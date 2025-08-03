This example shows how to lazily load an element on a page.
We start with a loading indicator inside an `<article>`. Note that the article is assigned :
```
<article id="post" x-init="$ajax('/posts/1')">  
  <svg class="loader" aria-label="Loading content">...</svg>  
</article>
```
This loading indicator will exist on the page while we fetch the articles's content. You can use any CSS or SVG magic you'd like to create a fancy looking loading indicator.
The loaded content is then inserted into the UI once the request has succeeded:
```
<article id="post">  
   <header>...</header>  
   <p>...</p>  
</article>
```


## Demo