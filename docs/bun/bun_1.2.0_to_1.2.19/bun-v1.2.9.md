This release fixes 48 bugs (addressing 116 👍). `Bun.redis` is a builtin Redis client for Bun. `ListObjectsV2` support in `Bun.S3Client`, more `libuv` symbols, `require.extensions` compatibility, regressions & bugfixes in `node:http`, `AsyncLocalStorage`, and `node:crypto`.


#### To install Bun


curl

```
curl -fsSL https://bun.sh/install | bash
```

npm

```
npm install -g bun
```

powershell

```
powershell -c "irm bun.sh/install.ps1|iex"
```

scoop

```
scoop install bun
```

brew

```
brew tap oven-sh/bun
```

```
brew install bun
```

docker

```
docker pull oven/bun
```

```
docker run --rm --init --ulimit memlock=-1:-1 oven/bun
```


#### To upgrade Bun


```
bun upgrade
```


## [Bun.redis is Bun's builtin Redis client](#bun-redis-is-bun-s-builtin-redis-client)


An incredibly fast Redis/Valkey client is now built into Bun.

```
import { redis, RedisClient } from "bun";
// Reads $REDIS_URL from environment
await redis.set("foo", "bar");
const value = await redis.get("foo");
console.log(value); // "bar"
await redis.ttl("foo"); // 10 seconds
// or use redis.set("foo", "bar", "EX", 10)
const custom = new RedisClient("redis://localhost:6379", {
  // options
});
await custom.set("foo", "bar");
```

