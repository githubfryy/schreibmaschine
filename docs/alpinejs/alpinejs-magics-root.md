`$root` is a magic property that can be used to retrieve the root element of any Alpine component. In other words the closest element up the DOM tree that contains `x-data`.
```
<div x-data data-message="Hello World!">
<button @click="alert($root.dataset.message)">Say Hi</button>
</div>
```

[← $nextTick](https://alpinejs.dev/magics/nextTick)

[$data →](https://alpinejs.dev/magics/data)

Code highlighting provided by [Torchlight](https://torchlight.dev/)