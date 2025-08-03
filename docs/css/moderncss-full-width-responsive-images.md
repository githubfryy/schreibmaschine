In the not to distant past when jQuery was King of the Mountain and CSS3 was still worth being designated as such, the most popular tool for responsive background images was the [Backstretch jQuery plugin](https://www.jquery-backstretch.com/).
I used this plugin on ~30 sites prior to the following property becoming more supported (aka IE < 9 dropping in total market share):
```
background-size: cover;
```
According to [caniuse.com](https://caniuse.com/#feat=mdn-css_properties_background-size_contain_and_cover), this property and value have been well supported for over 9 years! But websites that are intertwined with using Backstretch or another homegrown solution may not yet have updated.
The alternative method makes use of the standard `img` tag, and uses the magic of:
```
object-fit: cover;
```
Let's look at how to use each solution, and learn when to select one over the other.
A decade of my background was creating highly customized WordPress themes and plugins for enterprise websites. So using the example of templated cards, here's how you might set up using the `background-size: cover` solution.
First, the HTML, where the image is inserted into the `style` attribute as a `background-image`. An `aria-label` is encouraged to take the place of the `alt` attribute that would normally be present on a regular `img` tag.
```
<article class="card">
  <div
    class="card__img"
    aria-label="Preview of Whizzbang Widget"
    style="background-image: url(https://placeimg.com/320/240/tech)"
  ></div>
  <div class="card__content">
    <h3>Whizzbang Widget SuperDeluxe</h3>
    <p>
      Liquorice candy macaroon soufflé jelly cake. Candy canes ice cream biscuit marzipan. Macaroon
      pie sesame snaps jelly-o.
    </p>
    <a href="#" class="button">Add to Cart</a>
  </div>
</article>
```
The relevant corresponding CSS would be the following, where `padding-bottom` is one weird trick that is used to set a 16:9 ratio on the div containing the image:
```
.card__img {
  background-size: cover;
  background-position: center;
  // 16:9 ratio
  padding-bottom: 62.5%;
}
```
Here's this solution altogether:
By Stephanie Eckles ([@5t3ph](https://codepen.io/5t3ph))
This solution is a newer player, and is not available to you if you need to support IE < Edge 16, according to [caniuse data](https://caniuse.com/#search=object-fit) without a polyfill.
This style is placed directly on the `img` tag, so we update our card HTML to the following, swapping the `aria-label` to `alt`:
```
<article class="card">
  <img
    class="card__img"
    alt="Preview of Whizzbang Widget"
    src="https://placeimg.com/320/240/tech"
  />
  <div class="card__content">
    <h3>Whizzbang Widget SuperDeluxe</h3>
    <p>
      Liquorice candy macaroon soufflé jelly cake. Candy canes ice cream biscuit marzipan. Macaroon
      pie sesame snaps jelly-o.
    </p>
    <a href="#" class="button">Add to Cart</a>
  </div>
</article>
```
Then our updated CSS swaps to using the `height` property to constrain the image so that any size image conforms to the constrained ratio. If the inherent size of the image is greater than the constrained image size, the `object-fit` property takes over and by default centers the image within the bounds created by the card container + the `height` definition:
```
.card__img {
  object-fit: cover;
  height: 30vh;
}
```
And here's the result:
By Stephanie Eckles ([@5t3ph](https://codepen.io/5t3ph))
If you have to support older versions of IE, then without a polyfill you are limited to the `background-size` solution (it pains me to say this in 2020, but this is a possibility particularly for enterprise and education industries).
Both solutions enable a full-width responsive image based on a width:height ratio you control.
Choose `background-size` if:

-   applying to a container expected to hold additional content, ex. a website header background
-   to apply additional effect styles via pseudo elements which are not available to the `img` element
-   to more gracefully apply a uniform size of image
-   the image is purely decorative and the inherent `img` semantics are not needed

Choose `object-fit` if:

-   using a standard `img` is best for your context in order to maintain all semantics provided by an image