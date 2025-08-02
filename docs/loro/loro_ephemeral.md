In real-time collaborative scenarios, Presence information is just as important as maintaining document consistency across peers through CRDTs. This includes information such as the current collaborator's username, mouse pointer position, or selected objects. We need a mechanism that doesn't persist in the CRDT Document but remains ephemeral, allowing collaborators to perceive each other's presence for better coordination and to avoid conflicts when multiple users edit the same object. This is why we've introduced the Ephemeral Store.
!
Since Ephemeral information is primarily used for real-time collaboration, we've chosen a simple yet effective approach. The Ephemeral Store is a timestamp-based, last-write-wins key-value store. Each entry maintains its own timestamp of the last update, enabling the system to send only the updated entry content rather than the complete current state.


## Example



## API


-   `constructor(timeout)`: Creates a new EphemeralStore instance with an optional timeout parameter (default: 30000ms). The timeout determines how long ephemeral data remains valid before being automatically removed.
    
-   `set(key, value)`: Sets a value for the specified key in the ephemeral store. If the key already exists, its value will be updated.
    
-   `get(key)`: Retrieves the current value for the specified key, or returns `undefined` if the key doesn't exist.
    
-   `delete(key)`: Removes the specified key and its associated value from the ephemeral store.
    
-   `getAllStates()`: Returns all current key-value pairs in the ephemeral store.
    
-   `keys()`: Returns an array of all keys currently in the ephemeral store.
    
-   `encode(key)`: Encodes the value associated with the specified key into a binary format that can be transmitted to other peers.
    
-   `encodeAll()`: Encodes all key-value pairs in the ephemeral store into a binary format.
    
-   `apply(bytes)`: Applies encoded ephemeral data received from other peers to the local ephemeral store.
    
-   `subscribe((event: EphemeralStoreEvent)=>void)`: Registers a listener function that will be called whenever the ephemeral store is updated, either from local changes, remote changes, or timeout events.
    
-   `subscribeLocalUpdates((bytes: Uint8Array) => void)`: Registers a listener that will be called only for local updates to the ephemeral store.
    

[Time Travel](https://loro.dev/docs/tutorial/time_travel "Time Travel")[Tips and Tricks](https://loro.dev/docs/tutorial/tips "Tips and Tricks")