Put a variable or expression between `{{ }}` to output the result.
For example, to print the variable `name`:
```
{{ name }}
```
Everything you put between `{{ }}` is evaluated as JavaScript code so you can print the result of an expression:
```
{{ (name + " " + surname).toUpperCase() }}
```
Or a condition:
```
{{ name || "Unknown" }}
```
Or an async operation (using `await`):
```
{{ await users.getUserName(23) }}
```


## [Autoescaping](#autoescaping)


Important
Autoescaping is disabled by default. [See configuration](https://vento.js.org/syntax/configuration.md#autoescape) to learn how to enable it.

If autoescaping is enabled any HTML content will be escaped automatically. For example:
```
{{ "<h1>Hello, world!</h1>" }}
```
This prints:
```
&lt;h1&gt;Hello, world!&lt;/h1&gt;
```
To mark this variable as trust, use the `safe` filter:
```
{{ "<h1>Hello, world!</h1>" |> safe }}
```


## [Trimming the previous/next content](#trimming-the-previous%2Fnext-content)


Use the `-` character next to the opening tag or previous to the closing tag to remove all white spaces and line breaks of the previous or next content.
In the following example, the `-` in the opening tag configure Vento to remove the white space before the printing tag:
```
<h1>
  {{- "Hello, world!" }}
</h1>
```
The result is:
```
<h1>Hello, world!
</h1>
```
Use the `-` character in both opening and closing tags to remove the white space previous and next to the printing tag:
```
<h1>
  {{- "Hello, world!" -}}
</h1>
```
The result is:
```
<h1>Hello, world!</h1>
```


## [Pipes](#pipes)


Pipes allow transforming the content before printing it using custom functions or global functions. [More info about pipes](https://vento.js.org/syntax/print/pipes.md).
Vento comes with the `escape` filter by default. This filter escapes the html code. For example:
```
{{ "<h1>Hello, world!</h1>" |> escape }}
```
This code outputs:
```
&lt;h1&gt;Hello, world!&lt;/h1&gt;
```


## [Echo](#echo)


The `{{ echo }}` tag does the same as printing. It was added to cover a couple of common cases:


### [Disable the tag processing temporarily](#disable-the-tag-processing-temporarily)


You might want to print content with conflicting syntax (like code examples of Vento, Nunjucks, Liquid, Mustache etc):
```
{{ echo }}
In Vento, {{ name }} will print the "name" variable.
Use {{ name |> escape }} to HTML-escape its content
{{ /echo }}
```


### [To apply pipes to a block of content](#to-apply-pipes-to-a-block-of-content)


Let's say you have a `md` filter to transform Markdown content to HTML:
```
{{ echo |> md }}

## Header


- First item.
- Second item.
{{ /echo }}
```
The `echo` tag can also be used in inline mode, passing the content after the tag name:
```
{{ echo "Hello, world!" }}
```
Which is exactly the same as:
```
{{ "Hello, world!" }}
```