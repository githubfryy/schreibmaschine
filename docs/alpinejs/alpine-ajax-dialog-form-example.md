This example shows how to handle forms within a dialog window.
We start with an empty `<dialog>` and a `<table>` of contact data.
```
<table>  
  <thead>  
    <tr>  
      <th scope="col">Name</th>  
      <th scope="col">Status</th>  
      <th scope="col">Email</th>  
      <th scope="col">Action</th>  
    </tr>  
  </thead>  
  <tbody id="contacts" x-init @ajax:before="$dispatch('dialog:open')" @contact:updated.window="$ajax('/contacts')">  
    ...  
  </tbody>  
</table>
<dialog x-init @dialog:open.window="$el.showModal()" @contact:updated.window="$el.close()">  
  <div id="contact"></div>  
</dialog>
```
Notice that the `<tbody>` has an `id` and is listening for two events:

1.  When the `ajax:before` event is triggered we dispatch a `dialog:open` event.
2.  When the `contact:updated` event is triggered we issue a `GET` request to `/contacts` and refresh the `<tbody>` to match the server.

The `<dialog>` is also listening for two events:

1.  When the `dialog:open` event is triggered the dialog will open.
2.  When the `contact:updated` event is triggered the dialog with close.

Here is the HTML for a table row:
```
<tr>  
  <td>Finn Mertins</td>  
  <td>Active</td>  
  <td>fmertins@candykingdom.gov</td>  
  <td><a href="/contacts/1/edit" x-target="contact">Edit</a></td>  
</tr>
```
In each table row we have an "Edit" link targeting the empty `#contact` `<div>` inside our `<dialog>`.
Clicking the "Edit" link issues a `GET` request to `/contacts/1/edit` which returns the corresponding `<form>` for the contact inside the `<dialog>`:
```
<form id="contact" x-target method="put" action="/contacts/1" aria-label="Contact Information">  
  <div>  
    <label for="name">Name</label>  
    <input id="name" name="name" value="Finn">  
  </div>  
  <div>  
    <label for="status">Status</label>  
    <select id="status" name="status">  
      <option value="Active" selected>Active</option>  
      <option value="Inactive">Inactive</option>  
    </select>  
  </div>  
  <div>  
    <label for="email">Email</label>  
    <input type="email" id="email" name="email" value="fmertins@candykingdom.gov">  
  </div>  
  <button>Update</button>  
</form>
```
Notice the `<form>` has the `x-target` attribute so that both success and error responses are rendered within the `<dialog>`.
When the `<form>` is submitted, a `PUT` request is issued to `/contacts/1` and the server responds with an updated form and a `contact:updated` event:
```
<form id="contact" x-target method="put" action="/contacts/1" aria-label="Contact Information">  
  <div x-init="$dispatch('contact:updated')"></div>  
  ...  
</form>
```
Finally, the `contact:updated` event from the server causes the `<tbody>` to refresh with the updated contact data and dialog to close.


## Demo