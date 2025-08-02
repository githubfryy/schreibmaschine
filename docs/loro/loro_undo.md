We provide an `UndoManager` that helps you manage the undo/redo stack and can be used during concurrent editing. It also supports cursor position transformation. In the case of concurrent editing, you will want the undo/redo to be local, meaning it should only undo/redo local operations without affecting other collaborators' edits.


### Why Local Undo/Redo?


If undo/redo is global, it often does not meet expectations. Consider the following scenario:

-   User A and User B are collaborating: They are likely editing different parts of the document.
-   User A performs an undo: If this undoes User B's operations, User A might see no changes and think the undo failed, as User B might be editing content outside of User A's view.
-   User B's perspective: User B would find their recent edits deleted without knowing how it happened.


## Usage


To create an `UndoManager`, you can specify:

-   Which local operations are not recorded.
-   The merge range for undo operations.
-   The stack depth.


## Limitations


It can only track a single peer. When the peer ID of the document changes, it will clear the undo stack and the redo stack and track the new peer ID.


## Restoring Selections


When utilizing undo/redo functionalities, it is important for our application to restore the selection to its position prior to the operation that is being undone or redone. This task is particularly challenging in a collaborative setting where remote operations can alter the cursor's position (for instance, if the cursor needs to revert to the 5th position, but remote operations have added new characters before this position).
Challenges


### Solution


We support storing [`cursors`](https://loro.dev/docs/tutorial/cursor) for each undo/redo action within the `UndoManager`. The `UndoManager` will adjust the stored cursors to reflect changes from remote edits or other undo/redo operations, ensuring they match the current state of the document.
They need be handled by the `onPush` and `onPop` callbacks.
On `onPush`, you can return a list of `Cursor`s that you want to store. On `onPop`, you can retrieve the stored cursors and use them to restore the selection.
Typically, you may need to store selections in an undo/redo item in the following cases:

-   When a new local change is applied, we need to record a new undo item. Therefore, we must store the selection beforethe operation to be undone.
    -   Purpose: Storing the selection beforeis crucial because we may lose the selection after applying the operation. If the user selects text and deletes it, after undo, the `onPop` can retrieve the state of the selected deleted content.
-   First undo operation: Store the current document's selection for the corresponding redo item.
    -   Purpose: After redo, it can return to the initial selection state.

Internally, we also automatically handle the storage and reset of cursors in the undo/redo loop state.
Implementation


## Demonstration


ProseMirror with Loro binding


## Understanding the Undo/Redo Stack


The UndoManager maintains two stacks:

1.  Undo Stack: Contains operations that can be undone
2.  Redo Stack: Contains operations that were undone and can be redone


### How the Callbacks Work


The `onPush` and `onPop` callbacks are triggered when these stacks change:

-   onPush(isUndo, range, event): Called when a new item is pushed to either stack
    -   `isUndo: boolean`: `true` for the undo stack, `false` for the redo stack
    -   `range: (number, number)`: The operations' counter range that associated with the undo/redo action
    -   Returns: An object that can include `value` (any data you want to store) and `cursors` (cursor positions)
-   onPop(isUndo, value): Called when an item is popped from either stack
    -   `isUndo`: `true` for the undo stack, `false` for the redo stack
    -   `value`: The value you returned from `onPush` when this item was created


### Understanding Action Merging


The `mergeInterval` option in the UndoManager controls how closely spaced operations are grouped:
How mergeInterval works:-   Operations occurring within the specified time interval (in milliseconds) will be merged into a single undo action
-   Even though these operations are merged, `onPush` events will still be triggered for each individual operation
-   When undoing, all merged operations will be undone as a single unit
-   A lower value results in more granular undo steps; a higher value creates fewer, more comprehensive undo steps
-   Set to `0` to disable merging entirely (every operation becomes a separate undo step)


### Stack Operations Flow


1.  When a local transaction is committed, a new undo item is pushed to the undo stack (triggers `onPush` with `isUndo=true`)
2.  When `.undo()` is called:
    -   An item is popped from the undo stack (triggers `onPop` with `isUndo=true`)
    -   A corresponding item is pushed to the redo stack (triggers `onPush` with `isUndo=false`)
3.  When `.redo()` is called:
    -   An item is popped from the redo stack (triggers `onPop` with `isUndo=false`)
    -   A corresponding item is pushed to the undo stack (triggers `onPush` with `isUndo=true`)


### Example: Text Editing with Undo/Redo


Consider a simple text editor that uses Loro for collaboration. Let's walk through what happens during typical editing operations:
When the user clicks Undo, two things happen:

1.  The last action is popped from the undo stack (removing " World")
2.  That action is pushed to the redo stack so it can be redone later

This approach ensures that local changes can be undone without affecting other users' edits, making it ideal for collaborative editing.


### Cursor Efficiency


The built-in cursor solution is optimized for performance and handles collaborative scenarios efficiently, including situations where peers may change the document concurrently during undo/redo operations. For complex editors like rich text editors, the cursor implementation provides the best balance of performance and correctness.
[Event Graph Walker](https://loro.dev/docs/advanced/event_graph_walker "Event Graph Walker")[Batch Import](https://loro.dev/docs/advanced/import_batch "Batch Import")