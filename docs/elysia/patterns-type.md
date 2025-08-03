Here's a common patterns for writing validation types in Elysia.


## Primitive Type [​](#primitive-type)


The TypeBox API is designed around and is similar to TypeScript types.
There are many familiar names and behaviors that intersect with TypeScript counterparts, such as String, Number, Boolean, and Object, as well as more advanced features like Intersect, KeyOf, and Tuplefor versatility.
If you are familiar with TypeScript, creating a TypeBox schema behaves the same as writing a TypeScript type, except it provides actual type validation at runtime.
To create your first schema, import Elysia.tfrom Elysia and start with the most basic type:

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

 }) => `Hello ${

body

}`, {
		body

: 

t

.

String

()
	})
	.

listen

(3000)
```

This code tells Elysia to validate an incoming HTTP body, ensuring that the body is a string. If it is a string, it will be allowed to flow through the request pipeline and handler.
If the shape doesn't match, it will throw an error into the [Error Life Cycle](https://elysiajs.com/essential/life-cycle.html#on-error).
![Elysia Life Cycle](https://elysiajs.com/assets/lifecycle-chart.svg)


### Basic Type [​](#basic-type)


TypeBox provides basic primitive types with the same behavior as TypeScript types.
The following table lists the most common basic types:
| TypeBox | TypeScript |
| typescriptt.String() | typescriptstring |
| typescriptt.Number() | typescriptnumber |
| typescriptt.Boolean() | typescriptboolean |
| typescriptt.Array(
    t.Number()
) | typescriptnumber[] |
| typescriptt.Object({
    x: t.Number()
}) | typescript{
    x: number
} |
| typescriptt.Null() | typescriptnull |
| typescriptt.Literal(42) | typescript42 |
Elysia extends all types from TypeBox, allowing you to reference most of the API from TypeBox for use in Elysia.
See [TypeBox's Type](https://github.com/sinclairzx81/typebox#json-types) for additional types supported by TypeBox.


### Attribute [​](#attribute)


TypeBox can accept arguments for more comprehensive behavior based on the JSON Schema 7 specification.
| TypeBox | TypeScript |
| typescriptt.String({
    format: 'email'
}) |  |
| typescriptt.Number({
    minimum: 10,
    maximum: 100
}) | typescript10 |
| typescriptt.Array(
    t.Number(),
    {
        /* Minimum number of items
         */
        minItems: 1,
        /* Maximum number of items
         */
        maxItems: 5
    }
) | typescript[1, 2, 3, 4, 5] |
| typescriptt.Object(
    {
        x: t.Number()
    },
    {
        /* @default false
         * Accept additional properties
         * that not specified in schema
         * but still match the type
         */
        additionalProperties: true
    }
) | typescriptx: 100
y: 200 |
See [JSON Schema 7 specification](https://json-schema.org/draft/2020-12/json-schema-validation) for more explanation of each attribute.


## Honorable Mentions [​](#honorable-mentions)


The following are common patterns often found useful when creating a schema.


### Union [​](#union)


Allows a field in `t.Object` to have multiple types.
| TypeBox | TypeScript | Value |
| typescriptt.Union([
    t.String(),
    t.Number()
]) | typescriptstring | number | Hello
123 |


### Optional [​](#optional)


Allows a field in `t.Object` to be undefined or optional.
| TypeBox | TypeScript | Value |
| typescriptt.Object({
    x: t.Number(),
    y: t.Optional(t.Number())
}) | typescript{
    x: number,
    y?: number
} | typescript{
    x: 123
} |


### Partial [​](#partial)


Allows all fields in `t.Object` to be optional.
| TypeBox | TypeScript | Value |
| typescriptt.Partial(
    t.Object({
        x: t.Number(),
        y: t.Number()
    })
) | typescript{
    x?: number,
    y?: number
} | typescript{
    y: 123
} |


## Elysia Type [​](#elysia-type)


`Elysia.t` is based on TypeBox with pre-configuration for server usage, providing additional types commonly found in server-side validation.
You can find all the source code for Elysia types in `elysia/type-system`.
The following are types provided by Elysia:


### UnionEnum [​](#unionenum)


`UnionEnum` allows the value to be one of the specified values.

typescript
```
t.UnionEnum(['rapi', 'anis', 1, true, false])
```

By default, these value will not automatically


### File [​](#file)


A singular file, often useful for file uploadvalidation.

typescript
```
t.File()
```

File extends the attributes of the base schema, with additional properties as follows:


#### type [​](#type-1)


Specifies the format of the file, such as image, video, or audio.
If an array is provided, it will attempt to validate if any of the formats are valid.

typescript
```
type?: MaybeArray<string>
```


#### minSize [​](#minsize)


Minimum size of the file.
Accepts a number in bytes or a suffix of file units:

typescript
```
minSize?: number | `${number}${'k' | 'm'}`
```


#### maxSize [​](#maxsize)


Maximum size of the file.
Accepts a number in bytes or a suffix of file units:

typescript
```
maxSize?: number | `${number}${'k' | 'm'}`
```


#### File Unit Suffix: [​](#file-unit-suffix)


The following are the specifications of the file unit: m: MegaByte (1048576 byte) k: KiloByte (1024 byte)


### Files [​](#files)


Extends from [File](#file), but adds support for an array of files in a single field.

typescript
```
t.Files()
```

Files extends the attributes of the base schema, array, and File.


### Cookie [​](#cookie)


Object-like representation of a Cookie Jar extended from the Object type.

typescript
```
t.Cookie({
    name: t.String()
})
```

Cookie extends the attributes of [Object](https://json-schema.org/draft/2020-12/json-schema-validation#name-validation-keywords-for-obj) and [Cookie](https://github.com/jshttp/cookie#options-1) with additional properties as follows:


#### secrets [​](#secrets)


The secret key for signing cookies.
Accepts a string or an array of strings.

typescript
```
secrets?: string | string[]
```

If an array is provided, [Key Rotation](https://crypto.stackexchange.com/questions/41796/whats-the-purpose-of-key-rotation) will be used. The newly signed value will use the first secret as the key.


### Nullable [​](#nullable)


Allows the value to be null but not undefined.

typescript
```
t.Nullable(t.String())
```


### MaybeEmpty [​](#maybeempty)


Allows the value to be null and undefined.

typescript
```
t.MaybeEmpty(t.String())
```

For additional information, you can find the full source code of the type system in [`elysia/type-system`](https://github.com/elysiajs/elysia/blob/main/src/type-system.ts).


### Form [​](#form)


A syntax sugar our `t.Object` with support for verifying return value of [form](https://elysiajs.com/essential/handler.html#formdata) (FormData).

typescript
```
t.FormData({
	someValue: t.File()
})
```


### Numeric (legacy) [​](#numeric-legacy)


WARNING
This is not need as Elysia type already transforms Number to Numeric automatically since 1.0

Numeric accepts a numeric string or number and then transforms the value into a number.

typescript
```
t.Numeric()
```

This is useful when an incoming value is a numeric string, for example, a path parameter or query string.
Numeric accepts the same attributes as [Numeric Instance](https://json-schema.org/draft/2020-12/json-schema-validation#name-validation-keywords-for-num)


## Elysia behavior [​](#elysia-behavior)


Elysia use TypeBox by default.
However, to help making handling with HTTP easier. Elysia has some dedicated type and have some behavior difference from TypeBox.


## Optional [​](#optional-1)


To make a field optional, use `t.Optional`.
This will allows client to optionally provide a query parameter. This behavior also applied to `body`, `headers`.
This is different from TypeBox where optional is to mark a field of object as optional.

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

('/optional', ({ 

query

 }) => 

query

, {
		query

: 

t

.

Optional

(
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
		)
	})
```


