Eden Treaty is an object representation to interact with a server and features type safety, auto-completion, and error handling.
To use Eden Treaty, first export your existing Elysia server type:

typescript
```
// server.ts
import { Elysia, t } from 'elysia'
const app = new Elysia()
    .get('/hi', () => 'Hi Elysia')
    .get('/id/:id', ({ params: { id } }) => id)
    .post('/mirror', ({ body }) => body, {
        body: t.Object({
            id: t.Number(),
            name: t.String()
        })
    })
    .listen(3000)
export type App = typeof app
```

Then import the server type and consume the Elysia API on the client:

typescript
```
// client.ts
import { 

treaty

 } from '@elysiajs/eden'
import type { 

App

 } from './server'
const 

app

 = 

treaty

<

App

>('localhost:3000')
// response type: 'Hi Elysia'
const { 

data

, 

error

 } = await 

app

.

hi

.

get

()
```


## Tree like syntax [​](#tree-like-syntax)


HTTP Path is a resource indicator for a file system tree.
File system consists of multiple levels of folders, for example:

-   /documents/elysia
-   /documents/kalpas
-   /documents/kelvin

Each level is separated by /(slash) and a name.
However in JavaScript, instead of using "/"(slash) we use "."(dot) to access deeper resources.
Eden Treaty turns an Elysia server into a tree-like file system that can be accessed in the JavaScript frontend instead.
| Path | Treaty |
| --- | --- |
| / |  |
| /hi | .hi |
| /deep/nested | .deep.nested |
Combined with the HTTP method, we can interact with the Elysia server.
| Path | Method | Treaty |
| --- | --- | --- |
| / | GET | .get() |
| /hi | GET | .hi.get() |
| /deep/nested | GET | .deep.nested.get() |
| /deep/nested | POST | .deep.nested.post() |


## Dynamic path [​](#dynamic-path)


However, dynamic path parameters cannot be expressed using notation. If they are fully replaced, we don't know what the parameter name is supposed to be.

typescript
```
// ❌ Unclear what the value is supposed to represent?
treaty.item['skadi'].get()
```

To handle this, we can specify a dynamic path using a function to provide a key value instead.

typescript
```
// ✅ Clear that value is dynamic path is 'name'
treaty.item({ name: 'Skadi' }).get()
```

| Path | Treaty |
| --- | --- |
| /item | .item |
| /item/:name | .item({ name: 'Skadi' }) |
| /item/:name/id | .item({ name: 'Skadi' }).id |