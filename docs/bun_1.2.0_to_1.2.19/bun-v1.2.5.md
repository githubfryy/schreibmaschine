This release fixes 75 bugs (addressing 162 👍), and adds +69 passing Node.js tests. It includes improvements to the frontend dev server, CSS modules support, a full rewrite of Node-API, faster `Sign`, `Verify`, `Hash`, `Hmac` from `node:crypto`, and bug fixes for `node:net` and Bun's bundler.


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


## [Node.js compatibility](#node-js-compatibility)



### [Much better Node-API compatibility](#much-better-node-api-compatibility)


In Bun v1.2.5, we've almost completely rewritten Bun's Node-API implementation. Node-API is a C interface that allows you to write a module in highly-optimized native code and embed it in any compatible JavaScript runtime. This can speed up performance-critical code, and also allows reusing existing native libraries in languages like C, C++, Rust, or Zig. We now have much better compatibility with Node.js's implementation than we did before, ensuring that Node-API modules that work in Node also work in Bun.
To work on Node-API compatibility, we focused on running Node's tests in Bun. This is the same way we've been testing compatibility of core JavaScript modules [since Bun v1.2](https://bun.com/blog/bun-v1.2#how-do-you-measure-compatibility). We've also added new tests to our own Node-API test suite to cover edge cases. Bun v1.2.5 passes 98% of Node's `js-native-api` test suite, which covers the APIs to interact with core JavaScript types and execution (for instance, `napi_create_double` to turn a C `double` into a JavaScript `number`).
The full list of bugs fixed doing this work is quite long, but some of the major ones are:

-   Each Node-API module now gets its own `napi_env`. Previously, they all shared the same one, which would break if you loaded two modules that both tried to store data in a `napi_env`.
-   Almost all functions have better error handling than before, such as correctly returning error codes when they are passed null pointers instead of assuming the pointer is valid and crashing. As much as we can, it's important to ensure that faulty native modules throw errors which can be caught instead of crashing the entire process.
-   Properties on objects created by Node-API now have the correct flags, fixing issues such as [#15429](https://github.com/oven-sh/bun/issues/15429).
-   We detect which version of Node-API a module is using, which is meant to cause some APIs [such as finalizers](https://nodejs.org/api/n-api.html#node_api_basic_finalize) to behave differently.


### [More accurate `node:timers`](#more-accurate-node-timers)


Bun's `node:timers` implementation has been fixed to match Node.js behavior more closely. This update addresses several compatibility issues and edge cases, making it easier to run Node-based code without modifications.

```
// Unref'd setImmediate no longer keeps the event loop alive
const immediate = setImmediate(() => console.log("This won't prevent exit"));
immediate.unref();
// Timers now handle edge cases for millisecond values
setTimeout(() => console.log("Still works with edge cases"), NaN); // Fires immediately with warning
// clearTimeout now accepts stringified timer IDs
const timeoutId = setTimeout(() => {}, 1000);
clearTimeout(String(timeoutId)); // Works correctly
```


### [`Bun.CSRF`](#bun-csrf)


We've added `Bun.CSRF.generate` and `Bun.CSRF.verify` to help you protect your applications from Cross-Site Request Forgery (CSRF) attacks.
Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Better `connect()` validation in `node:net`](#better-connect-validation-in-node-net)


Improved validation is now implemented in the Node.js compatibility layer for the `net.connect()` method. The module now properly validates `localAddress` and `localPort` options, throwing appropriate error types when invalid values are provided.

```
// This will throw with ERR_INVALID_IP_ADDRESS
net.connect({
  host: "localhost",
  port: 8080,
  localAddress: "invalid-ip",
});
// This will throw with ERR_INVALID_ARG_TYPE
net.connect({
  host: "localhost",
  port: 8080,
  localPort: "not-a-number",
});
```


### [Improved `String` rendering in `console.log()`](#improved-string-rendering-in-console-log)


Bun now displays String objects in the console similar to Node.js, showing them as `[String: "value"]`. This provides better clarity when debugging code that uses String object wrappers.

```
console.log(new String("Hello"));
// Previous: "Hello"
// Now: [String: "Hello"]
```

Thanks to [@Pranav2612000](https://github.com/Pranav2612000) for the contribution!


### [`captureRejections` validation in `EventEmitter`](#capturerejections-validation-in-eventemitter)


The validation of the `captureRejections` option in `EventEmitter` has been improved to provide better error messaging when an invalid value is provided.

```
// This will now throw a more descriptive error
const emitter = new EventEmitter({ captureRejections: "yes" });
// TypeError: The "options.captureRejections" property must be of type boolean.
// Correct usage
const emitter = new EventEmitter({ captureRejections: true });
```


### [Faster `Sign` and `Verify` in `node:crypto`](#faster-sign-and-verify-in-node-crypto)


> In the next version of Bun
> node:crypto Sign & Verify passes Node.js' tests, and gets 34x faster thanks to hardware acceleration using BoringSSL. [pic.twitter.com/dEOBXmpMdM](https://t.co/dEOBXmpMdM)
> 
> — Bun (@bunjavascript) [March 7, 2025](https://twitter.com/bunjavascript/status/1897936906090168600?ref_src=twsrc%5Etfw)

The `node:crypto` module's `Sign` and `Verify` classes have been reimplemented in C++, leveraging BoringSSL for better performance and security.


### [Faster `createHash` and `createHmac` in `node:crypto`](#faster-createhash-and-createhmac-in-node-crypto)


Bun now implements the Node.js `crypto` module's `Hmac` and `Hash` classes natively in C++. This improves performance and compatibility with Node.js for cryptographic operations.

```
// Hash example
import { createHash } from "node:crypto";
const hash = createHash("sha256");
hash.update("hello world");
console.log(hash.digest("hex"));
// 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
// Hmac example
import { createHmac } from "node:crypto";
const hmac = createHmac("sha256", "secret-key");
hmac.update("hello world");
console.log(hmac.digest("hex"));
// 'f13607378197fdb246f5dbc78e86e2fea13347b273087b330e8be27484cecae1'
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


### [`AbortSignal` support in `node:net`](#abortsignal-support-in-node-net)


You can now pass an `AbortSignal` to `net.createServer` to abort the server when the signal is aborted.

```
// Create a server with an AbortSignal
const server = net.createServer();
const controller = new AbortController();
// Pass the signal in the listen options
server.listen({ port: 0, signal: controller.signal });
// Later, abort the controller to close the server
controller.abort();
// You can also use a pre-aborted signal
const preAbortedServer = net.createServer();
preAbortedServer.listen({
  port: 0,
  signal: AbortSignal.abort(),
}); // Server will close immediately
```


### [Fixed behavior in `node:perf_hooks`](#fixed-behavior-in-node-perf-hooks)


The `monitorEventLoopDelay()` and `createHistogram()` methods in the `node:perf_hooks` module now correctly throw when called, rather than silently doing nothing. These functions are not implemented in Bun yet, and they now properly indicate this to developers.

```
const { performance } = require("node:perf_hooks");
// Before: These would silently do nothing
// Now: They properly throw an error when called
try {
  performance.monitorEventLoopDelay();
} catch (e) {
  console.error("Error:", e.message); // Error: Not implemented
}
```


### [Fixed sending empty IPC messages in `node:child_process`](#fixed-sending-empty-ipc-messages-in-node-child-process)


Fixed an issue where the Bun runtime would throw an assertion error when receiving empty IPC messages during child process communication. This improves reliability when using `child_process.fork()` by properly handling edge cases.

```
// Before: Empty messages could cause an assertion error
const child = fork("./worker.js");
child.send(""); // Could cause assertion failure
// Now: Empty messages are properly handled
const child = fork("./worker.js");
child.send(""); // Works correctly
```

Fixed thanks to [@DonIsaac](https://github.com/DonIsaac)!


### [Fixed `server.unref()` before listening](#fixed-server-unref-before-listening)


Fixed a bug where calling `unref()` on a `net.Server` before listening would not persist the unref state, which could cause servers to unexpectedly keep the event loop open.

```
// Previously, this pattern didn't work correctly
const server = net.createServer();
server.unref(); // This wouldn't persist after listen()
server.listen();
// Now unref() correctly persists even when called before listen()
```

Thanks to [@nektro](https://github.com/nektro) for the contribution!


### [Fixed behavior of `setImmediate` on the event loop](#fixed-behavior-of-setimmediate-on-the-event-loop)


Fixed a performance issue in the event loop that caused unnecessary idling when both `setInterval` timers and `setImmediate` tasks were present. The event loop now properly prioritizes immediate tasks without idling, resulting in better performance for code that relies on immediate callbacks.

```
// Immediate tasks now run efficiently even with interval timers present
setInterval(() => {
  // Some background task
}, 1000);
function processNextItem() {
  // Process item from queue
  if (moreItemsExist) {
    setImmediate(processNextItem);
  }
}
processNextItem();
```

Fixed thanks to [@190n](https://github.com/190n)!


### [Inherited stdin with `node:child_process`](#inherited-stdin-with-node-child-process)


Fixed an issue where child processes with inherited stdin were incorrectly returning `process.stdin` instead of `null`. This change makes Bun's behavior match Node.js and resolves compatibility issues with tools like `npx` that expect `null` when stdin is inherited.

```
// Before: Would incorrectly return process.stdin
const child = spawn("some-command", [], { stdio: "inherit" });
console.log(child.stdin); // Previously: process.stdin (caused errors)
// After: Correctly returns null
const child = spawn("some-command", [], { stdio: "inherit" });
console.log(child.stdin); // Now: null (matches Node.js behavior)
```

Fixed thanks to [@pfgithub](https://github.com/pfgithub)!


### [Fixed infinite loop in `net.connect()`](#fixed-infinite-loop-in-net-connect)


This release addresses an issue where `Socket.connect()` would enter an infinite loop when called with only null or undefined arguments. Now, the method properly validates inputs and throws a meaningful error message.

```
const net = require("net");
// This would previously cause an infinite loop
// Now throws: 'The "options", "port", or "path" argument must be specified'
try {
  net.connect();
} catch (error) {
  console.error(error.message);
}
```


### [Fixed `resetAndDestroy()` in `node:net`](#fixed-resetanddestroy-in-node-net)


This update improves the socket handling in the `net` module for more consistent error behavior when sockets are closed or reset.

```
// Create a socket and use the new resetAndDestroy method
const socket = new net.Socket();
socket.resetAndDestroy();
// Error handling is now more consistent with proper error codes
socket.on("error", (err) => {
  console.log(err.code); // ERR_SOCKET_CLOSED
});
```


### [Fixed socket timeouts in `node:net`](#fixed-socket-timeouts-in-node-net)


Fixed the behavior of socket timeouts in Node.js compatibility mode. The implementation now properly validates timeout values and callback functions, ensuring consistent behavior with Node.js.

```
// Setting socket timeout now validates input values
const socket = new net.Socket();
// Valid timeout values work as expected
socket.setTimeout(1000, () => console.log("Socket timed out"));
// Invalid values throw appropriate errors
socket.setTimeout("100"); // Throws ERR_INVALID_ARG_TYPE
socket.setTimeout(-1); // Throws ERR_OUT_OF_RANGE
socket.setTimeout(Infinity); // Throws ERR_OUT_OF_RANGE
// Large values are capped with a warning
socket.setTimeout(Number.MAX_SAFE_INTEGER);
// TimeoutOverflowWarning: Value does not fit into a 32-bit signed integer.
// Timer duration was truncated to 2147483647.
```


### [Fixed `write()` argument validation in `node:net`](#fixed-write-argument-validation-in-node-net)


Bun now correctly validates arguments passed to `socket.write()`, throwing appropriate errors when invalid types are provided. This matches Node.js behavior for better compatibility.

```
// Will throw TypeError with code ERR_STREAM_NULL_VALUES
socket.write(null);
// Will throw TypeError with code ERR_INVALID_ARG_TYPE
socket.write(true);
socket.write(1);
socket.write([]);
socket.write({});
// Only string, Buffer, TypedArray, or DataView are allowed
```


### [Fixed `allowHalfOpen` in `node:net`](#fixed-allowhalfopen-in-node-net)


Fixed the implementation of `allowHalfOpen` in `net.Socket` to properly enforce closing the writable side when the readable side ends, aligning with Node.js behavior.

```
const { Socket } = require("net");
// Create a socket that will auto-close when the readable side ends
const socket = new Socket({ allowHalfOpen: false });
// With this fix, the socket correctly registers a listener for the 'end' event
// to enforce the half-open connection policy
```


## [Bun's frontend dev server](#bun-s-frontend-dev-server)



### [Svelte support in the bundler and dev server](#svelte-support-in-the-bundler-and-dev-server)


We added built-in support for Svelte through a new official plugin package: `bun-plugin-svelte`. You can now use Svelte components seamlessly in both the development server with HMR and the bundler.

```
// Import the plugin
import { SveltePlugin } from "bun-plugin-svelte";
// Use in Bun.build
Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "browser", // Also supports "bun" or "node" for server-side components
  plugins: [
    SveltePlugin({
      development: true, // Enable dev features, set to false for production
    }),
  ],
});
```

The plugin provides out-of-the-box TypeScript support in Svelte components:

```
<!-- App.svelte -->
<script lang="ts">
let name: string = "Bun";
</script>
<main>
  <h1>Hello {name}!</h1>
</main>
```


### [Support for CSS modules](#support-for-css-modules)


We added support for CSS modules in the bundler, allowing you to import CSS with locally-scoped class names generated automatically. Files with the `.module.css` extension are automatically treated as CSS modules.

```
// style.module.css
.button {
  background: blue;
  color: white;
}
.button:hover {
  background: darkblue;
}
// In your JavaScript file
import styles from './style.module.css';
// Use the generated class names
const button = document.createElement('button');
button.className = styles.button;
button.textContent = 'Click me';
```

Supported features include class name composition with `composes` (within the same file, from other CSS module files, or from the global scope). The implementation generates globally unique names for locally scoped classes and IDs.


### [Improved HMR support](#improved-hmr-support)


This release brings significant improvements to Hot Module Replacement (HMR) in the development server, making it more robust and feature-rich for JavaScript developers.

```
// Self-accepting module using new import.meta.hot API
import.meta.hot.accept();
// Accept changes from dependencies
import * as foo from "./foo";
export let state = getState(foo);
// Handle updates from specific module
import.meta.hot.accept("./foo", (newFoo) => {
  state.foo = newFoo;
});
```

The HMR system has been completely rewritten to support synchronous ESM imports and the modern `import.meta.hot.accept` API pattern. This brings Bun's HMR implementation closer to other modern development tools while adding unique optimizations.
HMR code is now automatically DCE'd (dead code eliminated) in production, meaning you can use `import.meta.hot` API calls at the top level without wrapping them in conditional checks in many cases.


### [Non-string `describe` labels](#non-string-describe-labels)


Bun's test runner now accepts numbers, functions, and classes (both anonymous and named) as the first argument to `describe` blocks, which fixed a Jest compatibility issue.

```
// Using a number as describe label
describe(1, () => {
  test("works with number labels", () => {
    // ...
  });
});
// Using a class as describe label
class UserService {}
describe(UserService, () => {
  test("automatically uses the class name", () => {
    // ...
  });
});
// Using a function as describe label
function validateInput() {}
describe(validateInput, () => {
  test("automatically uses the function name", () => {
    // ...
  });
});
```

Thanks to [@reillyjodonnell](https://github.com/reillyjodonnell) for the contribution!


## [Bug fixes](#bug-fixes)



### [Bug with `server.close()` before listening](#bug-with-server-close-before-listening)


Fixed the handling of callback functions in the Node.js `net.Server` API. The implementation now properly registers the `onListen` callback function as a one-time event listener instead of directly calling it, improving compatibility with Node.js behavior.

```
// Before, callback could be called incorrectly
const server = net.createServer();
server.listen(3000, () => {
  console.log("Server listening");
});
// Now follows Node.js behavior and handles edge cases properly
server.close(); // Can be called before the server is listening
```


### [Fixed `bun.lock` with workspace overrides](#fixed-bun-lock-with-workspace-overrides)


We fixed an issue where `bun install` would fail when loading a `bun.lock` file that contains workspace package overrides with different names. Now you can successfully override npm packages with workspace packages regardless of name differences.

```
// In package.json
{
  "name": "foo",
  "workspaces": ["packages/*"],
  "dependencies": {
    "one-dep": "1.0.0"
  },
  "overrides": {
    "no-deps": "workspace:packages/pkg1"
  }
}
// In packages/pkg1/package.json
{
  "name": "pkg1",
  "version": "2.2.2"
}
// After bun install, no-deps will point to the workspace package
// node_modules/no-deps/package.json will contain:
{
  "name": "pkg1",
  "version": "2.2.2"
}
```

Fixed thanks to [@dylan-conway](https://github.com/dylan-conway)!


### [Unicode bug in `RegExp`](#unicode-bug-in-regexp)


Fixed a regression impacting webpack with Unicode property escapes in regular expressions, particularly affecting script-based property lookups like `\p{Script=Hangul}`. This resolves a compatibility issue where certain Unicode pattern matches would fail.

```
// Now working correctly
const pattern = /^\p{Script=Hangul}$/u;
console.log(pattern.test("한글")); // true
// Also fixed basic character class checks
console.log(/^(?:H|Hangul)$/.test("Hangul")); // true
```

Bun now properly supports sending the `Strict-Transport-Security` header in HTTP responses when using either `Bun.serve` or `node:http`. Previously, the header was being automatically removed when served over HTTP connections, but many deployments rely on proxying HTTP traffic through tools like NGINX which handle the HTTPS termination.

```
// With Bun.serve
Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello World", {
      headers: {
        "Strict-Transport-Security": "max-age=31536000",
      },
    });
  },
});
// With node:http
import http from "node:http";
http
  .createServer((req, res) => {
    res.writeHead(200, {
      "Strict-Transport-Security": "max-age=31536000",
    });
    res.end("Hello World");
  })
  .listen(3000);
