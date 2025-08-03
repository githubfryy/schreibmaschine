This example demonstrates how you can configure components to respond to events that occur on your server. Alpine already provides a pattern for communicating between components using an [event listener on the `window` object](https://alpinejs.dev/essentials/events#listening-for-events-on-window). We can use this same pattern to also communicate from the server to any component on the page. Consider this list of comments followed by a comment form:
```
<ul x-init @comment:created.window="$ajax('/comments')" id="comments">  
  ...  
</ul>
<div x-sync id="server_events"></div>
<form id="comment_form" x-target method="post" action="/comments">  
  <label for="comment_body">  
  <textarea id="comment_body" name="comment_body"></textarea>  
  <button>Submit</button>  
</form>
```
Notice that the comment form does not explicitly target the comment list. Instead, we want to decouple the form and the comment list behavior. The form will be in charge of updating it's own state after a submission, and the comment list will be in charge of adding new comments when a comment is created on the server.
To this end we've added a custom event listener to the comment list. The comment list is listening for an event named `comment:created` to trigger on the root `window` object. When the `comment:created` event is triggered, a `GET` request is issued to `/comments`, and the comments list is reloaded with a fresh list of comments.
We've also included a placeholder element on the page assigned . This placeholder will act as an event bus for our server events. We've included the `x-sync` attribute on this element so that we can easily push content into it without explicitly targeting it in an AJAX requests.
Next, when our comment form is submitted the server will respond with a new server event and a fresh comment form:
```
<div x-sync id="server_events">  
  <div x-init="$dispatch('comment:created')"></div>  
</div>
<form id="comment_form" x-target method="post" action="/comments">  
  <label for="comment_body">  
  <textarea id="comment_body" name="comment_body"></textarea>  
  <button>Submit</button>  
</form>
```
The `<div>` with `x-init` will immediately dispatch a `comment:created` event as soon as it is rendered to the page. Subsequently, the `comment:created` event will cause our comment list to refresh itself via its own event listener.


## Making the experience more accessible


At this point our comment form is working with a mouse, but we need to also consider what the experience is like for users who might use a keyboard or assistive technology like a screen reader. There are two major problems with our implementation so far:

1.  After a comment is submitted there is no clear indication that a comment was created for visually impaired users.
2.  After a comment is submitted keyboard focus is removed from the page.

We can solve both of this issues by adding with only a few tweaks:
To address the first issue, we'll include a message in our new server event and wrap the `#server_events` component in a `status` element so that the message can be automatically discovered up by assistive technologies:
```
<div role="status">  
  <div x-sync id="server_events">  
    <div x-init="$dispatch('comment:created')">Your comment was added!</div>  
  </div>  
</div>
```
Next, we'll add a `x-autofocus` attribute to the comment `<textarea>`, so that focus is returned to it after a comment is posted:
```
<textarea id="comment_body" name="comment_body" x-autofocus></textarea>
```


## Demo