Imagine you have a toy train set.
Each piece of the train track has to fit perfectly with the next one, like puzzle pieces.
End-to-end type safety is like making sure all the pieces of the track match up correctly so the train doesn't fall off or get stuck.
For a framework to have end-to-end type safety means you can connect client and server in a type-safe manner.
Elysia provide end-to-end type safety without code generationout of the box with RPC-like connector, EdenSomething went wrong trying to load video
Others framework that support e2e type safety:

-   tRPC
-   Remix
-   SvelteKit
-   Nuxt
-   TS-Rest

Elysia allows you to change the type on the server and it will be instantly reflected on the client, helping with auto-completion and type-enforcement.


## Eden [​](#eden)


Eden is a RPC-like client to connect Elysia end-to-end type safetyusing only TypeScript's type inference instead of code generation.
Allowing you to sync client and server types effortlessly, weighing less than 2KB.
Eden is consists of 2 modules:

1.  Eden Treaty (recommended): an improved version RFC version of Eden Treaty
2.  Eden Fetch: Fetch-like client with type safety.

Below is an overview, use-case and comparison for each module.


## Eden Treaty (Recommended) [​](#eden-treaty-recommended)


Eden Treaty is an object-like representation of an Elysia server providing end-to-end type safety and a significantly improved developer experience.
With Eden Treaty we can connect interact Elysia server with full-type support and auto-completion, error handling with type narrowing, and creating type safe unit test.
Example usage of Eden Treaty:

typescript
```
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

app

.
// Call [GET] at '/'
const { data } = await 

app

.

get

()
// Call [PUT] at '/nendoroid/:id'
const { 

data

: 

nendoroid

, 

error

 } = await 

app

.

nendoroid

({ 

id

: 1895 }).

put

({
    name

: 'Skadi',
    from

: 'Arknights'
})
```


## Eden Fetch [​](#eden-fetch)


A fetch-like alternative to Eden Treaty for developers that prefers fetch syntax.

typescript
```
import { edenFetch } from '@elysiajs/eden'
import type { App } from './server'
const fetch = edenFetch<App>('http://localhost:3000')
const { data } = await fetch('/name/:name', {
    method: 'POST',
    params: {
        name: 'Saori'
    },
    body: {
        branch: 'Arius',
        type: 'Striker'
    }
})
```

NOTE
Unlike Eden Treaty, Eden Fetch doesn't provide Web Socket implementation for Elysia server