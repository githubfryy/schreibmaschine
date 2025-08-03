The purpose of creating an API server is to take an input and process it.
JavaScript allows any data to be any type. Elysia provides a tool to validate data out of the box to ensure that the data is in the correct format.

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

get

('/id/:id', ({ 

params

: { 

id

 } }) => 

id

, {
        params

: 

t

.

Object

({
            id

: 

t

.

Number

()
        })
    })
    .

listen

(3000)
```


### TypeBox [​](#typebox)


Elysia.tis a schema builder based on [TypeBox](https://github.com/sinclairzx81/typebox) that provides type-safety at runtime, compile-time, and for OpenAPI schemas, enabling the generation of OpenAPI/Swagger documentation.
TypeBox is a very fast, lightweight, and type-safe runtime validation library for TypeScript. Elysia extends and customizes the default behavior of TypeBox to match server-side validation requirements.
We believe that validation should be handled by the framework natively, rather than relying on the user to set up a custom type for every project.


### TypeScript [​](#typescript)


We can get a type definitions of every Elysia/TypeBox's type by accessing `static` property as follows:

ts
```
import { 

t

 } from 'elysia'
const 

MyType

 = 

t

.

Object

({
	hello

: 

t

.

Literal

('Elysia')
})
type 

MyType

 = typeof 

MyType

.

static
```

This allows Elysia to infer and provide type automatically, reducing the need to declare duplicate schema
A single Elysia/TypeBox schema can be used for:

-   Runtime validation
-   Data coercion
-   TypeScript type
-   OpenAPI schema

This allows us to make a schema as a single source of truth.


## Schema type [​](#schema-type)


Elysia supports declarative schemas with the following types:

---

These properties should be provided as the third argument of the route handler to validate the incoming request.

typescript
```
import { Elysia, t } from 'elysia'
new Elysia()
    .get('/id/:id', () => 'Hello World!', {
        query: t.Object({
            name: t.String()
        }),
        params: t.Object({
            id: t.Number()
        })
    })
    .listen(3000)
```

localhost
GET

The response should be as follows:
| URL | Query | Params |
| --- | --- | --- |
| /id/a | ❌ | ❌ |
| /id/1?name=Elysia | ✅ | ✅ |
| /id/1?alias=Elysia | ❌ | ✅ |
| /id/a?name=Elysia | ✅ | ❌ |
| /id/a?alias=Elysia | ❌ | ❌ |
When a schema is provided, the type will be inferred from the schema automatically and an OpenAPI type will be generated for Swagger documentation, eliminating the redundant task of providing the type manually.


## Guard [​](#guard)


Guard can be used to apply a schema to multiple handlers.

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

get

('/none', ({ 

query

 }) => 'hi')
    .

guard

({ 
        query

: 

t

.

Object

({ 
            name

: 

t

.

String

() 
        }) 
    }) 
    .

get

('/query', ({ 

query

 }) => 

query

)
    .

listen

(3000)
```

This code ensures that the query must have namewith a string value for every handler after it. The response should be listed as follows:

localhost
GET

The response should be listed as follows:
| Path | Response |
| --- | --- |
| /none | hi |
| /none?name=a | hi |
| /query | error |
| /query?name=a | a |
If multiple global schemas are defined for the same property, the latest one will take precedence. If both local and global schemas are defined, the local one will take precedence.


### Guard Schema Type [​](#guard-schema-type)


Guard supports 2 types to define a validation.


### override (default)[​](#override-default)


