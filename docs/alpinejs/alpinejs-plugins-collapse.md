## Collapse Plugin


Alpine's Collapse plugin allows you to expand and collapse elements using smooth animations.
Because this behavior and implementation differs from Alpine's standard transition system, this functionality was made into a dedicated plugin.


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


You can install Collapse from NPM for use inside your bundle like so:
```
npm install @alpinejs/collapse
```
Then initialize it from your bundle:
```
import Alpine from 'alpinejs'
import collapse from '@alpinejs/collapse'
Alpine.plugin(collapse)
...
```
The primary API for using this plugin is the `x-collapse` directive.
`x-collapse` can only exist on an element that already has an `x-show` directive. When added to an `x-show` element, `x-collapse` will smoothly "collapse" and "expand" the element when it's visibility is toggled by animating its height property.
For example:
```
<div x-data="{ expanded: false }">
<button @click="expanded = ! expanded">Toggle Content</button>
<p x-show="expanded" x-collapse>
...
</p>
</div>
```

Reprehenderit eu excepteur ullamco esse cillum reprehenderit exercitation labore non. Dolore dolore ea dolore veniam sint in sint ex Lorem ipsum. Sint laborum deserunt deserunt amet voluptate cillum deserunt. Amet nisi pariatur sit ut id. Ipsum est minim est commodo id dolor sint id quis sint Lorem.


## [Modifiers](#modifiers)



### [.duration](#dot-duration)


You can customize the duration of the collapse/expand transition by appending the `.duration` modifier like so:
```
<div x-data="{ expanded: false }">
<button @click="expanded = ! expanded">Toggle Content</button>
<p x-show="expanded" x-collapse.duration.1000ms>
...
</p>
</div>
```

Reprehenderit eu excepteur ullamco esse cillum reprehenderit exercitation labore non. Dolore dolore ea dolore veniam sint in sint ex Lorem ipsum. Sint laborum deserunt deserunt amet voluptate cillum deserunt. Amet nisi pariatur sit ut id. Ipsum est minim est commodo id dolor sint id quis sint Lorem.


### [.min](#dot-min)


By default, `x-collapse`'s "collapsed" state sets the height of the element to `0px` and also sets `display: none;`.
Sometimes, it's helpful to "cut-off" an element rather than fully hide it. By using the `.min` modifier, you can set a minimum height for `x-collapse`'s "collapsed" state. For example:
```
<div x-data="{ expanded: false }">
<button @click="expanded = ! expanded">Toggle Content</button>
<p x-show="expanded" x-collapse.min.50px>
...
</p>
</div>
```

Reprehenderit eu excepteur ullamco esse cillum reprehenderit exercitation labore non. Dolore dolore ea dolore veniam sint in sint ex Lorem ipsum. Sint laborum deserunt deserunt amet voluptate cillum deserunt. Amet nisi pariatur sit ut id. Ipsum est minim est commodo id dolor sint id quis sint Lorem.

Code highlighting provided by [Torchlight](https://torchlight.dev/)