`$dispatch` is a helpful shortcut for dispatching browser events.
```
<div @notify="alert('Hello World!')">
<button @click="$dispatch('notify')">
Notify
</button>
</div>
```
You can also pass data along with the dispatched event if you wish. This data will be accessible as the `.detail` property of the event:
```
<div @notify="alert($event.detail.message)">
<button @click="$dispatch('notify', { message: 'Hello World!' })">
Notify
</button>
</div>
```
Under the hood, `$dispatch` is a wrapper for the more verbose API: `element.dispatchEvent(new CustomEvent(...))`
Note on event propagationNotice that, because of [event bubbling](https://en.wikipedia.org/wiki/Event_bubbling), when you need to capture events dispatched from nodes that are under the same nesting hierarchy, you'll need to use the [`.window`](https://github.com/alpinejs/alpine#x-on) modifier:
Example:```
<!-- 🚫 Won't work -->
<div x-data>
<span @notify="..."></span>
<button @click="$dispatch('notify')">Notify</button>
</div>
<!-- ✅ Will work (because of .window) -->
<div x-data>
<span @notify.window="..."></span>
<button @click="$dispatch('notify')">Notify</button>
</div>
```

> The first example won't work because when `notify` is dispatched, it'll propagate to its common ancestor, the `div`, not its sibling, the `<span>`. The second example will work because the sibling is listening for `notify` at the `window` level, which the custom event will eventually bubble up to.


## [Dispatching to other components](#dispatching-to-components)


You can also take advantage of the previous technique to make your components talk to each other:
Example:```
<div
x-data="{ title: 'Hello' }"
@set-title.window="title = $event.detail"
>
<h1 x-text="title"></h1>
</div>
<div x-data>
<button @click="$dispatch('set-title', 'Hello World!')">Click me</button>
</div>
<!-- When clicked, the content of the h1 will set to "Hello World!". -->
```


## [Dispatching to x-model](#dispatching-to-x-model)


You can also use `$dispatch()` to trigger data updates for `x-model` data bindings. For example:
```
<div x-data="{ title: 'Hello' }">
<span x-model="title">
<button @click="$dispatch('input', 'Hello World!')">Click me</button>
<!-- After the button is pressed, `x-model` will catch the bubbling "input" event, and update title. -->
</span>
</div>
```
This opens up the door for making custom input components whose value can be set via `x-model`.
Code highlighting provided by [Torchlight](https://torchlight.dev/)