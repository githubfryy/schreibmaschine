This example filters down a table of contacts based on the user's selection.
We start with some filter buttons and a table inside a container with and `x-merge="morph"`.
```
<div id="contacts" x-merge="morph">  
  <form action="/contacts" aria-label="Filter contacts" x-target="contacts">  
    <button name="status" value="Active" aria-pressed="false">Active</button>  
    <button name="status" value="Inactive" aria-pressed="false">Inactive</button>  
  </form>  
  <table>  
    <thead>  
      <tr>  
        <th scope="col">Name</th>  
        <th scope="col">Email</th>  
        <th scope="col">Status</th>  
      </tr>  
    </thead>  
    <tbody>  
      <tr>  
        <td>Finn</td>  
        <td>fmertins@candykingdom.gov</td>  
        <td>Active</td>  
      </tr>  
      <tr>  
        <td>Jake</td>  
        <td>jake@candykingdom.gov</td>  
        <td>Inactive</td>  
      </tr>  
      ...  
    </tbody>  
  </table>  
</div>
```
The `x-merge="morph` attribute does a lot of the heavy lifting in this example. The `morph` option ensures that the keyboard focus state of our filter buttons will be preserved as the HTML changes between AJAX requests. Morphing requires an extra dependency, so let's pull in Alpine's [Morph Plugin](https://alpinejs.dev/plugins/morph):
```
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/morph@3.x.x/dist/cdn.min.js"></script>
```
*If you'd rather bundle your JavaScript, the [Morph Plugin installation instructions](https://alpinejs.dev/plugins/morph#installation) explain how to do this too.*
Clicking a filter button issues a `GET` request to `/contacts?status=` which returns a response with updated content.
First, the response should include the modified state of the filter form:
```
<form action="/contacts" aria-label="Filter contacts" x-target="contacts">  
  <button name="status" value="Active" aria-pressed="true">Active</button>  
  <button name="status" value="Inactive" aria-pressed="false">Inactive</button>  
  <button name="status" value="" aria-pressed="false">Reset</button>  
</form>
```
The "Active" button has `aria-pressed="true"` to indicate that it has been selected and the form includes a new button to reset the filter settings.
Second, the response should also include the markup for our table with only content related to the active filter:
```
<tbody>  
  <tr>  
    <td>Finn</td>  
    <td>fmertins@candykingdom.gov</td>  
    <td>Active</td>  
  </tr>  
</tbody>
```
Let's see our filterable table in action. Try activating a filter button using the keyboard, notice that the keyboard focus stays consistent even as the content on the page changes:


## Demo