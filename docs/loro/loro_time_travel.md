In Loro, you can call `doc.checkout(frontiers)` to jump to the version specified by the frontiers([Learn more about frontiers](https://loro.dev/docs/advanced/version_deep_dive#frontiers)).
Note that using `doc.checkout(frontiers)` to jump to a specific version places the document in a detached state, preventing further edits. To learn more, see [*Attached/Detached Status*](https://loro.dev/docs/advanced/doc_state_and_oplog#attacheddetached-status). To continue editing, reattach the document to the latest version using `doc.attach()`. This design is temporary and will be phased out once we have a more refined version control API in place.


## Read-only Time Travel


Below we demonstrate how to implement simple, read-only time-travel. You could, for example, combine this with a slider in a UI to allow users to view the document over time.


### Enable Timestamps


Before this example will work, it is important that the edits made to the document have had [timestamp storage](https://loro.dev/docs/advanced/timestamp) enabled:
This makes sure that all changes to the document will have a timestamp added to it. We will use this timestamp to sort changes so that the ordering will match user intuition.


### Implementing Time Travel


The first step is to load our document. Here we assume that you have a snapshot from your database or API.
Next we must collect and sort the timestamps for every change in the document. We want uesrs to be able to drag a slider to select a timestamp out of this list.
Next we need to make a helper function that will return a list of [Frontiers](https://loro.dev/docs/advanced/version_deep_dive#frontiers) for any timestamp.
For each peer that has edited a document, there is a list of changes by that peer. Each change has a `counter`, and a `length`. That `counter` is like an always incrementing version number for the changes made by that peer.
A change's `counter` is the starting point of the change, and the `length` indicates how much the change incremented the counter before the end of the change.
The frontiers are the list of counters that we want to checkout from each peer. Since we are going for a timeline view, we want to get the highest counter that we know happned before our timestamp for each peer.
Here we make a helper function to do that.
Finally, all we can get the index from our slider, get the timestamp from our list, and then checkout the calculated frontiers.


## Time Travel With Editing


Below is a more complete example demonstrating Time Travel functionality with a node editor.
[Cursor](https://loro.dev/docs/tutorial/cursor "Cursor")[Ephemeral Store](https://loro.dev/docs/tutorial/ephemeral "Ephemeral Store")