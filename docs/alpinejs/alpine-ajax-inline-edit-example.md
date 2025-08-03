The inline edit pattern provides a way to edit parts of a record by toggling between a "view mode" and "edit mode" without a page refresh .
This pattern starts with a "view mode" showing the details of a contact inside an element with . The "Edit" link will fetch the "edit mode" for editing a contact at the URL `/contacts/1/edit`.
```
<div id="contact_1">  
  <p><strong>First Name</strong>: Finn</p>  
  <p><strong>Last Name</strong>: Mertens</p>  
  <p><strong>Email</strong>: fmertens@candykingdom.gov</p>  
  <a href="/contacts/1/edit" x-target="contact_1">Edit</a>  
</div>
```
This returns a form that can be used to edit the contact:
```
<form id="contact_1" x-target method="put" action="/contacts/1" aria-label="Contact Information">  
  <div>  
    <label for="first_name">First Name</label>  
    <input id="first_name" name="first_name" value="Finn">  
  </div>  
  <div>  
    <label for="last_name">Last Name</label>  
    <input id="last_name" name="last_name" value="Mertens">  
  </div>  
  <div>  
    <label for="email">Email</label>  
    <input type="email" id="email" name="email" value="fmertens@candykingdom.gov">  
  </div>  
  <button>Update</button>  
  <a href="/contacts/1" x-target="contact_1">Cancel</a>  
</form>
```
When submitted, the form issues a `PUT` back to `/contacts/1`, which will again display the "view mode" with updated contact details.


## Improving focus


Our inline edit pattern is functioning now, but we can sprinkle in a few more attributes to ensure that it's a good experience for keyboard users. We'll use the `x-autofocus` attribute to control the keyboard focus as we switch between the view and edit modes on the page.
First, we'll add `x-autofocus` to the "First Name" field so that it is focused when our edit form is rendered:
```
<input id="first_name" name="first_name" x-autofocus>
```
Next, we'll add `x-autofocus` to the "Edit" link, so that it is focused when returning back to the details page:
```
<a href="/contacts/1/edit" x-target="contact_1" x-autofocus>Edit</a>
```
Try using the keyboard in the following demo and notice how keyboard focus is maintained as your navigate between the "view" and "edit" modes.


## Demo