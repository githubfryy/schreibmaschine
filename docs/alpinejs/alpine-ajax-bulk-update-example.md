This demo shows how to implement a common pattern where rows are selected and then bulk updated. This is accomplished by putting an AJAX form below a table, with associated checkboxes in the table. When the AJAX form is submitted, each checked value will be included in a `PUT` request to `/contacts`.
```
<table id="contacts">  
  <thead>  
    <tr>  
      <th scope="col">Edit</th>  
      <th scope="col">Name</th>  
      <th scope="col">Status</th>  
    </tr>  
  </thead>  
  <tbody>  
    <tr>  
      <td><input type="checkbox" form="contacts_form" aria-label="Change Status" name="ids" value="0"></td>  
      <td>Finn Mertins</td>  
      <td>Active</td>  
    </tr>  
    ...  
  </tbody>  
</table>  
<form x-target="contacts" id="contacts_form" method="put" action="/contacts">  
  <button name="status" value="Active">Activate</button>  
  <button name="status" value="Inactive">Deactivate</button>  
</form>
```
Notice the AJAX form is targeting the `contacts` table. The server will either activate or deactivate the checked users and then rerender the `contacts` table with updated rows.


## Demo