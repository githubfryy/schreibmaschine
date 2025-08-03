This example shows how to load remote content into a dialog window.
We start an empty `<dialog>` and a list of links that target the `<dialog>`.
```
<ul x-init @ajax:before="$dispatch('dialog:open')">  
  <li><a href="/contacts/1" x-target="contact">Finn Mertins</a></li>  
  ...  
<ul>
<dialog x-init @dialog:open.window="$el.showModal()">  
  <div id="contact"></div>  
  <form method="dialog" novalidate><button>Close</button></form>  
</dialog>
```
Clicking a link issues a `GET` request to the server and triggers the `ajax:before` event. When the `ajax:before` event is triggered we dispatch a `dialog:open` event.
The `<dialog>` is set to listen for `dialog:open` and will open when that event is fired.
Finally, the server responds with the modal content:
```
<div id="contact">  
  <p><strong>First Name</strong>: Finn</p>  
  <p><strong>Last Name</strong>: Mertens</p>  
  <p><strong>Email</strong>: fmertens@candykingdom.gov</p>  
  <p><strong>Status</strong>: Active</p>  
</div>
```


## Demo