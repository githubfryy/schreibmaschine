## x-id


`x-id` allows you to declare a new "scope" for any new IDs generated using `$id()`. It accepts an array of strings (ID names) and adds a suffix to each `$id('...')` generated within it that is unique to other IDs on the page.
`x-id` is meant to be used in conjunction with the `$id(...)` magic.
[Visit the $id documentation](https://alpinejs.dev/magics/id) for a better understanding of this feature.
Here's a brief example of this directive in use:
```
<div x-id="['text-input']">
<label :for="$id('text-input')">Username</label>
<!-- for="text-input-1" -->
<input type="text" :id="$id('text-input')">
<!-- -->
</div>
<div x-id="['text-input']">
<label :for="$id('text-input')">Username</label>
<!-- for="text-input-2" -->
<input type="text" :id="$id('text-input')">
<!-- -->
</div>
```

> Despite not being included in the above snippet, `x-id` cannot be used if no parent element has `x-data` defined. [→ Read more about `x-data`](https://alpinejs.dev/directives/data)

Code highlighting provided by [Torchlight](https://torchlight.dev/)