`x-ref` in combination with `$refs` is a useful utility for easily accessing DOM elements directly. It's most useful as a replacement for APIs like `getElementById` and `querySelector`.
```
<button @click="$refs.text.remove()">Remove Text</button>
<span x-ref="text">Hello 👋</span>
```

Hello 👋

> Despite not being included in the above snippet, `x-ref` cannot be used if no parent element has `x-data` defined. [→ Read more about `x-data`](https://alpinejs.dev/directives/data)

[← x-ignore](https://alpinejs.dev/directives/ignore)

[x-cloak →](https://alpinejs.dev/directives/cloak)

Code highlighting provided by [Torchlight](https://torchlight.dev/)