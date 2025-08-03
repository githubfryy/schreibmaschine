Vento templates not only render content but also can export other things like variables and functions. The API is very similar to Emacscript modules, using the `import` and `export` tags.


## [Exporting](#exporting)


The `export` tag allows to export a variable or function under a name. For example, to export a variable:
```
{{ export message = "Hello, world!" }}
```
Use pipes to transform the value:
```
{{ export message = "Hello, world!" |> toUpperCase }}
```
The exported variable is also available in the current template:
```
{{ export message = "Hello, world!" }}

{{ message }}
```


### [Block mode](#block-mode)


It's also possible to export a block using `{{ export }}` and `{{ /export }}` tags.
```
{{ export message }}
  Hello, world!
{{ /export }}
```
Block mode supports pipes too:
```
{{ export message |> toUpperCase }}
  Hello, world!
{{ /export }}
```


### [Functions](#functions)


To export a function, just include the `function` keyword after `export`:
```
{{ export function message (name) }}
  Hello, {{ name }}!
{{ /export }}
```
Like with variables, the exported functions are also available in the template:
```
{{ export function message (name) }}
  Hello, {{ name }}!
{{ /export }}

{{ message("world") }}
```


## [Importing](#importing)


Use the tag `import` to get the variables and functions exported by other templates. For example, to import and use a variable:
```
{{ import { message } from "./vars.vto" }}

{{ message }}
```
Or a function:
```
{{ import { message } from "./functions.vto" }}

{{ message() }}
```
The imported variables are specified between curly brackets (For example `{ message }`). You can import all elements from a template by omitting the brackets.
```
{{ import fns from "./functions.vto" }}

{{ fns.message() }}
```