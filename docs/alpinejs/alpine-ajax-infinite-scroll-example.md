This example demonstrates how to load content automatically when the user scrolls to the end of the page. We'll start by building basic pagination and then we'll enhance it with Alpine AJAX to automatically fetch the next page. Here's our table followed by simple page navigation:
```
<table>  
  <thead>  
    <tr>  
      <th scope="col">Name</th>  
      <th scope="col">Email</th>  
      <th scope="col">Status</th>  
    </tr>  
  </thead>  
  <tbody id="records">  
    <tr>  
      <td>AMO</td>  
      <td>amo@mo.co</td>  
      <td>Active</td>  
    </tr>  
    ...  
  </tbody>  
  <div id="pagination">  
    <div>Page 1 of 5</div>  
    <div>  
      <!-- Page 2 and up would have a "Previous" link like this -->  
      <!-- <a href="/contacts?page=1"><span aria-hidden="true">← </span> Previous</a> -->  
      <a href="/contacts?page=2">Next<span aria-hidden="true"> →</span></a>  
    </div>  
  </div>  
</table>
```
Alpine already provides a great way to react to a users's scroll position: We can use the first-party [Intercept Plugin](https://alpinejs.dev/plugins/intersect), so let's load that onto the page:
```
<script defer src="https://cdn.jsdelivr.net/npm/@alpinejs/intersect@3.x.x/dist/cdn.min.js"></script>
```
*If you'd rather bundle your JavaScript, the [Intercept Plugin installation instructions](https://alpinejs.dev/plugins/intersect#installation) explain how to do this too.*
With the Intercept Plugin installed we can update our pagination markup to issue an AJAX request when it is scrolled into view:
```
<div id="pagination" x-init x-intersect="$ajax('/contacts?page=2', { target: 'records pagination' })">  
</div>
```
Note that the `target` option includes both the table andpagination elements. This ensures that the table is updated with fresh records and the pagination is updated with a fresh page URL after each AJAX request.
Lastly, we need to ensure that the new table rows from subsequent pages are *appended* to the end of the table. The default behavior is for Alpine AJAX to *replace* the existing table rows with the incoming rows. To change this behavior we need to add `x-merge="append"` to the element that will receive the new records, in this case that's our table's `tbody`:
```
<tbody id="records" x-merge="append">
```


## Demo