[Read the docs](https://bun.sh/docs/api/redis)
We wrote this client from scratch in Zig. Consider it experimental and send us feedback!66 commands are supported, we will add more and you can always fallback to running `redis.send(command, args)` for any command that is not yet wrapped.
For some performance numbers:

```
❯ bun-latest redis.mjs
[146.08ms] Bun.redis GET 'greeting' 10000 batches of 10
[211.52ms]   ioredis GET 'greeting' 10000 batches of 10
→ Bun.redis is 44.82% faster
[527.04ms] Bun.redis GET 'greeting' 10000 batches of 100
[834.25ms]   ioredis GET 'greeting' 10000 batches of 100
→ Bun.redis is 58.29% faster
[4.22s] Bun.redis GET 'greeting' 10000 batches of 1000
[7.83s]   ioredis GET 'greeting' 10000 batches of 1000
→ Bun.redis is 85.39% faster
❯ node redis.mjs
  ioredis GET 'greeting' 10000 batches of 10: 270.837ms
  ioredis GET 'greeting' 10000 batches of 100: 1.181s
  ioredis GET 'greeting' 10000 batches of 1000: 10.095s
```

View the benchmark


## [list objects with `Bun.S3Client`](#list-objects-with-bun-s3client)


The `S3Client` now supports the `ListObjectsV2` action, allowing you to list objects in an S3 bucket with pagination and filtering options.

```
const client = new Bun.S3Client({
  region: "us-west-2",
  credentials: { ... },
});
// Basic usage
const result = await client.list({
  bucket: "my-bucket",
  prefix: "uploads/",
  maxKeys: 100
});
// Pagination
const secondPage = await client.list({
  bucket: "my-bucket",
  prefix: "uploads/",
  continuationToken: result.nextContinuationToken
});
for (const item of result.contents || []) {
  console.log(`Key: ${item.key}, Size: ${item.size}`);
}
```

Thanks to [@Inqnuam](https://github.com/Inqnuam) for the contribution!


## [More supported libuv symbols](#more-supported-libuv-symbols)


This release adds support for several libuv mutex and timing functions, which are essential for native add-ons requiring these APIs.

```
// These functions are now available to N-API modules:
// - uv_mutex_destroy
// - uv_mutex_init
// - uv_mutex_init_recursive
// - uv_mutex_lock
// - uv_mutex_trylock
// - uv_mutex_unlock
// - uv_hrtime
// - uv_once
```

Thanks to [@zackradisic](https://github.com/zackradisic) for the contribution!


## [Support for `require.extensions`](#support-for-require-extensions)


Bun now fully supports the `require.extensions` object, providing improved compatibility with `node:module` module. This allows you to register custom handlers for different file extensions.

```
require.extensions[".custom"] = function (module, filename) {
  module._compile('module.exports = "hi!";', filename);
};
require("./file.custom");
```

Thanks to [@paperclover](https://github.com/paperclover)!


## [Support for `require.resolve` `"paths"` option](#support-for-require-resolve-paths-option)


The `require.resolve` function now supports the `paths` option, which allows you to specify additional directories to search for the module.

```
const path = require.resolve("module", { paths: ["./lib", "./src"] });
```

Thanks to [@paperclover](https://github.com/paperclover)!


## [WebKit update](#webkit-update)


This release includes a WebKit upgrade.


### [Performance improvements](#performance-improvements)


-   Polymorphic array access: Calling the same function on a Float32Array, Float64Array, Array gets faster.
    
-   `Number.isFinite()` optimization: Rewrote `Number.isFinite()` in C++ instead of JavaScript, resulting in ~1.6x faster execution.
    
-   Array method optimizations: Dedicated JIT operations added for searching untyped elements in Int32 arrays:
    -   `Array.prototype.indexOf` is now ~5.2x faster with untyped elements in Int32 arrays
    -   `Array.prototype.includes` is now ~4.7x faster with untyped elements in Int32 arrays
-   Improved NaN handling: Lower `globalThis.isNaN` to `Number.isNaN` when the input is a double.
    
-   Integer to float conversion: Added optimized `convertUInt32ToDouble` and `convertUInt32ToFloat` functions for ARM64 and x64 architectures, benefiting both JavaScript and WebAssembly.
    


## [`node:http` and `AsyncLocalStorage` regression fixed](#node-http-and-asynclocalstorage-regression-fixed)


A regression in `node:http` that could cause crashes when using `AsyncLocalStorage` with async callbacks has been fixed. This example will now properly print `'counter: 1'`.

```
import { createServer } from "node:http";
import { AsyncLocalStorage } from "node:async_hooks";
const store = new AsyncLocalStorage();
const server = createServer((req, res) => {
  const appStore = store.getStore();
  store.run(appStore, async () => {
    const out = `counter: ${++store.getStore().counter}`;
    await new Promise((resolve) => setTimeout(resolve, 10));
    res.end(out);
  });
});
store.run({ counter: 0 }, () => {
  server.listen(0, async () => {
    const response = await fetch(`http://localhost:${server.address().port}`);
    console.log(await response.text());
    server.close();
  });
});
```

Fixed thanks to [@heimskr](https://github.com/heimskr)!


## [`crypto.Hmac` regression fixed](#crypto-hmac-regression-fixed)


A regression was fixed that caused the `Hmac` constructor to throw an error when `options.encoding` was set to `undefined`. Instead, it should ignore it and use the default (`'utf8'`).

index.js

```
const { createHmac } = require('node:crypto');
const hmac = createHmac('sha256', 'secret', { encoding: undefined });
// TypeError: The "options.encoding" property must be of type string. Received undefined
```

Fixed thanks to [@cirospaciari](https://github.com/cirospaciari)!

JSHmac.cpp

```
if (!encodingValue.isNull()) {
if (!encodingValue.isUndefinedOrNull()) {
```


## [`crypto.DiffieHellman` regression fixed](#crypto-diffiehellman-regression-fixed)


A regression was introduced in Bun v1.2.6 where `verifyError` was incorrectly assigned to the prototype of `crypto.DiffieHellman`. This caused accessing `verifyError` from the prototype to throw an invalid this error.

index.js

```
import crypto from 'node:crypto';
console.log(crypto.DiffieHellman.prototype.verifyError);
// Now prints `undefined` instead of throwing an error
```

Thanks to [@dylan-conway](https://github.com/dylan-conway)!


## [Fixed certificate verification error spelling](#fixed-certificate-verification-error-spelling)


A typo in a few locations was fixed in the error code for certificate verification errors.

```
UNKKNOW_CERTIFICATE_VERIFICATION_ERROR,
UNKNOWN_CERTIFICATE_VERIFICATION_ERROR,
```

Fixed thanks to [@cirospaciari](https://github.com/cirospaciari)!


## [Fixed `Bun.serve` redirects with empty streams](#fixed-bun-serve-redirects-with-empty-streams)


A bug was fixed in `Bun.serve` that caused redirects to fail to include the body of the response when the redirect body was an empty stream.

index.js

```
using server = Bun.serve({
    port: 0,
    async fetch(req) {
        if (req.url.endsWith('/redirect')) {
            const emptyStream = new ReadableStream({
                start(controller) {
                    // Immediately close the stream to make it empty
                    controller.close();
                },
            });
            return new Response(emptyStream, {
                status: 307,
                headers: {
                    location: '/',
                },
            });
        }
        return new Response('Bun v1.2.9!');
    },
});
const response = await fetch(`http://localhost:${server.port}/redirect`);
console.log(await response.text());
```

Previously, this example would print an empty string. Now it correctly prints `'Bun v1.2.9!'`.
Fixed thanks to [@cirospaciari](https://github.com/cirospaciari)!


## [Added fields to `Bun.connect()` `Socket`](#added-fields-to-bun-connect-socket)


Previously, `Socket`s obtained from `Bun.connect()` only had the `.localPort` and `.remoteAddress` fields to inspect the socket and peer.
They have since been enhanced to have `.localAddress`, `.localFamily`, `.remoteFamily`, and `.remotePort`. The content of these properties matches what you would get from the `node:net.Socket` properties of the same name.

```
Bun.connect({
  hostname: "google.com",
  port: 443,
  socket: {
    open(socket) {
      console.log(socket.localFamily); // "IPv4"
      console.log(socket.localAddress); // "10.0.0.53"
      console.log(socket.localPort); // 49312
      console.log(socket.remoteFamily); // "IPv6"
      console.log(socket.remoteAddress); // "2607:f8b0:4005:802::200e"
      console.log(socket.remotePort); // 443
      socket.end();
    },
    data(socket, chunk) {},
  },
});
```

Thanks to [@nektro](https://github.com/nektro) for the contribution!


## [Fixed: regression impacting Fastify websockets](#fixed-regression-impacting-fastify-websockets)


This release addresses an issue in `node:http` that prevented Fastify websockets from registering successfully.

```
// Now Bun correctly handles WebSocket connections with Fastify
import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
const fastify = Fastify();
await fastify.register(fastifyWebsocket);
fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    connection.socket.on("message", (message) => {
      connection.socket.send("Echo: " + message);
    });
  });
});
await fastify.listen({ port: 3000 });
```

Fixed thanks to [@cirospaciari](https://github.com/cirospaciari)!

```
let dir = "\\\\192.168.8.1\\hdd\\sata1-1\\Lib\\xx";
fs.existsSync(dir);
```

The following code regressed shortly in 1.2 and would return false even when the folder exists.
Fixed thanks to [@paperclover](https://github.com/paperclover)!


## [Added `maxBuffer` option in `Bun.spawn` and `node:child_process.spawn`](#added-maxbuffer-option-in-bun-spawn-and-node-child-process-spawn)


```
const result = Bun.spawnSync({
  cmd: ["yes"],
  maxBuffer: 100,
});
```

This option will kill the `yes` invocation if it emits over 100 bytes of output. This provides another great way to prevent spawned programs from accidentally consuming too many resources.
It is supported in `Bun.spawn`, `Bun.spawnSync`, `node:child_process.spawn`, `node:child_process.spawnSync`.
Thanks to [@pfgithub](https://github.com/pfgithub) for the contribution!


## [Fixed issue where `node:crypto.createCipheriv` with empty options object would throw](#fixed-issue-where-node-crypto-createcipheriv-with-empty-options-object-would-throw)


```
const crypto = require("node:crypto");
const serverKeyArr = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv("aes-128-gcm", serverKeyArr, iv, {
  authTagLength: 12,
});
```

Previously if the options was instead `{}` rather than `{ authTagLength }` Bun would throw `INVALID_ARG_VALUE`. This is no longer the case and the `authTagLength` will be inferred if not passed.
Fixed thanks to [@dylan-conway](https://github.com/dylan-conway)!


## [Added support for preserving symlinks during module resolution](#added-support-for-preserving-symlinks-during-module-resolution)


```
├── app
│   ├── index.js
│   └── node_modules
│       ├── moduleA -> {tmpDir}/moduleA
│       └── moduleB
│           ├── index.js
│           └── package.json
└── moduleA
    ├── index.js
    └── package.json
