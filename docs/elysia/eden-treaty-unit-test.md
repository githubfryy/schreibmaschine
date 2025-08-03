According to [Eden Treaty config](https://elysiajs.com/eden/treaty/config.html#urlorinstance) and [Unit Test](https://elysiajs.com/patterns/unit-test.html), we may pass an Elysia instance to Eden Treaty directly to interact with Elysia server directly without sending a network request.
We may use this patterns to create a unit test with end-to-end type safety and type-level test all at once.

typescript
```
// test/index.test.ts
import { 

describe

, 

expect

, 

it

 } from 'bun:test'
import { 

Elysia

 } from 'elysia'
import { 

treaty

 } from '@elysiajs/eden'
const 

app

 = new 

Elysia

().

get

('/hello', 'hi')
const 

api

 = 

treaty

(

app

)

describe

('Elysia', () => {
    it

('return a response', async () => {
        const { 

data

 } = await 

api

.

hello

.

get

()
        expect

(

data

).

toBe

('hi')
    })
})
```


## Type safety test [​](#type-safety-test)


To perform a type safety test, simply run tscto test folders.

bash
```
tsc --noEmit test//*.ts
```

This is useful to ensure type integrity for both client and server, especially during migrations.