Override schema if schema is collide with each others.
![Elysia run with default override guard showing schema gets override](https://elysiajs.com/blog/elysia-13/schema-override.webp)


### standalone[​](#standalone)


Separate collided schema, and runs both independently resulting in both being validated.
![Elysia run with standalone merging multiple guard together](https://elysiajs.com/blog/elysia-13/schema-standalone.webp)
To define schema type of guard with `schema`:

ts
```
import { Elysia } from 'elysia'
new Elysia()
	.guard({
		schema: 'standalone', 
		response: t.Object({
			title: t.String()
		})
	})
```


## Body [​](#body)


An incoming [HTTP Message](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages) is the data sent to the server. It can be in the form of JSON, form-data, or any other format.

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

post

('/body', ({ 

body

 }) => 

body

, {
		body

: 

t

.

Object

({
			name

: 

t

.

String

()
		})
	})
	.

listen

(3000)
```

The validation should be as follows:
| Body | Validation |
| --- | --- |
| { name: 'Elysia' } | ✅ |
| { name: 1 } | ❌ |
| { alias: 'Elysia' } | ❌ |
| undefined | ❌ |
Elysia disables body-parser for GETand HEADmessages by default, following the specs of HTTP/1.1 [RFC2616](https://www.rfc-editor.org/rfc/rfc2616#section-4.3)

> If the request method does not include defined semantics for an entity-body, then the message-body SHOULD be ignored when handling the request.

Most browsers disable the attachment of the body by default for GETand HEADmethods.


#### Specs [​](#specs)


Validate an incoming [HTTP Message](https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages) (or body).
These messages are additional messages for the web server to process.
The body is provided in the same way as the `body` in `fetch` API. The content type should be set accordingly to the defined body.

typescript
```
fetch('https://elysiajs.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'Elysia'
    })
})
```


### File [​](#file)


File is a special type of body that can be used to upload files.

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

post

('/body', ({ 

body

 }) => 

body

, {
		body

: 

t

.

Object

({
			file

: 

t

.

File

({ 

format

: 'image/*' }),
			multipleFiles

: 

t

.

Files

()
		})
	})
	.

listen

(3000)
```

By providing a file type, Elysia will automatically assume that the content-type is `multipart/form-data`.


## Query [​](#query)


Query is the data sent through the URL. It can be in the form of `?key=value`.

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

get

('/query', ({ 

query

 }) => 

query

, {
		query

: 

t

.

Object

({
			name

: 

t

.

String

()
		})
	})
	.

listen

(3000)
```

Query must be provided in the form of an object.
The validation should be as follows:
| Query | Validation |
| --- | --- |
| /?name=Elysia | ✅ |
| /?name=1 | ✅ |
| /?alias=Elysia | ❌ |
| /?name=ElysiaJS&alias=Elysia | ✅ |
| / | ❌ |


#### Specs [​](#specs-1)


A query string is a part of the URL that starts with ?and can contain one or more query parameters, which are key-value pairs used to convey additional information to the server, usually for customized behavior like filtering or searching.
![URL Object](https://elysiajs.com/essential/url-object.svg)
Query is provided after the ?in Fetch API.

typescript
```
fetch('https://elysiajs.com/?name=Elysia')
```

When specifying query parameters, it's crucial to understand that all query parameter values must be represented as strings. This is due to how they are encoded and appended to the URL.


### Coercion [​](#coercion)


Elysia will coerce applicable schema on `query` to respective type automatically.
See [Elysia behavior](https://elysiajs.com/patterns/type.html#elysia-behavior) for more information.

ts
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

get

('/', ({ 

query

 }) => 

query

, {
		query

: 

t

.

Object

({ 
			name

: 

t

.

Number

() 
		}) 
	})
	.

listen

(3000)
```

localhost
GET

1


### Array [​](#array)


By default, Elysia treat query parameters as a single string even if specified multiple time.
To use array, we need to explicitly declare it as an array.

ts
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

get

('/', ({ 

query

 }) => 

query

, {
		query

: 

t

.

Object

({
			name

: 

t

.

Array

(

t

.

String

()) 
		})
	})
	.

listen

(3000)
```

localhost
GET

{ "name": \[ "rapi", "anis", "neon" \], "squad": "counter" }

Once Elysia detect that a property is assignable to array, Elysia will coerce it to an array of the specified type.
By default, Elysia format query array with the following format:


#### nuqs [​](#nuqs)


This format is used by [nuqs](https://nuqs.47ng.com/).
By using ,as a delimiter, a property will be treated as array.

```
http://localhost?name=rapi,anis,neon&squad=counter
{
	name: ['rapi', 'anis', 'neon'],
	squad: 'counter'
}
```


#### HTML form format [​](#html-form-format)


If a key is assigned multiple time, the key will be treated as an array.
This is similar to HTML form format when an input with the same name is specified multiple times.

```
http://localhost?name=rapi&name=anis&name=neon&squad=counter
// name: ['rapi', 'anis', 'neon']
```


## Params [​](#params)


Params or path parameters are the data sent through the URL path.
They can be in the form of `/key`.

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

get

('/id/:id', ({ 

params

 }) => 

params

, {
		params

: 

t

.

Object

({
			id

: 

t

.

Number

()
		})
	})
```

