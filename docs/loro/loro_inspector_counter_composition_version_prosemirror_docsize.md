Docs
Advanced Topics
Loro Inspector

[Loro Inspector (opens in a new tab)](https://inspector.loro.dev/) is an open-source web tool that helps developers debug and visualize Loro documents. It provides a user-friendly interface to inspect the state and history of Loro documents.
[Batch Import](https://loro.dev/docs/advanced/import_batch "Batch Import")[JS/WASM Benchmarks](https://loro.dev/docs/performance "JS/WASM Benchmarks")


Docs
Tutorial
Counter

Loro's Counter will add up all the applied values, and supports integers and floating point numbers.
Here is how to use it:

```
const doc = new LoroDoc();
const counter = doc.getCounter("counter");
counter.increment(1);
counter.increment(2);
counter.decrement(1);
expect(counter.value).toBe(2);
```

[Tree](https://loro.dev/docs/tutorial/tree "Tree")[Version](https://loro.dev/docs/tutorial/version "Version")

Composition

In Loro, you can build complex data structures using basic CRDTs such as List, MovableList, Map and Tree. These containers can include sub-containers, which in turn can contain more sub-containers, allowing for the composition of intricate data structures.
It's important to note that documents in Loro must adhere to a tree structure. This means that while a parent can have multiple children, each child is restricted to only one parent. Therefore, the document forms a tree rather than a graph (like a DAG).
By leveraging these fundamental CRDTs, you can effectively model the states and the updates of documents that conform to the JSON schema.
[Text](https://loro.dev/docs/tutorial/text "Text")[List and Movable List](https://loro.dev/docs/tutorial/list "List and Movable List")

Version

In centralized environments, we can use linear version numbers to represent a version, such as incrementing a number each time or using timestamps. However, CRDTs can be used in decentralized environments, and their version representation is different.
In Loro, you can express a document's version through a [Version Vector (opens in a new tab)](https://en.wikipedia.org/wiki/Version_vector) or Frontiers.
In most cases, you might only need the Version Vector, which can be used for data synchronization and version comparison.
To understand the difference and the definition of `Frontiers`, see [Loro's Versioning Deep Dive: DAG, Frontiers, and Version Vectors](https://loro.dev/docs/advanced/version_deep_dive)
[Counter](https://loro.dev/docs/tutorial/counter "Counter")[Event Handling](https://loro.dev/docs/tutorial/event "Event Handling")


Prosemirror

## Prosemirror Binding for Loro




-   Sync document state with Loro
-   Sync cursors with Loro's Awareness and [Cursor](https://loro.dev/docs/tutorial/cursor)
-   Undo/Redo in collaborative editing
-   [🎨 Try it online](https://main--6661e86e215da40180d90507.chromatic.com/)

```
import {
  CursorAwareness,
  LoroCursorPlugin,
  LoroSyncPlugin,
  LoroUndoPlugin,
  redo,
  undo,
} from "loro-prosemirror";
import { LoroDoc } from "loro-crdt";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";

const doc \= new LoroDoc();
const awareness \= new CursorAwareness(doc.peerIdStr);
const plugins \= \[
  ...pmPlugins,
  LoroSyncPlugin({ doc }),
  LoroUndoPlugin({ doc }),
  keymap({
    "Mod-z": undo,
    "Mod-y": redo,
    "Mod-Shift-z": redo,
  }),
  LoroCursorPlugin(awareness, {}),
\];
const editor \= new EditorView(editorDom, {
  state: EditorState.create({ doc, plugins }),
});
```

collab-undo.mp4


Docsize

In this benchmark, we use the Automerge paper dataset.
Source: [https://github.com/automerge/automerge-perf/tree/master/edit-by-index (opens in a new tab)](https://github.com/automerge/automerge-perf/tree/master/edit-by-index)
The dataset consists of:

-   182,315 single-character insertion operations
-   77,463 single-character deletion operations
-   A total of 259,778 operations
-   104,852 characters in the final document

The first line of settings in the table below indicates configurations without `gc` and `compress`.

> The `x` in the table above signifies that the corresponding setting is not supported.

Loro also supports a shallow snapshot encoding format with gc capabilities by truncating the history. For details, see [the doc](https://loro.dev/docs/tutorial/encoding). If truncated from the latest version, the result will be:
[Native Benchmarks](https://loro.dev/docs/performance/native "Native Benchmarks")[Examples](https://loro.dev/docs/examples "Examples")