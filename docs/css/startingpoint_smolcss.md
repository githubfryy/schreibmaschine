## Smol Responsive CSS Grid


[Section titled Smol Responsive CSS Grid](#smol-css-grid)

-   grid
-   layout

Create an intrinsically responsive grid layout, optionally using a CSS custom property to extend to variable contexts. Each column will resize at the same rate, and items will begin to break to a new row if the width reaches the `--min` value.
CSS for "Smol Responsive CSS Grid"
```
.smol-css-grid {
  --min: 15ch;
  --gap: 1rem;

  display: grid;
  grid-gap: var(--gap);
  /* min() with 100% prevents overflow
  in extra narrow spaces */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--min)), 1fr));
}
```

-   Item 1
-   Item 2
-   Item 3


## Smol Responsive Flexbox Grid


[Section titled Smol Responsive Flexbox Grid](#smol-flexbox-grid)

-   flexbox
-   layout

Create an intrinsically responsive grid layout, optionally using a CSS custom property to extend to variable contexts. Each column will resize at the same rate *until* reaching the `--min` width. At that point, the last item will break to a new row and fill any available space.
CSS for "Smol Responsive Flexbox Grid"
```
.smol-flexbox-grid {
  --min: 10ch;
  --gap: 1rem;

  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
}

.smol-flexbox-grid > * {
  flex: 1 1 var(--min);
}
```

-   Item 1
-   Item 2
-   Item 3


## Smol Modern Centering


[Section titled Smol Modern Centering](#smol-grid-centering)

-   grid
-   layout

Put down the CSS centering jokes! This modern update is often the solution you're looking for to solve your centering woes.
CSS for "Smol Modern Centering"
```
.smol-centering {
  display: grid;
  place-content: center;
}
```

Feeling Centered


## Smol Intrinsic Container


[Section titled Smol Intrinsic Container](#smol-container)

-   utility
-   layout

This modern CSS container recipe has three delicious ingredients: the `min()` function, the logical property `margin-inline`, and a custom property - `--container-max` - to make it flexible across infinite contexts.
Logical properties are writing mode-aware properties that can also serve as shorthand in some cases. Here, `margin-inline` is a shorthand for setting both `margin-left` and `margin-right`, and [`margin-inline` has fairly good support](https://caniuse.com/mdn-css_properties_margin-inline). A PostCSS plugin is available if you're unable to upgrade quite yet for your audience.
Review the "[Smol Flexible Unbreakable Boxes](#smol-unbreakable-boxes)" for an explanation of `min()`,
CSS for "Smol Intrinsic Container"
```
.smol-container {
  width: min(100% - 3rem, var(--container-max, 60ch));
  margin-inline: auto;
}
```

Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ex quos doloribus autem praesentium quod voluptatem quaerat accusamus labore ullam, omnis corrupti aperiam natus fuga repudiandae repellendus, ipsa enim vitae ut!


## Smol Breakout Grid


[Section titled Smol Breakout Grid](#smol-breakout-grid)

-   grid
-   layout

Setup a flexible grid layout with collapsing outer columns for easy placement of "breakout" elements.
The first feature is the use of the `[x-start]`/`[x-end]` syntax to create named grid areas that span more than one column (also works for rows!). In this example, we create three columns where the `grid` area spans all three, and the `content` area is the center column.
Next, we've set the outer column widths to `1fr` and those columns will collapse first to give the `minmax()` definition for the center column priority, meaning they will eventually compute to a width of `0`. Important to note is that we're only setting *row* gap, otherwise any column gap would keep space propped open between the middle and outer columns. The `minmax()` definition is explained in the demo for the [Smol Responsive Grid](#smol-css-grid).
Finally, we assign everything that doesn't have the special `.breakout` class to the `content` named area, and the `.breakout` to the `grid` named area. Be sure to resize the demo to see the outer columns collapse to contain the breakout!
CSS for "Smol Breakout Grid"
```
.smol-breakout-grid {
  --max-content-width: 50ch;
  --breakout-difference: 0.2;

  /*  Compute total allowed grid width to `--breakout-difference` 
      larger than content area  */
  --breakout-grid-width: calc(
      var(--max-content-width) +
      (var(--max-content-width) * var(--breakout-difference))
    );

  display: grid;
  grid-template-columns:
    [grid-start] 1fr 
    [content-start] minmax(
      min(100%, var(--max-content-width)),
      1fr
    )
    [content-end] 1fr 
    [grid-end];
  width: min(100% - 2rem, var(--breakout-grid-width));
  row-gap: 1rem;
  margin: 5vb auto;
}

.smol-breakout-grid > *:not(.breakout) {
  grid-column: content;
}

.smol-breakout-grid > .breakout {
  grid-column: grid;
}
```


## "Breakout" elements using CSS Grid


Gummi bears gummies cheesecake donut liquorice sweet roll lollipop chocolate cake macaroon. Dragée powder biscuit.
I'm a breakout element, when my parent's parent is wide enough to let me expand into the outer columns.
Jelly sweet tiramisu fruitcake dessert muffin chocolate cake dragée. Donut dragée carrot cake.


## Smol Stack Layout


[Section titled Smol Stack Layout](#smol-stack-layout)

-   grid
-   layout

This smol stacked layout is a grid feature that can often replace older techniques that relied on absolute positioning. It works by defining a single `grid-template-area` and then assigning all direct children to that `grid-area`. The children are then "stacked" and can take advantage of grid positioning, such as the centering technique in the demo.
At first glance you might not notice, but that's a video background in the demo. And all we had to do was set `width: 100%` to ensure it filled the grid area. Then, we make use of `place-self` on the `h3` to center it. The rest is completely optional design styling!
Bonus features in this demo include defining the `h3` size using `clamp()` for *viewport relative sizing*, and also using `aspect-ratio` to size the container to help reduce [cumulative layout shift](https://web.dev/cls/).
CSS for "Smol Stack Layout"
```
.smol-stack-layout {
  display: grid;
  grid-template-areas: "stack";
  /* Set within the HTML for the demo */
  aspect-ratio: var(--stack-aspect-ratio);
  background-color: #200070;
}

.smol-stack-layout > * {
  grid-area: stack;
}

.smol-stack-layout video {
  width: 100%;
}

.smol-stack-layout h3 {
  place-self: center;
  font-size: clamp(2.5rem, 5vw, 5rem);
  text-align: center;
  line-height: 1;
  font-style: italic;
  padding: 5vh 2vw;
}

.smol-stack-layout--video small {
  align-self: end;
  justify-self: start;
  padding: 0 0 0.25em 0.5em;
  opacity: 0.8;
  font-size: 0.8rem;
}

.smol-stack-layout h3,
.smol-stack-layout small {
  position: relative;
  color: #fff;
}
```


### Into The Unknown


Video from [Pexels](https://www.pexels.com/video/a-sky-full-of-stars-at-night-2646392/)


## Smol Responsive Padding


[Section titled Smol Responsive Padding](#smol-responsive-padding)

-   layout

This smol demo is using `clamp()` for responsive padding. The order of `clamp()` values can be interpreted as: the minimum allowed value is `1rem`, the ideal value is `5%` (which will be relative to the element), and the max allowed value is `3rem`.
In other words, as the element is placed in different contexts and resized across viewports, that value will grow and shrink. But it will always compute to a value within the range of `1rem` to `3rem`.
Another suggested option for the middle ideal value is to use a viewport unit, like `4vw`, which works great for components such as models or setting padding on the `body`.
CSS for "Smol Responsive Padding"
```
.smol-responsive-padding {
  padding: 1.5rem clamp(1rem, 5%, 3rem);
}
```

Gummi bears gummies cheesecake donut liquorice sweet roll lollipop chocolate cake macaroon. Dragée powder biscuit. Dessert topping jelly beans liquorice cake sesame snaps oat cake chocolate bar marshmallow. Cookie danish jelly-o pudding tart chocolate. Jelly sweet tiramisu fruitcake dessert muffin chocolate cake dragée. Donut dragée carrot cake icing. Macaroon lemon drops muffin.

-   grid
-   layout

Several layers of delicious modern CSS goodness here! First, we're using `fit-content` to handle the sidebar sizing. This allows the sidebar to grow *up to* the defined value, but only if it *needs to*, else it will use/shrink to the equivalent of `min-content`.
Next, we use `minmax` for the main content. Why? Because if we only use `1fr` then eventually our sidebar and main will share 50% of the space, and we want the main area to always be wider. We also nest `min` to ask the browser to use the minimum of *either* of the options. The result in this case is use of `50vw` on mobile-sized viewports, and `30ch` on larger viewports. And, when there's room, it also stretches to `1fr` for the *max* part of `minmax` 🙌🏽
CSS for "Smol Responsive Sidebar Layout"
```
.smol-sidebar {
  display: grid;
  grid-template-columns: fit-content(20ch) minmax(min(50vw, 30ch), 1fr);
}
```


## Smol Aspect Ratio Gallery


[Section titled Smol Aspect Ratio Gallery](#smol-aspect-ratio-gallery)

-   flexbox
-   layout
-   component

The `aspect-ratio` property [has support in all major modern browsers](https://caniuse.com/mdn-css_properties_aspect-ratio), and by combining it with `object-fit` and flexbox, we can create a smol responsive gallery. Check out the CSS via your browser Inspector to modify the CSS custom properties on `.smol-aspect-ratio-gallery` and see how they affect this layout.
The demo initially sets a height as a fallback for browsers that do not yet support `aspect-ratio`, and then uses `@supports` to upgrade to use of `aspect-ratio`.
Note that `aspect-ratio` isn't just for images, but any element!

> This solution also uses the [Smol Responsive Flexbox Grid](#smol-flexbox-grid).

CSS for "Smol Aspect Ratio Gallery"
```
.smol-aspect-ratio-gallery {
  --min: 15rem;
  --aspect-ratio: 4/3;
  --gap: 0;
}

.smol-aspect-ratio-gallery li {
  height: max(25vh, 15rem);
}

@supports (aspect-ratio: 1) {
  .smol-aspect-ratio-gallery li {
    aspect-ratio: var(--aspect-ratio);
    height: auto;
  }
}

.smol-aspect-ratio-gallery img {
  display: block;
  object-fit: cover;
  width: 100%;
  height: 100%;
}
```


## Smol Flexible Unbreakable Boxes


[Section titled Smol Flexible Unbreakable Boxes](#smol-unbreakable-boxes)

-   component
-   layout

[CSS is awesome](https://css-tricks.com/css-is-in-fact-awesome/), and using a mix of older and modern CSS we can quickly define flexible, unbreakable boxes!
This demo of a `blockquote` first reuses our [responsive padding](#smol-responsive-padding) idea to enable padding that *just feels right* as the box flexes to different sizes. The box size is controlled by setting width using the `min()` function. As the box grows and shrinks, `min()` will select the *minimum* of the provided values, resulting in a box that has a `max-width` for large viewports *and* a `max-width` on smaller viewports.
Then we add a few properties to ensure long text values cannot break the box, including `word-break` and `hyphens` (note that [`hyphens`](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens#browser_compatibility) may not work in all languages).
Finally, the `footer` sets its width with `fit-content` just as we also used in the previous [visited styles demo](#smol-visited-styles). This makes for a great alternative to swapping to an `inline` display value in case you also need to set a `display`!
CSS for "Smol Flexible Unbreakable Boxes"
```
.smol-unbreakable-box {
  --color-light: #E0D4F6;
  --color-dark: #675883;

  margin: 2rem auto;
  color: var(--color-dark);
  background-color: var(--color-light);
  font-size: 1.15rem;
  /* Smol Responsive Padding FTW! */
  padding: clamp(.75rem, 3%, 2rem);
  /* Provide a max-width and prevent overflow */
  width: min(50ch, 90%);
  /* Help prevent overflow of long words/names/URLs */
  word-break: break-word;
  /* Optional, not supported for all languages */
  hyphens: auto;
}

.smol-unbreakable-box footer {
  padding: 0.25em 0.5em;
  margin-top: 1rem;
  color: var(--color-light);
  background-color: var(--color-dark);
  font-size: 0.9rem;
  /* Creates a visual box shrunk to `max-content` */
  width: fit-content;
}
```

> Topping candy canes ice cream gummi bears gingerbread marshmallow. Chocolate cake powder sugar plum topping. Cake marshmallow carrot cake. Pie liquorice liquorice sweet tootsie roll caramels donut dragée bear claw. Chocolate powder candy canes.


## Smol Background Picture


[Section titled Smol Background Picture](#smol-background-picture)

-   grid
-   component

We can reuse the Smol Stack to enable layering the `<picture>` element with content as a replacement for using `background-image`. This will let you get the performance benefits of modern image formats like WebP, as well as being able to define `alt` text for accessibility.
If you haven't worked with the `picture` element before, note that you apply image-related CSS to the internal `img` element.
To emulate `background-image` type of behavior, we use `object-fit: cover` just like we also used for the [image gallery](#smol-aspect-ratio-gallery).
Bonus technique: improve text contrast of the overlaid content by applying `filter` to the `img`. With the filter, we reduce `brightness` to darken the image while also increasing the `saturate` value to recuperate some of the image vibrancy. These are set with custom properties so that you can easily modify them per-instance if needed to ensure the best contrast.

> This solution also uses the [Smol Stack Layout](#smol-stack-layout).

CSS for "Smol Background Picture"
```
.smol-background-picture img {
  --background-img-brightness: 0.45;
  --background-img-saturate: 1.25;

  object-fit: cover;
  width: 100%;
  height: 100%;
  /* decrease brightness to improve text contrast */
  filter: 
    brightness(var(--background-img-brightness)) 
    saturate(var(--background-img-saturate));
}

/* Necessary if not already within a reset */
.smol-background-picture :is(img, picture) {
  display: block;
}

.smol-background-picture__content {
  /* ensure stacking context above the picture */
  position: relative;
  align-self: center;
  color: #fff;
  text-align: center;
  padding: 1rem;
}

.smol-background-picture__content p {
  font-size: clamp(1.35rem, 5vw, 1.75rem);
  line-height: 1.3;
}
```


## Smol Composable Card Component


[Section titled Smol Composable Card Component](#smol-card-component)

-   grid
-   flexbox
-   component

This component features `aspect-ratio` and leans heavily on the pseudo selectors of `:not()`, `:first-child`, and `:last-child`. The result is a composable card component that *just works* with your desired semantic internal content.
With [CSS Selectors Level 4](https://drafts.csswg.org/selectors-4/#negation), the enhanced version of `:not()` now allows a selector list. This ability is fairly [well supported in modern browsers](https://caniuse.com/css-not-sel-list).
A tiny modern CSS progressive enhancement is the use of `text-wrap: pretty` which prevents typography "orphans" by evaluating the last four lines in a text block and makes adjustments so the last line has two or more words.
Note: You may need to create fallbacks for `aspect-ratio` for your unique audience and consider this solution as a progressive enhancement. Review the [Smol Aspect Ratio Gallery](#smol-aspect-ratio-gallery) for one method of creating a fallback.

> This solution also uses the [Smol Responsive CSS Grid](#smol-css-grid) to contain the cards.

CSS for "Smol Composable Card Component"
```
.smol-card-component {
  --img-ratio: 3/2;

  display: flex;
  flex-direction: column;
  /* Supported for flexbox in modern browsers since April 2021 */
  gap: 1rem;
  box-shadow: 0 0 0.5rem hsl(0 0% 0% / 35%);
  border-radius: 0.5rem;
}

.smol-card-component > img {
  aspect-ratio: var(--img-ratio);
  object-fit: cover;
  width: 100%;
}

.smol-card-component > img:first-child {
  border-radius: 0.5rem 0.5rem 0 0;
}

.smol-card-component > img:last-child {
  border-radius: 0 0 0.5rem 0.5rem;
  margin-top: auto;
}

.smol-card-component > :not(img) {
  margin-left: 1rem;
  margin-right: 1rem;

  /* Prevent typography "orphans" */
  text-wrap: pretty;
}

.smol-card-component > :not(img):first-child {
  margin-top: 1rem;
}

/* Enhanced `:not()` accepts a selector list,
but as a fallback you can chain `:not()` instead */
.smol-card-component > :last-of-type:not(img, h2, h3, h4) {
  margin-bottom: 1rem;
}

.smol-card-component > :not(h2, h3, h4) {
  font-size: 0.9rem;
}

.smol-card-component > a {
  align-self: start;
}
```

-   !
    
    ### Card Headline 1
    
    Chocolate cake macaroon tootsie roll pastry gummies.
    Apple pie jujubes cheesecake ice cream gummies sweet roll lollipop.
    [Visit ModernCSS.dev](https://moderncss.dev/)
-   ### Card Headline 2
    
    !
    Chocolate cake macaroon tootsie roll pastry gummies.
    
-   ### Card Headline 3
    
    Apple pie jujubes cheesecake ice cream gummies sweet roll lollipop.
    Chocolate cake macaroon tootsie roll pastry gummies.
    !


## Smol Avatar List Component


[Section titled Smol Avatar List Component](#smol-avatar-list)

-   grid
-   layout
-   component

This smol component, which you may also know as a [facepile](https://indieweb.org/facepile), is possible due to the ability of CSS grid to easily create overlapping content. Paired with CSS custom properties and `calc()` we can make this a contextually resizable component.
Based on devices capabilities, the grid columns are adjusted to slightly narrower than the `--avatar-size`. Since nothing inherent to CSS grid stops the content overflowing, it forces an overlap based on DOM order of the list items. To ensure perfect circle images, we first use the `--avatar-size` value to explicitly set the list item dimensions. Then by setting both width and height to `100%` on the `img` in addition to `object-fit: cover` and `border-radius: 50%`, we can be assured that regardless of actual image dimensions the contents will be forced into a circle appearance.
Bonus trick #1is the use of layered `box-shadow` values that only set a *spread* to create the appearance of borders without adding to the computed dimensions of the image. The spread values are set with `em` so that they are relative to the avatar size. And that works because we set the list's `font-size` to `--avatar-size`.
Bonus trick #2is using the *general sibling combinator* (`~`) so that on hover or `:focus-within` of an `li`, all linked images that follow animate over to reveal more of the hovered avatar. If the number of avatars will cause wrapping, you may want to choose a different effect such as changing the layering via `z-index`.
🔎 Pop open your browser devtools and experiment with changing the `--avatar-size` value!
CSS for "Smol Avatar List Component"
```
.smol-avatar-list {
  --avatar-size: 3rem;
  --avatar-count: 3;

  display: grid;
  /* Default to displaying most of the avatar to
  enable easier access on touch devices, ensuring
  the WCAG touch target size is met or exceeded */
  grid-template-columns: repeat(
    var(--avatar-count),
    max(44px, calc(var(--avatar-size) / 1.15))
  );
  /* `padding` matches added visual dimensions of
  the `box-shadow` to help create a more accurate
  computed component size */
  padding: 0.08em;
  font-size: var(--avatar-size);
}

@media (any-hover: hover) and (any-pointer: fine) {
  .smol-avatar-list {
    /* We create 1 extra cell to enable the computed 
    width to match the final visual width */
    grid-template-columns: repeat(
      calc(var(--avatar-count) + 1),
      calc(var(--avatar-size) / 1.75)
    );
  }
}

.smol-avatar-list li {
  width: var(--avatar-size);
  height: var(--avatar-size);
}

.smol-avatar-list li:hover ~ li a,
.smol-avatar-list li:focus-within ~ li a {
  transform: translateX(33%);
}

.smol-avatar-list img,
.smol-avatar-list a {
  display: block;
  border-radius: 50%;
}

.smol-avatar-list a {
  transition: transform 180ms ease-in-out;
}

.smol-avatar-list img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #fff;
  box-shadow: 0 0 0 0.05em #fff, 0 0 0 0.08em rgba(0, 0, 0, 0.15);
}

.smol-avatar-list a:focus {
  outline: 2px solid transparent;
  /* Double-layer trick to work for dark and light backgrounds */
  box-shadow: 0 0 0 0.08em #29344B, 0 0 0 0.12em white;
}
```

-   grid
-   layout

Modern CSS has gifted us a series of properties that enable setting up more controlled scrolling experiences. In this demo, you'll find that as you begin to scroll, the middle items "snap" to the center of the scrollable area. Additionally, you are unable to scroll past more than one item at a time.
To align the scroll items, we're using grid and updating the orientation of child items using `grid-auto-flow: column`. Then the width of the grid children is set using `min()` which selects the *minimum computed value* between the options provided. The selected width options in this demo results in a large section of neighboring items being visible in the scrollable area for large viewports, while on smaller viewports the scrollable area is mostly consumed by the current scroll item.
*While this is a very cool feature set, use with care!* Be sure to test your implementation to ensure its not inaccessible. Test across a variety of devices, and with desktop zoom particularly at levels of 200% and 400% to check for overlap and how a changed aspect ratio affects scroll items. Try it out with a screen reader and make sure you can navigate to all content.
Note: Have caution when attempting to mix fullscreen scroll snap slideshows followed by normal flow content. This can damage the overall scrolling experience and even prevent access to content. Fullscreen scroll areas are also prone to issues for users of high desktop zoom due to high risk of overlapping content as the aspect ratio changes. In addition, fullscreen versions that use `y mandatory` result in "scroll hijacking" which can be frustrating to users.
Also - you may have a pleasant smooth scroll experience on a touchpad or magic mouse. But mouse users who rely on interacting with the scroll bar arrows or use a click wheel can have a jarring experience. This is due to browser and OS inconsistencies in handling the snapping based on input method (an issue was specifically reported for this demo using Chrome and Edge on PC).
CSS for "Smol Scroll Snap"
```
.smol-scroll-snap {
  /* Set up container positioning */
  display: grid;
  grid-auto-flow: column;
  grid-gap: 1.5rem;
  /* Enable overflow along our scroll axis */
  overflow-x: auto;
  /* Define axis and scroll type, where
  `mandatory` means any scroll attempt will
  cause a scroll to the next item */
  scroll-snap-type: x mandatory;
  padding: 0 0 1.5rem;
  -webkit-overflow-scrolling: touch;
}

.smol-scroll-snap > * {
  width: min(45ch, 60vw);
  /* Choose how to align children on scroll */
  scroll-snap-align: center;
  /* Prevents scrolling past more than one child */
  scroll-snap-stop: always;
}
```


## Smol Focus Styles


[Section titled Smol Focus Styles](#smol-focus-styles)

-   utility

Focus styles are incredibly important for the accessibility of your application. But, it can be difficult to manage them across changing contexts.
The following solution takes advantage of custom properties and `:is()` to set reasonable defaults for interactive elements. Then, individual instances can override each setting by simply providing an alternate value for the custom property.
This solution sets `currentColor` as the `outline-color` which works in many contexts. One that it might not is for buttons, in which case you could update `--outline-color` to use the same color as the button background, for example.
Additionally, this demonstrates one of the newly available CSS pseudo-class selectors: `focus-visible`. This selector is intended to only display focus styles when the browser detects that they should be visible (you may encounter the term "heuristics"). For now, we've setup some fallbacks so that a focus style is presented even when a browser doesn't support `:focus-visible` quite yet.
Note: Due to using `:focus-visible`, you may not see focus styles on the links and buttons unless you tab to them.

> Make sure your focus styles have appropriate contrast! If you're working on buttons, [generate an accessible color palette with ButtonBuddy](https://buttonbuddy.dev/)

CSS for "Smol Focus Styles"
```
/* For "real-world" usage, you do not need to scope
these custom properties */
.smol-focus-styles :is(a, button, input, textarea, summary) {
  /* Using max() ensures at least a value of 2px, 
  while allowing the possibility of scaling 
  relative to the component */
  --outline-size: max(2px, 0.08em);
  --outline-style: solid;
  --outline-color: currentColor;
}

/* Base :focus styles for fallback purposes */
.smol-focus-styles :is(a, button, input, textarea, summary):focus {
  outline: var(--outline-size) var(--outline-style) var(--outline-color);
  outline-offset: var(--outline-offset, var(--outline-size));
}

/* Final :focus-visible styles */
.smol-focus-styles :is(a, button, input, textarea):focus-visible {
  outline: var(--outline-size) var(--outline-style) var(--outline-color);
  outline-offset: var(--outline-offset, var(--outline-size));
}

/* Remove base :focus styles when :focus-visible is available */
.smol-focus-styles :is(a, button, input, textarea):focus:not(:focus-visible) {
  outline: none;
}

/* Demonstration of customizing */
.smol-focus-styles li:nth-of-type(2) a {
  --outline-style: dashed;
}

.smol-focus-styles input {
  --outline-color: red;
}

.smol-focus-styles textarea {
  --outline-size: 0.25em;
  --outline-style: dotted;
  --outline-color: green;
}

.smol-focus-styles li:nth-of-type(4) button {
  font-size: 2.5rem;
}
```

-   A link
-   A link customized to dashed style

-   Customized outline color
-   Fully customized


## Smol Visited Styles


[Section titled Smol Visited Styles](#smol-visited-styles)

-   utility

The `:visited` pseudo class is very unique because of [the potential to be exploited in terms of user's privacy](https://developer.mozilla.org/en-US/docs/Web/CSS/Privacy_and_the_:visited_selector). To resolve this, browser makers have limited which CSS styles are allowed to be applied using `:visited`.
A key gotcha is that styles applied via `:visited` will always use the parent's alpha channel - meaning, you cannot use `rgba` to go from invisible to visible, you must change the whole color value. So, to hide the initial state, you need to be able to use a solid color, such as the page or element's background color.
As usual - this demo has bonus techniques and properties! Note the way we're updating the *order* of the visited indicator using flexbox. And, we're using some newly supported properties to change the color, position, and style of the link underline.
Plus, we're using `fit-content` again but as a value of `width` this time and not as a function. This means it will expand to the equivalent of `max-width` but not *exceed* the available width, preventing overflow.
CSS for "Smol Visited Styles"
```
ul.smol-visited-styles {
  --color-background: #fff;
  --color-accent: green;

  display: grid;
  grid-gap: 0.5rem;
  width: fit-content;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--color-background); 
  border: 1px solid var(--color-accent);
}

.smol-visited-styles a {
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  color: #222;
  text-decoration-color: var(--color-accent);
  text-decoration-style: dotted;
  text-underline-offset: 0.15em;
}

.smol-visited-styles a span {
  margin-right: 0.25em;
  /* Remove from normal document flow
  which excludes it from receiving 
  the underline ✨ */
  float: left;
}

.smol-visited-styles a span::after {
  content: "✔";
  color: var(--color-background);
}

.smol-visited-styles a:visited span::after {
  color: var(--color-accent);
}
```

-   [ModernCSS.dev](https://moderncss.dev/)
-   [LearnFromSteph.dev](https://learnfromsteph.dev/)
-   [Course: Accessibly Styling Form Fields](https://5t3ph.dev/a11y-forms)


## Smol Document Styles


[Section titled Smol Document Styles](#smol-document-styles)

-   layout

In 55 smol lines of CSS, we've created a set of reasonable document styles that is *just enough* to produce a responsive, easily readable document given the use of semantic HTML. Thanks to `flexbox`, `viewport units`, and `clamp`, it's flexible for variable document lengths. The newly supported `:is()` deserves the most credit in terms of reducing lines of code.
While lines of code (short or long) certainly doesn't automatically mean "quality", this demo shows that for a simple project you may not need a framework when a little dash of carefully applied CSS will do!
In fact - it's a great starting point to expand from to use the other smol techniques 😉

> This particular snippet is for an *entire webpage* so consequently the demo is not available for direct preview. Select "Open in Codepen"to check out the following styles in context!

CSS for "Smol Document Styles"
```
* {
  box-sizing: border-box;
  margin: 0;
}

body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 5vh clamp(1rem, 5vw, 3rem) 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #222;
}

body > * {
  --layout-spacing: max(8vh, 3rem);
  --max-width: 70ch;
  width: min(100%, var(--max-width));
  margin-left: auto;
  margin-right: auto;
}

main {
  margin-top: var(--layout-spacing);
}

footer {
  margin-top: auto;
  padding-top: var(--layout-spacing);
}

footer p {
  border-top: 1px solid #ccc;
  padding-top: 0.25em;
  font-size: 0.9rem;
  color: #767676;
}

:is(h1, h2, h3) {
  line-height: 1.2;
}

:is(h2, h3):not(:first-child) {
  margin-top: 2em;
}

article * + * {
  margin-top: 1em;
}

a {
  color: navy;
  text-underline-offset: 0.15em;
}
```


## Smol Transitions


[Section titled Smol Transitions](#smol-transitions)

-   utility

This set of performant CSS transition utility classes include CSS custom properties for scaling the transition property and duration. We're doing a few things in this demo that you may want to keep in mind if you use them.
First, we're triggering the transition of the *child elements* on `:hover` of the parent. The reason for this is that for transitions that move the element, it could end up moving out from under the mouse and causing a flicker between states. The `rise` transition is particularly in danger of that behavior.
Second, we wrap our effect class in a media query check for `prefers-reduced-motion: reduce` that instantly jumps the transition to the final state. This is to comply with the request for reduced motion by effectively disabling the animated part of the transition.
CSS for "Smol Transitions"
```
.smol-transitions > * {
  --transition-property: transform;
  --transition-duration: 180ms;

  transition: var(--transition-property) var(--transition-duration) ease-in-out;
}

.rise:hover > * {
  transform: translateY(-25%);
}

.rotate:hover > * {
  transform: rotate(15deg);
}

.zoom:hover > * {
  transform: scale(1.1);
}

.fade > * {
  --transition-property: opacity;
  --transition-duration: 500ms;
}

.fade:hover > * {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .smol-transitions > * {
    --transition-duration: 0.01ms;
  }
}
```

-   rise
-   rotate
-   zoom
-   fade


## Smol Article Anchors


[Section titled Smol Article Anchors](#smol-article-anchors)

-   grid
-   component
-   utility

Anchor links have had quite an evolution over the years. Have you checked if your implementation is as accessible as it can be? This demo starts with an accessible DOM structure as [researched by Amber Wilson](https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/), and then uses CSS grid to position the anchor link element.
Note: When using grid or flexbox to change the visual order vs the DOM order, always be cautious of breaking expectations in visual focus order. In this case, we know the headline itself will not contain a link and so we are still able to maintain a visually logical focus order.
This demo also features an old pseudo class that is often forgotten which is `:target`. Go ahead - click the anchor in this demo or across this site. Thanks to `:target` coupled with `::before`, you'll be greeted with a friendly message to help identify the *target* of the hashed URL.
Finally, we've also included `scroll-margin-top` which adds margin *only* to an active page target. In other words, upon clicking an anchor link or visiting the site with a hashed URL, the scroll point will be above the target by the value of `scroll-margin-top` (*not yet available in Safari*).
Bonus: Notice the properties set on `:focus` to adjust the `outline` position with `outline-offset`. And check out `:hover` to see `text-underline-offset` used to adjust the position of the underline.
CSS for "Smol Article Anchors"
```
.smol-article-anchor {
  display: grid;
  grid-template-columns: min-content auto;
  position: relative;
  margin-top: 2em;
  /* You could pull this property out and
  generalize it under the selector `[id]` as
  it won't affect flow layout or regular margins */
  scroll-margin-top: 2em;
}

.smol-article-anchor:target::before {
  content: "Is it me you're looking for?";
  position: absolute;
  font-size: .9rem;
  top: -1.25rem;
  left: 0;
  font-style: italic;
  color: currentColor;
}

.smol-article-anchor a {
  grid-row-start: 1;
  align-self: start;
  font-size: 1rem;
  line-height: 1;
  /* We're using `transform` vs. margins */
  transform: translateX(-50%) translateY(25%);
  text-decoration: none;
  /* Be sure to check that your own colors still meet
  or exceed 4.5:1 contrast when using lowering opacity */
  opacity: 0.75;
}

.smol-article-anchor a:hover {
  text-decoration: underline;
  text-underline-offset: 0.25em;
  opacity: 1;
}

.smol-article-anchor a:focus {
  outline: 2px solid currentColor;
  outline-offset: 0.15em;
}

/* Visually hidden while remaining accessible to
assistive tech like screen readers */
.smol-article-anchor-hidden {
  width: 0;
  height: 0;
  overflow: hidden;
  position: absolute;
}
```


### A Wonderful Article Headline


[Section titled A Wonderful Article Headline](#smol-article-anchor-title)


## Smol List Markers


[Section titled Smol List Markers](#smol-list-markers)

-   utility

Support for `::marker` is now available across all modern browsers! This pseudo-selector allows customizing the "bullet" for unordered lists and the numeral for ordered lists without other pseudo element hacks.
Note: `::marker` only allows a select few properties to be modified including `animation-*`, `color`, `content`, `direction`, `font-*`, `transition-*`, `unicode-bidi`, and `white-space`.
The use of `::marker` is a great progressive enhancement that can be used safely without any special consideration since the default experience should always acceptable.
Bonus: Check out how the emoji are being inserted thanks to the `content` property's ability to access custom data attributes! (This appears not yet supported for `::marker` in Safari)
CSS for "Smol List Markers"
```
.smol-list-markers {
  --marker-color: #A150FB;
  
  padding: 0;
  margin: 0 0 0 2em;
}

.smol-list-markers li {
  padding-left: 0.5em;
}

.smol-list-markers li + li {
  margin-top: 0.5em;
}

.smol-list-markers li::marker {
  color: var(--marker-color);
}

ul.smol-list-markers li::marker {
  content: attr(>
  

    -   Chocolate cake pastry toffee tootsie roll
    -   Cake bear claw liquorice oat cake oat cake cheesecake
    -   Ice cream soufflé carrot cake jelly-o bonbon
  

  

    1.  Chocolate cake pastry toffee tootsie roll
    2.  Cake bear claw liquorice oat cake oat cake cheesecake
    3.  Ice cream soufflé carrot cake jelly-o bonbon
```