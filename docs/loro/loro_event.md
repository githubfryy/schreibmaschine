Loro implements an event system to track changes in the document. This section explains when events are emitted and how transactions work in Loro.


## Event Emission Points


Events in Loro are emitted whenever the internal document state changes. This mechanism allows application-level derived states to automatically synchronize with changes in the document state.

1.  Local Operations: For local operations (like insertions or deletions on text), the operations are first placed in a pending state within an internal transaction.
    
2.  Transaction Commit: When a transaction is committed, all pending operations collectively emit their corresponding events. This transaction commit occurs in two scenarios:
    
    -   When `LoroDoc.commit()` is explicitly called
    -   Automatically before an import or export operation
    
    Note that events are emitted asynchronously after a microtask. If you need to handle events immediately after a commit, you should await a microtask:
    

3.  Import: When importing changes from a remote source using the `import()` method, respective events are emitted. This allows the local document to react to changes made by other peers.

4.  Version Checkout: When you switch document state to a different version using `doc.checkout(frontiers)`, Loro emits an event to reflect this change. Like other events, these are also emitted after a microtask.


## Transaction Behavior


Transactions in Loro primarily serve to bundle related operations and emit their events together as a cohesive unit. This is useful in several scenarios:

1.  Related Local Operations: When performing multiple local operations that are logically connected, you may want them to:
    -   Share the same commit message
    -   Have the same timestamp
    -   Move together during undo/redo operations
2.  Event Handling: Applications often benefit from receiving related changes as a single batch rather than individual updates. Transactions facilitate this by:
    -   Allowing you to set an origin identifier during commit
    -   Including this origin value in the emitted events
    -   Enabling better event filtering and processing based on the origin


## Triggering a Commit


There are several ways to trigger a commit:

1.  Explicit Commit: Directly calling the `commit()` method on the Loro document.
    
2.  Before Import/Export: A commit is automatically triggered before executing an import operation.
    


## Transactions in Loro


It's important to note that Loro's concept of a transaction differs from traditional database transactions:

-   Loro transactions do not have ACID properties.
-   They primarily serve as event wrappers.
-   There is no rollback mechanism if an operation fails.

[Version](https://loro.dev/docs/tutorial/version "Version")[Export Mode](https://loro.dev/docs/tutorial/encoding "Export Mode")