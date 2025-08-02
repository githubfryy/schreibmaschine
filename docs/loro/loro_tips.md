##### `LoroDoc` will be initialized with a new random PeerID each time


What if I need to set the initial state?

---


##### Be careful when using `doc.setPeerId(newId)`


When using `setPeerId`, you must avoid having two parallel peers use the same PeerId. This can cause serious consistency problems in your application.
Why How to reuse PeerIds safely

---


##### Root containers don't need operations to be initialized


Root Containers are created implicitly in Loro. This means that when you call `doc.getText("text")`, no new operations appear in the LoroDoc history, and there are no operations that need to be synchronized with other peers.
This behavior contrasts with non-root containers. For example, when you execute `doc.getMap("meta").setContainer("text", new LoroText())`, it generates an operation to insert the LoroText container into the map.

---


##### When initializing child containers of LoroMap in parallel, overwrites can occur instead of automatic merging.


Why this happens Best practices for container initialization

---


##### Use redaction to safely share document history


There are times when users might accidentally paste sensitive information (like API keys, passwords, or personal data) into a collaborative document. When this happens, you need a way to remove just that sensitive content from the document history without compromising the rest of the document's integrity.
How to safely redact sensitive content

---


##### Use shallow snapshots to completely remove old history


When you need to completely remove ALL history older than a certain version point, shallow snapshots provide the solution.
How to remove old history with shallow snapshots

---


##### You can store mappings between LoroDoc's peerIds and user IDs in the document itself


Use `doc.subscribeFirstCommitFromPeer(listener)` to associate peer information with user identities when a peer first interacts with the document.
How to track peer-to-user mappings

---


##### You can use [https://loro.dev/llms-full.txt (opens in a new tab)](https://loro.dev/llms-full.txt) to prompt your AI


When working with AI assistants or language models on Loro-related tasks, you can use these URLs to provide comprehensive context about Loro's capabilities and API:

-   `https://loro.dev/llms-full.txt` - All the documentation in one file
-   `https://loro.dev/llms.txt` - An overview of Loro website

[Ephemeral Store](https://loro.dev/docs/tutorial/ephemeral "Ephemeral Store")[What are CRDTs](https://loro.dev/docs/concepts/crdt "What are CRDTs")