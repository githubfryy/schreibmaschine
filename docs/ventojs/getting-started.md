## [Install](#install)



### [Deno](#deno)


With Deno, you can just import Vento from HTTP:
```
import vento from "https://deno.land/x/vento@v1.15.0/mod.ts";
```

Note
Vento is also [available on JSR](https://jsr.io/@vento/vento). However, some versions may be missing due to publishing issues, so using the Deno import above is recommended.


### [Node.js](#node.js)


In Node.js, [install it from NPM](https://www.npmjs.com/package/ventojs):
```
npm install ventojs
```
And then import Vento:
```
import vento from "ventojs";
```


## [Usage](#usage)


First, create an instance of Vento.
```
const env = vento();
```


### [`load`](#load)


You can use `load` to load and compile a template from a path. The compiled templates are stored in an internal cache, so they are only compiled once.
```
const template = await env.load("my-template.vto");
const result = await template({ title: "Hello, world!" });
```


### [`run`](#run)


Alternatively, you can load and run the template file in a single call:
```
const result = await env.run("my-template.vto", { title: "Hello, world!" });
```


### [`runString`](#runstring)


If the template code is not a file, you can run it directly:
```
const result = await env.runString("<h1>{{ title }}</h1>", {
  title: "Hello, world!",
});

console.log(result.content);
// <h1>Hello, world!</h1>
```


### [Clearing cache](#clearing-cache)


Vento implements a cache to prevent excessive compilation. If you need to reload your templates at runtime (ie. for development), you can clear the cache.
```
env.cache.clear();
```