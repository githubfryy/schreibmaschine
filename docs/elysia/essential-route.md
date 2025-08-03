## Routing [​](#routing)


Web servers use the request's path and HTTP methodto look up the correct resource, refers as "routing".
We can define a route by calling a method named after HTTP verbs, passing a path and a function to execute when matched.

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .get('/', 'hello')
    .get('/hi', 'hi')
    .listen(3000)
```

We can access the web server by going to [http://localhost:3000](http://localhost:3000/)By default, web browsers will send a GET method when visiting a page.

localhost
GET

TIP
Using an interactive browser above, hover on a blue highlight area to see difference result between each path


## Path type [​](#path-type)


Path in Elysia can be grouped into 3 types:

-   static paths- static string to locate the resource
-   dynamic paths- segment can be any value
-   wildcards- path until a specific point can be anything

You can use all of the path types together to compose a behavior for your web server.
The priorities are as follows:

1.  static paths
2.  dynamic paths
3.  wildcards

If the path is resolved as the static wild dynamic path is presented, Elysia will resolve the static path rather than the dynamic path

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .get('/id/1', 'static path')
    .get('/id/:id', 'dynamic path')
    .get('/id/*', 'wildcard path')
    .listen(3000)
```

localhost
GET

Here the server will respond as follows:
| Path | Response |
| --- | --- |
| /id/1 | static path |
| /id/2 | dynamic path |
| /id/2/a | wildcard path |


## Static Path [​](#static-path)


A path or pathname is an identifier to locate resources of a server.

bash
```
http://localhost:/path/page
```

