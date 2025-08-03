## Unit Test [​](#unit-test)


Being WinterCG compliant, we can use Request / Response classes to test an Elysia server.
Elysia provides the Elysia.handlemethod, which accepts a Web Standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) and returns [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), simulating an HTTP Request.
Bun includes a built-in [test runner](https://bun.sh/docs/cli/test) that offers a Jest-like API through the `bun:test` module, facilitating the creation of unit tests.
Create test/index.test.tsin the root of project directory with the following:

typescript
```
// test/index.test.ts
import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'
describe('Elysia', () => {
    it('returns a response', async () => {
        const app = new Elysia().get('/', () => 'hi')
        const response = await app
            .handle(new Request('http://localhost/'))
            .then((res) => res.text())
        expect(response).toBe('hi')
    })
})
```

Then we can perform tests by running bun testbash
```
bun test
```

New requests to an Elysia server must be a fully valid URL, NOTa part of a URL.
The request must provide URL as the following:
| URL | Valid |
| --- | --- |
| http://localhost/user | ✅ |
| /user | ❌ |
We can also use other testing libraries like Jest to create Elysia unit tests.


## Eden Treaty test [​](#eden-treaty-test)


We may use Eden Treaty to create an end-to-end type safety test for Elysia server as follows:

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

('returns a response', async () => {
        const { 

data

, 

error

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

See [Eden Treaty Unit Test](https://elysiajs.com/eden/treaty/unit-test.html) for setup and more information.