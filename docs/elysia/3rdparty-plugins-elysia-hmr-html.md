Esta documentación está disponible también en español en el archivo [🇪🇸 README.es.md](https://github.com/gtrabanco/elysia-hmr-html/blob/main/README.es.md).


## Elysia HMR HTML Plugin




This plugin adds fast-refreash using Server Sent Events to your html files.
You can view a example in [`example`](https://github.com/gtrabanco/elysia-hmr-html/blob/main/example) directory (is explained in this file).


## KNOWN ISSUES




-   There is an issue with server sent events currently in Bun:
    -   [oven-sh/bun#17947](https://github.com/oven-sh/bun/issues/17947)
    -   [elysiajs/elysia#909 (comment)](https://github.com/elysiajs/elysia/issues/909#issuecomment-2667693911)
    -   [elysiajs/elysia#755](https://github.com/elysiajs/elysia/issues/755)
    -   [elysiajs/elysia#732](https://github.com/elysiajs/elysia/issues/732)

RECOMMENDED: Use default Websockets implementation instead of SSE.


## Requirements




-   Browser with [Server Sent Events Support](https://caniuse.com/eventsource) or [Websockets](https://caniuse.com/websockets)
-   [Elysia 1.1.0](https://elysiajs.com/) or newer package installed
-   Bun. Not tested with NodeJS, but probably you will need [some wrappers](https://github.com/jhmaster2000/node-bun), [Elysia/node package](https://github.com/elysiajs/node-adapter) and [HTMLRewriter](https://www.npmjs.com/package/html-rewriter-wasm) package.
-   You need to set `idleTimeout` to 0 in your server if you use SSE but it could fail as well. I had no issues but maybe you need this also for Websockets.


## Installation




```
bun add --exact @gtrabanco/elysia-hmr-html
```


## Usage




```
import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static'
import { hmr } from '@gtrabanco/elysia-hmr-html';

const app \= new Elysia()
  .use(hmr({
    prefixToWatch: 'example/public' // Local path to watch for changes
  }))
  .use(staticPlugin({
    assets: 'example/public',
    prefix: '',
  }))
  .listen(
    { 
      port: process.env.PORT || 0,
      idleTimeout: 0
    }, ({ hostname, port }) \=> { console.log(\`Elysia server started http://${hostname}:${port}\`) }
  );
```


## Run the included example




```
git clone https://github.com/gtrabanco/elysia-hmr-html
cd elysia-hmr-html
bun install
PORT=3000 bun example
```

After that open [https://localhost:3000/index.html](https://localhost:3000/index.html)in your browser and open `${EDITOR} example/public/index.html`
Change something and save, you will see the changes in the browser :)


## Other




This plugin requires on `@gtrabanco/elysia-inject-html` package.
This plugin listen in BroadcastChannel on client in the channel with configured `hmrEventName` value. If you send the pathname to the file in the same domain as value it will only refreash only that page but if you send `*` value, it will refresh all pages listen for that event (in the same domain).


## More information




-   [Elysia](https://elysiajs.com/)
-   [Browser support of Server Sent Events in CanIUse](https://caniuse.com/eventsource)
-   [MDN Server Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
-   [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
-   [Websockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)