localhost
GET

Params must be provided in the form of an object.
The validation should be as follows:
| URL | Validation |
| --- | --- |
| /id/1 | ✅ |
| /id/a | ❌ |


#### Specs [​](#specs-2)


Path parameter (not to be confused with query string or query parameter).
This field is usually not needed as Elysia can infer types from path parameters automatically, unless there is a need for a specific value pattern, such as a numeric value or template literal pattern.

typescript
```
fetch('https://elysiajs.com/id/1')
```


### Params type inference [​](#params-type-inference)


If a params schema is not provided, Elysia will automatically infer the type as a string.

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

get

('/id/:id', ({ 

params

 }) => 

params

)
```


## Headers [​](#headers)


Headers are the data sent through the request's header.

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

get

('/headers', ({ 

headers

 }) => 

headers

, {
		headers

: 

t

.

Object

({
			authorization

: 

t

.

String

()
		})
	})
```

Unlike other types, headers have `additionalProperties` set to `true` by default.
This means that headers can have any key-value pair, but the value must match the schema.


#### Specs [​](#specs-3)


HTTP headers let the client and the server pass additional information with an HTTP request or response, usually treated as metadata.
This field is usually used to enforce some specific header fields, for example, `Authorization`.
Headers are provided in the same way as the `body` in `fetch` API.

typescript
```
fetch('https://elysiajs.com/', {
    headers: {
        authorization: 'Bearer 12345'
    }
})
```

TIP
Elysia will parse headers as lower-case keys only.
Please make sure that you are using lower-case field names when using header validation.


## Cookie [​](#cookie)


Cookie is the data sent through the request's cookie.

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

get

('/cookie', ({ 

cookie

 }) => 

cookie

, {
		cookie

: 

t

.

Cookie

({
			cookieName

: 

t

.

String

()
		})
	})
```

Cookies must be provided in the form of `t.Cookie` or `t.Object`.
Same as `headers`, cookies have `additionalProperties` set to `true` by default.


#### Specs [​](#specs-4)


An HTTP cookie is a small piece of data that a server sends to the client. It's data that is sent with every visit to the same web server to let the server remember client information.
In simpler terms, it's a stringified state that is sent with every request.
This field is usually used to enforce some specific cookie fields.
A cookie is a special header field that the Fetch API doesn't accept a custom value for but is managed by the browser. To send a cookie, you must use a `credentials` field instead:

typescript
```
fetch('https://elysiajs.com/', {
    credentials: 'include'
})
```


### t.Cookie [​](#t-cookie)


`t.Cookie` is a special type that is equivalent to `t.Object` but allows to set cookie-specific options.

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

get

('/cookie', ({ 

cookie

 }) => 

cookie

.

name

.

value

, {
		cookie

: 

t

.

Cookie

({
			name

: 

t

.

String

()
		}, {
			secure

: true,
			httpOnly

: true
		})
	})
```


## Response [​](#response)


Response is the data returned from the handler.

typescript
```
import { Elysia, t } from 'elysia'
new Elysia()
	.get('/response', () => {
		return {
			name: 'Jane Doe'
		}
	}, {
		response: t.Object({
			name: t.String()
		})
	})
```


### Response per status [​](#response-per-status)


Responses can be set per status code.

typescript
```
import { Elysia, t } from 'elysia'
new Elysia()
	.get('/response', ({ status }) => {
		if (Math.random() > 0.5)
			return status(400, {
				error: 'Something went wrong'
			})
		return {
			name: 'Jane Doe'
		}
	}, {
		response: {
			200: t.Object({
				name: t.String()
			}),
			400: t.Object({
				error: t.String()
			})
		}
	})
```

This is an Elysia-specific feature, allowing us to make a field optional.


## Error Provider [​](#error-provider)


There are two ways to provide a custom error message when the validation fails:

