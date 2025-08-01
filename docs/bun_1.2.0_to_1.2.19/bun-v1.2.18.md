Bun is the complete toolkit for building and testing full-stack JavaScript and TypeScript applications. If you're new to Bun, you can learn more from the [Bun 1.0](https://bun.com/blog/bun-v1.0#bun-is-an-all-in-one-toolkit) blog post.
This release fixes 52 issues (addressing 112 👍). ReadableStream text(), json(), bytes(), blob(), WebSocket client compression with `permessage-deflate`, `bun pm version`, reduced memory usage for large `fetch()` and `S3` uploads, faster `napi_create_buffer`, faster sliced string handling in native addons, `fs.glob` now matches directories by default, `net.createConnection()` now validates `options.host`, `http.ClientRequest#flushHeaders` now correctly sends the request body, `net.connect` `keepAlive` and `keepAliveInitialDelay` options are now correctly handled, `fs.watchFile` emits `stop` on next tick, `net.Server` handles promise rejections in connection listeners, `net.connect` throws `ERR_INVALID_IP_ADDRESS` for non-string lookup results, `fs.watchFile` now ignores access time, `bun:sqlite` updated to SQLite 3.50.2, Bun now reports as Node.js v24.3.0, `bun test` now fails when no tests match a filter, `bun install` is faster for packages using `node-gyp`, `Math.sumPrecise` is now available, Node.js compatibility improvements.


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


## [ReadableStream `.text()`, `.json()`, `.bytes()`, `.blob()`](#readablestream-text-json-bytes-blob)


You can now await `.json()`, `.bytes()`, `.text()`, and `.blob()` on `ReadableStream` to consume the data in one call.
This avoids the need to wrap the stream in a `Response` object or use a separate utility function like `Bun.readableStreamToText()`.
For the following snippet, you can now directly call `.json()` on the stream:

spawn.js

```
const {stdout} = Bun.spawn({
  cmd: ["echo", '{"hello": "world"}'],
  stdout: "pipe",
});
const data = await stdout.json();
```

Instead of using `Bun.readableStreamToJSON()`:

spawn.diff

```
-const data = await Bun.readableStreamToJSON(stdout);
+const data = await stdout.json();
```

And instead of wrapping the stream in a `Response` object:

spawn.diff

```
-const data = await new Response(stdout).json();
+const data = await stdout.json();
```

Thanks to @pfgithub for the contribution


## [`Bun.spawn` now accepts a `ReadableStream` for `stdin`](#bun-spawn-now-accepts-a-readablestream-for-stdin)


