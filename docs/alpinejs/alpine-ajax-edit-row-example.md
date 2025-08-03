This example shows how to implement editable table rows. First let's look at the table:
```
<table>  
  <thead>  
    <tr>  
      <th scope="col">Name</th>  
      <th scope="col">Email</th>  
      <th scope="col">Actions</th>  
    </tr>  
  </thead>  
  <tbody>  
    ...  
  </tbody>  
</table>
```
Here is the HTML for a table row:
```
<tr id="contact_1">  
  <td>Finn Mertins</td>  
  <td>fmertins@candykingdom.gov</td>  
  <td>  
    <a href="/contacts/1/edit" x-target="contact_1">Edit</a>  
  </td>  
</tr>
```
Notice the "Edit" link in the table row is targeting its own row, this will tell the request triggered by the "Edit" link to replace the entire table row.
Finally, here is the "edit mode" state that will replace a row:
```
<tr id="contact_1">  
  <td><input aria-label="Name" form="contact_1_form" name="name" value="Finn Mertins"></td>  
  <td><input aria-label="Email" form="contact_1_form" name="email" value="fmertins@candykingdom.gov" type="email">  
  </td>  
  <td>  
    <a x-target="contact_1" href="/contacts">Cancel</a>  
    <form x-target="contact_1" id="contact_1_form" method="put" action="/contacts/1">  
      <button>Save</button>  
    </form>  
  </td>  
</tr>
```
When submitted, the form issues a `PUT` back to `/contacts/1`, which will again display the "view mode" with updated contact details.


## Improving focus


Our editable table is functioning now, but we can sprinkle in a few more attributes to ensure that it's a good experience for keyboard users. We'll use the `x-autofocus` attribute to control the keyboard focus as we switch between the "view" and "edit" modes on the page.
First, we'll add `x-autofocus` to the "Name" field so that it is focused when our edit form is rendered:
```
<input aria-label="Name" form="contact_1_form" name="name" value="Finn Mertins" x-autofocus>
```
Next, we'll add `x-autofocus` to the "Edit" link, so that it is focused when returning back to the details page:
```
<a href="/contacts/1/edit" x-target="contact_1" x-autofocus>Edit</a>
```
Try using the keyboard in the following demo and notice how keyboard focus is maintained as your navigate between the "view" and "edit" modes.


## Demo