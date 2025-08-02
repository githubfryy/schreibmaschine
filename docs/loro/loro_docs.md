It is well-known that syncing data/building realtime collaborative apps is challenging, especially when devices can be offline or part of a peer-to-peer network. Loro simplifies this process for you.
We want to provide better DevTools to make building [local-first apps (opens in a new tab)](https://www.inkandswitch.com/local-first/) easy and enjoyable.
Loro uses [Conflict-free Replicated Data Types (CRDTs)](https://loro.dev/docs/concepts/crdt) to resolve parallel edits. By utilizing Loro's data types, your applications can be made collaborative and keep the editing history with low overhead.
After you model your app state by Loro, syncing is simple:
Saving your app state is also straightforward:
Loading your app state:
Loro also makes it easy for you to time travel the history and add version control to your app. [Learn more about time travel](https://loro.dev/docs/tutorial/time_travel).
Loro is compatible with the JSON schema. If you can model your app state with JSON, you probably can sync your app with Loro. Because we need to adhere to the JSON schema, using a number as a key in a Map is not permitted, and cyclic links should be avoided.


## Differences from other CRDT libraries


The table below summarizes Loro's features, which may not be present in other CRDT libraries.

-   \[1\] Unlike others, Yjs requires users to store a version vector and a delete set, enabling time travel back to a specific point.
-   [Fugue (opens in a new tab)](https://arxiv.org/abs/2305.00583) is a text/list CRDTs that can minimize the chance of the interleaving anomalies.

[Getting Started](https://loro.dev/docs/tutorial/get_started "Getting Started")