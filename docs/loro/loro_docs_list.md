It is well-known that syncing data/building realtime collaborative apps is challenging, especially when devices can be offline or part of a peer-to-peer network. Loro simplifies this process for you.
We want to provide better DevTools to make building [local-first apps (opens in a new tab)](https://www.inkandswitch.com/local-first/) easy and enjoyable.
Loro uses [Conflict-free Replicated Data Types (CRDTs)](https://loro.dev/docs/concepts/crdt) to resolve parallel edits. By utilizing Loro's data types, your applications can be made collaborative and keep the editing history with low overhead.
After you model your app state by Loro, syncing is simple:
Saving your app state is also straightforward:
Loading your app state:
Loro also makes it easy for you to time travel the history and add version control to your app. [Learn more about time travel](https://loro.dev/docs/tutorial/time_travel).
Loro is compatible with the JSON schema. If you can model your app state with JSON, you probably can sync your app with Loro. Because we need to adhere to the JSON schema, using a number as a key in a Map is not permitted, and cyclic links should be avoided.


## Differences from other CRDT libraries


The table below summarizes Loro's features, which may not be present in other CRDT libraries.

-   \[1\] Unlike others, Yjs requires users to store a version vector and a delete set, enabling time travel back to a specific point.
-   [Fugue (opens in a new tab)](https://arxiv.org/abs/2305.00583) is a text/list CRDTs that can minimize the chance of the interleaving anomalies.

[Getting Started](https://loro.dev/docs/tutorial/get_started "Getting Started")


List

Loro supports two types of lists: `List` and `MovableList`. The `List` is a standard list that supports Insert and Delete operations. In contrast, the `MovableList` supports additional Set and Move operations.
Using a combination of insert and delete operations, one can simulate set and move operations on a `List`. However, this approach fails in concurrent editing scenarios. For example, if the same element is set or moved concurrently, the simulation would result in the deletion of the original element and the insertion of two new elements, which does not meet expectations.
The `MovableList` addresses these issues by ensuring that set and move operations do not lead to such problems, though it incurs additional overheads. Specifically, when performing only insertions/deletions, the `MovableList` is approximately 80% slower in encode/decode and consumes about 50% more memory compared to the `List`.
Both `List` and `MovableList` utilize the [*Fugue* (opens in a new tab)](https://arxiv.org/abs/2305.00583) to achieve *maximal non-interleaving*. Additionally, `MovableList` uses the algorithm from [*Moving Elements in List CRDTs* (opens in a new tab)](https://martin.kleppmann.com/2020/04/27/papoc-list-move.html) to implement the move operation.


## Basic Usage



### List



### MovableList



## Using Cursor on List


The Cursor on a List changes with the list's modifications. If new elements are inserted in front of it, it moves to the right. If elements in front are deleted, it moves to the left. If elements are inserted or deleted behind it, it remains stationary.
If you use a List to represent paragraphs in an article, you can use a Cursor to stably represent the selection range on the paragraph.
[Composing CRDTs](https://loro.dev/docs/tutorial/composition "Composing CRDTs")[Map](https://loro.dev/docs/tutorial/map "Map")