```

This behavior can be enabled with `--preserve-symlinks` or `NODE_PRESERVE_SYMLINKS=1`.
With the flag enabled, `require("moduleB")` while inside `moduleA/index.js` will work.
Fixed thanks to [@paperclover](https://github.com/paperclover)!


## [Fixed `node:net.Server.prototype.address()` when listening on localhost](#fixed-node-net-server-prototype-address-when-listening-on-localhost)


```
const net = require("net");
const server = net.createServer();
server.listen(0, "localhost", () => {
  console.log(server.address());
  server.close();
});
```

Previously this would return the incorrect result and print:

```
{
  port: 52556,
  address: "localhost",
  family: undefined,
}
```

Now in Bun 1.2.9 it properly resolves the hostname and instead prints:

```
{
  family: "IPv6",
  address: "::1",
  port: 52563,
}
```

Fixed thanks to [@nektro](https://github.com/nektro)!


## [`napi_async_work` creation and cancelation fixes](#napi-async-work-creation-and-cancelation-fixes)


We added null checks for the `execute` and `complete` arguments in `napi_create_async_work`. This stops buggy Node.js native addons from crashing your application when they pass invalid arguments.

```
// ...
napi_async_work work;
napi_create_async_work(env, resource, resource_name, /* execute */ NULL, complete, data, &work);
// now returns `napi_invalid_arg`
```

If `complete` is `NULL`, the work will still execute if the task is queued.

```
// ...
napi_async_work work;
napi_create_async_work(env, resource, resource_name, execute, /* complete */ NULL, data, &work);
```

Also fixed in this release was a bug that caused `napi_cancel_async_work` to not cancel the task after it was queued for execution.

```
napi_async_work work;
// ...
napi_queue_async_work(env, work);
napi_cancel_async_work(env, work);
// now works if the task hasn't already started executing!
```

If a `complete` callback was provided, it will now receive `napi_cancelled` as the status.
Fixed thanks to [@dylan-conway](https://github.com/dylan-conway)!


## [Fixed garbage collection edge case impacting `node:fs`](#fixed-garbage-collection-edge-case-impacting-node-fs)


Functions in `node:fs` could have input buffers collected by the garbage collector too early, potentially causing unexpected crashes.
Thanks to [@dylan-conway](https://github.com/dylan-conway)!


### [Thanks to 13 contributors!](#thanks-to-13-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@donisaac](https://github.com/donisaac)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@electroid](https://github.com/electroid)
-   [@heimskr](https://github.com/heimskr)
-   [@inqnuam](https://github.com/inqnuam)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@nektro](https://github.com/nektro)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)
-   [@zackradisic](https://github.com/zackradisic)