The `{{ set [name] = [value] }}` tag allows to create or modify a global variable. For example:
```
{{ set message = "Hello, world!" }}
```
Use pipes to transform the value:
```
{{ set message = "Hello, world!" |> toUpperCase }}
```


## [Block mode](#block-mode)


It's also possible to capture the variable value between `{{ set [name] }}` and `{{ /set }}`.
```
{{ set message }}
  Hello, world!
{{ /set }}
```
Block mode supports pipes too:
```
{{ set message |> toUpperCase }}
  Hello, world!
{{ /set }}
```


## [Differences between `set` and creating the variable with JavaScript](#differences-between-set-and-creating-the-variable-with-javascript)


Vento allows you to [run JavaScript](https://vento.js.org/syntax/set/javascript.md), so it's possible to create new variables using normal JavaScript code:
```
{{> const name = "Óscar" }}
{{ name }}
```
The `set` tag provides the following benefits:

-   With `set`, the variable is created globally. This means it's available in the included files (using [include](https://vento.js.org/syntax/set/include.md)).
    
-   You can use Pipes.
    
-   It prevents errors of initializing the variable twice. For example, the following code will breaks, because the same variable is initialized twice:
    ```
    {{> const name = "Óscar" }}
    {{> const name = "Laura" }}
    ```
    With `set` this will work fine:
    ```
    {{ set name = "Óscar" }}
    {{ set name = "Laura" }}
    ```
    


## [Importing/exporting variables](#importing%2Fexporting-variables)


See [Imports and exports](https://vento.js.org/syntax/set/import-export.md) to learn how to export and import variables from other templates.


## [Internal variables](#internal-variables)


When Vento compiles a template, it generates JavaScript code that contains some internal variables like `__env`, `__exports`, or `__pos`. These internal variables (prefixed with `__` to avoid conflicts with your own variables) shouldn't be modified. As a general rule, avoid creating variables prefixed with a double underscore, especially the names `__env`, `__exports`, and `__pos`.