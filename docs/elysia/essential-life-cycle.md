## Lifecycle [​](#lifecycle)


Life Cycle allows us to intercept an important event at the predefined point allowing us to customize the behavior of our server as needed.
Elysia's Life Cycle event can be illustrated as the following. ![Elysia Life Cycle Graph](https://elysiajs.com/assets/lifecycle-chart.svg)

> Click on image to enlarge

Below are the request life cycle available in Elysia:


## Why [​](#why)


Imagine we want to return some HTML.
We need to set "Content-Type"headers as "text/html"for the browser to render HTML.
Explicitly specifying that the response is HTML could be repetitive if there are a lot of handlers, say ~200 endpoints.
This can lead to a lot of duplicated code just to specify the "text/html""Content-Type"But what if after we send a response, we could detect that the response is an HTML string then append the header automatically?
That's when the concept of Life Cycle comes into play.


## Hook [​](#hook)


We refer to each function that intercepts the life cycle event as "hook", as the function hooks into the lifecycle event.
Hooks can be categorized into 2 types:

1.  Local Hook: Execute on a specific route
2.  Interceptor Hook: Execute on every route

TIP
The hook will accept the same Context as a handler, you can imagine adding a route handler but at a specific point.


## Local Hook [​](#local-hook)


The local hook is executed on a specific route.
To use a local hook, you can inline hook into a route handler:

typescript
```
import { Elysia } from 'elysia'
import { isHtml } from '@elysiajs/html'
new Elysia()
    .get('/', () => '<h1>Hello World</h1>', {
        afterHandle({ response, set }) {
            if (isHtml(response))
                set.headers['Content-Type'] = 'text/html; charset=utf8'
        }
    })
    .get('/hi', () => '<h1>Hello World</h1>')
    .listen(3000)
```

The response should be listed as follows:
| Path | Content-Type |
| --- | --- |
| / | text/html; charset=utf8 |
| /hi | text/plain; charset=utf8 |


## Interceptor Hook [​](#interceptor-hook)


Register hook into every handler of the current instancethat came after.
To add an interceptor hook, you can use `.on` followed by a life cycle event in camelCase:

typescript
```
import { Elysia } from 'elysia'
import { isHtml } from '@elysiajs/html'
new Elysia()
    .get('/none', () => '<h1>Hello World</h1>')
    .onAfterHandle(({ response, set }) => {
        if (isHtml(response))
            set.headers['Content-Type'] = 'text/html; charset=utf8'
    })
    .get('/', () => '<h1>Hello World</h1>')
    .get('/hi', () => '<h1>Hello World</h1>')
    .listen(3000)
```

The response should be listed as follows:
| Path | Content-Type |
| --- | --- |
| / | text/html; charset=utf8 |
| /hi | text/html; charset=utf8 |
| /none | text/plain; charset=utf8 |
Events from other plugins are also applied to the route so the order of code is important.

