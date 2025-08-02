In Loro, every basic operation such as setting a key-value pair on a Map, adding a list item, or inserting/deleting a character in text is considered an individual op. (Don't worry about the cost, in Loro's internal memory representation and export format, consecutive ops are merged into a larger op, such as consecutive text insertions and deletions.)
One or more local consecutive `Op`s constitute a `Change`, which includes the following information:

-   ID: ID of the Change is essentially the first op's ID
-   Timestamp: An optional timestamp, which can be enabled with `setRecordTimestamp(true)`. If not enabled, there is no extra storage overhead.
-   Dependency IDs: Used to represent the causal order, the Op IDs that the current Change directly depends on.
-   Commit Message: An optional commit message (WIP not yet released); when not enabled, there is no extra storage overhead.

Each time `doc.commit()` is called, a new `Change` is generated, which will be merged with the previous local `Change` as much as possible to reduce the amount of metadata that needs to be stored.

> Note: Each time you export, a `doc.commit()` is implicitly performed by the Loro Doc.

Unlike a Git commit, Loro's Change can be merged; it is neither atomic nor indivisible. This design allows Loro to better accommodate real-time collaboration scenarios (where each keystroke would have its own `doc.commit()`, which would be hugely costly if not merged) and asynchronous collaboration scenarios (like Git, which combines many modifications to form one).


## When a New Change is Formed


> Note: You may not need to understand the content of this section, and the content may change in future versions. Unless you want to understand Loro's internal implementation or want to achieve more extreme performance optimization.

By default, each commit-generated `Change` will merge with the previous local `Change`. However, there are exceptions in several cases:

-   The current Change depends on a Change from a different peer. This occurs when local operations build upon recently applied remote operations. For example, deleting a character sequence that was just inserted by a remote peer. These causal relationships form a DAG (Directed Acyclic Graph). After importing remote updates, the next local Change will have new dependency IDs, necessitating a separate Change.
-   When `setRecordTimestamp(true)` is set, if the time interval between successive Changes exceeds the "change merge interval" (default duration 1000s).
-   When the current Change has a different commit message from the previous Change by the same peer.


## Example


[Storing Timestamps](https://loro.dev/docs/advanced/timestamp "Storing Timestamps")[Loro's Versioning Deep Dive: DAG, Frontiers, and Version Vectors](https://loro.dev/docs/advanced/version_deep_dive "Loro's Versioning Deep Dive: DAG, Frontiers, and Version Vectors")