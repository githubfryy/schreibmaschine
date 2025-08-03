Cursor is an independently storable entity, meaning it can store content separately from the Loro document. It is used to stably represent positions within structures such as Text, List, or MovableList. Cursors can be utilized to represent collaborative cursor positions, highlight ranges, or comment ranges.


## Motivation


Using "index" to denote cursor positions can be unstable, as positions may shift with document edits. To reliably represent a position or range within a document, it is more effective to leverage the unique ID of each item/character in a List CRDT or Text CRDT.


## Updating Cursors


Loro optimizes State metadata by not storing the IDs of deleted elements. This approach, while efficient, complicates tracking cursor positions since they rely on these IDs for precise locations within the document. The solution recalculates position by replaying relevant history to update stable positions accurately. To minimize the performance impact of history replay, the system updates cursor info to reference only the IDs of currently present elements, thereby reducing the need for replay.
Each position has a "Side" information, indicating the actual cursor position is on the left, right, or directly in the center of the target ID.
Note: In JavaScript, the offset returned when querying a Stable Position is based on the UTF-16 index.


## Example


[Persistence](https://loro.dev/docs/tutorial/persistence "Persistence")[Time Travel](https://loro.dev/docs/tutorial/time_travel "Time Travel")


Timestamp

You can enable timestamp recording through `setRecordTimestamp`, allowing Unix timestamps to be logged in each `Change`. Consequently, these timestamps will be preserved in exported `Updates` or `Snapshots`.
Enabling this feature affects the merge behavior of `Changes`, as `Changes` with too long a time gap cannot share the same timestamp. In such cases, you can adjust the mergeable duration range using `setChangeMergeInterval`, with a default setting of 1,000,000, equating to a 1000s threshold for merging `Changes`.

> Each insertion or deletion by the user generates an `op`, and multiple consecutive `op`s can merge into a larger `Change`. `Change`s log a `Timestamp`, but each `Change` can only associate with one `Timestamp`. Hence, if the time gap is too wide, merging `Changes` becomes impractical. However, treating each Change as new based on slight timestamp differences (e.g., key presses milliseconds apart) introduces significant additional overhead for each Change. Therefore, users can customize the `change merge interval` according to their needs.

Note that these settings do not persist in exported `Updates` or `Snapshots`. Thus, if custom configurations are required, they must be reapplied upon each initialization of `LoroDoc`. Without timestamp recording enabled, the `Timestamp` defaults to the current maximum known `Timestamp`.
[Shallow Snapshot](https://loro.dev/docs/advanced/shallow_snapshot "Shallow Snapshot")[Operations and Change](https://loro.dev/docs/advanced/op_and_change "Operations and Change")