## Number to Numeric [​](#number-to-numeric)


By default, Elysia will convert a `t.Number` to [t.Numeric](#numeric-legacy) when provided as route schema.
Because parsed HTTP headers, query, url parameter is always a string. This means that even if a value is number, it will be treated as string.
Elysia override this behavior by checking if a string value looks like a number then convert it even appropriate.
This is only applied when it is used as a route schema and not in a nested `t.Object`.

ts
```
import { Elysia, t } from 'elysia'
new Elysia()
	.get('/:id', ({ id }) => id, {
		params: t.Object({
			// Converted to t.Numeric()
			id: t.Number()
		}),
		body: t.Object({
			// NOT converted to t.Numeric()
			id: t.Number()
		})
	})
// NOT converted to t.Numeric()
t.Number()
```


## Boolean to BooleanString [​](#boolean-to-booleanstring)


Similar to [Number to Numeric](#number-to-numeric)
Any `t.Boolean` will be converted to `t.BooleanString`.

ts
```
import { Elysia, t } from 'elysia'
new Elysia()
	.get('/:id', ({ id }) => id, {
		params: t.Object({
			// Converted to t.Boolean()
			id: t.Boolean()
		}),
		body: t.Object({
			// NOT converted to t.Boolean()
			id: t.Boolean()
		})
	})
// NOT converted to t.BooleanString()
t.Boolean()
```