This demo shows how to implement a toggle button that alters server state.
This pattern starts with an AJAX form assigned :
```
<form id="like" x-target method="post" action="/comments/1/like">  
  <button name="user_id" value="1">Like</button>  
</form>
```
When the form is submitted, a `POST` request is issued to the server, and the server will return a new form state:
```
<form id="like" x-target method="delete" action="/comments/1/like">  
  <button name="user_id" value="1" x-autofocus>Unlike</button>  
</form>
```
The `x-autofocus` attribute ensures that keyboard focus is preserved between state changes. Try out the following demo, note that when the button is toggled using the keyboard, focus stays consistent:


## Demo