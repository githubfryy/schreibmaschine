Two documents with concurrent edits can be synchronized by just two message exchanges.
Below is an example of synchronization between two documents:


## Real-time Collaboration


Due to CRDT properties, document consistency is guaranteed when peers receive the same updates, regardless of order or duplicates.


### Sync Strategies


1.  First Sync(Initial synchronization between peers):
    -   New peers can exchange their [Version Vectors](https://loro.dev/docs/tutorial/version) to determine missing updates
    -   Use `doc.export({ mode: "update", from: versionVector })` to get updates since the peer's last known state. You may as well send the whole history by `doc.export({ mode: "update" })` as shown in the example above.
    -   Example shows basic first sync scenario
2.  Realtime Sync(Continuous updates):
    -   Subscribe to local updates
    -   Broadcast updates directly to all other peers
    -   No need for version comparison after initial sync
    -   As long as updates reach all peers, consistency is maintained


### Example


Here's how two peers can establish realtime sync when one comes online with offline changes:

1.  Both peers exchange their version information
2.  Each peer shares their missing updates:
    -   `doc2` gets updates it's missing from `doc1`
    -   `doc1` gets updates it's missing from `doc2`
3.  Both peers establish realtime sync to stay connected


## Understanding the `import()` Return Value


The `import()` method in Loro's JavaScript/WASM binding returns an object that provides feedback on the import operation. This object, let's call it `ImportStatusJS`, has the following structure:


### Fields Explained:


1.  `success`(Object, `PeerVersionRange`)
    -   Description: This field is always present and details the ranges of operations (changes) that were successfully imported and applied to the Loro document.
    -   Structure: It's an object where:
        -   Each keyis a `string` representing a `PeerID` (the unique identifier of a collaborator or a source of changes).
        -   Each valueis an object `{ start: number, end: number }` defining a continuous range of operation counters for that specific peer.
            -   `start`: The starting counter of the successfully imported range (inclusive).
            -   `end`: The ending counter of the successfully imported range (exclusive). This means operations from `start` up to, but not including, `end` were processed.
    -   Purpose: Helps understand which parts of the provided update data have been integrated into the local document's state.
    -   Example:
2.  `pending`(Object, `PeerVersionRange`, optional)
    -   Description: This field is only present if some operations from the imported data could not be applied because they depend on other operations that Loro has not seen yet (i.e., their causal dependencies are missing). It details these "pending" operation ranges.
    -   Structure: Identical to the `success` field. An object mapping `PeerID` strings to `{ start: number, end: number }` counter ranges.
    -   Purpose: Informs the application that certain changes are known but are "on hold" awaiting their prerequisites. To apply these pending changes, the missing prerequisite operations must be imported first. This is crucial for maintaining data consistency in collaborative scenarios.
    -   Example:


### How to Use This Information:


-   Check the `success` field to confirm which updates were applied.
-   If the `pending` field exists and is not empty, it signals that further updates (dependencies) are required to fully integrate all known changes. Your application might need to fetch or request these missing updates from other peers or a central server.

[Loro Document](https://loro.dev/docs/tutorial/loro_doc "Loro Document")[Text](https://loro.dev/docs/tutorial/text "Text")