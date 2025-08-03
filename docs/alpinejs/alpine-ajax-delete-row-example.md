This example shows how to implement a delete button that removes a table row when clicked. First let's look at the table markup:
```
<table>  
  <thead>  
    <tr>  
      <th scope="col">Name</th>  
      <th scope="col">Email</th>  
      <th scope="col"></th>  
    </tr>  
  </thead>  
  <tbody id="contacts" x-init @ajax:before="confirm('Are you sure?') || $event.preventDefault()">  
    ...  
  </tbody>  
</table>
```
The table body is assigned and is listening for the `ajax:before` event to confirm any delete actions.
Each row has a form that will issue a `DELETE` request to delete the row from the server. This request responds with a table that is lacking the row which was just deleted.
```
<tr>  
  <td>Finn</td>  
  <td>fmertins@candykingdom.gov</td>  
  <td>Active</td>  
  <td>  
    <form method="delete" action="/contacts/1" x-target="contacts">  
      <button>Delete</button>  
    </form>  
  </td>  
</tr>
```


## Demo