> In the next version of Bun
> You can now pipe a ReadableStream directly to a child process's standard input using the stdin option in Bun.spawn. This enables efficient, unbuffered data streaming from sources like fetch responses into external commands without needing to manually buffer the data in memory first. [pic.twitter.com/fWOnl9dbUL](https://t.co/fWOnl9dbUL)
> 
> — Jarred Sumner (@jarredsumner) [July 2, 2025](https://twitter.com/jarredsumner/status/1938933842074907090?ref_src=twsrc%5Etfw)


## [WebSocket client compression with `permessage-deflate`](#websocket-client-compression-with-permessage-deflate)


Bun's builtin `WebSocket` client now supports the `permessage-deflate` extension, which enables message compression. This can significantly reduce network bandwidth usage.
The negotiated compression parameters will be reflected in the `extensions` property of the `WebSocket` instance after a connection is established.

```
const ws = new WebSocket("wss://echo.websocket.org");
ws.onopen = () => {
  // If the server agrees to use permessage-deflate,
  // the `extensions` property will reflect that.
  console.log("Negotiated extensions:", ws.extensions);
  // > Negotiated extensions: permessage-deflate
  ws.send("This message will be compressed!");
};
ws.onmessage = (event) => {
  console.log("Received:", event.data);
  ws.close();
};
```

This feature is enabled by default and will be automatically negotiated with servers that support it. Bun's builtin WebSocket server has supported permessage-deflate compression since before Bun v1.0.0.


## [Reduced memory usage for large `fetch()` and `S3` uploads](#reduced-memory-usage-for-large-fetch-and-s3-uploads)


Previously, uploading a large file using `fetch()` or `Bun.S3` could result in high memory usage, as the entire file might be buffered in memory before being sent over the network. This has been fixed by implementing proper backpressure handling.
Bun now pauses reading from a `ReadableStream` body when the underlying network socket is busy. This prevents unbounded buffering and keeps memory usage low and stable, even when uploading large files over a slow connection.
For `Bun.S3` multipart uploads, the `writer.flush()` method now correctly returns a promise that resolves after the current part has been successfully uploaded, allowing for fine-grained control over the upload process.

```
import { s3 } from "bun";
const file = Bun.file("/path/to/large-file.bin");
const stream = file.stream({ highWaterMark: 1024 * 1024 });
const writer = s3("my-large-file.bin").writer();
// This will now stream the file with low, constant memory usage.
for await (const chunk of stream) {
  writer.write(chunk);
  // If the network is slow, .flush() will wait for the buffer to drain.
  await writer.flush();
}
await writer.close();
```

Thanks to @cirospaciari for the contribution


## [`bun build` supports `$NODE_PATH`](#bun-build-supports-node-path)


Bun's builtin bundler now supports the `NODE_PATH` environment variable for module resolution. This allows you to specify custom directories for Bun's bundler to search for modules, aligning with the legacy Node.js feature (which is also supported at runtime). This is particularly useful for projects that use absolute-like import paths without relying on `tsconfig.json` path mappings.
For example, consider a project where utility modules are located in a `src` directory.

src/my-module.js

```
export function greet() {
  return "Hello from my-module!";
}
```

entry.js

```
import { greet } from "my-module";
console.log(greet());
```

By setting `NODE_PATH`, you can now bundle `entry.js` and it will correctly resolve the import from the `src` directory.

```
NODE_PATH=./src bun build ./entry.js --outdir ./out
```

```

# The bundled file can be executed successfully

```

```
bun ./out/entry.js
```

```
Hello from my-module!
```

Thanks to @dylan-conway for the contribution


## [`bun test` now fails when no tests match a filter](#bun-test-now-fails-when-no-tests-match-a-filter)


> In the next version of Bun
> bun test errors when 0 tests match the -t <filter> regex. and it doesn't fill the logs with skipped tests.
> test.skip & test.todo's behavior is unchanged. [pic.twitter.com/fWOnl9dbUL](https://t.co/fWOnl9dbUL)
> 
> — Jarred Sumner (@jarredsumner) [July 1, 2025](https://twitter.com/jarredsumner/status/1939921363122245741?ref_src=twsrc%5Etfw)


## [`bun pm version` bumps `package.json` `version`](#bun-pm-version-bumps-package-json-version)


`bun pm version` lets you bump the `version` in `package.json` with a few options.

```
bun pm version
```

```
bun pm version v1.2.18-canary.91 (010e7159)
Current package version: v0.1.0
Increment:
  patch      0.1.0 → 0.1.1
  minor      0.1.0 → 0.2.0
  major      0.1.0 → 1.0.0
  prerelease 0.1.0 → 0.1.1-0
  from-git   Use version from latest git tag
  1.2.3      Set specific version
Options:
  --no-git-tag-version Skip git operations
  --allow-same-version Prevents throwing error if version is the same
  --message=<val>, -m  Custom commit message
  --preid=<val>        Prerelease identifier
Examples:
  $ bun pm version patch
  $ bun pm version 1.2.3 --no-git-tag-version
  $ bun pm version prerelease --preid beta
More info: https://bun.sh/docs/cli/pm#version
```

Thanks to @riskymh for the contribution!


## [`bun install` is faster for packages using `node-gyp`](#bun-install-is-faster-for-packages-using-node-gyp)


> In the next version of Bun
> bun install gets up to 2.5x faster in repos with dependencies that compile native addons in postinstall scripts
> 
> — Jarred Sumner (@jarredsumner) [July 1, 2025](https://twitter.com/jarredsumner/status/1937744700179628434?ref_src=twsrc%5Etfw)


## [`Math.sumPrecise` is now available](#math-sumprecise-is-now-available)


`Math.sumPrecise` is a TC39 Stage 3 proposal that provides high-precision summation of numbers using a more accurate algorithm than naive summation. This method is particularly useful for financial calculations and other scenarios where floating-point inaccuracies from traditional summation methods can be problematic.
Unlike naive summation with `.reduce((a, b) => a + b, 0)`, `Math.sumPrecise` uses algorithms that minimize floating-point errors by computing the maximally correct answer - equivalent to doing arbitrary-precision arithmetic and then converting back to floats.

```
Math.sumPrecise([0.1, 0.2, 0.3, -0.5, 0.1]);
// => 0.2
```


## [Node.js compatibility improvements](#node-js-compatibility-improvements)



### [Bun now reports as Node.js v24.3.0](#bun-now-reports-as-node-js-v24-3-0)


Bun's self-reported Node.js version has been upgraded from v22.6.0 to v24.3.0. This updates the values of `process.version`, `process.versions.node`, and the Node-API (N-API) version. This change improves compatibility with native Node.js addons, allowing many pre-built binaries compiled for Node.js v24 to work seamlessly in Bun.

```
// Bun now reports itself as Node.js v24.3.0
console.log(process.version);
// => "v24.3.0"
console.log(process.versions.node);
// => "24.3.0"
```

Thanks to @nektro for the contribution!


### [Faster `napi_create_buffer`](#faster-napi-create-buffer)


`napi_create_buffer` now uses uninitialized memory instead of zero-initialized memory. This aligns the behavior with Node.js, and makes it about 30% faster when allocating large amounts of memory.


### [Faster sliced string handling in native addons](#faster-sliced-string-handling-in-native-addons)


When N-API addons try to read JavaScript strings that have been `.slice()`'d, Bun no longer clones the string when the output encoding allows it. This reduces memory usage and improves performance.
This change impacts:

-   `napi_get_value_string_utf8`
-   `napi_get_value_string_latin1`
-   `napi_get_value_string_utf16`


### [`fs.glob` now matches directories by default](#fs-glob-now-matches-directories-by-default)


The `fs.glob`, `fs.globSync`, and `fs.promises.glob` APIs now match directories by default, aligning with the behavior of `glob` in Node.js. Previously, Bun's implementation would only return files unless `onlyFiles: false` was specified.

```
import { globSync } from "node:fs";
console.log(globSync("/*", { cwd: "/tmp/abc" }));
// => [ "a-directory", "a-file.txt" ]
// under the hood this is the same as
console.log([
  ...Bun.Glob("/*").scanSync({ onlyFiles: false, cwd: "/tmp/abc" }),
]);
```

Thanks to @riskymh for the contribution


### [`net.createConnection()` now validates `options.host`](#net-createconnection-now-validates-options-host)


The `net.createConnection()` function now correctly validates the `options.host` property. If a non-string value is provided, Bun will throw a `TypeError` with the code `ERR_INVALID_ARG_TYPE`, aligning its behavior with Node.js for improved compatibility and clearer error handling.
Thanks to @nektro for the contribution!


### [Fixed: `net.connect` error message formatting](#fixed-net-connect-error-message-formatting)


The error message for `net.connect()` when called with no arguments has been updated to more closely match Node.js. The message now uses "or" between all possible arguments instead of only before the final one.

```
import { connect } from "net";
try {
  connect();
} catch (e) {
  console.log(e.message);
  // Bun v1.2.17: The "options", "port", or "path" argument must be specified
  // Bun v1.2.18: The "options" or "port" or "path" argument must be specified
}
```

Thanks to @nektro for the contribution!


### [Fixed: `http2` client now emits `remoteSettings` for default settings](#fixed-http2-client-now-emits-remotesettings-for-default-settings)


A bug has been fixed where a `http2.connect()` client would not emit the `remoteSettings` event if the server sent an empty `SETTINGS` frame, which indicates that default settings are being used. This could cause libraries like `grpc-js` to hang while waiting for this event.
The `remoteSettings` event is now correctly emitted in all cases, improving compatibility with the Node.js `http2` module.

```
import http2 from "node:http2";
// Assumes an http2 server is running
const session = http2.connect("https://my-grpc-server.com");
session.on("remoteSettings", (settings) => {
  // This event now fires even when the server uses default settings
  console.log(settings);
  session.close();
});
```

Thanks to @cirospaciari for the contribution


### [Fixed: `flushHeaders` in `node:http` client sends the request body](#fixed-flushheaders-in-node-http-client-sends-the-request-body)


A bug has been fixed in `http.ClientRequest` where calling `req.flushHeaders()` wouldn't send the request body. Now, you can flush headers early and still stream the request body, which aligns Bun's behavior with Node.js.
Thanks to @cirospaciari for the contribution


### [Improved error handling in `node:net` for IPC connections](#improved-error-handling-in-node-net-for-ipc-connections)


The `net.connect` and `net.createConnection` functions now provide improved validation and error messages for IPC (Unix domain socket) connections. Passing a non-string value for the `path` option will now correctly throw a `TypeError` with code `ERR_INVALID_ARG_TYPE`. Additionally, attempting to connect to a non-existent path will consistently emit an `ENOENT` error.

```
import { connect } from "node:net";
// Previously, this might not throw immediately.
// Now, it throws a TypeError.
try {
  connect({ path: {} });
} catch (e) {
  console.log(e.code); // => ERR_INVALID_ARG_TYPE
}
// Attempting to connect to a non-existent socket path
const client = connect("/tmp/this-socket-does-not-exist.sock");
// Emits an 'error' event with an ENOENT error code
client.on("error", (err) => {
  console.log(err.code); // => "ENOENT"
});
```


### [`fs.watchFile` emits `stop` on next tick](#fs-watchfile-emits-stop-on-next-tick)


Calling `.stop()` on an `fs.StatWatcher` instance, as returned from `fs.watchFile`, now correctly emits a `stop` event. The event is emitted asynchronously in the next tick, aligning Bun's behavior with Node.js. This resolves a compatibility issue for applications that listen for this event to perform cleanup.

```
import { watchFile } from "fs";
const watcher = watchFile("/tmp/a-file-to-watch.txt", () => {});
let didStop = false;
watcher.on("stop", () => {
  didStop = true;
  console.log("watchFile stopped");
});
watcher.stop();
// The 'stop' event is emitted on the next tick
await new Promise((resolve) => setImmediate(resolve));
console.log(didStop);
// => true
```

Thanks to @dylan-conway for the contribution


### [`net.Server` handles promise rejections in connection listeners](#net-server-handles-promise-rejections-in-connection-listeners)


This change improves Node.js compatibility by correctly implementing support for `events.captureRejections = true` in `net.Server`.
When `events.captureRejections` is enabled, if an `async` connection listener on a `net.Server` throws an error, the error will now be caught and emitted as an `'error'` event on the incoming socket. This prevents an unhandled promise rejection from crashing the process.

```
import { createServer, connect } from "net";
import { captureRejections } from "events";
// Enable automatic error handling for unhandled promise rejections in EventEmitter.
captureRejections(true);
const server = createServer(async (socket) => {
  // When captureRejections is true, errors thrown in an async
  // 'connection' listener are emitted as an 'error' event
  // on the socket itself.
  socket.on("error", (err) => {
    console.log(`Socket error: ${err.message}`);
    // => "Socket error: kaboom"
  });
  // The socket will be destroyed with this error.
  throw new Error("kaboom");
});
server.listen(0, () => {
  const client = connect(server.address().port);
  client.on("close", () => {
    console.log("Client disconnected.");
    // => "Client disconnected."
    server.close();
  });
});
```

Thanks to @nektro for the contribution!


### [`net.connect` emits `error` with `ERR_INVALID_IP_ADDRESS` for non-string lookup results](#net-connect-emits-error-with-err-invalid-ip-address-for-non-string-lookup-results)


The `net.connect` function now correctly handles cases where a custom `lookup` function returns a non-string value for the address. In alignment with Node.js, Bun will now emit an `'error'` event on the socket with the code `ERR_INVALID_IP_ADDRESS`.

```
import net from "node:net";
const brokenCustomLookup = (_hostname, _options, callback) => {
  // Incorrectly return an array of IPs instead of a string.
  callback(null, ["127.0.0.1"], 4);
};
const socket = net.connect({
  host: "example.com",
  port: 80,
  lookup: brokenCustomLookup,
});
socket.on("error", (err) => {
  console.log(err.code); // "ERR_INVALID_IP_ADDRESS"
});
```

Thanks to @nektro for the contribution!


### [Fixed: `fs.watchFile` ignores access time](#fixed-fs-watchfile-ignores-access-time)


Previously, `fs.watchFile` would incorrectly trigger a "change" event when a file was simply read, which updates its access time (`atime`). This is now fixed. The watcher will now only be triggered by changes to the file's content or modification time (`mtime`), aligning Bun's behavior with Node.js.
This fix makes file watching more reliable, especially in scenarios like hot-reloading or build tools where files are frequently accessed.
Thanks to @dylan-conway for the contribution


## [`bun:sqlite` updated to SQLite 3.50.2](#bun-sqlite-updated-to-sqlite-3-50-2)


The built-in `bun:sqlite` module has been upgraded to use SQLite version 3.50.2. This update incorporates the latest bug fixes and improvements from the SQLite project.

```
import { Database } from "bun:sqlite";
const db = new Database(":memory:");
const query = db.query(
  "select 'SQLite version: ' || sqlite_version() as message;",
);
console.log(query.get());
// { message: "SQLite version: 3.50.2" }
```


## [Updated WebKit](#updated-webkit)


Bun's underlying JavaScript engine, JavaScriptCore, and web APIs have been updated to a more recent version of WebKit. This change incorporates the latest upstream performance improvements, bug fixes, and features.
Here's a summary of the changes:

-   Separates structure IDs for functions with prototype vs methods without prototype, improving IC (inline cache) correctness and performance (89a544312175)
-   Optimized MarkedBlock::sweep with BitSet, improves GC performance when many objects are allocated and freed (e498e0debab2)
-   JIT Worklist load balancing improvements, improves JIT compilation performance (1656e50c527a)
-   Concurrent CodeBlockHash computation, improves JIT compilation performance (82de5bb87784)
-   Code like `str += "abc" + "deg" + variable` is now optimized to `str += "abcdeg" + variable`, improving string concatenation performance (b4e75f745812)
-   Delayed CachedCall initialization, improves performance of functions that may not use cached calls (e3a8241c538c)
-   `new Function` when passed a `.slice()`'d string less frequently resolves rope strings when constructing a function, improving performance of `new Function` (05cdfcbb72aa)


## [Bugfixes](#bugfixes)



### [Node.js compatibility bugfixes](#node-js-compatibility-bugfixes)


-   A reliability issue when calling `napi_delete_async_work` multiple times on the same work handle has been fixed
-   A crash that could occur when exiting a Worker inside of an N-API addon has been fixed
-   `net.Server.listen({ fd })` now emits an `error` event when passed an invalid file descriptor
-   A potential crash in N-API class constructors constructed via `Reflect.construct` or when subclassed has been fixed
-   `net.Socket.prototype.write()` will now correctly throw an `EBADF` error when writing to a socket after its underlying handle has been closed
-   To align with Node.js, `clearImmediate` no longer clears timeouts and intervals. `clearTimeout` and `clearInterval` still clear both timeouts and intervals.
-   `napi_create_buffer_from_arraybuffer` shares memory from the input ArrayBuffer instead of cloning it.
-   `net.connect` `keepAlive` and `keepAliveInitialDelay` options are now correctly handled
-   `child_process.execFile`'s `stdout` or `stderr` in certain cases returned `undefined` instead of a string. This bug impacted Claude Code.


### [Runtime bugfixes](#runtime-bugfixes)


-   Fixed a crash that could occur in `process.env` when invalid environment variables were passed to the Bun executable at startup
-   Fixed potential invalid UTF-8 output in `console.log` and other APIs
-   A bug on Linux and macOS where `stdout` from `Bun.spawn` hypothetically could be truncated when the child process exited before the data has been fully read has been fixed. We are not aware of any cases where this bug has been observed in practice.
-   Fixed a hypothetical type confusion bug when a function bound to an async generator function was passed as a readable stream body
-   A crash that could potentially occur when writing to an already-closed socket created via `Bun.connect` has been fixed
-   Fixed a hypothetical crash that could occur when a `ReadableStream` was garbage-collected while a Worker is terminating.
-   Several memory leaks in the Bun Shell have been fixed, thanks to improved tooling for tracking allocated memory.


### [Bundler bugfixes](#bundler-bugfixes)


-   Fixed a missing `default` export in browser polyfills for Node.js addons like `crypto`, `http`, `https`, `net`, `tty`, and `util`
-   Fixed a code splitting bug when CSS was imported inside of a dynamically imported ES module that caused the JavaScript import to sometimes point to the CSS file instead of the JavaScript file.


### [bun install bugfixes](#bun-install-bugfixes)


-   Fixed error handling when private git dependencies fail to install


### [Windows bugfixes](#windows-bugfixes)


-   The Bun executable on Windows now correctly specifies "Oven" as the company name in its file properties. This is a minor metadata update for better identification in Windows File Explorer thanks to @sunsettechuila


## [Thanks to 14 contributors!](#thanks-to-14-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@ianzone](https://github.com/ianzone)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@mizulu](https://github.com/mizulu)
-   [@nektro](https://github.com/nektro)
-   [@pfgithub](https://github.com/pfgithub)
-   [@riskymh](https://github.com/riskymh)
-   [@sharunkumar](https://github.com/sharunkumar)
-   [@ssahillppatell](https://github.com/ssahillppatell)
-   [@sunsettechuila](https://github.com/sunsettechuila)
-   [@zackradisic](https://github.com/zackradisic)