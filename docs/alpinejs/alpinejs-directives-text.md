`x-text` sets the text content of an element to the result of a given expression.
Here's a basic example of using `x-text` to display a user's username.
```
<div x-data="{ username: 'calebporzio' }">
Username: <strong x-text="username"></strong>
</div>
```

Username:

Now the `<strong>` tag's inner text content will be set to "calebporzio".

[← x-on](https://alpinejs.dev/directives/on)

[x-html →](https://alpinejs.dev/directives/html)

Code highlighting provided by [Torchlight](https://torchlight.dev/)