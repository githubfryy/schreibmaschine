You can use Loro in your application by using:

-   [`loro-crdt` (opens in a new tab)](https://www.npmjs.com/package/loro-crdt) NPM package
-   [`loro` (opens in a new tab)](https://crates.io/crates/loro) Rust crate
-   [`loro-swift` (opens in a new tab)](https://github.com/loro-dev/loro-swift) Swift package
-   [`loro-py` (opens in a new tab)](https://github.com/loro-dev/loro-py) Python package
-   [`loro-cs` (opens in a new tab)](https://github.com/sensslen/loro-cs) Community-maintained C# package
-   You can also find a list of examples in [Loro examples in Deno (opens in a new tab)](https://github.com/loro-dev/loro-examples-deno).

You can use [Loro Inspector](https://loro.dev/docs/advanced/inspector) to debug and visualize the state and history of Loro documents.
The following guide will use `loro-crdt` js package as the example.
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg) (opens in a new tab)](https://stackblitz.com/edit/loro-basic-test?file=test%2Floro-sync.test.ts)


## Install


If you're using `Vite`, you should add the following to your vite.config.ts:
⚠️ DOMContentLoaded Timing Issue with Vite
If you're using `Next.js`, you should add the following to your next.config.js:
You can also use Loro directly in the browser via ESM imports. Here's a minimal example:


## Introduction


It is well-known that syncing data/building realtime collaborative apps is challenging, especially when devices can be offline or part of a peer-to-peer network. Loro simplifies this process for you.
After you model your app state by Loro, syncing is simple:
Saving your app state is also straightforward:
Loading your app state:
Loro also makes it easy for you to time travel the history and add version control to your app. [Learn more about time travel](https://loro.dev/docs/tutorial/time_travel).
Loro is compatible with the JSON schema. If you can model your app state with JSON, you probably can sync your app with Loro. Because we need to adhere to the JSON schema, using a number as a key in a Map is not permitted, and cyclic links should be avoided.


## Entry Point: LoroDoc


LoroDoc is the entry point for using Loro. You must create a Doc to use Map, List, Text, and other types and to complete data synchronization.


## Container


We refer to CRDT types such as `List`, `Map`, `Tree`, `MovableList`, and `Text` as `Container`s.
Here are their basic operations:


## Save and Load


Loro is a pure library and does not handle network protocols or storage mechanisms. It is your responsibility to manage the storage and transmission of the binary data exported by Loro.
To save the document, use `doc.export({mode: "snapshot"})` to get its binary form. To open it again, use `doc.import(data)` to load this binary data.
Exporting the entire document on each keypress is inefficient. Instead, use `doc.export({mode: "update", from: VersionVector})` to obtain binary data for operations since the last export.
If updates accumulate, exporting a new snapshot can quicken import times and decrease the overall size of the exported data.
You can store the binary data exported from Loro wherever you prefer.


## Sync


Two documents with concurrent edits can be synchronized by just two message exchanges.
Below is an example of synchronization between two documents:


## Event


You can subscribe to the event from `Container`s.
`LoroText` and `LoroList` can receive updates in [Quill Delta (opens in a new tab)](https://quilljs.com/docs/delta/) format.
The events will be emitted after a transaction is committed. A transaction is committed when:

-   `doc.commit()` is called.
-   `doc.export(mode)` is called.
-   `doc.import(data)` is called.
-   `doc.checkout(version)` is called.

Below is an example of rich text event:
The types of events are defined as follows:
[Introduction to Loro](https://loro.dev/docs "Introduction to Loro")[Loro Document](https://loro.dev/docs/tutorial/loro_doc "Loro Document")