```


### [Fixed crash with long package names in `package.json`](#fixed-crash-with-long-package-names-in-package-json)


Fixed an issue where parsing a `package.json` with a very long package name could cause a crash. This improves stability when working with projects that have unusually long package names.

```
// Previously, this would crash when the package name was very long
const longNamePackage = {
  name: "extremely-long-package-name-that-would-cause-issues-with-fixed-buffer",
  version: "1.0.0",
};
// Now it parses correctly without crashing
```

Fixed thanks to [@hudon](https://github.com/hudon)!


### [Support for `test.failing`](#support-for-test-failing)


Bun now supports `test.failing()`, which allows you to mark tests that you expect to fail. These tests are inverted - they pass if they throw an error and fail if they don't throw. This is useful for documenting bugs that need to be fixed or for test-driven development.

```
describe("add(a, b)", () => {
  test.failing("should return sum but not implemented yet", () => {
    // This test will pass overall because the expectation fails
    expect(add(1, 2)).toBe(3);
  });
  test.failing("this test will actually fail", () => {
    // This will cause the test to fail because it passes unexpectedly
    expect(true).toBe(true);
  });
});
```

Thanks to [@DonIsaac](https://github.com/DonIsaac) for the contribution!


### [Using Jest globals in imported files](#using-jest-globals-in-imported-files)


Jest globals like `expect`, `test`, and `describe` are now properly available in all files of a test suite, not just the entry point file. This allows you to define Jest extensions, custom matchers, and test helpers in separate files without encountering reference errors.

```
// entry.test.js
import "./test-helpers.js";
test("can use helpers from imported file", () => {
  expect(1).toBeOne();
});
// test-helpers.js
expect.extend({
  toBeOne(actual) {
    return {
      pass: actual === 1,
      message: () => `expected ${actual} to be 1`,
    };
  },
});
```

Thanks to [@Electroid](https://github.com/electroid) for the contribution!


### [Fixed running tests in VSCode extension with special characters](#fixed-running-tests-in-vscode-extension-with-special-characters)


The VS Code extension now properly handles tests with special characters in their names. Tests with names containing braces, parentheses, or other special characters can now be run directly through the CodeLens "Run Test" or "Watch Test" actions without failing or being skipped.

```
// Test names with special characters now work correctly
test("can run with special chars :)", () => {
  // This test will now run properly when clicked in VS Code
});
test("parse {", () => {
  // Previously would fail the runner
});
test("something (something)", () => {
  // Previously would be skipped
});
```

Thanks to [@MarkSheinkman](https://github.com/MarkSheinkman) for the contribution!


### [Fixed error handling when closing `WebSocket`](#fixed-error-handling-when-closing-websocket)


Fixed a bug where WebSocket's `close()` and `terminate()` methods would throw errors when the internal WebSocket instance is unavailable. This resolves issues particularly when terminating Next.js dev sessions with Turbopack via CTRL+C.

```
// Now checks if internal WebSocket exists before calling methods
webSocket.close(1000, "Normal closure");
webSocket.terminate();
```


### [Improved socket error messages](#improved-socket-error-messages)


Socket error messages now include more detailed information, such as the `syscall`, `address`, and `port` properties. This enhancement makes debugging network-related issues easier and provides better compatibility with Node.js.

```
// When a network server fails to listen
const server = net.createServer();
server.listen(1234, "192.168.1.100");
server.on("error", (err) => {
  console.log(err.syscall); // "listen"
  console.log(err.address); // "192.168.1.100"
  console.log(err.port); // 1234
});
```


### [Fixed `WebSocket` upgrades with `Bun.serve()` routes](#fixed-websocket-upgrades-with-bun-serve-routes)


We fixed an issue with WebSocket upgrades when using explicit route handlers. Previously, WebSocket connections would only work properly with the catch-all route, but now they work correctly with specific route paths.

```
// Define a server with explicit routes and WebSocket support
const server = Bun.serve({
  port: 3000,
  // WebSocket handler works with specific routes now
  websocket: {
    message(ws, message) {
      ws.send(`Echo: ${message}`);
    },
  },
  // Route-specific handlers properly handle WebSocket upgrades
  routes: {
    "/chat": (req, server) => {
      // This now works correctly
      if (server.upgrade(req)) {
        return; // Request was upgraded
      }
      return new Response("WebSocket connection required", { status: 400 });
    },
  },
});
```


## [Other changes](#other-changes)



### [Smaller binary size for Alpine Linux](#smaller-binary-size-for-alpine-linux)


Bun builds targeting Alpine Linux (musl libc) are now significantly smaller due to optimized compilation settings and updated WebKit dependency.


### [`NPM_CONFIG_TOKEN` support in `bun publish`](#npm-config-token-support-in-bun-publish)


`bun publish` now respects the `NPM_CONFIG_TOKEN` environment variable, making it easier to set up automated publishing workflows in CI environments like GitHub Actions without additional configuration.

```
// In your CI workflow
process.env.NPM_CONFIG_TOKEN = "npm-token-from-secrets";
await $`bun publish`;
```

Thanks to [@KilianB](https://github.com/KilianB)!


### [Support for `bun init <folder>`](#support-for-bun-init-folder)


You can now specify a target folder when initializing a new Bun project. Bun will create the directory if it doesn't exist and initialize the project inside it.

```
// Create a new project in a specific directory
bun init myproject -y
// The folder structure is created automatically
// myproject/
//   ├── .gitignore
//   ├── README.md
//   ├── bun.lock
//   ├── index.ts
//   ├── node_modules
//   ├── package.json
//   └── tsconfig.json
```


### [Dynamic column support in `Bun.sql`](#dynamic-column-support-in-bun-sql)


You can now use dynamic column selection, update operations, and "WHERE IN" clauses, making database operations more flexible and intuitive in `Bun.sql`.

```
// Dynamic column selection with rest parameters
await sql`INSERT INTO users ${sql(user, "name", "email")}`;
// Dynamic updates with selected columns
await sql`UPDATE users SET ${sql(user, "name", "email")} WHERE id = ${user.id}`;
// Use all object keys for updates
await sql`UPDATE users SET ${sql(user)} WHERE id = ${user.id}`;
// Simple "WHERE IN" with array of values
await sql`SELECT * FROM users WHERE id IN ${sql([1, 2, 3])}`;
// "WHERE IN" with array of objects
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];
await sql`SELECT * FROM users WHERE id IN ${sql(users, "id")}`;
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Fixed memory leaks in development server](#fixed-memory-leaks-in-development-server)


This release fixes memory leaks in Bun's development server by properly deinitializing resources when the server shuts down. The changes improve memory management and stability when running Bun's dev server for extended periods.

```
// Memory leaks are now properly handled when stopping the dev server
const devServer = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Hello World");
  },
});
// Later when you want to shut down
devServer.stop();
// Resources are now properly cleaned up
```


### [`server.reload()` is 30% faster](#server-reload-is-30-faster)



### [Reduced memory usage in timers](#reduced-memory-usage-in-timers)



### [Faster `TextDecoder` initialization](#faster-textdecoder-initialization)



## [Improvements to `@types/bun`](#improvements-to-types-bun)


This release includes significant improvements to TypeScript type definitions in Bun, addressing various issues and adding better type support for several APIs.

```
// Better *.svg module declarations for frontend dev server
declare module "*.svg" {
  var contents: `${string}.svg`;
  export = contents;
}
// Improved ShellError class types with full method definitions
const output = await $`echo '{"hello": 123}'`;
console.log(output.json()); // { hello: 123 }
```

Thanks to [@alii](https://github.com/alii) for the contribution!


### [Improved error messages for `ReadableStream`](#improved-error-messages-for-readablestream)


Bun now provides more descriptive error messages when using ReadableStream with `type: "direct"`. Instead of the generic "Expected Sink" error, you'll now see specific information about what went wrong, such as when trying to use a controller after the stream has been closed.

```
// Before: Generic "Expected Sink" error
// Now: Detailed error message
const stream = new ReadableStream({
  type: "direct",
  async pull(controller) {
    controller.write("data");
    // If you try to use the controller after pull() returns:
    // Error: This HTTPResponseSink has already been closed.
    // A "direct" ReadableStream terminates its underlying socket once `async pull()` returns.
  },
});
```

Thanks to [@paperclover](https://github.com/paperclover) for the contribution!


### [HMR event improvements](#hmr-event-improvements)


The hot-module-reloading API has been enhanced with a fully-implemented event system, allowing developers to listen for various HMR lifecycle events. This enables more control over the hot module replacement process in Bun's development server.

```
// Listen for an event before hot updates are applied
import.meta.hot.on("bun:beforeUpdate", () => {
  console.log("Preparing for hot update...");
});
// Clean up when no longer needed
import.meta.hot.off("bun:beforeUpdate", listener);
```

Events include `bun:beforeUpdate`, `bun:afterUpdate`, `bun:error`, `bun:ws:connect`, and more. For compatibility, Vite-style event names (with `vite:` prefix) are also supported.
Thanks to [@paperclover](https://github.com/paperclover)!


### [Fixed `ipv6Only` in `node:net`](#fixed-ipv6only-in-node-net)


Fixed the implementation of the `ipv6Only` option in `net.Server.listen()` to properly disable dual-stack support when specified. This ensures that when you set `ipv6Only: true`, the server will only listen on IPv6 addresses and not accept IPv4 connections.

```
const server = net.createServer();
server.listen(
  {
    host: "::",
    port: 0,
    ipv6Only: true,
  },
  () => {
    console.log("Server is now listening only on IPv6");
  },
);
```


### [Fixed SQL parameter handling in `Bun.sql`](#fixed-sql-parameter-handling-in-bun-sql)


Fixed a bug in PostgreSQL driver where statement state was being set to prepared too soon, causing issues with parameter validation. The fix properly handles cases where parameter counts don't match between the query and supplied values.

```
// Before: Could encounter errors when parameter counts didn't match
const sql = new SQL("postgres://user:pass@localhost:5432/db");
await sql.query("SELECT * FROM users WHERE id = $1"); // Missing parameter
// After: Provides clearer error messages about parameter mismatches
// Error: PostgresError: bind message supplies 0 parameters, but prepared statement requires 1
```


### [Fixed `new File()` with an empty body](#fixed-new-file-with-an-empty-body)


The `File` constructor now properly handles the case when a file is created with an empty body but a specified name. Previously, this would lead to unexpected behavior.

```
// Now works correctly
const file = new File([], "empty.txt", { type: "text/plain;charset=utf-8" });
console.log(file.name); // "empty.txt"
console.log(file.size); // 0
console.log(file.type); // "text/plain;charset=utf-8"
```

Fixed thanks to [@cirospaciari](https://github.com/cirospaciari)!


### [Fixed unminified identifier collisions in the bundler](#fixed-unminified-identifier-collisions-in-the-bundler)


Fixed a bundling bug where block-scoped variables weren't properly hoisted during parsing, resulting in identifier collisions when bundling multiple modules with the same variable names.

```
// Before: These two files would conflict when bundled
// foo.js
{
  var d = 0;
}
export const foo = () => {};
// bar.js
function d() {}
export function bar() {
  d.length;
}
// After: The bundler now correctly handles this case
// without causing identifier conflicts
```

Fixed thanks to [@jbarrieault](https://github.com/jbarrieault)!


### [Thanks to 25 contributors!](#thanks-to-25-contributors)


[@190n](https://github.com/190n) [@alii](https://github.com/alii) [@aryzing](https://github.com/aryzing) [@brycefranzen](https://github.com/brycefranzen) [@cirospaciari](https://github.com/cirospaciari) [@cngJo](https://github.com/cngJo) [@daniellionel01](https://github.com/daniellionel01) [@DonIsaac](https://github.com/DonIsaac) [@dylan-conway](https://github.com/dylan-conway) [@Electroid](https://github.com/Electroid) [@heimskr](https://github.com/heimskr) [@hudon](https://github.com/hudon) [@Jarred-Sumner](https://github.com/Jarred-Sumner) [@jbarrieault](https://github.com/jbarrieault) [@KilianB](https://github.com/KilianB) [@malonehedges](https://github.com/malonehedges) [@MarkSheinkman](https://github.com/MarkSheinkman) [@mayfieldiv](https://github.com/mayfieldiv) [@Nanome203](https://github.com/Nanome203) [@nektro](https://github.com/nektro) [@paperclover](https://github.com/paperclover) [@pfgithub](https://github.com/pfgithub) [@Pranav2612000](https://github.com/Pranav2612000) [@reillyjodonnell](https://github.com/reillyjodonnell) [@zackradisic](https://github.com/zackradisic)