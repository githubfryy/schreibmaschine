Functions are similar to JavaScript functions and allow you to define reusable chunks of content.
```
{{ function hello }}
  Hello, world!
{{ /function }}

{{ hello() }}
```
You can specify arguments to the function just like in JavaScript:
```
{{ function hello(name = "world") }}
  Hello, {{ name }}!
{{ /function }}

{{ hello() }}

{{ hello("Vento") }}
```
Like in JavaScript, Vento functions can access to scoped variables of the template, even if they are not passed to the function:
```
{{ set name = "world" }}

{{ function hello }}
  Hello, {{ name }}!
{{ /function }}

{{ hello() }}
```


## [Async functions](#async-functions)


Use the `async` keyword to create asynchronous functions.
```
{{ async function hello }}
  {{ await Promise.resolve("Hello, world!") }}
{{ /function }}

{{ await hello() }}
```


## [Importing/exporting functions](#importing%2Fexporting-functions)


See [Imports and exports](https://vento.js.org/syntax/function/import-export.md) to learn how to import and export functions from other templates.