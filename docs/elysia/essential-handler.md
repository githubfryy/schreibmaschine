Handler is a function that responds to the request for each route.
Accepting request information and returning a response to the client.
Altenatively, handler is also known as a Controllerin other frameworks.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    // the function `() => 'hello world'` is a handler
    .get('/', () => 'hello world')
    .listen(3000)
```

Handler maybe a literal value, and can be inlined.

typescript
```
import { Elysia, file } from 'elysia'
new Elysia()
    .get('/', 'Hello Elysia')
    .get('/video', file('kyuukurarin.mp4'))
    .listen(3000)
```

Using an inline value always returns the same value which is useful to optimize performance for static resource like file.
This allows Elysia to compile the response ahead of time to optimize performance.

TIP
Providing an inline value is not a cache.
Static Resource value, headers and status can be mutate dynamically using lifecycle.


## Context [​](#context)


Contextcontains a request information which unique for each request, and is not shared except for `store` (global mutable state).

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
	.

get

('/', (

context

) => 

context

.

path

)
            // ^ This is a context
```

Contextcan only be retrieved in a route handler. It consists of:

-   path- Pathname of the request
-   body- [HTTP message](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages), form or file upload.
-   query- [Query String](https://en.wikipedia.org/wiki/Query_string), include additional parameters for search query as JavaScript Object. (Query is extracted from a value after pathname starting from '?' question mark sign)
-   params- Elysia's path parameters parsed as JavaScript object
-   headers- [HTTP Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers), additional information about the request like User-Agent, Content-Type, Cache Hint.
-   request- [Web Standard Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
-   redirect- A function to redirect a response
-   store- A global mutable store for Elysia instance
-   cookie- A global mutable signal store for interacting with Cookie (including get/set)
-   set- Property to apply to Response:
    -   status- [HTTP status](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status), defaults to 200 if not set.
    -   headers- Response headers
    -   redirect- Response as a path to redirect to
-   error- A function to return custom status code
-   server- Bun server instance


## Set [​](#set)


setis a mutable property that form a response accessible via `Context.set`.

-   set.status- Set custom status code
-   set.headers- Append custom headers
-   set.redirect- Append redirect

ts
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
	.

get

('/', ({ 

set

, 

status

 }) => {
		set

.

headers

 = { 'X-Teapot': 'true' }
		return 

status

(418, 'I am a teapot')
	})
	.

listen

(3000)
```


### status [​](#status)


We can return a custom status code by using either:

-   statusfunction (recommended)
-   set.status(legacy)

typescript
```
import { Elysia } from 'elysia'
new Elysia()
	.get('/error', ({ error }) => error(418, 'I am a teapot'))
	.get('/set.status', ({ set }) => {
		set.status = 418
		return 'I am a teapot'
	})
	.listen(3000)
```


### status function [​](#status-function)


A dedicated `status` function for returning status code with response.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .get('/', ({ status }) => status(418, "Kirifuji Nagisa"))
    .listen(3000)
```

localhost
GET

It's recommend to use `status` inside main handler as it has better inference:

-   allows TypeScript to check if a return value is correctly type to response schema
-   autocompletion for type narrowing base on status code
-   type narrowing for error handling using End-to-end type safety ([Eden](https://elysiajs.com/eden/overview.html))


### set.status [​](#set-status)


Set a default status code if not provided.
It's recommended to use this in a plugin that only needs to return a specific status code while allowing the user to return a custom value. For example, HTTP 201/206 or 403/405, etc.

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    .

onBeforeHandle

(({ 

set

 }) => {
        set

.

status

 = 418
        return 'Kirifuji Nagisa'
    })
    .

get

('/', () => 'hi')
    .

listen

(3000)
```

Unlike `status` function, `set.status` cannot infer the return value type, therefore it can't check if the return value is correctly type to response schema.

TIP
HTTP Status indicates the type of response. If the route handler is executed successfully without error, Elysia will return the status code 200.

You can also set a status code using the common name of the status code instead of using a number.

typescript
```
// @errors 2322
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    .

get

('/', ({ 

set

 }) => {
        set

.

status
        return 'Kirifuji Nagisa'
    })
    .

listen

(3000)
```


### set.headers [​](#set-headers)


Allowing us to append or delete a response headers represent as Object.

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    .

get

('/', ({ 

set

 }) => {
        set

.

headers

['x-powered-by'] = 'Elysia'
        return 'a mimir'
    })
    .

listen

(3000)
```

WARNING
The names of headers should be lowercase to force case-sensitivity consistency for HTTP headers and auto-completion, eg. use `set-cookie` rather than `Set-Cookie`.


### redirect [​](#redirect)


Redirect a request to another resource.

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    .

get

('/', ({ 

redirect

 }) => {
        return 

redirect

('https://youtu.be/whpVWVWBW4U?&t=8')
    })
    .

get

('/custom-status', ({ 

redirect

 }) => {
        // You can also set custom status to redirect
        return 

redirect

('https://youtu.be/whpVWVWBW4U?&t=8', 302)
    })
    .

listen

(3000)
```

When using redirect, returned value is not required and will be ignored. As response will be from another resource.


## Server [​](#server)


Server instance is accessible via `Context.server` to interact with the server.
Server could be nullable as it could be running in a different environment (test).
If server is running (allocating) using Bun, `server` will be available (not null).

typescript
```
import { Elysia } from 'elysia'
new Elysia()
	.get('/port', ({ server }) => {
		return server?.port
	})
	.listen(3000)
```


### Request IP [​](#request-ip)


We can get request IP by using `server.requestIP` method

typescript
```
import { Elysia } from 'elysia'
new Elysia()
	.get('/ip', ({ server, request }) => {
		return server?.requestIP(request)
	})
	.listen(3000)
```


## Response [​](#response)


Elysia is built on top of Web Standard Request/Response.
To comply with the Web Standard, a value returned from route handler will be mapped into a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) by Elysia.
Letting you focus on business logic rather than boilerplate code.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    // Equivalent to "new Response('hi')"
    .get('/', () => 'hi')
    .listen(3000)
```

If you prefer an explicit Response class, Elysia also handles that automatically.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .get('/', () => new Response('hi'))
    .listen(3000)
```

TIP
Using a primitive value or `Response` has near identical performance (+- 0.1%), so pick the one you prefer, regardless of performance.


## Formdata [​](#formdata)


We may return a `FormData` by using returning `form` utility directly from the handler.

typescript
```
import { Elysia, form, file } from 'elysia'
new Elysia()
	.get('/', () => form({
		name: 'Tea Party',
		images: [file('nagi.web'), file('mika.webp')]
	}))
	.listen(3000)
```

This pattern is useful if even need to return a file or multipart form data.


### Return a single file [​](#return-a-single-file)


Or alternatively, you can return a single file by returning `file` directly without `form`.

typescript
```
import { Elysia, file } from 'elysia'
new Elysia()
	.get('/', file('nagi.web'))
	.listen(3000)
```


## Handle [​](#handle)


As Elysia is built on top of Web Standard Request, we can programmatically test it using `Elysia.handle`.

typescript
```
import { Elysia } from 'elysia'
const app = new Elysia()
    .get('/', () => 'hello')
    .post('/hi', () => 'hi')
    .listen(3000)
app.handle(new Request('http://localhost/')).then(console.log)
```

Elysia.handleis a function to process an actual request sent to the server.

TIP
Unlike unit test's mock, you can expect it to behave like an actual requestsent to the server.
But also useful for simulating or creating unit tests.


## Stream [​](#stream)


To return a response streaming out of the box by using a generator function with `yield` keyword.

typescript
```
import { Elysia } from 'elysia'
const app = new Elysia()
	.get('/ok', function* () {
		yield 1
		yield 2
		yield 3
	})
```

This this example, we may stream a response by using `yield` keyword.


## Server Sent Events (SSE) [​](#server-sent-events-sse)


Elysia supports [Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) by providing a `sse` utility function.

typescript
```
import { 

Elysia

, 

sse

 } from 'elysia'
new 

Elysia

()
	.

get

('/sse', function* () {
		yield 

sse

('hello world')
		yield 

sse

({
			event

: 'message',
			data

: {
				message

: 'This is a message',
				timestamp

: new 

Date

().

toISOString

()
			},
		})
	})
```

When a value is wrapped in `sse`, Elysia will automatically set the response headers to `text/event-stream` and format the data as an SSE event.


### Set headers [​](#set-headers-1)


Elysia will defers returning response headers until the first chunk is yielded.
This allows us to set headers before the response is streamed.

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
	.

get

('/ok', function* ({ 

set

 }) {
		// This will set headers
		set

.

headers

['x-name'] = 'Elysia'
		yield 1
		yield 2
		// This will do nothing
		set

.

headers

['x-id'] = '1'
		yield 3
	})
```

Once the first chunk is yielded, Elysia will send the headers and the first chunk in the same response.
Setting headers after the first chunk is yielded will do nothing.


### Conditional Stream [​](#conditional-stream)


If the response is returned without yield, Elysia will automatically convert stream to normal response instead.

typescript
```
import { Elysia } from 'elysia'
const app = new Elysia()
	.get('/ok', function* () {
		if (Math.random() > 0.5) return 'ok'
		yield 1
		yield 2
		yield 3
	})
```

This allows us to conditionally stream a response or return a normal response if necessary.


### Abort [​](#abort)


While streaming a response, it's common that request may be cancelled before the response is fully streamed.
Elysia will automatically stop the generator function when the request is cancelled.


### Eden [​](#eden)


[Eden](https://elysiajs.com/eden/overview.html) will interpret a stream response as `AsyncGenerator` allowing us to use `for await` loop to consume the stream.

typescript
```
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

()
	.

get

('/ok', function* () {
		yield 1
		yield 2
		yield 3
	})
const { 

data

, 

error

 } = await 

treaty

(

app

).

ok

.

get

()
if (

error

) throw 

error

for await (const 

chunk

 of 

data

)
	console

.

log

(

chunk

)
```


## Extending context [​](#extending-context)


As Elysia only provides essential information, we can customize Context for our specific need for instance:

-   extracting user ID as variable
-   inject a common pattern repository
-   add a database connection

We may extend Elysia's context by using the following APIs to customize the Context:

-   [state](#state) - a global mutable state
-   [decorate](#decorate) - additional property assigned to Context-   [derive](#derive) / [resolve](#resolve) - create a new value from existing property


### When to extend context [​](#when-to-extend-context)


You should only extend context when:

-   A property is a global mutable state, and shared across multiple routes using [state](#state)
-   A property is associated with a request or response using [decorate](#decorate)
-   A property is derived from an existing property using [derive](#derive) / [resolve](#resolve)

Otherwise, we recommend defining a value or function separately than extending the context.

TIP
It's recommended to assign properties related to request and response, or frequently used functions to Context for separation of concerns.


## State [​](#state)


Stateis a global mutable object or state shared across the Elysia app.
Once stateis called, value will be added to storeproperty once at call time, and can be used in handler.

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

('version', 1)
    .

get

('/a', ({ 

store

: { 

version

 } }) => 

version

)
    .

get

('/b', ({ 

store

 }) => 

store

)
    .

get

('/c', () => 'still ok')
    .

listen

(3000)
```

localhost
GET


### When to use [​](#when-to-use)


-   When you need to share a primitive mutable value across multiple routes
-   If you want to use a non-primitive or a `wrapper` value or class that mutate an internal state, use [decorate](#decorate) instead.


### Key takeaway [​](#key-takeaway)


-   storeis a representation of a single-source-of-truth global mutable object for the entire Elysia app.
-   stateis a function to assign an initial value to store, which could be mutated later.
-   Make sure to assign a value before using it in a handler.

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    // ❌ TypeError: counter doesn't exist in store
    .

get

('/error', ({ 

store

 }) => 

store

.counter)
Property 'counter' does not exist on type '{}'.
    .

state

('counter', 0)
    // ✅ Because we assigned a counter before, we can now access it
    .

get

('/', ({ 

store

 }) => 

store

.

counter

)
```

localhost
GET

TIP
Beware that we cannot use a state value before assign.
Elysia registers state values into the store automatically without explicit type or additional TypeScript generic needed.


## Decorate [​](#decorate)


decorateassigns an additional property to Contextdirectly at call time.

typescript
```
import { 

Elysia

 } from 'elysia'
class 

Logger

 {
    log

(

value

: string) {
        console

.

log

(

value

)
    }
}
new 

Elysia

()
    .

decorate

('logger', new 

Logger

())
    // ✅ defined from the previous line
    .

get

('/', ({ 

logger

 }) => {
        logger

.

log

('hi')
        return 'hi'
    })
```


### When to use [​](#when-to-use-1)


-   A constant or readonly value object to Context-   Non primitive value or class that may contain internal mutable state
-   Additional functions, singleton, or immutable property to all handlers.


### Key takeaway [​](#key-takeaway-1)


-   Unlike state, decorated value SHOULD NOTbe mutated although it's possible
-   Make sure to assign a value before using it in a handler.


## Derive [​](#derive)


Retrieve values from existing properties in Contextand assign new properties.
Derive assigns when request happens at transform lifecycleallowing us to "derive" (create new properties from existing properties).

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    .

derive

(({ 

headers

 }) => {
        const 

auth

 = 

headers

['authorization']
        return {
            bearer

: 

auth

?.

startsWith

('Bearer ') ? 

auth

.

slice

(7) : null
        }
    })
    .

get

('/', ({ 

bearer

 }) => 

bearer

)
```

localhost
GET

Because deriveis assigned once a new request starts, derivecan access request properties like headers, query, bodywhere store, and decoratecan't.


### When to use [​](#when-to-use-2)


-   Create a new property from existing properties in Contextwithout validation or type checking
-   When you need to access request properties like headers, query, bodywithout validation


### Key takeaway [​](#key-takeaway-2)


-   Unlike stateand decorateinstead of assign at call time, deriveis assigned once a new request starts.
-   derive is called at transform, or before validationhappens, Elysia cannot safely confirm the type of request property resulting in as unknown. If you want to assign a new value from typed request properties, you may want to use [resolve](#resolve) instead.


## Resolve [​](#resolve)


Same as [derive](#derive), resolve allow us to assign a new property to context.
Resolve is called at beforeHandlelifecycle or after validation, allowing us to deriverequest properties safely.

typescript
```
import { 

Elysia

, 

t

 } from 'elysia'
new 

Elysia

()
	.

guard

({
		headers

: 

t

.

Object

({
			bearer

: 

t

.

String

({
				pattern

: '^Bearer .+$'
			})
		})
	})
	.

resolve

(({ 

headers

 }) => {
		return {
			bearer

: 

headers

.

bearer

.

slice

(7)
		}
	})
	.

get

('/', ({ 

bearer

 }) => 

bearer

)
```


### When to use [​](#when-to-use-3)


-   Create a new property from existing properties in Contextwith type integrity (type checked)
-   When you need to access request properties like headers, query, bodywith validation


### Key takeaway [​](#key-takeaway-3)


-   resolve is called at beforeHandle, or after validationhappens. Elysia can safely confirm the type of request property resulting in as typed.


### Error from resolve/derive [​](#error-from-resolve-derive)


As resolve and derive is based on transformand beforeHandlelifecycle, we can return an error from resolve and derive. If error is returned from derive, Elysia will return early exit and return the error as response.

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    .

derive

(({ 

headers

, 

status

 }) => {
        const 

auth

 = 

headers

['authorization']
        if(!

auth

) return 

status

(400)
        return {
            bearer

: 

auth

?.

startsWith

('Bearer ') ? 

auth

.

slice

(7) : null
        }
    })
    .

get

('/', ({ 

bearer

 }) => 

bearer

)
```


## Pattern [​](#pattern)


state, decorateoffers a similar APIs pattern for assigning property to Context as the following:

-   key-value
-   object
-   remap

Where derivecan be only used with remapbecause it depends on existing value.


### key-value [​](#key-value)


We can use state, and decorateto assign a value using a key-value pattern.

typescript
```
import { Elysia } from 'elysia'
class Logger {
    log(value: string) {
        console.log(value)
    }
}
new Elysia()
    .state('counter', 0)
    .decorate('logger', new Logger())
```

This pattern is great for readability for setting a single property.


### Object [​](#object)


Assigning multiple properties is better contained in an object for a single assignment.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .decorate({
        logger: new Logger(),
        trace: new Trace(),
        telemetry: new Telemetry()
    })
```

The object offers a less repetitive API for setting multiple values.


### Remap [​](#remap)


Remap is a function reassignment.
Allowing us to create a new value from existing value like renaming or removing a property.
By providing a function, and returning an entirely new object to reassign the value.

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

('counter', 0)
    .

state

('version', 1)
    .

state

(({ 

version

, ...

store

 }) => ({
        ...

store

,
        elysiaVersion

: 1
    }))
    // ✅ Create from state remap
    .

get

('/elysia-version', ({ 

store

 }) => 

store

.

elysiaVersion

)
    // ❌ Excluded from state remap
    .

get

('/version', ({ 

store

 }) => 

store

.version)
Property 'version' does not exist on type '{ elysiaVersion: number; counter: number; }'.
```

localhost
GET

It's a good idea to use state remap to create a new initial value from the existing value.
However, it's important to note that Elysia doesn't offer reactivity from this approach, as remap only assigns an initial value.

TIP
Using remap, Elysia will treat a returned object as a new property, removing any property that is missing from the object.


## Affix [​](#affix)


To provide a smoother experience, some plugins might have a lot of property value which can be overwhelming to remap one-by-one.
The Affixfunction which consists of prefixand suffix, allowing us to remap all property of an instance.

ts
```
import { 

Elysia

 } from 'elysia'
const 

setup

 = new 

Elysia

({ 

name

: 'setup' })
    .

decorate

({
        argon

: 'a',
        boron

: 'b',
        carbon

: 'c'
    })
const 

app

 = new 

Elysia

()
    .

use

(
        setup
            .

prefix

('decorator', 'setup')
    )
    .

get

('/', ({ 

setupCarbon

, ...

rest

 }) => 

setupCarbon

)
```

localhost
GET

Allowing us to bulk remap a property of the plugin effortlessly, preventing the name collision of the plugin.
By default, affixwill handle both runtime, type-level code automatically, remapping the property to camelCase as naming convention.
In some condition, we can also remap `all` property of the plugin:

ts
```
import { 

Elysia

 } from 'elysia'
const 

setup

 = new 

Elysia

({ 

name

: 'setup' })
    .

decorate

({
        argon

: 'a',
        boron

: 'b',
        carbon

: 'c'
    })
const 

app

 = new 

Elysia

()
    .

use

(

setup

.

prefix

('all', 'setup')) 
    .

get

('/', ({ 

setupCarbon

, ...

rest

 }) => 

setupCarbon

)
```


## Reference and value [​](#reference-and-value)


To mutate the state, it's recommended to use referenceto mutate rather than using an actual value.
When accessing the property from JavaScript, if we define a primitive value from an object property as a new value, the reference is lost, the value is treated as new separate value instead.
For example:

typescript
```
const store = {
    counter: 0
}
store.counter++
console.log(store.counter) // ✅ 1
```

We can use store.counterto access and mutate the property.
However, if we define a counter as a new value

typescript
```
const store = {
    counter: 0
}
let counter = store.counter
counter++
console.log(store.counter) // ❌ 0
console.log(counter) // ✅ 1
```

Once a primitive value is redefined as a new variable, the reference "link"will be missing, causing unexpected behavior.
This can apply to `store`, as it's a global mutable object instead.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .state('counter', 0)
    // ✅ Using reference, value is shared
    .get('/', ({ store }) => store.counter++)
    // ❌ Creating a new variable on primitive value, the link is lost
    .get('/error', ({ store: { counter } }) => counter)
```

localhost
GET


## TypeScript [​](#typescript)


Elysia automatically type context base on various of factors like store, decorators, schema.
It's recommended to leave Elysia to type context instead of manually define one.
However, Elysia also offers some utility type to help you define a handler type.

-   [InferContext](#infercontext)
-   [InferHandle](#inferhandler)


### InferContext [​](#infercontext)


Infer context is a utility type to help you define a context type based on Elysia instance.

typescript
```
import { 

Elysia

, type 

InferContext

 } from 'elysia'
const 

setup

 = new 

Elysia

()
	.

state

('a', 'a')
	.

decorate

('b', 'b')
type 

Context

 = 

InferContext

<typeof 

setup

>
const 

handler

 = ({ 

store

 }: 

Context

) => 

store

.

a
```


### InferHandler [​](#inferhandler)


Infer handler is a utility type to help you define a handler type based on Elysia instance, path, and schema.

typescript
```
import { 

Elysia

, type 

InferHandler

 } from 'elysia'
const 

setup

 = new 

Elysia

()
	.

state

('a', 'a')
	.

decorate

('b', 'b')
type 

Handler

 = 

InferHandler

<
	// Elysia instance to based on
	typeof 

setup

,
	// path
	'/path',
	// schema
	{
		body

: string
		response

: {
			200: string
		}
	}
>
const 

handler

: 

Handler

 = ({ 

body

 }) => 

body

const 

app

 = new 

Elysia

()
	.

get

('/', 

handler

)
```

Unlike `InferContext`, `InferHandler` requires a path and schema to define a handler type and can safely ensure type safety of a return type.