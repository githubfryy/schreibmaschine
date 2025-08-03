Start by installing Eden on your frontend:

bash
```
bun add @elysiajs/eden
bun add -d elysia
```

TIP
Eden needs Elysia to infer utilities type.
Make sure to install Elysia with the version matching on the server.

First, export your existing Elysia server type:

typescript
```
// server.ts
import { Elysia, t } from 'elysia'
const app = new Elysia()
    .get('/', () => 'Hi Elysia')
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

Then consume the Elysia API on client side:

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

client

 = 

treaty

<

App

>('localhost:3000') 
// response: Hi Elysia
const { 

data

: 

index

 } = await 

client

.

get

()
// response: 1895
const { 

data

: 

id

 } = await 

client

.

id

({ 

id

: 1895 }).

get

()
// response: { id: 1895, name: 'Skadi' }
const { 

data

: 

nendoroid

 } = await 

client

.

mirror

.

post

({
    id

: 1895,
    name

: 'Skadi'
})

client

.
```


## Gotcha [​](#gotcha)


Sometimes, Eden may not infer types from Elysia correctly, the following are the most common workarounds to fix Eden type inference.


### Type Strict [​](#type-strict)


Make sure to enable strict mode in tsconfig.jsonjson
```
{
  "compilerOptions": {
    "strict": true
  }
}
```


### Unmatch Elysia version [​](#unmatch-elysia-version)


Eden depends on Elysia class to import Elysia instance and infer types correctly.
Make sure that both client and server have the matching Elysia version.
You can check it with [`npm why`](https://docs.npmjs.com/cli/v10/commands/npm-explain) command:

bash
```
npm why elysia
```

And output should contain only one elysia version on top-level:

```
[[email protected]](https://elysiajs.com/cdn-cgi/l/email-protection)
node_modules/elysia
  elysia@"1.1.25" from the root project
  peer elysia@">= 1.1.0" from @elysiajs/[[email protected]](https://elysiajs.com/cdn-cgi/l/email-protection)
  node_modules/@elysiajs/html
    dev @elysiajs/html@"1.1.1" from the root project
  peer elysia@">= 1.1.0" from @elysiajs/[[email protected]](https://elysiajs.com/cdn-cgi/l/email-protection)
  node_modules/@elysiajs/opentelemetry
    dev @elysiajs/opentelemetry@"1.1.7" from the root project
  peer elysia@">= 1.1.0" from @elysiajs/[[email protected]](https://elysiajs.com/cdn-cgi/l/email-protection)
  node_modules/@elysiajs/swagger
    dev @elysiajs/swagger@"1.1.6" from the root project
  peer elysia@">= 1.1.0" from @elysiajs/[[email protected]](https://elysiajs.com/cdn-cgi/l/email-protection)
  node_modules/@elysiajs/eden
    dev @elysiajs/eden@"1.1.3" from the root project
```


### TypeScript version [​](#typescript-version)


Elysia uses newer features and syntax of TypeScript to infer types in the most performant way. Features like Const Generic and Template Literal are heavily used.
Make sure your client has a minimum TypeScript version if >= 5.0### Method Chaining [​](#method-chaining)

To make Eden work, Elysia must use method chainingElysia's type system is complex, methods usually introduce a new type to the instance.
Using method chaining will help save that new type reference.
For example:

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    .

state

('build', 1)
    // Store is strictly typed
    .

get

('/', ({ 

store

: { 

build

 } }) => 

build

)
    .

listen

(3000)
```

Using this, statenow returns a new ElysiaInstancetype, introducing buildinto store replacing the current one.
Without method chaining, Elysia doesn't save the new type when introduced, leading to no type inference.

typescript
```
import { 

Elysia

 } from 'elysia'
const 

app

 = new 

Elysia

()

app

.

state

('build', 1)

app

.

get

('/', ({ 

store

: { build } }) => 

build

)
Property 'build' does not exist on type '{}'.

app

.

listen

(3000)
```


### Type Definitions [​](#type-definitions)


If you are using a Bun specific feature, like `Bun.file` or similar API and return it from a handler, you may need to install Bun type definitions to the client as well.

bash
```
bun add -d @types/bun
```


### Path alias (monorepo) [​](#path-alias-monorepo)


If you are using path alias in your monorepo, make sure that frontend is able to resolve the path as same as backend.

TIP
Setting up path alias in monorepo is a bit tricky, you can fork our example template: [Kozeki Template](https://github.com/SaltyAom/kozeki-template) and modify it to your needs.

For example, if you have the following path alias for your backend in tsconfig.json:

json
```
{
  "compilerOptions": {
  	"baseUrl": ".",
	"paths": {
	  "@/*": ["./src/*"]
	}
  }
}
```

And your backend code is like this:

typescript
```
import { Elysia } from 'elysia'
import { a, b } from '@/controllers'
const app = new Elysia()
	.use(a)
	.use(b)
	.listen(3000)
export type app = typeof app
```

You mustmake sure that your frontend code is able to resolve the same path alias. Otherwise, type inference will be resolved as any.

typescript
```
import { treaty } from '@elysiajs/eden'
import type { app } from '@/index'
const client = treaty<app>('localhost:3000')
// This should be able to resolve the same module both frontend and backend, and not `any`
import { a, b } from '@/controllers'
```

To fix this, you must make sure that path alias is resolved to the same file in both frontend and backend.
So, you must change the path alias in tsconfig.jsonto:

json
```
{
  "compilerOptions": {
  	"baseUrl": ".",
	"paths": {
	  "@/*": ["../apps/backend/src/*"]
	}
  }
}
```

If configured correctly, you should be able to resolve the same module in both frontend and backend.

typescript
```
// This should be able to resolve the same module both frontend and backend, and not `any`
import { a, b } from '@/controllers'
```


#### Scope [​](#scope)


We recommended adding a scopeprefix for each module in your monorepo to avoid any confusion and conflict that may happen.

json
```
{
  "compilerOptions": {
  	"baseUrl": ".",
	"paths": {
	  "@frontend/*": ["./apps/frontend/src/*"],
	  "@backend/*": ["./apps/backend/src/*"]
	}
  }
}
```

Then, you can import the module like this:

typescript
```
// Should work in both frontend and backend and not return `any`
import { a, b } from '@backend/controllers'
```

We recommend creating a single tsconfig.jsonthat defines a `baseUrl` as the root of your repo, provide a path according to the module location, and create a tsconfig.jsonfor each module that inherits the root tsconfig.jsonwhich has the path alias.
You may find a working example of in this [path alias example repo](https://github.com/SaltyAom/elysia-monorepo-path-alias) or [Kozeki Template](https://github.com/SaltyAom/kozeki-template).