Elysia uses the path and method to look up the correct resource.
![URL Representation](https://elysiajs.com/essential/url-object.svg)
A path starts after the origin. Prefix with /and ends before search query (?)We can categorize the URL and path as follows:
| URL | Path |
| --- | --- |
| http://example.com/ | / |
| http://example.com/hello | /hello |
| http://example.com/hello/world | /hello/world |
| http://example.com/hello?name=salt | /hello |
| http://example.com/hello#title | /hello |

TIP
If the path is not specified, the browser and web server will treat the path as '/' as a default value.

Elysia will look up each request for [route](https://elysiajs.com/essential/route.html) and response using [handler](https://elysiajs.com/essential/handler.html) function.


## Dynamic path [​](#dynamic-path)


URLs can be both static and dynamic.
Static paths are hardcoded strings that can be used to locate resources of the server, while dynamic paths match some part and captures the value to extract extra information.
For instance, we can extract the user ID from the pathname. For example:

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

('/id/:id', ({ 

params

: { 

id

 } }) => 

id

)
    .

listen

(3000)
```

Here dynamic path is created with `/id/:id` which tells Elysia to match any path up until `/id`. What comes after that is then stored as paramsobject.

localhost
GET

1

When requested, the server should return the response as follows:
| Path | Response |
| --- | --- |
| /id/1 | 1 |
| /id/123 | 123 |
| /id/anything | anything |
| /id/anything?name=salt | anything |
| /id | Not Found |
| /id/anything/rest | Not Found |
Dynamic paths are great to include things like IDs, which then can be used later.
We refer to the named variable path as path parameteror paramsfor short.


## Segment [​](#segment)


URL segments are each path that is composed into a full path.
Segments are separated by `/`. ![Representation of URL segments](https://elysiajs.com/essential/url-segment.webp)
Path parameters in Elysia are represented by prefixing a segment with ':' followed by a name. ![Representation of path parameter](https://elysiajs.com/essential/path-parameter.webp)
Path parameters allow Elysia to capture a specific segment of a URL.
The named path parameter will then be stored in `Context.params`.
| Route | Path | Params |
| --- | --- | --- |
| /id/:id | /id/1 | id=1 |
| /id/:id | /id/hi | id=hi |
| /id/:name | /id/hi | name=hi |


## Multiple path parameters [​](#multiple-path-parameters)


You can have as many path parameters as you like, which will then be stored into a `params` object.

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

('/id/:id', ({ 

params

: { 

id

 } }) => 

id

)
    .

get

('/id/:id/:name', ({ 

params

: { 

id

, 

name

 } }) => 

id

 + ' ' + 

name

)
    .

listen

(3000)
```

localhost
GET

1

The server will respond as follows:
| Path | Response |
| --- | --- |
| /id/1 | 1 |
| /id/123 | 123 |
| /id/anything | anything |
| /id/anything?name=salt | anything |
| /id | Not Found |
| /id/anything/rest | anything rest |


## Optional path parameters [​](#optional-path-parameters)


Sometime we might want a static and dynamic path to resolve the same handler.
We can make a path parameter optional by adding a question mark `?` after the parameter name.

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

('/id/:id?', ({ 

params

: { 

id

 } }) => `id ${

id

}`)
    .

listen

(3000)
```

  

localhost
GET

The server will respond as follows:
| Path | Response |
| --- | --- |
| /id | id undefined |
| /id/1 | id 1 |


## Wildcards [​](#wildcards)


Dynamic paths allow capturing certain segments of the URL.
However, when you need a value of the path to be more dynamic and want to capture the rest of the URL segment, a wildcard can be used.
Wildcards can capture the value after segment regardless of amount by using "\*".

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

('/id/*', ({ 

params

 }) => 

params

['*'])
    .

listen

(3000)
```

  

localhost
GET

1

In this case the server will respond as follows:
| Path | Response |
| --- | --- |
| /id/1 | 1 |
| /id/123 | 123 |
| /id/anything | anything |
| /id/anything?name=salt | anything |
| /id | Not Found |
| /id/anything/rest | anything/rest |
Wildcards are useful for capturing a path until a specific point.

TIP
You can use a wildcard with a path parameter.


## HTTP Verb [​](#http-verb)


HTTP defines a set of request methods to indicate the desired action to be performed for a given resource
There are several HTTP verbs, but the most common ones are:


### GET [​](#get)


Requests using GET should only retrieve data.


### POST [​](#post)


Submits a payload to the specified resource, often causing state change or side effect.


### PUT [​](#put)


Replaces all current representations of the target resource using the request's payload.


### PATCH [​](#patch)


Applies partial modifications to a resource.


### DELETE [​](#delete)


Deletes the specified resource.

---

To handle each of the different verbs, Elysia has a built-in API for several HTTP verbs by default, similar to `Elysia.get`

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .get('/', 'hello')
    .post('/hi', 'hi')
    .listen(3000)
```

localhost
GET

Elysia HTTP methods accepts the following parameters:

-   path: Pathname
-   function: Function to respond to the client
-   hook: Additional metadata

You can read more about the HTTP methods on [HTTP Request Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods).


## Custom Method [​](#custom-method)


We can accept custom HTTP Methods with `Elysia.route`.

typescript
```
import { Elysia } from 'elysia'
const app = new Elysia()
    .get('/get', 'hello')
    .post('/post', 'hi')
    .route('M-SEARCH', '/m-search', 'connect') 
    .listen(3000)
```

localhost
GET

Elysia.routeaccepts the following:

-   method: HTTP Verb
-   path: Pathname
-   function: Function to response to the client
-   hook: Additional metadata

When navigating to each method, you should see the results as the following:
| Path | Method | Result |
| --- | --- | --- |
| /get | GET | hello |
| /post | POST | hi |
| /m-search | M-SEARCH | connect |

TIP
Based on [RFC 7231](https://www.rfc-editor.org/rfc/rfc7231#section-4.1), HTTP Verb is case-sensitive.
It's recommended to use the UPPERCASE convention for defining a custom HTTP Verb with Elysia.


## Elysia.all [​](#elysia-all)


Elysia provides an `Elysia.all` for handling any HTTP method for a specified path using the same API like Elysia.getand Elysia.posttypescript
```
import { Elysia } from 'elysia'
new Elysia()
    .all('/', 'hi')
    .listen(3000)
```

localhost
GET

Any HTTP method that matches the path, will be handled as follows:
| Path | Method | Result |
| --- | --- | --- |
| / | GET | hi |
| / | POST | hi |
| / | DELETE | hi |


## Handle [​](#handle)


Most developers use REST clients like Postman, Insomnia or Hoppscotch to test their API.
However, Elysia can be programmatically test using `Elysia.handle`.

typescript
```
import { Elysia } from 'elysia'
const app = new Elysia()
    .get('/', 'hello')
    .post('/hi', 'hi')
    .listen(3000)
app.handle(new Request('http://localhost/')).then(console.log)
```

Elysia.handleis a function to process an actual request sent to the server.

TIP
Unlike unit test's mock, you can expect it to behave like an actual requestsent to the server.
But also useful for simulating or creating unit tests.


## 404 [​](#_404)


If no path matches the defined routes, Elysia will pass the request to [error](https://elysiajs.com/essential/life-cycle.html#on-error) life cycle before returning a "NOT\_FOUND"with an HTTP status of 404.
We can handle a custom 404 error by returning a value from `error` life cycle like this:

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

('/', 'hi')
    .

onError

(({ 

code

 }) => {
        if (

code

 === 'NOT_FOUND') {
            return 'Route not found :('
        }
    })
    .

listen

(3000)
```

localhost
GET

When navigating to your web server, you should see the result as follows:
| Path | Method | Result |
| --- | --- | --- |
| / | GET | hi |
| / | POST | Route not found :( |
| /hi | GET | Route not found :( |
You can learn more about life cycle and error handling in [Life Cycle Events](https://elysiajs.com/essential/life-cycle.html#events) and [Error Handling](https://elysiajs.com/essential/life-cycle.html#on-error).

TIP
HTTP Status is used to indicate the type of response. By default if everything is correct, the server will return a '200 OK' status code (If a route matches and there is no error, Elysia will return 200 as default)
If the server fails to find any route to handle, like in this case, then the server shall return a '404 NOT FOUND' status code.


## Group [​](#group)


When creating a web server, you would often have multiple routes sharing the same prefix:

typescript
```
import { Elysia } from 'elysia'
new Elysia()
    .post('/user/sign-in', 'Sign in')
    .post('/user/sign-up', 'Sign up')
    .post('/user/profile', 'Profile')
    .listen(3000)
```

localhost
POST

This can be improved with `Elysia.group`, allowing us to apply prefixes to multiple routes at the same time by grouping them together:

typescript
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
    .

group

('/user', (

app

) =>
        app
            .

post

('/sign-in', 'Sign in')
            .

post

('/sign-up', 'Sign up')
            .

post

('/profile', 'Profile')
    )
    .

listen

(3000)
```

localhost
POST

This code behaves the same as our first example and should be structured as follows:
| Path | Result |
| --- | --- |
| /user/sign-in | Sign in |
| /user/sign-up | Sign up |
| /user/profile | Profile |
`.group()` can also accept an optional guard parameter to reduce boilerplate of using groups and guards together:

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

group

(
        '/user',
        {
            body

: 

t

.

Literal

('Rikuhachima Aru')
        },
        (

app

) => 

app
            .

post

('/sign-in', 'Sign in')
            .

post

('/sign-up', 'Sign up')
            .

post

('/profile', 'Profile')
    )
    .

listen

(3000)
```

You may find more information about grouped guards in [scope](https://elysiajs.com/essential/plugin.html#scope).


### Prefix [​](#prefix)


We can separate a group into a separate plugin instance to reduce nesting by providing a prefixto the constructor.

typescript
```
import { Elysia } from 'elysia'
const users = new Elysia({ prefix: '/user' })
    .post('/sign-in', 'Sign in')
    .post('/sign-up', 'Sign up')
    .post('/profile', 'Profile')
new Elysia()
    .use(users)
    .get('/', 'hello world')
    .listen(3000)
```

localhost
GET