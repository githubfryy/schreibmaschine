There are currently [four well-supported math functions in CSS](https://caniuse.com/css-math-functions). I've found each of them to be extremely useful in my daily work. These CSS functions can be used in perhaps unexpected ways, such as within gradients and color functions and in combination with CSS custom properties. We'll learn the syntax for each, view basic demos of their functionality, and explore practical use cases.

> Practical purpose of `calc()`: performing basic math operations, with the ability to interpolate between unit types (ex. `rem` to `vw`).

This math function has the longest cross-browser support of the four functions we're exploring. It has a wide range of uses for any time you'd like to be able to do client-side math within your styles.
For example, you may want something to take up most of the viewport height except the height of the navigation. For this purpose, you can mix units to pass a relative `vh` (view height) unit with an absolute pixel unit:
```
.content {
  height: calc(100vh - 60px);
}
```
As the viewport resizes or a user visits on larger or smaller devices, the value of `100vh` will dynamically update, and therefore so will the calculation.

> The benefit of `calc()` is in allowing you to avoid either hard-coding a range of magic numbers or adding a JavaScript solution to calculate the value needed to apply it as an inline style.

We can extend the capabilities of `calc()` by passing in CSS custom properties.
An example of this being very useful is creating a consistent color palette using `hsl()` (which stands for hue, saturation, and lightness). Given values for saturation, lightness, and a starting hue, we can calculate complementary values to build a full palette. Because of the commonality among the saturation and lightness values, the palette will feel cohesive.
CSS for "Using calc() to create an HSL color palette"
```
.colors {
  --base-hue: 140;
  --saturation: 95%;
  --lightness: 80%;
  --rotation: 60;

  color: #222;
  text-align: center;
}

.color {
  padding: 0.25rem;
  background-color: hsl(var(--hue), var(--saturation), var(--lightness));
}

.color1 {
  --hue: calc(var(--base-hue));
}

.color2 {
  --hue: calc(var(--base-hue) + var(--rotation));
}

.color3 {
  --hue: calc(var(--base-hue) + var(--rotation) * 2);
}
```

-   Color 1
-   Color 2
-   Color 3

> Practical purpose of `clamp()`: setting boundaries on a range of acceptable values.

The `clamp()` function takes three values, and order matters. The first is the lowest value in your range, the middle is your ideal value, and the third is the highest value in your range.
An area you may have already encountered the use of `clamp()` is for fluid typography. The essential concept is that the `font-size` value can fluidly adjust based on the viewport size. This is intended to prevent large headlines triggering overflow, or taking up too much of the viewport.
A very basic definition for a fluid `h1` style:
```
h1 {
  font-size: clamp(1.75rem, 4vw + 1rem, 3rem);
}
```
You can [read more about generating fluid type in the Modern CSS episode 12](https://moderncss.dev/generating-font-size-css-rules-and-creating-a-fluid-type-scale/).
Another example can be seen in [my demo from SmolCSS on responsive padding](https://smolcss.dev/#smol-responsive-padding). The interesting thing about using percentages for padding is that it is relative to the element's width. This means it's a bit like a container-relative unit, which we can use similar to how you might think of `vw`.
The example from SmolCSS uses the following padding definition, where the padding will grow and shrink relative to the element's width. It will never be less than `1rem`, and never greater than `3rem`:
```
.element {
  padding: 1.5rem clamp(1rem, 5%, 3rem);
}
```
You may have realized this again removes some scenarios where you might have previously reached for media queries. Instead of micro-managing this spacing or worrying about strictly adhering to a pixel ramp (ex 8, 12, 24, 36), you can set up sensible guidelines for a responsive transition.
The most significant benefit here versus media queries is that since this padding definition is element relative, it will be larger when the element has more space on the page and smaller if, for example, it's placed in a narrow column. This would take a lot of coordination with media-query-based utility classes!

> Practical purpose of `min()`: setting boundaries on the maximum allowed value in a way that encompasses the responsive context of an element.

That's right - despite being the `min()` function, the outcome is that the provided values will act as a *maximum* allowed value for the property.
Given `width: min(80ch, 100vw)`, the outcome is that on a larger viewport, the `80ch` will be selected because it is the smaller value of the two options, yet it *acts like* a maximum based on contextually available space. Once the viewport shrinks, `100vw` will be used because it is computed as *smaller than* `80ch`, yet it's actually providing a *maximum* boundary for the element's width.
The example just provided is my preferred way to define a `.container`, with one tiny tweak. The `min()` function allows nested basic math operations, which means we can flip to subtracting some space as a swap for defining left and right padding, as follows:
```
.container {
  width: min(80ch, 100vw - 2rem);
}
```
On larger viewports, the element can grow to a *max* of `80ch`, and once the viewport shrinks below that width, it will be allowed to grow to `100vw - 2rem`. This definition effectively produces `1rem` of "padding" on either side of the element.
In this example, you could also swap to `100%` instead of `vw` to make the element width responsive within a *parent container*, as used for this demo:
CSS for "The Modern CSS .container Class"
```
.container {
  width: min(40ch, 100% - 2rem);
  margin-right: auto;
  margin-left: auto;
}
```

Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vero a quam labore inventore iste eligendi, quasi velit, qui repellendus voluptatem temporibus nisi. Pariatur nesciunt at dolorum, cumque illum maiores animi?

> *Quick note*: The `ch` unit is equal to the width of the `0` character given all current `font` properties at the time it is applied. This makes it an excellent choice for approximating line length for a better reading experience, for example.

What's the benefit? Responsive sizing *without* the need for media queries! It seems to be a common theme for these functions 😉
The `min()` function is my most used of the math functions. Let's look at some more amazing upgrades to practical scenarios.
Any time you would like to size an element responsively, `min()` can be a great choice. For example, I explored [using `min()` to control sizing an avatar](https://moderncss.dev/developing-for-imperfect-future-proofing-css-styles/) within a comment thread in Modern CSS episode 26.
In the avatar example, we ended up applying *three* values with different units: `min(64px, 15%, 10vw)`. Another way to read this is that the avatar size will not exceed one of those values at any given time, with the browser selecting whichever is the *minimum* computed value.
This definition works out to never having an avatar larger than `64px`. Particularly in a zoom scenario, the `10vw` helps the size feel more relative. And the `15%` helps keep the size relative to the element, which may have a more visually appealing result before the `10vw` applies.
CSS math functions can be used in most properties that allow a numeric value. One unique place to use them is within `background-size`.
Why? Perhaps you're supplying a layered effect of a background color and an image. And rather than using the `cover` size value, which would make the image fill the space, you would like to cap the growth of the image. This is a perfect place to bring in `min()`.
Consider the following example, where `min()` is used to ensure the image doesn't exceed `600px` while being allowed to respond down with the element by also setting `100%`. In other words, it will grow *up to* `600px` and then resize itself down to match the element's width when it is less than `600px`.
CSS for "Controlling background-size with min()"
```
.background-image {
  background: #1F1B1C url(https://source.unsplash.com/RapCPd_mJTU/800x800) no-repeat center;
  background-size: min(600px, 100%);
}
```

Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vero a quam labore inventore iste eligendi, quasi velit.

> Practical purpose of `max()`: setting boundaries on the minimum allowed value in a way that encompasses the responsive context of an element.

Yup, `max()` is the opposite of `min()`! So now we are setting up definitions for the *minimum* allowed values. Let's get right to the examples!
After learning about the [Web Content Accessibility Guidelines (WCAG) Success Criterion 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) for reflow, which states that a user should be able to use zoom to magnify your site to 400%, I noticed that pixels and rems become a subpar unit in that context.
Given a desktop size of 1280px at 400% zoom, your content is equivalent to a device at 320px. However - versus a mobile phone - the orientation is still landscape. A viewport of this size means a much-reduced area to read and perform actions. Additionally, sizes that seemed appropriate for a phone become a lot large contextually when viewed in a zoomed-in window.
Fortunately, `max()` gives us one way to in particular handle margins more gracefully. I avoid pixel values for everything in my personal work and usually prefer `rem` for smaller spaces. But for larger spaces intended to separate content sections, I use the following, which allows relative growth for tall viewports and reduces distance for shorter viewports, which also applies to zoomed viewports.
```
.element + .element {
  margin-top: max(8vh, 2rem);
}
```
On the taller viewports, `8vh` will be used, and on smaller or zoomed-in viewports, `2rem` will be used. I encourage you to try this out and spend some time testing across viewports, devices, and with and without zooming into your layout. This technique is a small upgrade that can make a significant difference for the end-user.

> Review an expanded example of this scenario and [learn more about reflow](https://moderncss.dev/modern-css-upgrades-to-improve-accessibility/#desktop-zoom-and-reflow) in the Modern CSS episode 27.

Have you ever experienced forced browser zoom once you focused a form input on iOS? This consequence will happen for any input that has a font-size less than `16px`.
Here's the fix, originally linked in [Modern CSS episode 21 about custom form input styles](https://moderncss.dev/custom-css-styles-for-form-inputs-and-textareas/), with full credit to [Dan Burzo](https://dev.to/danburzo/css-micro-tip-make-mobile-safari-not-have-to-zoom-into-inputs-1fc1) for this simple solution:
```
input {
  font-size: max(16px, 1rem);
}
```
Where `1rem` could be swapped with a Sass variable or a CSS custom property. This use of `max()` ensures that regardless of another value provided, the `font-size` will be *at least* `16px` and therefore prevent the forced browser zoom.
The latest addition to my CSS reset uses `min()` to apply relative sizing for focus outlines.
This is a reduced snippet, but by using `max()`, we ensure a *minimum* outline size of `2px`, while allowing it to *grow* relative to the element by using the font-relative `em` value.
```
a {
  --outline-size: max(2px, 0.08em);
  --outline-style: solid;
  --outline-color: currentColor;
}

a:focus {
  outline: var(--outline-size) var(--outline-style) var(--outline-color);
  outline-offset: var(--outline-size);
}
```
The term "target size" comes from [WCAG Success Criterion (SC) 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), where "target" refers to the area that will receive a pointer event (ex. mouse click or touch tap). In the upcoming WCAG 2.2, SC 2.5.5 is now the "Enhanced" version, which has a minimum size of `44px`.
For this guideline, consider buttons that only use icons or the avatar from our earlier example that links to a profile. Or perhaps a dual-action button where a dropdown arrow is a separate action from the primary button control.
In these instances, we can use `max()` similarly to when we provided a guardrail to prevent the input zooming. We'll set `44px` as one of the values within `max()` so that at *minimum*, that is the element's size.
```
.icon-button {
  width: max(44px, 2em);
  height: max(44px, 2em);
}
```
It should be noted that this criterion also considers the space around the element, which if combined with the element's actual size is *at least* 44px, then the criterion is passed successfully. As with all of these techniques, be sure to test with your actual product and with real users!
Another way I've used `max()` is to set an image height when using `aspect-ratio` to enable an acceptable experience for browsers that do not yet support that property.
You can see the following sample fully in use for the [SmolCSS demo for a composable card component](https://smolcss.dev/#smol-card-component).
```
img {
  /* Fallback for `aspect-ratio` of defining a height */
  height: max(18vh, 12rem);
  object-fit: cover;
  width: 100%;
}

/* When supported, use `aspect-ratio` */
@supports (aspect-ratio: 1) {
  img {
    aspect-ratio: var(--img-ratio);
    height: auto;
  }
}
```
This final demo shows an example of applying multiple CSS math functions to allow responsive sizing across several properties. Note the comments alongside the demonstrated code.
By Stephanie Eckles ([@5t3ph](https://codepen.io/5t3ph))

> For more examples of using these CSS math functions and other modern CSS features, [check out my talk from CSS Cafe on YouTube](https://www.youtube.com/watch?v=dz6aFfme_hg).