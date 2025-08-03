Elysia has first-class support and follows OpenAPI schema by default.
Elysia can automatically generate an API documentation page by providing a Swagger plugin.
To generate the Swagger page, install the plugin:

bash
```
bun add @elysiajs/swagger
```

And register the plugin to the server:

typescript
```
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
const app = new Elysia()
    .use(swagger())
```

By default, Elysia use OpenAPI V3 schema and [Scalar UI](http://scalar.com/) by default
For Swagger plugin configuration, see the [Swagger plugin page](https://elysiajs.com/plugins/swagger.html).


## Route definitions [​](#route-definitions)


We add route information by providing a schema type.
However, sometime defining a type only isn't clear what the route might work. You can use `schema.detail` fields to explictly define what the route is all about.

typescript
```
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
new Elysia()
    .use(swagger())
    .post('/sign-in', ({ body }) => body, {
        body: t.Object(
            {
                username: t.String(),
                password: t.String({
                	minLength: 8,
                	description: 'User password (at least 8 characters)'
                })
            },
            { 
                description: 'Expected an username and password'
            } 
        ),
        detail: { 
            summary: 'Sign in the user', 
            tags: ['authentication'] 
        } 
    })
```

The detail fields follows an OpenAPI V3 definition with auto-completion and type-safety by default.
Detail is then passed to Swagger to put the description to Swagger route.


### detail [​](#detail)


`detail` extends the [OpenAPI Operation Object](https://swagger.io/specification#operation-object)
The detail field is an object that can be use to describe information about the route for API documentation.
Which may contains the following fields:


### tags [​](#tags)


An array of tags for the operation. Tags can be used for logical grouping of operations by resources or any other qualifier.


### summary [​](#summary)


A short summary of what the operation does.


### description [​](#description)


A verbose explanation of the operation behavior.


### externalDocs [​](#externaldocs)


Additional external documentation for this operation.


### operationId [​](#operationid)


A unique string used to identify the operation. The id MUST be unique among all operations described in the API. The operationId value is case-sensitive.


### deprecated [​](#deprecated)


Declares this operation to be deprecated. Consumers SHOULD refrain from usage of the declared operation. Default value is `false`.


### security [​](#security)


A declaration of which security mechanisms can be used for this operation. The list of values includes alternative security requirement objects that can be used. Only one of the security requirement objects need to be satisfied to authorize a request. To make security optional, an empty security requirement (`{}`) can be included in the array.


## Hide [​](#hide)


You can hide the route from the Swagger page by setting `detail.hide` to `true`

typescript
```
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
new Elysia()
    .use(swagger())
    .post('/sign-in', ({ body }) => body, {
        body: t.Object(
            {
                username: t.String(),
                password: t.String()
            },
            {
                description: 'Expected an username and password'
            }
        ),
        detail: { 
        	hide: true
        } 
    })
```

Elysia may accept tags to add an entire instance or group of routes to a specific tag.

typescript
```
import { Elysia, t } from 'elysia'
new Elysia({
	tags: ['user']
})
	.get('/user', 'user')
	.get('/admin', 'admin')
```


## Guard [​](#guard)


Alternatively, Elysia may accept guards to add an entire instance or group of routes to a specific guard.

typescript
```
import { Elysia, t } from 'elysia'
new Elysia()
	.guard({
		detail: {
			description: 'Require user to be logged in'
		}
	})
	.get('/user', 'user')
	.get('/admin', 'admin')
```