1.  Inline `status` property
2.  Using [onError](https://elysiajs.com/essential/life-cycle.html#on-error) event


### Error Property [​](#error-property)


Elysia offers an additional errorproperty, allowing us to return a custom error message if the field is invalid.

typescript
```
import { Elysia, t } from 'elysia'
new Elysia()
    .post('/', () => 'Hello World!', {
        body: t.Object({
            x: t.Number({
               	error: 'x must be a number'
            })
        })
    })
    .listen(3000)
```

The following is an example of using the error property on various types:
| TypeBox | Error |
| typescriptt.String({
    format: 'email',
    error: 'Invalid email :('
}) | Invalid Email :( |
| typescriptt.Array(
    t.String(),
    {
        error: 'All members must be a string'
    }
) | All members must be a string |
| typescriptt.Object({
    x: t.Number()
}, {
    error: 'Invalid object UwU'
}) | Invalid object UwU |
| typescriptt.Object({
    x: t.Number({
        error({ errors, type, validation, value }) {
            return 'Expected x to be a number'
        }
    })
}) | Expected x to be a number |


## Custom Error [​](#custom-error)


TypeBox offers an additional "error" property, allowing us to return a custom error message if the field is invalid.
| TypeBox | Error |
| typescriptt.String({
    format: 'email',
    error: 'Invalid email :('
}) | Invalid Email :( |
| typescriptt.Object({
    x: t.Number()
}, {
    error: 'Invalid object UwU'
}) | Invalid object UwU |


### Error message as function [​](#error-message-as-function)


In addition to a string, Elysia type's error can also accept a function to programmatically return a custom error for each property.
The error function accepts the same arguments as `ValidationError`

typescript
```
import { Elysia, t } from 'elysia'
new Elysia()
    .post('/', () => 'Hello World!', {
        body: t.Object({
            x: t.Number({
                error() {
                    return 'Expected x to be a number'
                }
            })
        })
    })
    .listen(3000)
```

TIP
Hover over the `error` to see the type.


### Error is Called Per Field [​](#error-is-called-per-field)


Please note that the error function will only be called if the field is invalid.
Please consider the following table:
| Code | Body | Error |
| typescriptt.Object({
    x: t.Number({
        error() {
            return 'Expected x to be a number'
        }
    })
}) | json{
    x: "hello"
} | Expected x to be a number |
| typescriptt.Object({
    x: t.Number({
        error() {
            return 'Expected x to be a number'
        }
    })
}) | json"hello" | (default error, `t.Number.error` is not called) |
| typescriptt.Object(
    {
        x: t.Number({
            error() {
                return 'Expected x to be a number'
            }
        })
    }, {
        error() {
            return 'Expected value to be an object'
        }
    }
) | json"hello" | Expected value to be an object |


### onError [​](#onerror)


We can customize the behavior of validation based on the [onError](https://elysiajs.com/essential/life-cycle.html#on-error) event by narrowing down the error code to "VALIDATION".

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

onError

(({ 

code

, 

error

 }) => {
		if (

code

 === 'VALIDATION')
		    return 

error

.

message
	})
	.

listen

(3000)
```

The narrowed-down error type will be typed as `ValidationError` imported from elysia/error.
ValidationErrorexposes a property named validator, typed as [TypeCheck](https://github.com/sinclairzx81/typebox#typecheck), allowing us to interact with TypeBox functionality out of the box.

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

onError

(({ 

code

, 

error

 }) => {
        if (

code

 === 'VALIDATION')
            return 

error

.

validator

.

Errors

(

error

.

value

).First().message
    })
    .

listen

(3000)
```


### Error List [​](#error-list)


ValidationErrorprovides a method `ValidatorError.all`, allowing us to list all of the error causes.

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

post

('/', ({ 

body

 }) => 

body

, {
		body

: 

t

.

Object

({
			name

: 

t

.

String

(),
			age

: 

t

.

Number

()
		}),
		error

({ 

code

, 

error

 }) {
			switch (

code

) {
				case 'VALIDATION':
                    console

.

log

(

error

.

all

)
                    // Find a specific error name (path is OpenAPI Schema compliance)
                    const 

name

 = 

error

.

all

.

find

(
						(

x

) => 

x

.

summary

 && 

x

.

path

 === '/name'
					)
                    // If there is a validation error, then log it
                    if(

name

)
    					console

.

log

(

name

)
			}
		}
	})
	.

listen

(3000)
```

For more information about TypeBox's validator, see [TypeCheck](https://github.com/sinclairzx81/typebox#typecheck).


## Reference Model [​](#reference-model)


Sometimes you might find yourself declaring duplicate models or re-using the same model multiple times.
With a reference model, we can name our model and reuse it by referencing the name.
Let's start with a simple scenario.
Suppose we have a controller that handles sign-in with the same model.

typescript
```
import { 

Elysia

, 

t

 } from 'elysia'
const 

app

 = new 

Elysia

()
    .

post

('/sign-in', ({ 

body

 }) => 

body

, {
        body

: 

t

.

Object

({
            username

: 

t

.

String

(),
            password

: 

t

.

String

()
        }),
        response

: 

t

.

Object

({
            username

: 

t

.

String

(),
            password

: 

t

.

String

()
        })
    })
```

We can refactor the code by extracting the model as a variable and referencing it.

typescript
```
import { 

Elysia

, 

t

 } from 'elysia'
// Maybe in a different file eg. models.ts
const 

SignDTO

 = 

t

.

Object

({
    username

: 

t

.

String

(),
    password

: 

t

.

String

()
})
const 

app

 = new 

Elysia

()
    .

post

('/sign-in', ({ 

body

 }) => 

body

, {
        body

: 

SignDTO

,
        response

: 

SignDTO
    })
```

This method of separating concerns is an effective approach, but we might find ourselves reusing multiple models with different controllers as the app gets more complex.
We can resolve that by creating a "reference model", allowing us to name the model and use auto-completion to reference it directly in `schema` by registering the models with `model`.

typescript
```
import { 

Elysia

, 

t

 } from 'elysia'
const 

app

 = new 

Elysia

()
    .

model

({
        sign

: 

t

.

Object

({
            username

: 

t

.

String

(),
            password

: 

t

.

String

()
        })
    })
    .

post

('/sign-in', ({ 

body

 }) => 

body

, {
        // with auto-completion for existing model name
        body

: 'sign',
        response

: 'sign'
    })
```

When we want to access the model's group, we can separate a `model` into a plugin, which when registered will provide a set of models instead of multiple imports.

typescript
```
// auth.model.ts
import { Elysia, t } from 'elysia'
export const authModel = new Elysia()
    .model({
        sign: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
```

Then in an instance file:

typescript
```
// index.ts
import { 

Elysia

 } from 'elysia'
import { 

authModel

 } from './auth.model'
const 

app

 = new 

Elysia

()
    .

use

(

authModel

)
    .

post

('/sign-in', ({ 

body

 }) => 

body

, {
        // with auto-completion for existing model name
        body

: 'sign',
        response

: 'sign'
    })
```

This approach not only allows us to separate concerns but also enables us to reuse the model in multiple places while integrating the model into Swagger documentation.


### Multiple Models [​](#multiple-models)


`model` accepts an object with the key as a model name and the value as the model definition. Multiple models are supported by default.

typescript
```
// auth.model.ts
import { Elysia, t } from 'elysia'
export const authModel = new Elysia()
    .model({
        number: t.Number(),
        sign: t.Object({
            username: t.String(),
            password: t.String()
        })
    })
```


### Naming Convention [​](#naming-convention)


Duplicate model names will cause Elysia to throw an error. To prevent declaring duplicate model names, we can use the following naming convention.
Let's say that we have all models stored at `models/<name>.ts` and declare the prefix of the model as a namespace.

typescript
```
import { Elysia, t } from 'elysia'
// admin.model.ts
export const adminModels = new Elysia()
    .model({
        'admin.auth': t.Object({
            username: t.String(),
            password: t.String()
        })
    })
// user.model.ts
export const userModels = new Elysia()
    .model({
        'user.auth': t.Object({
            username: t.String(),
            password: t.String()
        })
    })
```

This can prevent naming duplication to some extent, but ultimately, it's best to let your team decide on the naming convention.
Elysia provides an opinionated option to help prevent decision fatigue.