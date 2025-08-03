LoroDoc is the main entry point for almost all Loro functionality. It serves as a container manager and coordinator that provides:

1.  Container Management: Create and manage different types of CRDT containers (Text, List, Map, Tree, MovableList)
2.  Version Control: Track document history, checkout versions, and manage branches
3.  Event System: Subscribe to changes at both document and container levels
4.  Import/Export: Save and load documents/updates in various formats


## Basic Usage


First, let's create a new LoroDoc instance:
To model a document with the following format:


## Container Types


LoroDoc supports several container types:

1.  Text- For rich text editing
2.  List- For ordered collections
3.  Map- For key-value pairs
4.  Tree- For hierarchical data structures
5.  MovableList- For lists with movable items

Let's look at how to use each type:


### Text Container



### List Container



### Map Container



### Tree Container



### MovableList Container



## Collaboration Features


LoroDoc can be used for real-time collaboration. Here's how to sync changes between peers:


## Undo/Redo Support


Loro provides built-in undo/redo functionality:


## Exporting and Importing


You can save and load the document state:


### Shallow Import/Export


Shallow import/export is a feature that allows you to create and share document snapshots without including the complete history. This is particularly useful for:

1.  Reducing the size of exported data
2.  Sharing the document with others without revealing the complete history
3.  Speedup the import/export process

Here's how to use shallow export:
Note: A shallow document only contains history after a certain version point. Operations before the shallow start point are not included, but the document remains fully functional for collaboration.


### Redacting Sensitive Content


Loro allows you to redact specific segments of document history while preserving the rest. This is particularly useful when:

1.  A user accidentally pastes sensitive information (like passwords or API keys) into the document
2.  You need to remove just the sensitive part of the history while keeping older and newer edits intact
3.  You want to share document history with sensitive segments sanitized

Here's how to use the redaction functionality:
Redaction applies these rules to preserve document structure while removing sensitive content:

-   Preserves delete and move operations
-   Replaces text insertion content with Unicode replacement characters '�'
-   Substitutes list and map insert values with null
-   Maintains structure of nested containers
-   Replaces text mark values with null
-   Preserves map keys and text annotation keys

Note that redaction doesn't remove the operations completely - it just replaces the sensitive content with placeholders. If you need to completely remove portions of history, see the section on shallow snapshots in the [Tips](https://loro.dev/docs/tutorial/tips) section.


#### Important: Synchronization Considerations


Both redaction and shallow snapshots maintain future synchronization consistency, but your application is responsible for ensuring all peers get the sanitized version. Otherwise, old instances of the document with sensitive information will still exist on other peers.


## Event Subscription


Subscribe to changes in the document:


### Event Emission


Events in LoroDoc are emitted only after a transaction is committed, and importantly, the events are emitted after a microtask. This means you need to await a microtask if you want to handle the events immediately after a commit.

1.  Explicitly calling `doc.commit()`:

2.  Implicitly through certain operations:

You can also specify additional information when committing:
Note: Multiple operations before a `commit` are batched into a single event. This helps reduce event overhead and provides atomic changes. The event will still be emitted after a microtask, regardless of whether the commit was explicit or implicit.


## Version Control and History


LoroDoc provides powerful version control features that allow you to track and manage document history:


### Version Representation


Loro uses two ways to represent versions:

1.  Version Vector: A map from peer ID to counter

2.  Frontiers: A list of operation IDs that represent the latest operations from each peer. This is compacter than version vector. In most of the cases, it only has 1 element.


### Checkout and Time Travel


You can navigate through document history using checkout:
Note: After checkout, the document enters "detached" mode. In this mode:

-   The document is not editable by default
-   Import operations are recorded but not applied to the document state
-   You need to call `attach()` or `checkoutToLatest()` to go back to the latest version and make it editable again


### Detached Mode


The document enters "detached" mode after a `checkout` operation or when explicitly calling `doc.detach()`. In detached mode, the document state is not synchronized with the latest version in the OpLog.
By default, editing is disabled in detached mode. However, you can enable it:


#### Key Behaviors in Detached Mode


1.  Import Operations-   Operations imported via `doc.import()` are recorded in the OpLog
    -   These operations are not applied to the document state until checkout

2.  Version Management-   Each checkout uses a different PeerID to prevent conflicts
    -   The document maintains two version states:

3.  Forking-   You can create a new document at a specific version:


#### Common Use Cases


1.  Time Travel and History Review2.  Branching## Subscription and Sync


### Local Updates Subscription


Subscribe to local changes for syncing between peers:


### Document Events


Subscribe to all document changes. The event may be triggered by local operations, importing updates, or switching to another version.


### Container-specific Events


Subscribe to changes in specific containers:


## Advanced Features



### Cursor Support


Loro provides stable cursor position tracking that remains valid across concurrent edits:


### Change Tracking


Track and analyze document changes:


### Advanced Import/Export


Loro supports various import and export modes:


### Path and Value Access


Access document content through paths:


### Debug and Metadata


Access debug information and metadata:
[Getting Started](https://loro.dev/docs/tutorial/get_started "Getting Started")[Sync](https://loro.dev/docs/tutorial/sync "Sync")