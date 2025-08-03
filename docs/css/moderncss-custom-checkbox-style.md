We'll create custom, cross-browser, theme-able, scalable checkboxes in pure CSS with the following:

-   `currentColor` and CSS custom properties for theme-ability
-   `em` units for relative sizing
-   use of pseudo elements for the `:checked` indicator
-   CSS grid layout to align the input and label

Many of the concepts here overlap with our [custom styled radio buttons](https://moderncss.dev/pure-css-custom-styled-radio-buttons/) from episode 18, with the addition of styling for the `:disabled` state

> Now available: my egghead video course [Accessible Cross-Browser CSS Form Styling](https://5t3ph.dev/a11y-forms). You'll learn to take the techniques described in this tutorial to the next level by creating a themable form design system to extend across your projects.

In the [radio buttons](https://moderncss.dev/pure-css-custom-styled-radio-buttons/) article, we explored the two valid ways to markup input fields. Much like then, we will select the method where the label wraps the input.
Here's our base HTML for testing both an unchecked and checked state:
```
<label class="form-control">
  <input type="checkbox" name="checkbox" />
  Checkbox
</label>

<label class="form-control">
  <input type="checkbox" name="checkbox-checked" checked />
  Checkbox - checked
</label>
```
As with the radio buttons, the checkbox appearance varies across browsers.
Here's the base styles across (in order from left) Chrome, Firefox, and Safari:
![default checkboxes in Chrome, Firefox, and Safari](https://dev-to-uploads.s3.amazonaws.com/i/hd8limqlb7v3wqf197e3.png)
Also like with radio buttons, the checkbox doesn't scale along with the `font-size`.
Our solution will accomplish the following goals:

-   scale with the `font-size` provided to the label
-   gain the same color as provided to the label for ease of theme-ability
-   achieve a consistent, cross-browser design style, including `:focus` state
-   maintain keyboard and color contrast accessibility

> Our styles will begin with the same variable and reset as used for the [radio buttons](https://moderncss.dev/pure-css-custom-styled-radio-buttons/#theme-variable-and-box-sizing-reset)

Our label uses the class of `.form-control`. The base styles we'll include here are font styles. Recall from earlier that the `font-size` will not yet have an effect on the visual size of the checkbox `input`.
CSS for ".form-control font styles"
```
.form-control {
  font-family: system-ui, sans-serif;
  font-size: 2rem;
  font-weight: bold;
  line-height: 1.1;
}
```

Checkbox Checkbox - checked

We're using an abnormally large `font-size` just to emphasize the visual changes for purposes of the tutorial demo.
Our label is also the layout container for our design, and we're going to set it up to use CSS grid layout to take advantage of `gap`.
CSS for ".form-control grid layout"
```
.form-control {
  font-family: system-ui, sans-serif;
  font-size: 2rem;
  font-weight: bold;
  line-height: 1.1;
  display: grid;
  grid-template-columns: 1em auto;
  gap: 0.5em;
}
```

Checkbox Checkbox - checked

Alright, now we'll get into restyling the checkbox to be our custom control.

> The original version of this tutorial demonstrated use of extra elements to achieve the desired effect. Thanks to improved support of `appearance: none` and with appreciation to [Scott O'Hara's post on styling radio buttons and checkboxes](https://www.scottohara.me/blog/2021/09/24/custom-radio-checkbox-again.html), we can rely on pseudo elements instead!

We need to reset the native checkbox input styles, but keep it interactive to enable proper keyboard interaction and also to maintain access to the `:focus` state.
To accomplish this, we only need to set `appearance: none`. This removes nearly all inherited browser styles *and*gives us access to styling the input's pseudo elements. Notice we have two additional properties to complete the reset.
CSS for "hiding the native checkbox input"
```
input[type="checkbox"] {
  /* Add if not using autoprefixer */
  -webkit-appearance: none;
  appearance: none;
  /* For iOS < 15 to remove gradient background */
  background-color: #fff;
  /* Not removed via appearance */
  margin: 0;
}
```

Checkbox Checkbox - checked

> Worried about support? This combination of using `appearance: none` and the ability to style the input's pseudo elements has been supported since 2017 in Chrome, Safari, and Firefox, and in Edge since their switch to Chromium in May 2020.

For our custom checkbox, we'll update box styles on the base input element. This includes inheriting the font styles to ensure the use of `em` produces the desired sizing outcome, as well as using `currentColor` to inherit any update on the label's color.
We use `em` for the `width`, `height`, and `border-width` value to maintain the relative appearance. We're also customizing the `border-radius` with another `em` relative style.
CSS for "custom unchecked checkbox styles"
```
input[type="checkbox"] {
  appearance: none;
  background-color: #fff;
  margin: 0;
  font: inherit;
  color: currentColor;
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid currentColor;
  border-radius: 0.15em;
  transform: translateY(-0.075em);
}
.form-control + .form-control {
  margin-top: 1em;
}
```

Checkbox Checkbox - checked

Our style updates includes a rule to give some space between our checkboxes by applying `margin-top` with the help of the [adjacent sibling combinator](https://moderncss.dev/guide-to-advanced-css-selectors-part-one/#adjacent-sibling-combinator).
Finally, as discussed in our [radio button tutorial](https://moderncss.dev/pure-css-custom-styled-radio-buttons/), we do a small adjustment on the label vs. checkbox alignment using a `transform` to nudge it up half the width of the border.
To prepare for the incoming pseudo element, we first need to change the display behavior of the input to use grid.
```
input[type="checkbox"] {
  /* ...existing styles */

  display: grid;
  place-content: center;
}
```
This is the quickest way to align the `:before` to the horizontal and vertical center of our custom control.
It's now time to bring in our `::before` pseudo element which will be styled in order to represent the `:checked` state. We create the `:before` element, including a transition and using transform hide it with `scale(0)`:
```
input[type="checkbox"]::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em var(--form-control-color);
}
```
Use of `box-shadow` instead of `background-color` will enable the state of the radio to be visible when printed (h/t [Alvaro Montoro](https://dev.to/alvaromontoro/comment/1214h)).
Finally, when the `input` is `:checked`, we make it visible with `scale(1)` with a nicely animated result thanks to the `transition`. Be sure to change the checkbox state to see the animation!
CSS for ":checked state styles"
```
input[type="checkbox"] {
  /* ...existing styles */
  display: grid;
  place-content: center;
}

input[type="checkbox"]::before {
  content: "";
  width: 0.65em;
  height: 0.65em;
  transform: scale(0);
  transition: 120ms transform ease-in-out;
  box-shadow: inset 1em 1em var(--form-control-color);
}

input[type="checkbox"]:checked::before {
  transform: scale(1);
}
```

Checkbox Checkbox - checked


#### High Contrast Themes and Forced Colors


As reviewed in the radio buttons tutorial, one more state we need to ensure our radio responds to is what you may hear referred to as ["Windows High Contrast Mode" (WHCM)](https://blogs.windows.com/msedgedev/2020/09/17/styling-for-windows-high-contrast-with-new-standards-for-forced-colors/). In this mode, the user's operating system swaps out color-related properties for a reduced palette which is [an incoming part of the CSS spec called "forced-colors"](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors).
Since `box-shadow` is removed, we'll ensure the `:checked` state is visible by providing a `background-color`, which is normally removed in forced-colors mode, but will be retained if we use one of the defined forced colors. In this case, we're selecting `CanvasText` which will match the regular body text color.
Due to the style stacking order, our `box-shadow` that we've themed for use in regular mode is actually visuallly placed *over* the `background-color`, meaning we can use both without any further modifications.
CSS for "supporting forced-colors"
```
input[type="checkbox"]::before {
  /* ...existing styles */

  /* Windows High Contrast Mode */
  background-color: CanvasText;
}
```

Checkbox Checkbox - checked


#### Creating the "Checkmark" Shape


Right now, the filled-in state is OK, but it would be ideal to have it shaped as a checkmark to match the more expected pattern.
We have a few options here, such as bringing in an SVG as a background image. However, that solution means losing access to CSS custom properties which we are relying on to "theme" our inputs.
Instead, we'll re-shape the default box by using the `clip-path` property. This property allows us to treat the pseudo element's box similar to a vector element being reshaped with the pen tool. We define coordinates to redraw the shape between. You can use [this handy clip-path generator](https://bennettfeely.com/clippy/) to draw your own shapes or instantly pick up common ones. We also use `clip-path` to create a [custom select dropdown arrow](https://moderncss.dev/custom-select-styles-with-pure-css/).
As a matter of preference, I also alter the `transform-origin` to use a value of `bottom left` instead of the default of `center` to mimic a sort of "checking in" animation.
CSS for "creating a checkmark with clip-path"
```
input[type="checkbox"]::before {
  /* ...existing styles */

  transform-origin: bottom left;
  clip-path: polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
}
```

Checkbox Checkbox - checked

In the earlier version of this tutorial, we used `box-shadow`, but now we have two improved features for the humble `outline`. First, we can use `outline-offset` to create a bit of space between the input and the outline. Second, evergreen browsers now support `outline` following `border-radius`!

> Remember: `:focus` is a temporary state, but it's very important that it is highly visible to ensure the accessibility of your form controls and other interactive elements.

CSS for ":focus state styles"
```
input[type="checkbox"]:focus {
  outline: max(2px, 0.15em) solid currentColor;
  outline-offset: max(2px, 0.15em);
}
```

Checkbox Checkbox - checked

This concludes our critical styles for the checkbox. If you're interested in an additional method to style the label, check out the [radio button tutorial](https://moderncss.dev/pure-css-custom-styled-radio-buttons/) to learn how to use `:focus-within`.
One step not present in the radio buttons tutorial was styling for the `:disabled` state.
This will follow a similar pattern as for our previous states, with the change here mostly being to update the color to a grey. We first re-assign the main `--form-control-color` to the new `--form-control-disabled` variable. Then, set the `color` property to use the disabled color.
CSS for ":disabled state styles"
```
:root {
  --form-control-disabled: #959495;
}

input[type="checkbox"]:disabled {
  --form-control-color: var(--form-control-disabled);

  color: var(--form-control-disabled);
  cursor: not-allowed;
}
```

Checkbox Checkbox - checked

We've also updated to set the cursor to `not-allowed` as an additional visual cue that these inputs are not presently interactive.
But we've hit a snag. Since the label is the parent element, we don't currently have a way in CSS alone to style it based on the `:disabled` state.
For a CSS-only solution, we need to create an add an extra class to the label when it is known that the checkbox is disabled. Since this state can't be changed by the user, this will generally be an acceptable additional step.
CSS for ":disabled state styles"
```
.form-control--disabled {
  color: var(--form-control-disabled);
  cursor: not-allowed;
}
```

Checkbox Checkbox - checked

Here's a demo that includes the `:disabled` styles, and also shows how the power of CSS variables + the use of `currentColor` means we can re-theme an individual checkbox with a simple inline style. This is very useful for things like a quick change to an error state.
By Stephanie Eckles ([@5t3ph](https://codepen.io/5t3ph))