`Alpine.bind(...)` provides a way to re-use [`x-bind`](https://alpinejs.dev/directives/bind#bind-directives) objects within your application.
Here's a simple example. Rather than binding attributes manually with Alpine:
```
<button type="button" @click="doSomething()" :disabled="shouldDisable"></button>
```
You can bundle these attributes up into a reusable object and use `x-bind` to bind to that:
```
<button x-bind="SomeButton"></button>
<script>
document.addEventListener('alpine:init', () => {
Alpine.bind('SomeButton', () => ({
type: 'button',
'@click'() {
this.doSomething()
},
':disabled'() {
return this.shouldDisable
},
}))
})
</script>
```
Code highlighting provided by [Torchlight](https://torchlight.dev/)