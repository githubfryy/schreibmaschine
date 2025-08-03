## Installation


You can use Alpine AJAX by either including it from a `<script>` tag or installing it via NPM.


### Via CDN


Include the CDN build of Alpine AJAX as a `<script>` tag, just make sure to include it beforeAlpine's core JS file.
```
<script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@0.12.4/dist/cdn.min.js"></script>  
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
```


### Via NPM


Install Alpine AJAX from NPM for use inside your bundle like so:
```
npm i @imacrayon/alpine-ajax
```
Then initialize it from your bundle:
```
import Alpine from 'alpinejs'  
import ajax from '@imacrayon/alpine-ajax'
window.Alpine = Alpine  
Alpine.plugin(ajax)
```


## Usage


It’s good practice to start building your UI withoutAlpine AJAX. Make your entire website work as it would if Alpine AJAX were not available, then sprinkle in AJAX functionality at the end. Working in this way will ensure that your AJAX interactions degrade gracefully [when JavaScript is not available](https://www.kryogenix.org/code/browser/everyonehasjs.html): Links and forms will continue to work as normal, they simply won't fire AJAX requests. This is known as [Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement), and it allows a wider audience to use your website.


### See it in in action


[Play Video: Alpine AJAX](https://youtube.com/watch?v=vNiZyFVmoOI "Play Video")


## x-target


Add the `x-target` attribute to forms or links to enable AJAX behavior. The value of `x-target` should equal the `id` of an element on the page that the form or link should target.
Take a look at the following comment list markup, notice the `x-target="comments"` attribute on the `<form>`:
```
<ul id="comments">  
  <li>Comment #1</li>  
</ul>  
<form x-target="comments" method="post" action="/comment">  
  <input aria-label="Comment text" name="text" required />  
  <button>Submit</button>  
</form>
```
When the form is submitted a `POST` request is issued to `/comment` and the `#comments` list will be replaced with the element that has in the AJAX request's response.


### Multiple Targets


`x-target` can replace multiple elements from a single server response by separating `id`s with a space.
In this comment list example note that the `x-target` attribute on the `<form>` targets two elements:
```
<h2>Comments (<span id="comments_count">1</span>)</h2>  
<ul id="comments">  
  <li>Comment #1</li>  
</ul>  
<form x-target="comments comments_count" method="post" action="/comment">  
  <input name="comment" required />  
  <button>Submit</button>  
</form>
```
Now, when the form is submitted, both the `#comments` list, and the `#comments_count` indicator will be updated.


### Target aliases


In situations where an element ID on the current page cannot be made to match an element ID in an AJAX response, you may specify a target alias by separating two IDs with a colon:
```
<a x-target="modal_body:page_body">Load modal</a>  
<div id="modal_body"></div>
```
In this example, when the link is clicked, `#modal_body` will be replaced with the `#page_body` element in the incoming AJAX request.


### Targets based on response status code


Add a status code modifier to `x-target` to define different targets based on the status code received in an AJAX response:

-   `x-target.422="my_form"` merge content when the response has a 422 status code.
-   `x-target.4xx="my_form"` merge content when the response has a 400 class status code (400, 403, 404, etc.).
-   `x-target.back="my_form"` merge content when the response is redirected backto the same page.
-   `x-target.away="my_form"` merge content when the response is redirected awayto a different page.
-   `x-target.error="my_form"` merge content when the response has a 400 or 500 class status codes.

Consider this login form:
```
<form x-target="login" x-target.away="_top" id="login" method="post" action="/login">  
  <label for="email">Email</label>  
  <input type="email" id="email" name="email">  
  ...  
  <button>Submit</button>  
</form>
```
When this form is submitted, all responses - such as validation errors - will render inside `#login` without a full page refresh. Once a login attempt is successful, the user will be redirected to a secure page via a full page reload.
Here is an example using multiple targets with the `back` modifier:
```
<form x-target="todo_list add_todo_form" x-target.back="add_todo_form" id="add_todo_form" method="post" action="/todos">  
  <label for="task">Task</label>  
  <input id="task" name="task">  
  <button>Add</button>  
</form>
<ul id="todo_list">  
  ...  
</ul>
```
When this form is submitted, validation errors will only target the `#add_todo_form`, but on a successful submission, both the `#add_todo_form` and `#todo_list` will be updated.


#### An important note about redirect (300 class) status codes


[The JavaScript Fetch API follows all redirects transparently](https://blog.jim-nielsen.com/2021/fetch-and-3xx-redirect-status-codes/), so Alpine AJAX cannot distinguish between 300 class status codes. This means all 300 class modifiers will capture any redirect response, for example, `x-target.302` will also handle 301 & 303 redirects.


### Special targets


The following target keywords have special meaning:

-   `_top` instructs an element to trigger a full page reload.
-   `_none` instructs an element to do nothing.
-   `_self` *(deprecated in 0.12.0)* instructs an element to trigger a full page reload, except when the response is redirected back to the same page.  
    *Use `x-target.away="_top"` instead*.

In cases when a form or link targets itself, you may leave the value of `x-target` blank, however the form or link must still have an `id`:
```
<form x-target id="star_repo" method="post" action="/repos/1/star">  
  <button>Star Repository</button>  
</form>
```
[Target aliases](#target-aliases) can use the shorthand syntax too (note the `:` prefix):
```
<form x-target=":alias_id" id="star_repo" method="post" action="/repos/1/star">  
  <button>Star Repository</button>  
</form>
```


### Dynamic target names


Sometimes simple target literals (i.e. comment\_1) are not sufficient. In these cases, `x-target:dynamic` allows you to dynamically generate target IDs using Alpine data and JavaScript expressions:
```
<template x-for="comment in comments" :key="comment.id">  
  <li :id="'comment_'+comment.id">  
    <div></div>  
    <form x-target:dynamic="'comment_'+comment.id" :action="'/comments/'+comment.id" method="post">  
      <button>Edit</button>  
    </form>  
  </li>  
</template>
```


### History & URL Support


Use the `x-target.replace` modifier to replace the URL in the browser's navigation bar when an AJAX request is issued.
Use the `x-target.push` modifier to push a new history entry onto the browser's session history stack when an AJAX request is issued.
`replace` simply changes the browser’s URL without adding a new entry to the browser’s session history stack, where as `push` creates a new history entry allowing your users to navigate back to the previous URL using the browser’s "Back" button.


### Disable AJAX per submit button


In cases where you have a form with multiple submit buttons, you may not always want all submit buttons to trigger an AJAX request. Add the `formnoajax` attribute to a submit element to instruct the form to make a standard full-page request instead of an AJAX request.
```
<form id="checkout" x-target method="post" action="/checkout">  
  <button name="procedure" value="increment">Increment quantity</button>  
  <button name="procedure" value="decrement">Decrement quantity</button>  
  <button formnoajax name="procedure" value="purchase">Complete checkout</button>  
</form>
```
In this example clicking "Increment" or "Decrement" will issue an AJAX request. Clicking "Complete Checkout" will perform a standard form submission.
Use `x-headers` to add additional request headers:
```
<form method="post" action="/comments" x-target="comments comments_count" x-headers="{'Custom-Header': 'Shmow-zow!'}">
```
Alpine AJAX adds two default headers to every request: `X-Alpine-Request` which is always `true`, and `X-Alpine-Target` which contains a space-separated list of target IDs. The previous form example would include these headers with its request:
```
X-Alpine-Request: true  
X-Alpine-Target: comments comments_count  
Custom-Header: Shmow-zow!
```


## x-merge


By default incoming HTML from the server will `replace` a targeted element. You can add `x-merge` to a targeted elementto change how it merges incoming content. For example, if you wanted to `append` new items to a list of messages, you would add `x-merge="append"` to the list:
```
<ul id="messages" x-merge="append">  
  <li>First message</li>  
</ul>
```
New HTML sent from the server might look like this:
```
<ul id="messages">  
  <li>Second message</li>  
</ul>
```
And after the HTML is merged, you'll have a list with two items:
```
<ul id="messages" x-merge="append">  
  <li>First message</li>  
  <li>Second message</li>  
</ul>
```
There are a total of seven merge strategies you can use, `replace` is the default strategy:

| Strategy | Description |
| --- | --- |
| before | Inserts the content of the incoming element before the target element. |
| replace | (Default) Replaces the target element with the incoming element. |
| update | Updates the target element's content with the incoming element's content. |
| prepend | Prepends the target element's content with the incoming element's content. |
| append | Appends the target element's content with the incoming element's content. |
| after | Inserts the content of the incoming element after the target element. |

You can change the default merge strategy for all AJAX requests using the `mergeStrategy` global [configuration option](#configuration).


### Morphing


Alpine AJAX supports using the [Alpine Morph Plugin](https://alpinejs.dev/plugins/morph) as a merge strategy for when you want to update content and preserve UI state in a more fine-grained way.
To enable the morph strategy, install the Morph Plugin beforeinstalling Alpine AJAX.
Via CDN:
```
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/morph@3.14.1/dist/cdn.min.js"></script>  
<script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@0.12.4/dist/cdn.min.js"></script>  
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>
```
Or via NPM:
```
npm i @alpinejs/morph
```
```
import Alpine from 'alpinejs'  
import morph from '@alpinejs/morph'  
import ajax from '@imacrayon/alpine-ajax'
window.Alpine = Alpine  
Alpine.plugin(morph)  
Alpine.plugin(ajax)
```
With the Morph Plugin installed you can use `x-merge="morph"` to morph content changes on the page.


### View transitions & animations


You can animate transitions between different DOM states using the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API). This API is still in active development and is currently only supported in Chrome browsers. Alpine AJAX provides support for View Transitions and gracefully falls back to no animations if the API is not available in a browser.
To enable View Transitions on an element use the `x-merge.transition` modifier. When enabled in a supported browser, you should see content automatically animate as it is merged onto the page. You can customize any transition animation via CSS by following [Chrome's documentation for customizing transitions](https://developer.chrome.com/docs/web-platform/view-transitions/#simple-customization).


## x-autofocus


When AJAX requests change content on the page it's important that you control keyboard focus to maintain [meaningful sequencing](https://www.w3.org/TR/WCAG21/#meaningful-sequence) and [focus order](https://www.w3.org/TR/WCAG21/#focus-order). `x-autofocus` will restore a user's keyboard focus when the content they were focused on is changed by an AJAX request.
Notice the `x-autofocus` attribute on this email `<input>`:
```
<input type="email" name="email" x-autofocus />
```
This input will steal keyboard focus whenever it is inserted into the page by Alpine AJAX. Check out the [Toggle Button](https://alpine-ajax.js.org/examples/toggle-button/) and [Inline Edit](https://alpine-ajax.js.org/examples/inline-edit/) examples to see `x-autofocus` in action.


### Disabling autofocus


You may use the `nofocus` modifier on `x-target` to disable autofocus behavior. This can be useful in situations where you may need to hand over focus control to a third-party script. In the following example we've disabled focus so that our dialog component can handle focus instead:
```
<a href="/preview/1" x-target.nofocus="dialog_content" @ajax:before="$dispatch('dialog:open')">Open preview</a>
```


### The standard `autofocus` attribute


Alpine AJAX will also respect the standard `autofocus` attribute and treat it like `x-autofocus`. When AJAX content contains elements with both `x-autofocus` and `autofocus`. The element with `x-autofocus` will win focus.


### Using `morph` and focus


It's worth noting that `x-merge="morph"` is another way to preserve keyboard focus between content changes. However, there are cases when the DOM is transformed so much that the Morph algorithm is unable to reliably preserve focus state, so `x-autofocus` is a lot more predictable in most situations.


## x-sync


Elements with the `x-sync` attribute are updated whenever the server sends a matching element, even if the element isn't targeted with `x-target`.
`x-sync` elements must have a unique `id`. Any element sent from the server with a matching `id` will replace the existing `x-sync` element.
Use cases for this attribute are unread message counters or notification flashes. These elements often live in the base layout, outside of the content area that is being replaced.
Consider this list of notifications:
```
<div role="status">  
  <ul x-sync id="notifications"></ul>  
</div>
```
Every server response that includes an element with will replace the existing list of notifications inside the `aria-live` region. Take a look at the [Notifications example](https://alpine-ajax.js.org/examples/notifications) for a complete demonstration of this UI pattern.


## $ajax


The `$ajax` magic helper is for finer-grained AJAX control. Use it to programmatically issue AJAX requests in response to events. Here we've wired it up to an input's `change` event to perform some server-side validation for an email:
```
<div id="email_field" x-data="{email : ''}" @change="$ajax('/validate-email', {  
  method: 'post',  
  body: { email },  
})">  
  <label for="email">Email</label>  
  <input type="email" name="email" id="email" x-model="email">  
</div>
```
In this example we make a `POST` request with the `email` value to the `/validate-email` endpoint. See the [Inline Validation example](https://alpine-ajax.js.org/examples/inline-validation) for a complete demonstration.
Note:Since `$ajax` is intended to be used in side effects it doesn't target `x-sync` elements or autofocus like `x-target`. However, you can change these defaults using the `$ajax` options.


### $ajax options


| Option | Default | Description |
| --- | --- | --- |
| method | 'GET' | The request method. |
| target | '' | The request target. |
| targets | [] | Same as target, but specified as an array of strings. If this is empty target is used. |
| body | {} | The request body. |
| focus | false | Setting this to true will enable `x-autofocus` & `autofocus` behavior. |
| sync | false | Setting this to true will include x-sync targets in the request. |
| headers | {} | Additional request headers as key/value pairs. |


## Events


You can listen for events to perform additional actions during the lifecycle of an AJAX request:

| Name | Description |
| --- | --- |
| ajax:before | Fired before any AJAX requests are made. If this event is canceled using $event.preventDefault() the request will be aborted. |
| ajax:send | Fired when an AJAX request is issued. $event.detail contains the request’s options, modifying these options will override the underlying fetch call. |
| ajax:redirect | Fired when an AJAX request responds with a 300 class status code. $event.detail contains the server response data. |
| ajax:success | Fired when an AJAX request responds with a 200 or 300 class status code. $event.detail contains the server response data. |
| ajax:error | Fired when an AJAX request responds with a 400 or 500 class status code. $event.detail contains the server response data. |
| ajax:sent | Fired after any AJAX request receives a response. |
| ajax:missing | Fired if a matching target is not found in the response body. $event.detail contains the server response data. You may cancel this event using $event.preventDefault() to override the default behavior. |
| ajax:merge | Fired when new content is being merged into $event.target. You may override a merge using $event.preventDefault(). $event.detail contains the server response data, the content to merge, and a merge() method to continue the merge. |
| ajax:merged | Fired after new content was merged into $event.target. |
| ajax:after | Fired after all AJAX merging has settled. $event.target contains the server response data and a render array that contains the rendered targets. |

Here's an example of aborting a form request when the user cancels a dialog prompt:
```
<form id="delete_user" x-target @ajax:before="confirm('Are you sure?') || $event.preventDefault()">  
  <button>Delete User</button>  
</form>
```
Note:The `ajax:success` and `ajax:error` events only convey the status code of an AJAX request. You'll probably find that [Server Events](https://alpine-ajax.js.org/examples/server-events/) are better for triggering actions based on your server's response.


## Loading states


While an AJAX request is in progress there are a few loading states to be aware of:

-   If a form submission triggered the request, the form's submit button is automatically disabled, this prevents users from triggering additional network requests by accidentally double clicking the submit button.
-   During an AJAX request, `aria-busy="true"` is set on all targets of the request. This attribute can be used in CSS to provide a loading indicator, check out the [Loading Indicator example](https://alpine-ajax.js.org/examples/loading) for more details.


## Configuration


You have the option to configure the default behavior of Alpine AJAX when importing it in your code:
```
import ajax from '@imacrayon/alpine-ajax'
Alpine.plugin(ajax.configure({  
  headers: { 'X-CSRF-Token': 'mathmatical!' },  
  mergeStrategy: 'morph'  
}))
```
Here are the configuration options and there defaults:

| Option | Default | Description |
| --- | --- | --- |
| headers | {} | Additional request headers, as key/value pairs, included in every AJAX request. |
| mergeStrategy | 'replace' | Set the default merge strategy used when new content is merged onto the page. |


## Navigation


Let's talk about the "Single Page Application" for a moment: This is a common pattern where every link on a webpage is made to issue an AJAX request instead of the standard full page refresh. The motivation behind SPA navigation is to reduce the page load and create a responsive experience that feels fast to the end user. However, SPA navigation also introduces a host of state management and accessibility concerns:

-   Page history must be cached and handled in client-side code rather than natively in the Browser
-   SPA navigation [introduces accessibility issues](https://github.com/hotwired/turbo/issues/774) that [require special consideration](https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing/)
-   Long-running JavaScript code can introduce runaway memory leaks and state synchronization issues

In the time since the "Single Page Application" was introduced browsers have eliminated many of the problems SPA navigation was designed to work around:

-   Browsers now implement [Paint Holding](https://developer.chrome.com/blog/paint-holding/) so users don't see a blank white page before a new page is loaded
-   Browsers [cache compiled JavaScript](https://v8.dev/blog/code-caching) across page loads, so that it can be [efficiently run on the next page load](https://dev.to/v8blink/lets-understand-chrome-v8-chapter-19-compilation-cache-make-the-compiler-faster-22ml)
-   The [Speculation Rules API](https://developer.chrome.com/docs/web-platform/prerender-pages) dramatically simplifies preloading assets before a link is clicked so that the next page can load instantly. Libraries like [instant.page](https://instant.page/) and [quicklink](https://github.com/GoogleChromeLabs/quicklink) provide cross-browser support for preloading.
-   Chromium browsers support [Multi-Page Transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/@view-transition) with support in more browsers [coming soon](https://bugzilla.mozilla.org/show_bug.cgi?id=1909173).
-   [Service Workers](https://github.com/DannyMoerkerke/basic-service-worker) provide advanced asset caching and offline support

All of these platform-native technologies can be combine to create very modern user experiences without the big drawbacks and extra work that come with SPA navigation, so before you start slapping `x-target` on every link in your project, consider that [one change to your `<head>`](https://github.com/csswizardry/csswizardry.github.com/commit/77285ba766bf94aed2a9fc66e10c91cef57d9f0a) may be all you need to achieve peak performance™.


## Creating demos


Use the mock server script included with Alpine AJAX when you need to build a quick prototype or demonstrate a bug, without a server. The mock server script adds a global `route` helper function for mocking server endpoints on the frontend:
```
<!--  
Include the typical required scripts before the mock server:  
<script defer src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@0.12.4/dist/cdn.min.js"></script>  
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.1/dist/cdn.min.js"></script>  
-->  
<script src="https://cdn.jsdelivr.net/npm/@imacrayon/alpine-ajax@0.12.4/dist/server.js"></script>
<script>  
route('POST', '/update-quantity', (request) => {  
  return `<output>${Number(request.quantity)}</output>`  
})  
</script>
<label for="current_quantity">Current quantity</label>  
<output id="current_quantity">0</output>  
<form x-target="current_quantity" method="POST" action="/update-quantity">  
  <label form="quantity">New quantity</label>  
  <input type="number" id="quantity" name="quantity">  
  <button>Update</button>  
</form>
```
Now, instead of issuing a real `POST` request to `/update-quantity`, Alpine AJAX will use the HTML returned in our route definition as the response. Note that any form data included in the AJAX request is made available too you in the `route` function.
Mock server example on CodePen
Important: The mock server should only be used for demos and testing, this utility is not designed for production environments.