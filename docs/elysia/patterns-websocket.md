## WebSocket [​](#websocket)


WebSocket is a realtime protocol for communication between your client and server.
Unlike HTTP where our client repeatedly asking the website for information and waiting for a reply each time, WebSocket sets up a direct line where our client and server can send messages back and forth directly, making the conversation quicker and smoother without having to start over each message.
SocketIO is a popular library for WebSocket, but it is not the only one. Elysia uses [uWebSocket](https://github.com/uNetworking/uWebSockets) which Bun uses under the hood with the same API.
To use websocket, simply call `Elysia.ws()`:

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .ws('/ws', {
        message(ws, message) {
            ws.send(message)
        }
    })
    .listen(3000)
```


## WebSocket message validation: [​](#websocket-message-validation)


Same as normal route, WebSockets also accepts a schemaobject to strictly type and validate requests.

typescript
```
import { Elysia, t } from 'elysia'
const app = new Elysia()
    .ws('/ws', {
        // validate incoming message
        body: t.Object({
            message: t.String()
        }),
        query: t.Object({
            id: t.String()
        }),
        message(ws, { message }) {
            // Get schema from `ws.data`
            const { id } = ws.data.query
            ws.send({
                id,
                message,
                time: Date.now()
            })
        }
    })
    .listen(3000)
```

WebSocket schema can validate the following:

-   message- An incoming message.
-   query- Query string or URL parameters.
-   params- Path parameters.
-   header- Request's headers.
-   cookie- Request's cookie
-   response- Value returned from handler

By default Elysia will parse incoming stringified JSON message as Object for validation.


## Configuration [​](#configuration)


You can set Elysia constructor to set the Web Socket value.

ts
```
import { Elysia } from 'elysia'
new Elysia({
    websocket: {
        idleTimeout: 30
    }
})
```

Elysia's WebSocket implementation extends Bun's WebSocket configuration, please refer to [Bun's WebSocket documentation](https://bun.sh/docs/api/websockets) for more information.
The following are a brief configuration from [Bun WebSocket](https://bun.sh/docs/api/websockets#create-a-websocket-server)


### perMessageDeflate [​](#permessagedeflate)


@default `false`
Enable compression for clients that support it.
By default, compression is disabled.


### maxPayloadLength [​](#maxpayloadlength)


The maximum size of a message.


### idleTimeout [​](#idletimeout)


@default `120`
After a connection has not received a message for this many seconds, it will be closed.


### backpressureLimit [​](#backpressurelimit)


@default `16777216` (16MB)
The maximum number of bytes that can be buffered for a single connection.


### closeOnBackpressureLimit [​](#closeonbackpressurelimit)


@default `false`
Close the connection if the backpressure limit is reached.


## Methods [​](#methods)


Below are the new methods that are available to the WebSocket route


## ws [​](#ws)


Create a websocket handler
Example:

typescript
```
import { Elysia } from 'elysia'
const app = new Elysia()
    .ws('/ws', {
        message(ws, message) {
            ws.send(message)
        }
    })
    .listen(3000)
```

Type:

typescript
```
.ws(endpoint: path, options: Partial<WebSocketHandler<Context>>): this
```

-   endpoint- A path to exposed as websocket handler
-   options- Customize WebSocket handler behavior


## WebSocketHandler [​](#websockethandler)


WebSocketHandler extends config from [config](#configuration).
Below is a config which is accepted by `ws`.


## open [​](#open)


Callback function for new websocket connection.
Type:

typescript
```
open(ws: ServerWebSocket<{
    // uid for each connection
    id: string
    data: Context
}>): this
```


## message [​](#message)


Callback function for incoming websocket message.
Type:

typescript
```
message(
    ws: ServerWebSocket<{
        // uid for each connection
        id: string
        data: Context
    }>,
    message: Message
): this
```

`Message` type based on `schema.message`. Default is `string`.


## close [​](#close)


Callback function for closing websocket connection.
Type:

typescript
```
close(ws: ServerWebSocket<{
    // uid for each connection
    id: string
    data: Context
}>): this
```


## drain [​](#drain)


Callback function for the server is ready to accept more data.
Type:

typescript
```
drain(
    ws: ServerWebSocket<{
        // uid for each connection
        id: string
        data: Context
    }>,
    code: number,
    reason: string
): this
```


## parse [​](#parse)


`Parse` middleware to parse the request before upgrading the HTTP connection to WebSocket.


## beforeHandle [​](#beforehandle)


`Before Handle` middleware which execute before upgrading the HTTP connection to WebSocket.
Ideal place for validation.


## transform [​](#transform)


`Transform` middleware which execute before validation.


## transformMessage [​](#transformmessage)


Like `transform`, but execute before validation of WebSocket message


## header [​](#header)


Additional headers to add before upgrade connection to WebSocket.