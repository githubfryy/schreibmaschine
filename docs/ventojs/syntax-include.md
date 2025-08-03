Use `{{ include [filename] }}` to insert other templates in place. Vento will look for the included file in the [`includes` folder](https://vento.js.org/syntax/configuration.md#includes).
```
{{ include "filename.vto" }}
```
Use relative paths to include files relative to the current template:
```
{{ include "./filename.vto" }}
```
The file name can be any JavaScript expression, useful if you want to include files dynamically:
```
{{ include `${name}.vto` }}
```


## [Data](#data)


The included file inherits the same data as the main file. But you can add additional data by passing an object after the file name.
```
{{ include "./filename.vto" { name: "Óscar" } }}
```


## [Pipes](#pipes)


You can use [pipes](https://vento.js.org/syntax/include/pipes.md) to transform the included content. For example:
```
{{ include "/hello-world.vto" |> toUpperCase }}
```
This code outputs:
```
HELLO WORLD
```