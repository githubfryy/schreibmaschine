This example shows how to implement a smoothly scrolling progress bar.
We start with an AJAX form that issues a `POST` request to `/jobs` to begin a job process:
```
<form id="jobs" x-target method="post" action="/jobs">  
  <h3>New Job</h3>  
  <button>Start New Job</button>  
</form>
```
Note that the form is assigned . When the form is submitted, it is replaced with a new `<div>` that reloads itself every 600ms:
```
<div id="jobs" x-init="setTimeout(() => $ajax('/jobs/1'), 600)">  
  <h3 id="progress_label">Job Progress</h3>  
  <div role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" aria-labelledby="progress_label">  
    <svg style="width:25%; transition: width .3s " width="24" height="24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">  
      <rect x="0" y="0" width="100%" height="100%" fill="blue"></rect>  
    </svg>  
  </div>  
</div>
```
On each reload the `aria-valuenow` attribute should change to indicate the server's progress. The `width` of the SVG element should also change to visually indicate progress.
Finally, when the job is complete, the `x-init` directive is removed and a `<form>` to restart the job is added to the UI:
```
<div id="jobs">  
  <h3 id="progress_label">Job Progress</h3>  
  <div role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" aria-labelledby="progress_label">  
    <svg style="width:100%; transition: width .3s " width="24" height="24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">  
      <rect x="0" y="0" width="100%" height="100%" fill="blue"></rect>  
    </svg>  
  </div>  
  <form x-target="jobs" method="post" action="/jobs">  
    <button>Restart Job</button>  
  </form>  
</div>
```


## Demo