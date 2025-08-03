This example shows how you can use a little CSS to create a nice looking loading indicator that will appear while AJAX requests are in progress.
We start with a card that contains a link. When the link is clicked, a `GET` request is issued to retrieve a table of contact information.
```
<div id="card">  
  <div id="table">  
    <a href="/contacts" x-target="table">Load Contacts</a>  
  </div>  
</div>
```
The contact table could take a long time to load if it is large, so it would be helpful to indicate to our users that the app is processing their request.
Fortunately, Alpine AJAX adds `aria-busy="true"` to targets while a request is processing. We can use this attribute in our CSS to automatically show and hide a loading indicator:
```
[aria-busy] {  
  --loading-size: 64px;  
  --loading-stroke: 6px;  
  --loading-duration: 1s;  
  position: relative;  
  opacity: .75  
}  
[aria-busy]:before {  
  content: '';  
  position: absolute;  
  top: 50%;  
  left: 50%;  
  width: var(--loading-size);  
  height: var(--loading-size);  
  margin-top: calc(var(--loading-size) / 2 * -1);  
  margin-left: calc(var(--loading-size) / 2 * -1);  
  border: var(--loading-stroke) solid rgba(0, 0, 0, 0.15);  
  border-radius: 50%;  
  border-top-color: rgba(0, 0, 0, 0.5);  
  animation: rotate calc(var(--loading-duration)) linear infinite;  
}  
@keyframes rotate {  
  100% { transform: rotate(360deg); }  
}
```


## Demo