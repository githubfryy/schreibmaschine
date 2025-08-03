This example actively searches a contacts database as the user enters text.
We start with a search form and a table:
```
<form x-target="contacts" action="/contacts" role="search" aria-label="Contacts" autocomplete="off">  
  <input type="search" name="search" aria-label="Search Term" placeholder="Type to filter contacts..." @input.debounce="$el.form.requestSubmit()" @search="$el.form.requestSubmit()">  
  <button x-show="false">Search</button>  
</form>  
<table>  
  <thead>  
    <tr>  
      <th scope="col">Name</th>  
      <th scope="col">Email</th>  
      <th scope="col">Status</th>  
    </tr>  
  </thead>  
  <tbody id="contacts">  
    <tr>  
      <td>Finn</td>  
      <td>fmertins@candykingdom.gov</td>  
      <td>Active</td>  
    </tr>  
    ...  
  </tbody>  
</table>
```
Note that the search form targets the table's `<tbody>`, and that the input inside the form is listening for the `input` event.
The input issues a `GET` request to `/contacts?search=` on the `input` event and sets the body of the table to be the resulting content.
We add the `debounce` modifier to the `input` event so that the AJAX request is only sent once the user stops typing.
Since we use a `search` type input we will get an "x" in the input field to clear the input. To make this trigger a new `GET` request we also add a `search` listener.
We use `x-show="false"` on the form's submit button so that it is hidden when JavaScript is loaded. This ensures that the search form is still functional if JavaScript fails to load or is disabled.


## Demo