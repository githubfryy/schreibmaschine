Pipes are the way to chain functions to transform a value. Vento uses the [pipeline operator](https://github.com/tc39/proposal-pipeline-operator), `|>`.
Note: this is not exactly like the last proposal for JavaScript, it's inspired by [the previous proposal](https://github.com/valtech-nyc/proposal-fsharp-pipelines) that was rejected but it's way more simple and fits better for filters.
Pipes can be used to [print a variable](https://vento.js.org/syntax/pipes/print.md), [save it](https://vento.js.org/syntax/pipes/set.md) or [before iterating a collection](https://vento.js.org/syntax/pipes/for.md#pipes).
Pipes can run three types of functions, in this order of priority:


## [Filters](#filters)


Filters are custom functions that you can configure to transform variables. By default Vento has the `escape`, `unescape` and `safe` filters out of the box, to escape and unescape HTML code:
```
{{ "<h1>Hello, world!</h1>" |> escape }}
```
The `safe` filter does not transform the content, but can be used to mark HTML data as trusted when in autoescaping mode;
```
{{ myTrustedSource.getHtml() |> safe }}
```
If the filter accepts additional arguments you can pass them between parenthesis:
```
{{ "<h1>Hello, world!</h1>" |> filter_name(arg1, arg2, ...) }}
```


## [Global functions](#global-functions)


Vento will execute functions available in the standard JavaScript namespace, such as `JSON.stringify()`:
```
{{ { name: "Óscar", surname: "Otero" } |> JSON.stringify }}
```
This is equivalent to:
```
{{ JSON.stringify({ name: "Óscar", surname: "Otero" }) }}
```
The value is passed as the first argument. Any other argument will go in the next positions:
```
{{ { name: "Óscar", surname: "Otero" } |> JSON.stringify(null, 2) }}
```
This is equivalent to:
```
{{ JSON.stringify({ name: "Óscar", surname: "Otero" }, null, 2) }}
```


## [Prototype functions](#prototype-functions)


As a fallback, Vento will execute the function as a prototype of the variable. In this example, the variable is a string that has the [`toUpperCase()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase) method, so it can be passed as a Pipe:
```
{{ "Hello, world!" |> toUpperCase }}
```
This is equivalent to:
```
{{ "Hello, world!".toUpperCase() }}
```


## [Chain pipes](#chain-pipes)


You can chain different functions with the pipe operator and use `await` for async functions. For example:
```
{{ "https://example.com/data.json" |> await fetch |> await json |> JSON.stringify }}
```

-   [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) is a global async function.
-   [`json`](https://developer.mozilla.org/en-US/docs/Web/API/Response/json) is an async method of the `Response` object returned by `fetch`.
-   [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) is a global function.

The JavaScript equivalent of this is:
```
JSON.stringify(await (await fetch("https://example.com/data.json")).json());
```