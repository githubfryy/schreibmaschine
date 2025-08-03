## Anchor Plugin


Alpine's Anchor plugin allows you to easily anchor an element's positioning to another element on the page.
This functionality is useful when creating dropdown menus, popovers, dialogs, and tooltips with Alpine.
The "anchoring" functionality used in this plugin is provided by the [Floating UI](https://floating-ui.com/) project.


## [Installation](#installation)


You can use this plugin by either including it from a `<script>` tag or installing it via NPM:


### Via CDN


You can include the CDN build of this plugin as a `<script>` tag, just make sure to include it BEFORE Alpine's core JS file.
```
<!-- Alpine Plugins -->
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/[[email protected]](https://alpinejs.dev/cdn-cgi/l/email-protection)/dist/cdn.min.js"></script>
<!-- Alpine Core -->
<script defer src="https://cdn.jsdelivr.net/npm/[[email protected]](https://alpinejs.dev/cdn-cgi/l/email-protection)/dist/cdn.min.js"></script>
```


### Via NPM


You can install Anchor from NPM for use inside your bundle like so:
```
npm install @alpinejs/anchor
```
Then initialize it from your bundle:
```
import Alpine from 'alpinejs'
import anchor from '@alpinejs/anchor'
Alpine.plugin(anchor)
...
```
The primary API for using this plugin is the `x-anchor` directive.
To use this plugin, add the `x-anchor` directive to any element and pass it a reference to the element you want to anchor it's position to (often a button on the page).
By default, `x-anchor` will set the element's CSS to `position: absolute` and the appropriate `top` and `left` values. If the anchored element is normally displayed below the reference element but doesn't have room on the page, it's styling will be adjusted to render above the element.
For example, here's a simple dropdown anchored to the button that toggles it:
```
<div x-data="{ open: false }">
<button x-ref="button" @click="open = ! open">Toggle</button>
<div x-show="open" x-anchor="$refs.button">
Dropdown content
</div>
</div>
```


## [Positioning](#positioning)


`x-anchor` allows you to customize the positioning of the anchored element using the following modifiers:

-   Bottom: `.bottom`, `.bottom-start`, `.bottom-end`
-   Top: `.top`, `.top-start`, `.top-end`
-   Left: `.left`, `.left-start`, `.left-end`
-   Right: `.right`, `.right-start`, `.right-end`

Here is an example of using `.bottom-start` to position a dropdown below and to the right of the reference element:
```
<div x-data="{ open: false }">
<button x-ref="button" @click="open = ! open">Toggle</button>
<div x-show="open" x-anchor.bottom-start="$refs.button">
Dropdown content
</div>
</div>
```


## [Offset](#offset)


You can add an offset to your anchored element using the `.offset.[px value]` modifier like so:
```
<div x-data="{ open: false }">
<button x-ref="button" @click="open = ! open">Toggle</button>
<div x-show="open" x-anchor.offset.10="$refs.button">
Dropdown content
</div>
</div>
```


## [Manual styling](#manual-styling)


By default, `x-anchor` applies the positioning styles to your element under the hood. If you'd prefer full control over styling, you can pass the `.no-style` modifer and use the `$anchor` magic to access the values inside another Alpine expression.
Below is an example of bypassing `x-anchor`'s internal styling and instead applying the styles yourself using `x-bind:style`:
```
<div x-data="{ open: false }">
<button x-ref="button" @click="open = ! open">Toggle</button>
<div
x-show="open"
x-anchor.no-style="$refs.button"
x-bind:style="{ position: 'absolute', top: $anchor.y+'px', left: $anchor.x+'px' }"
>
Dropdown content
</div>
</div>
```


## [Anchor to an ID](#from-id)


The examples thus far have all been anchoring to other elements using Alpine refs.
Because `x-anchor` accepts a reference to any DOM element, you can use utilities like `document.getElementById()` to anchor to an element by its `id` attribute:
```
<div x-data="{ open: false }">
<button id="trigger" @click="open = ! open">Toggle</button>
<div x-show="open" x-anchor="document.getElementById('trigger')">
Dropdown content
</div>
</div>
```
Code highlighting provided by [Torchlight](https://torchlight.dev/)