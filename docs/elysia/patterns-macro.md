Macro allows us to define a custom field to the hook.


## Macro v2


Macro v2 use an object syntax with return lifecycle like inline hook.
Elysia.macroallows us to compose custom heavy logic into a simple configuration available in hook, and guardwith full type safety.

typescript
```
import { 

Elysia

 } from 'elysia'
const 

plugin

 = new 

Elysia

({ 

name

: 'plugin' })
    .

macro

({
        hi

(

word

: string) {
            return {
	            beforeHandle

() {
	                console

.

log

(

word

)
	            }
            }
        }
    })
const 

app

 = new 

Elysia

()
    .

use

(

plugin

)
    .

get

('/', () => 'hi', {
        hi

: 'Elysia'
    })
```

Accessing the path should log "Elysia"as the results.


### API [​](#api-1)


macrohas the same API as hook.
In previous example, we create a himacro accepting a string.
We then assigned hito "Elysia", the value was then sent back to the hifunction, and then the function added a new event to beforeHandlestack.
Which is an equivalent of pushing function to beforeHandleas the following:

typescript
```
import { Elysia } from 'elysia'
const app = new Elysia()
    .get('/', () => 'hi', {
        beforeHandle() {
            console.log('Elysia')
        }
    })
```

macroshine when a logic is more complex than accepting a new function, for example creating an authorization layer for each route.

typescript
```
import { 

Elysia

 } from 'elysia'
import { 

auth

 } from './auth'
const 

app

 = new 

Elysia

()
    .

use

(

auth

)
    .

get

('/', ({ 

user

 }) => 

user

, {
        isAuth

: true,
        role

: 'admin'
    })
```

Macro v2 can also register a new property to the context, allowing us to access the value directly from the context.
The field can accept anything ranging from string to function, allowing us to create a custom life cycle event.
macrowill be executed in order from top-to-bottom according to definition in hook, ensure that the stack is handled in the correct order.


## Resolve [​](#resolve)


You add a property to the context by returning an object with a [resolve](https://elysiajs.com/essential/life-cycle.html#resolve) function.

ts
```
import { 

Elysia

 } from 'elysia'
new 

Elysia

()
	.

macro

({
		user

: (

enabled

: true) => ({
			resolve

: () => ({
				user

: 'Pardofelis'
			})
		})
	})
	.

get

('/', ({ 

user

 }) => 

user

, {
		user

: true
	})
```

In the example above, we add a new property userto the context by returning an object with a resolvefunction.
Here's an example that macro resolve could be useful:

-   perform authentication and add user to the context
-   run an additional database query and add data to the context
-   add a new property to the context


## Property shorthand [​](#property-shorthand)


Starting from Elysia 1.2.10, each property in the macro object can be a function or an object.
If the property is an object, it will be translated to a function that accept a boolean parameter, and will be executed if the parameter is true.

typescript
```
import { Elysia } from 'elysia'
export const auth = new Elysia()
    .macro({
    	// This property shorthand
    	isAuth: {
      		resolve() {
     			return {
         			user: 'saltyaom'
          		}
      		}
        },
        // is equivalent to
        isAuth(enabled: boolean) {
        	if(!enabled) return
        	return {
				resolve() {
					return {
						user
					}
				}
         	}
        }
    })
```