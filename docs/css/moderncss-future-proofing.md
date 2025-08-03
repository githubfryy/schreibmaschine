How do we plan future-proof styles in a world with an infinite degree of device and user ability variance? Let's explore how things can break and how modern CSS provides solutions.
This episode will cover handling for:

-   variable content length and overflow
-   unpredictable media sizes
-   internationalization
-   accessibility-related user settings

We'll explore creating a robust comment thread component. Here's our starting point - an exact mimic of the layout you received from design, good job!
CSS for "Initial Comment Thread"
```
.comment-list {
  list-style: none;
  padding: 0.5rem;
  margin: 0;
  display: grid;
  gap: 1.5rem;
}

.comment .comment-list {
  grid-column-start: 2;
  grid-column-end: -1;
  padding: 0;
}

.comment {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 1rem;
}

.comment-body {
  display: grid;
  gap: .5rem;
  color: #444;
}

.comment-meta {
  color: #767676;
  font-size: .875rem;
}

.comment-body a {
  color: inherit;
}

.comment-meta a {
  color: mediumvioletred;
}
```
But if you resize it, you'll already notice a few problems, particularly with overflow.
*Avatar illustrations are part of the [Women Power](https://blush.design/collections/women-power) collection on Blush by Sara Pelaez*.
When you can't precisely plan around content, plan for flexibility. Rather than setting absolutes, we can use CSS functions to choose the best value relative to the current context.
In our `.comment` styles, we set a precise pixel value for the avatar. Instead, we can use the CSS function `min` to select the *minimum computed value* between a list of options.
CSS for "Updated Avatar Grid Column"
```
.comment {
  grid-template-columns: 64px 1fr;
  grid-template-columns: min(64px, 15%) 1fr;
}
```
In this case, the impact is that the avatar will never exceed `64px` for larger viewports. And for smaller viewports *or* within narrower containers, it will be computed as `15%` of the total comment width.
As this example shows, sometimes we can turn over layout choices to the browser to make contextually versus define precise values within media queries.
Whether characters or elements, always expect more than the original design has planned.
Our avatar update has already improved things. But we're still viewing the component with "happy path" content from our designer that doesn't reflect real-world data. Notably, the user names and comment lengths are relatively short.
Let's update our demo data to have a bit more variance and "real" avatars:
Not as pretty as our mockup mimic 😊
Now, if you've been following along and testing our component via resizing, you'll see we have the possibility of content overflow.
Let's resolve it first for the `.comment-meta`, which is the `small` tag containing the username and date.
We will update the layout method to allow the username and date to line up on wider viewports and stack on smaller viewports. Simple flex behavior allows this since child elements will be their max-width when there's room and flow to a new row when the containing element reduces below that max-width.
CSS for "Update Comment Meta Layout"
```
.comment-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```
While [flexbox `gap` support](https://caniuse.com/flexbox-gap) is gaining, in this case, the degraded behavior is simply very slightly closer elements, so it isn't too detrimental not to provide a fallback.
Go ahead and test this version and see how the dates bump to a new line when there isn't enough space for their full width.
In the demo data, the longer email in the second comment eventually causes overflow scroll on smaller viewports. So does the extended URL in the comment body.
The fix could be scoped to only the link elements if we'd like. However, due to the nature of a comment thread, it seems to make sense to be extra-preventative about overflow content in this context So we'll apply two properties to the top-level `.comment` in order to cascade to all the content within.
CSS for "Preventing Content Overflow"
```
.comment {
  /* Help prevent overflow of long words/names/URLs */
  overflow-wrap: break-word;
  /* Optional, not supported for all languages */
  hyphens: auto;
}

.comment a {
  /* Remove from links to prevent perceiving false hyphens */
  hyphens: none;
}
```
Notice we removed the possibility of `hyphens` from links. In this case, the full links are visible like in our example, and someone tries to write it down or read it aloud.

> CSS-inserted hyphens are not included if a user copies the text. As noted, `hyphens` are also not consistently available for all languages in all browsers. You can [review `hyphens` support on MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens#browser_compatibility).

With `overflow-wrap: break-word`, any text string *may* be broken onto a new line once the containing element doesn't have room for its full-width. When `hyphens` are supported, the bonus effect is reducing a "ragged edge" from odd spaces caused by broken words.
Optionally, you may want to update links to use `overflow-wrap: anywhere;` to prevent an empty space if the browser decides to move the link to a new line before applying the break. You can see our current solution on smaller viewports currently leaves a space before the long exposed link.
Try out resizing the component now, and perhaps even pop open dev tools to inspect and toggle on and off these properties to see the difference in their effects.
Now let's deal with those avatars.
First, we set `border-radius` to create a circle appearance. Then we ensure the image fills the grid column with `width: 100%`. Following that, we turn the image into its own container and allow the image content to fill but not exceed the `img` dimensions with `object-fit: cover`. We end the rule with a [cutting-edge property of `aspect-ratio`](https://caniuse.com/mdn-css_properties_aspect-ratio) to ensure a perfect square.
CSS for "Updated Avatar Dimensions"
```
.comment img {
  border-radius: 50%;
  width: 100%;
  object-fit: cover;
  aspect-ratio: 1;
}

@supports not (aspect-ratio: 1) {
  .comment-avatar {
    position: relative;
    height: 0;
    padding-bottom: 100%;
  }

  .comment-avatar img {
    position: absolute;
    height: 100%;
  }
}
```
We follow that rule with a feature detection fallback rule - `@supports not (aspect-ratio: 1)` - for browsers that do *not* support `aspect-ratio`. This fallback is an older technique that relies on padding to ensure a perfect square ratio of the image's parent and then ensures the `img` fills that area.

> Previous Modern CSS tutorials have covered `object-fit`, such as [CSS-Only Full-Width Responsive Images 2 Ways](https://moderncss.dev/css-only-full-width-responsive-images-2-ways/). You may also enjoy this [3 min video demonstrating `object-fit`](https://egghead.io/lessons/css-apply-aspect-ratio-sizing-to-images-with-css-object-fit).

We've covered the scenarios we could detect fairly easily by resizing our browser/the component container. And adding more real-world data helped us define better avatar styles.
There are a few more items we need to explicitly test for: internationalization (i18n) and a few relevant WCAG success criteria for accessibility.

> Terminology check: WCAG stands for the "[Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)," a set of standards intended to help create more accessible and inclusive experiences. *[Success Criteria](https://www.w3.org/WAI/WCAG22/Understanding/understanding-techniques)* are guidance that is broadly applicable to current and future web technologies in order to assist in creating experiences that are accessible.

Yes, the comments are silly nonsense (courtesy of [cupcake ipsum](http://www.cupcakeipsum.com/) and [corporate ipsum](https://www.cipsum.com/)). However, for something like a comment thread component that's purpose is to intake and display user-submitted content, it's a great idea to stress-test by trialing some translations.
The first comment is German, the second is Estonian, and the third is Arabic.
CSS for "RTL Text Styling"
```
.comment {
  text-align: start;
}
```
Thanks to our previous work on handling overflow, our comment thread is gracefully handling the change in content languages.
On the third one that is in Arabic, the browser is handling the content direction switch firstly due to placing the attribute `dir="rtl"` on the `.comment` list element. Interestingly, the browser intelligently switches the order of the `grid-template-columns` without our needing to do anything extra. Flexbox will also flip according to this attribute. Older styles that use floats would not flip and would require an additional override.
We've defined just one extra property: `text-align: start`. This is called a *[logical property](https://rtlstyling.com/posts/rtl-styling#css-logical-properties)* and in the case of RTL being defined it flips the text and becomes equivalent to `text-align: right`. While [support is still gaining for logical properties](https://caniuse.com/css-logical-props), you may need to include a fallback. Since we're using `gap` for spacing throughout, no update is needed there. If we were using margins that were affected, we could again use logical properties to help do the conversion when needed.
Since I am not an RTL (right-to-left) styling expert, I will point you to this fantastic resource if you would like to [learn more about RTL styling](https://rtlstyling.com/posts/rtl-styling/).
Reflow is the term for supporting desktop zoom up to 400%. On a 1280px wide resolution at 400%, the viewport content is equivalent to 320 CSS pixels wide.
Zooming on a desktop eventually triggers what we usually think of as "responsive design" behavior. In fact, if you are using media queries or other viewport-based layout methods, you will see those begin to take hold as you zoom in.
The trouble with handling this success criterion is usually two-fold:

-   there is no `zoom` media query to adjust for any issues
-   the aspect ratio of a desktop using zoom is different than the mobile portrait mode we usually plan responsive design around

The aspect ratio difference, in particular, can cause issues with overlap. It also means solutions that rely on only viewport units or percentages appear either too large or too small within a zoom context.
However, viewport units used in combination with other units can actually help solve zoomed layout issues as well and gap-fill the problem of not having a dedicated `zoom` media query.
If we zoom our component to 400%, the avatar column begins to grow a bit large within that context. We'd like it to take up a relatively similar size column as we perceive it at standard zoom.
Recall that we originally applied `min` to the avatar's grid column, which was intended to resize the avatar for smaller containers and viewports via a percentage width. Fortunately, the `min` function can take more than two values!
Now, this type of fix can take some trial and error, but to my eye, adding `10vw` as an additional value provided the desired adjustment. It also slightly reduced the avatar for true mobile viewports but was a worthwhile trade-off.
The benefit of retaining the percentage width is that our component continues to be responsive to its parent container as well. If we removed it, we would not see a reduction until the viewport units began to take effect, which may objectively be too late.
CSS for "Update Column Minimum Allowed Widths"
```
.comment {
  grid-template-columns: min(64px, 15%) 1fr;
  grid-template-columns: min(64px, 15%, 10vw) 1fr;
}
```
If you are using a desktop browser, bump up your zoom to 400%. Then open dev tools (recommended not to place it as a sidebar for this test) and find this demo. Select one of the `.comment` list items and adjust the `10vw` by using your arrow keys to see when it "wins" versus the other values. Then, swap to a mobile emulator and view whether your adjustment positively or negatively impacted the avatar in that view.
Resolving zoom layout issues takes some patience, but `min` is one of the best modern CSS tools I've found to assist with this challenge.
Another criterion you may not be aware of or already be testing for is *Text Spacing*.
According to the [text spacing understanding documentation](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), your content should be flexible for user settings, including:

-   Line height (line spacing) to at least 1.5 times the font size
-   Spacing following paragraphs to at least 2 times the font size
-   Letter spacing (tracking) to at least 0.12 times the font size
-   Word spacing to at least 0.16 times the font size

Luckily, there is a [text spacing bookmarklet](https://dylanb.github.io/bookmarklets.html) you can grab that will apply styles to test this criterion.
If you're unfamiliar with a bookmarklet, you can click the link and drag it to your bookmark bar. In this case, the bookmarklet contains a tiny script that will apply the text spacing styles to all elements on the page you're viewing to allow you to test this criterion.
Applying the bookmarklet test to our comment thread component, we, fortunately, encounter no issues thanks to our previous efforts.

> You may have difficulties with this criterion if you try to define content boxes with absolute dimensions, or rely on CSS truncation methods, or force inline dimension styles with JavaScript. If the content is cut-off or overflows, you need to resolve it to meet this criterion.

You may choose the "Open in CodePen" option to generate a new CodePen that includes the final styles created for this component. Use it as an opportunity to better explore the various updates we applied, including:

-   responsive grid column sizing with `min`
-   flexbox for variable width content reflow
-   `overflow-wrap` and `hyphens` to handle content overflow
-   combining units within `min` to account for various viewport sizes as well as zoom