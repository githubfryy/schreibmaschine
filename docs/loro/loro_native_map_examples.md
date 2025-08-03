Docs
Performance
Native Benchmarks

[This native benchmark (opens in a new tab)](https://github.com/zxch3n/crdt-bench-native) is based on the Rust implementation of each crate.

-   Conducted on a M2 Max CPU, dated 2024-10-18.
-   The tasks with names starting with `automerge` use the automerge paper dataset.
-   In this benchmark, compression is disabled for both automerge and loro.
-   Diamond-type doesn't support the list type yet.

| Tasks | automerge | loro | diamond-type | yrs |
| --- | --- | --- | --- | --- |
| automerge - apply | 450.91 ms | 88.19 ms | 15.63 ms | 4238.8 ms |
| automerge - decode time | 506.30 ms | 0.189 ms | 2.19 ms | 3.82 ms |
| automerge - encode time | 17.65 ms | 0.416 ms | 1.15 ms | 0.759 ms |
| concurrent list inserts | 81.07 ms | 130.63 ms | 57.08 ms | 13.95 ms |
| list_random_insert_1k | 296.64 ms | 12.15 ms | 4.32 ms | 5.83 ms |
[JS/WASM Benchmarks](https://loro.dev/docs/performance "JS/WASM Benchmarks")[Document Size](https://loro.dev/docs/performance/docsize "Document Size")

MAP

Docs
Tutorial
Map

Loro's Map uses LWW (Last-Write-Wins) semantics. When concurrent edits conflict, it compares Lamport logic timestamps to determine the winner.
Here is how to use it:

```
const docA = new LoroDoc();
docA.setPeerId("0");
const docB = new LoroDoc();
docB.setPeerId("1");
 
const mapA = docA.getMap("map");
const mapB = docB.getMap("map");
 
mapA.set("a", 1);
const textB = mapB.setContainer("a", new LoroText());
textB.insert(0, "Hi");
 
console.log(docA.toJSON()); // OUTPUT: { map: { a: 1 } }
console.log(docB.toJSON()); // OUTPUT: { map: { a: "Hi" } }
 
docA.import(docB.export({ mode: "snapshot" }));
docB.import(docA.export({ mode: "snapshot" }));
 
// docB wins because it has the larger peerId, thus the larger logical timestamp
console.log(docA.toJSON()); // OUTPUT: { map: { a: "Hi" } }
console.log(docB.toJSON()); // OUTPUT: { map: { a: "Hi" } }
```

> Note: When calling `map.set(key, value)` on a LoroMap, if `map.get(key)` already returns `value`, the operation will be a no-op (no operation recorded).

[List and Movable List](https://loro.dev/docs/tutorial/list "List and Movable List")[Tree](https://loro.dev/docs/tutorial/tree "Tree")

Example

Docs
Examples

You can find the examples of basic usage in [Loro examples in Deno (opens in a new tab)](https://github.com/loro-dev/loro-examples-deno);


### loro-prosemirror


GitHub: [loro-dev/loro-prosemirror (opens in a new tab)](https://github.com/loro-dev/loro-prosemirror)
It provides seamless integration between Loro and ProseMirror, a powerful rich text editor framework. It includes:

-   Document state synchronization with rich text support
-   Cursor awareness and synchronization
-   Undo/Redo support in collaborative editing

It can also be used with [Tiptap (opens in a new tab)](https://tiptap.dev/), a popular rich text editor built on top of ProseMirror. This means you can easily add collaborative editing capabilities to your Tiptap-based applications.


### loro-codemirror


GitHub: [loro-dev/loro-codemirror (opens in a new tab)](https://github.com/loro-dev/loro-codemirror)
This package provides integration between Loro and CodeMirror 6, a versatile code editor. It supports:

-   Document state synchronization
-   Cursor awareness synchronization
-   Undo/Redo functionality


### loro-inspector


GitHub: [loro-dev/loro-inspector (opens in a new tab)](https://github.com/loro-dev/loro-inspector)
[Document Size](https://loro.dev/docs/performance/docsize "Document Size")