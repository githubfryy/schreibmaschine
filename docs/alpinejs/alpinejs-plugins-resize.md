## Resize Plugin


Alpine's Resize plugin is a convenience wrapper for the [Resize Observer](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API) that allows you to easily react when an element changes size.
This is useful for: custom size-based animations, intelligent sticky positioning, conditionally adding attributes based on the element's size, etc.


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


You can install Resize from NPM for use inside your bundle like so:
```
npm install @alpinejs/resize
```
Then initialize it from your bundle:
```
import Alpine from 'alpinejs'
import resize from '@alpinejs/resize'
Alpine.plugin(resize)
...
```
The primary API for using this plugin is `x-resize`. You can add `x-resize` to any element within an Alpine component, and when that element is resized for any reason, the provided expression will execute with two magic properties: `$width` and `$height`.
For example, here's a simple example of using `x-resize` to display the width and height of an element as it changes size.
```
<div
x-data="{ width: 0, height: 0 }"
x-resize="width = $width; height = $height"
>
<p x-text="'Width: ' + width + 'px'"></p>
<p x-text="'Height: ' + height + 'px'"></p>
</div>
```

*Resize your browser window to see the width and height values change.*


## [Modifiers](#modifiers)



### [.document](#document)


It's often useful to observe the entire document's size, rather than a specific element. To do this, you can add the `.document` modifier to `x-resize`:
```
<div x-resize.document="...">
```

*Resize your browser window to see the document width and height values change.*

Code highlighting provided by [Torchlight](https://torchlight.dev/)