TIP
The code above will only apply to the current instance, not applying to parent.
See [scope](https://elysiajs.com/essential/plugin.html#scope) to find out why


## Order of code [​](#order-of-code)


The order of Elysia's life-cycle code is very important.
Because event will only apply to routes afterit is registered.
If you put the onError before plugin, plugin will not inherit the onError event.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
 	.onBeforeHandle(() => {
        console.log('1')
    })
	.get('/', () => 'hi')
    .onBeforeHandle(() => {
        console.log('2')
    })
    .listen(3000)
```

Console should log the following:

bash
```
1
```

Notice that it doesn't log 2, because the event is registered after the route so it is not applied to the route.
This also applies to the plugin.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
	.onBeforeHandle(() => {
		console.log('1')
	})
	.use(someRouter)
	.onBeforeHandle(() => {
		console.log('2')
	})
	.listen(3000)
```

In the code above, only 1will be logged, because the event is registered after the plugin.
This is because each events will be inline into a route handler to create a true encapsulation scope and static code analysis.
The only exception is `onRequest` which is executed before the route handler so it couldn't be inlined and tied to the routing process instead.


## Request [​](#request)


The first life-cycle event to get executed for every new request is recieved.
As `onRequest` is designed to provide only the most crucial context to reduce overhead, it is recommended to use in the following scenario:

-   Caching
-   Rate Limiter / IP/Region Lock
-   Analytic
-   Provide custom header, eg. CORS


#### Example [​](#example)


Below is a pseudo code to enforce rate-limit on a certain IP address.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .use(rateLimiter)
    .onRequest(({ rateLimiter, ip, set, status }) => {
        if (rateLimiter.check(ip)) return status(420, 'Enhance your calm')
    })
    .get('/', () => 'hi')
    .listen(3000)
```

If a value is returned from `onRequest`, it will be used as the response and the rest of the life-cycle will be skipped.


### Pre Context [​](#pre-context)


Context's onRequest is typed as `PreContext`, a minimal representation of `Context` with the attribute on the following: request: `Request`

-   set: `Set`
-   store
-   decorators

Context doesn't provide `derived` value because derive is based on `onTransform` event.


## Parse [​](#parse)


Parse is an equivalent of body parserin Express.
A function to parse body, the return value will be append to `Context.body`, if not, Elysia will continue iterating through additional parser functions assigned by `onParse` until either body is assigned or all parsers have been executed.
By default, Elysia will parse the body with content-type of:

-   `text/plain`
-   `application/json`
-   `multipart/form-data`
-   `application/x-www-form-urlencoded`

It's recommended to use the `onParse` event to provide a custom body parser that Elysia doesn't provide.


#### Example [​](#example-1)


Below is an example code to retrieve value based on custom headers.

typescript
```
import { Elysia } from 'elysia'
new Elysia().onParse(({ request, contentType }) => {
    if (contentType === 'application/custom-type') return request.text()
})
```

The returned value will be assigned to Context.body. If not, Elysia will continue iterating through additional parser functions from onParsestack until either body is assigned or all parsers have been executed.


### Context [​](#context)


`onParse` Context is extends from `Context` with additional properties of the following:

-   contentType: Content-Type header of the request

All of the context is based on normal context and can be used like normal context in route handler.


### Parser [​](#parser)


By default, Elysia will try to determine body parsing function ahead of time and pick the most suitable function to speed up the process.
Elysia is able to determine that body function by reading `body`.
Take a look at this example:

typescript
```
import { Elysia, t } from 'elysia'
new Elysia().post('/', ({ body }) => body, {
    body: t.Object({
        username: t.String(),
        password: t.String()
    })
})
```

Elysia read the body schema and found that, the type is entirely an object, so it's likely that the body will be JSON. Elysia then picks the JSON body parser function ahead of time and tries to parse the body.
Here's a criteria that Elysia uses to pick up type of body parser

-   `application/json`: body typed as `t.Object`
-   `multipart/form-data`: body typed as `t.Object`, and is 1 level deep with `t.File`
-   `application/x-www-form-urlencoded`: body typed as `t.URLEncoded`
-   `text/plain`: other primitive type

This allows Elysia to optimize body parser ahead of time, and reduce overhead in compile time.


### Explicit Parser [​](#explicit-parser)


However, in some scenario if Elysia fails to pick the correct body parser function, we can explicitly tell Elysia to use a certain function by specifying `type`

typescript
```
import { Elysia } from 'elysia'
new Elysia().post('/', ({ body }) => body, {
    // Short form of application/json
    parse: 'json'
})
```

Allowing us to control Elysia behavior for picking body parser function to fit our needs in a complex scenario.
`type` may be one of the following:

typescript
```
type ContentType = |
    // Shorthand for 'text/plain'
    | 'text'
    // Shorthand for 'application/json'
    | 'json'
    // Shorthand for 'multipart/form-data'
    | 'formdata'
    // Shorthand for 'application/x-www-form-urlencoded'
    | 'urlencoded'
    // Skip body parsing entirely
    | 'none'
    | 'text/plain'
    | 'application/json'
    | 'multipart/form-data'
    | 'application/x-www-form-urlencoded'
```


### Skip Body Parsing [​](#skip-body-parsing)


When you need to integrate a third-party library with HTTP handler like `trpc`, `orpc`, and it throw `Body is already used`.
This is because Web Standard Request can be parsed only once.
Both Elysia and the third-party library both has its own body parser, so you can skip body parsing on Elysia side by specifying `parse: 'none'`

typescript
```
import { Elysia } from 'elysia'
new Elysia()
	.post(
		'/',
		({ request }) => library.handle(request),
		{
			parse: 'none'
		}
	)
```


### Custom Parser [​](#custom-parser)


You can provide register a custom parser with `parser`:

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .parser('custom', ({ request, contentType }) => {
        if (contentType === 'application/elysia') return request.text()
    })
    .post('/', ({ body }) => body, {
        parse: ['custom', 'json']
    })
```


## Transform [​](#transform)


Executed just before Validationprocess, designed to mutate context to conform with the validation or appending new value.
It's recommended to use transform for the following:

-   Mutate existing context to conform with validation.
-   `derive` is based on `onTransform` with support for providing type.


#### Example [​](#example-2)


Below is an example of using transform to mutate params to be numeric values.

typescript
```
import { Elysia, t } from 'elysia'
new Elysia()
    .get('/id/:id', ({ params: { id } }) => id, {
        params: t.Object({
            id: t.Number()
        }),
        transform({ params }) {
            const id = +params.id
            if (!Number.isNaN(id)) params.id = id
        }
    })
    .listen(3000)
```


## Derive [​](#derive)


Append new value to context directly before validation. It's stored in the same stack as transform.
Unlike stateand decoratethat assigned value before the server started. deriveassigns a property when each request happens. Allowing us to extract a piece of information into a property instead.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .derive(({ headers }) => {
        const auth = headers['Authorization']
        return {
            bearer: auth?.startsWith('Bearer ') ? auth.slice(7) : null
        }
    })
    .get('/', ({ bearer }) => bearer)
```

Because deriveis assigned once a new request starts, derivecan access Request properties like headers, query, bodywhere store, and decoratecan't.
Unlike state, and decorate. Properties which assigned by deriveis unique and not shared with another request.


### Queue [​](#queue)


`derive` and `transform` is stored in the same queue.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .onTransform(() => {
        console.log(1)
    })
    .derive(() => {
        console.log(2)
        return {}
    })
```

The console should log as the following:

bash
```
1
2
```


## Before Handle [​](#before-handle)


Execute after validation and before the main route handler.
Designed to provide a custom validation to provide a specific requirement before running the main handler.
If a value is returned, the route handler will be skipped.
It's recommended to use Before Handle in the following situations:

-   Restricted access check: authorization, user sign-in
-   Custom request requirement over data structure


#### Example [​](#example-3)


Below is an example of using the before handle to check for user sign-in.

typescript
```
import { Elysia } from 'elysia'
import { validateSession } from './user'
new Elysia()
    .get('/', () => 'hi', {
        beforeHandle({ set, cookie: { session }, status }) {
            if (!validateSession(session.value)) return status(401)
        }
    })
    .listen(3000)
```

The response should be listed as follows:
| Is signed in | Response |
| --- | --- |
| ❌ | Unauthorized |
| ✅ | Hi |


### Guard [​](#guard)


When we need to apply the same before handle to multiple routes, we can use `guard` to apply the same before handle to multiple routes.

typescript
```
import { Elysia } from 'elysia'
import { signUp, signIn, validateSession, isUserExists } from './user'
new Elysia()
    .guard(
        {
            beforeHandle({ set, cookie: { session }, status }) {
                if (!validateSession(session.value)) return status(401)
            }
        },
        (app) =>
            app
                .get('/user/:id', ({ body }) => signUp(body))
                .post('/profile', ({ body }) => signIn(body), {
                    beforeHandle: isUserExists
                })
    )
    .get('/', () => 'hi')
    .listen(3000)
```


## Resolve [​](#resolve)


Append new value to context after validation. It's stored in the same stack as beforeHandle.
Resolve syntax is identical to [derive](#derive), below is an example of retrieving a bearer header from the Authorization plugin.

typescript
```
import { Elysia, t } from 'elysia'
new Elysia()
    .guard(
        {
            headers: t.Object({
                authorization: t.TemplateLiteral('Bearer ${string}')
            })
        },
        (app) =>
            app
                .resolve(({ headers: { authorization } }) => {
                    return {
                        bearer: authorization.split(' ')[1]
                    }
                })
                .get('/', ({ bearer }) => bearer)
    )
    .listen(3000)
```

Using `resolve` and `onBeforeHandle` is stored in the same queue.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .onBeforeHandle(() => {
        console.log(1)
    })
    .resolve(() => {
        console.log(2)
        return {}
    })
    .onBeforeHandle(() => {
        console.log(3)
    })
```

The console should log as the following:

bash
```
1
2
3
```

Same as derive, properties which assigned by resolveis unique and not shared with another request.


### Guard resolve [​](#guard-resolve)


As resolve is not available in local hook, it's recommended to use guard to encapsulate the resolveevent.

typescript
```
import { Elysia } from 'elysia'
import { isSignIn, findUserById } from './user'
new Elysia()
    .guard(
        {
            beforeHandle: isSignIn
        },
        (app) =>
            app
                .resolve(({ cookie: { session } }) => ({
                    userId: findUserById(session.value)
                }))
                .get('/profile', ({ userId }) => userId)
    )
    .listen(3000)
```


## After Handle [​](#after-handle)


Execute after the main handler, for mapping a returned value of before handleand route handlerinto a proper response.
It's recommended to use After Handle in the following situations:

-   Transform requests into a new value, eg. Compression, Event Stream
-   Add custom headers based on the response value, eg. Content-Type#### Example [​](#example-4)

Below is an example of using the after handle to add HTML content type to response headers.

typescript
```
import { Elysia } from 'elysia'
import { isHtml } from '@elysiajs/html'
new Elysia()
    .get('/', () => '<h1>Hello World</h1>', {
        afterHandle({ response, set }) {
            if (isHtml(response))
                set.headers['content-type'] = 'text/html; charset=utf8'
        }
    })
    .get('/hi', () => '<h1>Hello World</h1>')
    .listen(3000)
```

The response should be listed as follows:
| Path | Content-Type |
| --- | --- |
| / | text/html; charset=utf8 |
| /hi | text/plain; charset=utf8 |


### Returned Value [​](#returned-value)


If a value is returned After Handle will use a return value as a new response value unless the value is undefinedThe above example could be rewritten as the following:

typescript
```
import { Elysia } from 'elysia'
import { isHtml } from '@elysiajs/html'
new Elysia()
    .get('/', () => '<h1>Hello World</h1>', {
        afterHandle({ response, set }) {
            if (isHtml(response)) {
                set.headers['content-type'] = 'text/html; charset=utf8'
                return new Response(response)
            }
        }
    })
    .get('/hi', () => '<h1>Hello World</h1>')
    .listen(3000)
```

Unlike beforeHandle, after a value is returned from afterHandle, the iteration of afterHandle will NOTbe skipped.### Context [​](#context-1)

`onAfterHandle` context extends from `Context` with the additional property of `response`, which is the response to return to the client.
The `onAfterHandle` context is based on the normal context and can be used like the normal context in route handlers.


## Map Response [​](#map-response)


Executed just after "afterHandle", designed to provide custom response mapping.
It's recommended to use transform for the following:

-   Compression
-   Map value into a Web Standard Response


#### Example [​](#example-5)


Below is an example of using mapResponse to provide Response compression.

typescript
```
import { Elysia } from 'elysia'
const encoder = new TextEncoder()
new Elysia()
    .mapResponse(({ response, set }) => {
        const isJson = typeof response === 'object'
        const text = isJson
            ? JSON.stringify(response)
            : (response?.toString() ?? '')
        set.headers['Content-Encoding'] = 'gzip'
        return new Response(Bun.gzipSync(encoder.encode(text)), {
            headers: {
                'Content-Type': `${
                    isJson ? 'application/json' : 'text/plain'
                }; charset=utf-8`
            }
        })
    })
    .get('/text', () => 'mapResponse')
    .get('/json', () => ({ map: 'response' }))
    .listen(3000)
```

Like parseand beforeHandle, after a value is returned, the next iteration of mapResponsewill be skipped.
Elysia will handle the merging process of set.headersfrom mapResponseautomatically. We don't need to worry about appending set.headersto Response manually.


## On Error (Error Handling) [​](#on-error-error-handling)


Designed for error-handling. It will be executed when an error is thrown in any life-cycle.
Its recommended to use on Error in the following situation:

-   To provide custom error message
-   Fail safe or an error handler or retrying a request
-   Logging and analytic


#### Example [​](#example-6)


Elysia catches all the errors thrown in the handler, classifies the error code, and pipes them to `onError` middleware.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .onError(({ code, error }) => {
        return new Response(error.toString())
    })
    .get('/', () => {
        throw new Error('Server is during maintenance')
        return 'unreachable'
    })
```

With `onError` we can catch and transform the error into a custom error message.

TIP
It's important that `onError` must be called before the handler we want to apply it to.


### Custom 404 message [​](#custom-404-message)


For example, returning custom 404 messages:

typescript
```
import { Elysia, NotFoundError } from 'elysia'
new Elysia()
    .onError(({ code, status, set }) => {
        if (code === 'NOT_FOUND') return status(404, 'Not Found :(')
    })
    .post('/', () => {
        throw new NotFoundError()
    })
    .listen(3000)
```


### Context [​](#context-2)


`onError` Context is extends from `Context` with additional properties of the following:

-   error: A value that was thrown
-   code: *Error Code*


### Error Code [​](#error-code)


Elysia error code consists of:
"UNKNOWN" | "VALIDATION" | "NOT\_FOUND" | "PARSE" | "INTERNAL\_SERVER\_ERROR" | "INVALID\_COOKIE\_SIGNATURE" | "INVALID\_FILE\_TYPE"

-   NOT\_FOUND-   PARSE-   VALIDATION-   INTERNAL\_SERVER\_ERROR-   INVALID\_COOKIE\_SIGNATURE-   INVALID\_FILE\_TYPE-   UNKNOWN-   number(based on HTTP Status)

By default, the thrown error code is `UNKNOWN`.

TIP
If no error response is returned, the error will be returned using `error.name`.


### To Throw or To Return [​](#to-throw-or-to-return)


`Elysia.error` is a shorthand for returning an error with a specific HTTP status code.
It could either be returnor throwbased on your specific needs.

-   If an `status` is throw, it will be caught by `onError` middleware.
-   If an `status` is return, it will be NOTcaught by `onError` middleware.

See the following code:

typescript
```
import { Elysia, file } from 'elysia'
new Elysia()
    .onError(({ code, error, path }) => {
        if (code === 418) return 'caught'
    })
    .get('/throw', ({ status }) => {
        // This will be caught by onError
        throw status(418)
    })
    .get('/return', ({ status }) => {
        // This will NOT be caught by onError
        return status(418)
    })
```

localhost
GET


### Custom Error [​](#custom-error)


Elysia supports custom error both in the type-level and implementation level.
To provide a custom error code, we can use `Elysia.error` to add a custom error code, helping us to easily classify and narrow down the error type for full type safety with auto-complete as the following:

typescript
```
import { 

Elysia

 } from 'elysia'
class 

MyError

 extends 

Error

 {
    constructor(public 

message

: string) {
        super(

message

)
    }
}
new 

Elysia

()
    .

error

({
        MyError
    })
    .

onError

(({ 

code

, 

error

 }) => {
        switch (

code

) {
            // With auto-completion
            case 'MyError':
                // With type narrowing
                // Hover to see error is typed as `CustomError`
                return 

error
        }
    })
    .

get

('/', () => {
        throw new 

MyError

('Hello Error')
    })
```


### Local Error [​](#local-error)


Same as others life-cycle, we provide an error into an [scope](https://elysiajs.com/essential/plugin.html#scope) using guard:

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .get('/', () => 'Hello', {
        beforeHandle({ set, request: { headers }, error }) {
            if (!isSignIn(headers)) throw error(401)
        },
        error({ error }) {
            return 'Handled'
        }
    })
    .listen(3000)
```


## After Response [​](#after-response)


Executed after the response sent to the client.
It's recommended to use After Responsein the following situations:

-   Clean up response
-   Logging and analytics


#### Example [​](#example-7)


Below is an example of using the response handle to check for user sign-in.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .onAfterResponse(() => {
        console.log('Response', performance.now())
    })
    .listen(3000)
```

Console should log as the following:

bash
```
Response 0.0000
Response 0.0001
Response 0.0002
```


### Response [​](#response)


Similar to [Map Response](#map-resonse), `afterResponse` also accept a `response` value.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
	.onAfterResponse(({ response }) => {
		console.log(response)
	})
	.get('/', () => 'Hello')
	.listen(3000)
```

`response` from `onAfterResponse`, is not a Web-Standard's `Response` but is a value that is returned from the handler.
To get a headers, and status returned from the handler, we can access `set` from the context.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
	.onAfterResponse(({ set }) => {
		console.log(set.status, set.headers)
	})
	.get('/', () => 'Hello')
	.listen(3000)
```