This demo shows how to implement notification "toasts".
This pattern starts with an empty list for our notifications, the list needs an `id` and `x-sync`. We've added `aria-live` to the list so that screen readers will read out new notifications when the are added to the list.
```
<ul x-sync id="notification_list" role="status">  
</ul>
```
We'll also add an AJAX form to this demo so that we can issue requests to the server that will trigger new notifications.
```
<form id="action" x-target method="post" action="/action">  
  <button>Click Me</button>  
</form>
```
When the AJAX form is submitted the server will respond with a new notification in the list:
```
<ul x-sync id="notification_list" role="status">  
  <li>  
    <span>The button was clicked 1 time.</span>  
  </li>  
</ul>
```
Notice that our AJAX form does nottarget the `notification_list` element, however since our list has the `x-sync` attribute, it will automatically update any time the server responds with an element assigned .
Our notifications should now be appearing with each form submission, however, every time the form is submitted the new incoming notification will replace the existing notification in our list of notifications; Essentially, our UI can only display a single notification at a time. Instead, we should prepend incoming notifications to our list so that older notifications aren't clobbered with each AJAX request. We can control how new content is added to our list using the `x-merge` attribute:
```
<ul x-sync id="notification_list" x-merge="prepend" role="status">
```
The basic functionality of our notifications is complete, next there are a few refinements we can make to the notification messages to further improve the user experience. First, let's sprinkle in some additional Alpine code to animate our notifications:
```
<li x-data="{  
    show: false,  
    init() {  
      this.$nextTick(() => this.show = true)  
    }  
  }"  
  x-show="show"  
  x-transition.duration.500ms  
>  
  <span>The button was clicked 1 time.</span>  
</li>
```
Now our messages will smoothly transition in and out as they are added and removed from the notification list. Next, we can add a "Dismiss" button to each notification:
```
<li x-data="{  
    show: false,  
    init() {  
      this.$nextTick(() => this.show = true)  
    },  
    dismiss() {  
      this.show = false  
      setTimeout(() => this.$root.remove(), 500)  
    }  
  }"  
  x-show="show"  
  x-transition.duration.500ms  
>  
  <span>The button was clicked 1 time.</span>  
  <button @click="dismiss" type="button" aria-label="Dismiss">&times;</button>  
</li>
```
And finally, we can make our notifications automatically dismiss after 6 seconds, by adding a `setTimeout` in the `init` method:
```
<li x-data="{  
    show: false,  
    init() {  
      this.$nextTick(() => this.show = true)  
      setTimeout(() => this.dismiss(), 6000)  
    },  
    dismiss() {  
      this.show = false  
      setTimeout(() => this.$root.remove(), 500)  
    }  
  }"  
  x-show="show"  
  x-transition.duration.500ms  
>  
  <span>The button was clicked 1 time.</span>  
  <button @click="dismiss" type="button" aria-label="Dismiss">&times;</button>  
</li>
```


## Demo