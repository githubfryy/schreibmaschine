A Container ID is a unique identifier that comes in two forms:

-   Root Container: Composed of a type and root name
-   Normal Container: Created through user operations, composed of an ID and type

Rust `ContainerID`TypeScript `ContainerID`1.  Root Containers-   Created implicitly when accessing a root container for the first time (e.g., calling `doc.getText("text")`). No operation is generated in the history.
    -   Uniquely identified by a string name and container type
2.  Normal Containers-   Created explicitly through operations like `insertContainer` or `createNode`
    -   Generated automatically when applying operations that create child containers
    -   Contains the Operation ID of its creation within its Container ID


## Container Overwrites


When initializing child containers in parallel, overwrites can occur instead of automatic merging. For example:
This behavior poses a significant risk of data loss if the editing history is not preserved. Even when the complete history is available and allows for data recovery, the recovery process can be complex.
When a container holds substantial data or serves as the primary storage for document content, overwriting it can lead to the unintended hiding/loss of critical information. For this reason, it is essential to implement careful and systematic container initialization practices to prevent such issues.


### Best Practices


1.  When containers might be initialized concurrently, prefer initializing them at the root level rather than as nested containers
    
2.  When using map containers:
    -   If possible, initialize all child containers during the map container's initialization
    -   Avoid concurrent creation of child containers with the same key in the map container to prevent overwrites

The overwrite behavior occurs because parallel creation of child containers results in different container IDs, preventing automatic merging of their contents.
[DocState and OpLog](https://loro.dev/docs/advanced/doc_state_and_oplog "DocState and OpLog")[Shallow Snapshot](https://loro.dev/docs/advanced/shallow_snapshot "Shallow Snapshot")