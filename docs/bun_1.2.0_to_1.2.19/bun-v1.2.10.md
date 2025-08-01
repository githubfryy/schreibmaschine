This release fixes 33 bugs (addressing 33 👍). setImmediate gets faster. Reliability improvements for filesystem operations. Fixes test.failing with done callbacks. Fixes default idle timeout in Redis client. Fixes importing from 'bun' module with bytecode compilation. Default Docker image updated to Debian Bookworm.


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

We fixed a bug that caused `setImmediate` to be extremely slow in cases where non-timer pending i/o was involved.

| Version | Time |
| --- | --- |
| 1.2.10 | 4ms |
| 1.2.9 | 74,000ms |

```
let i = 0;
function iterate() {
  if (i++ < 100) {
    setImmediate(iterate);
  } else {
    console.timeEnd("time");
    process.exit(0);
  }
}
console.time("time");
setImmediate(iterate);
Bun.serve({
  fetch(req) {
    return new Response("Hello World");
  },
  port: 0,
});
```

This makes `next build` 10% faster on macOS## [Micro-optimized request.method getter](#micro-optimized-request-method-getter)

The `request.method` getter in Fetch API requests has been micro-optimized to avoid memory allocation on initial access. Previously, a new string was created on each initial access, but now the 34 HTTP methods are cached as common strings, resulting in microscopically faster performance.

```
// Much faster now when accessing method properties
const request = new Request("https://example.com");
console.log(request.method); // "GET" - no longer allocates memory
```


## [Reliability improvements](#reliability-improvements)


We have added several patches to usages of Zig's standard library in Bun to address cases where Zig was not propagating errors from system calls or libc correctly.
We expect this to address many obscure bugs that have been reported.


## [Docker Image Update to Debian Bookworm](#docker-image-update-to-debian-bookworm)


The Bun Docker images have been updated from Debian Bullseye to Debian Bookworm, providing a more recent base operating system with newer packages and security updates. Debian Bullseye reached end of life in February 2024, so this was long overdue.

```
// Using the updated Docker image
docker pull oven/bun:latest
// or specify version
docker pull oven/bun:1.2.10
```

Thanks to @lxsmnsyc for the contribution!


## [Several bugfixes](#several-bugfixes)


This release is mostly bugfixes.


### [Fixed: Test Timeout Behavior with spawnSync](#fixed-test-timeout-behavior-with-spawnsync)


The timeout handling mechanism in Bun's test runner has been improved, particularly for tests using `spawnSync` that previously encountered termination issues. This fix ensures tests timeout correctly and properly terminate child processes that exceed their time limit.

```
// Tests with timeouts now properly terminate
import { test, expect } from "bun:test";
test("test with timeout", { timeout: 1000 }, async () => {
  // This will properly timeout and terminate after 1 second
  const proc = Bun.spawnSync(["sleep", "10"]);
});
```

Thanks to @190n for the contribution!


### [Fixed: `test.failing` with Done Callbacks](#fixed-test-failing-with-done-callbacks)


Tests marked with `test.failing` now properly handle tests that use a done callback. The feature now correctly passes when a test using `done()` passes an error or throws, and fails when tests complete successfully.

```
// This test will pass because it throws an error
test.failing("test.failing passes when an error is thrown", (done) => {
  throw new Error("test error");
  done();
});
// This test will pass because it passes an error to done()
test.failing(
  "test.failing passes when done() is called with an error",
  (done) => {
    done(new Error("test error"));
  },
);
// This test will fail because it doesn't throw or pass an error
test.failing(
  "test.failing fails when done is called without an error",
  (done) => {
    done();
  },
);
```


### [Fixed: `ERR_HTTP_SOCKET_ASSIGNED` impacting some requests in Next.js](#fixed-err-http-socket-assigned-impacting-some-requests-in-next-js)


A regression from our node:http server rewrite in Bun v1.2.6 caused `ERR_HTTP_SOCKET_ASSIGNED` to be thrown in certain cases when using Next.js. This has been fixed, thanks to @cirospaciari.


### [Fixed: Connection close error in Redis Client](#fixed-connection-close-error-in-redis-client)


Fixed the default idle timeout in the Redis client to be 0 (no timeout) instead of 30 seconds, ensuring connections remain active indefinitely by default.


### [Fixed: HTML Imports with Custom Loaders](#fixed-html-imports-with-custom-loaders)


Bun now supports importing HTML files with non-HTML loaders, particularly with `type: "text"`. This fixes an issue where importing HTML files with a text loader would result in an error message: "Browser builds cannot import HTML files."

```
// This now works properly
import htmlContent from "./template.html" with { type: "text" };
console.log(htmlContent); // "<div>hello world</div>"
```

Thanks to @pfgithub for fixing this issue!


### [Fixed: bytecode compilation with 'bun' module imports](#fixed-bytecode-compilation-with-bun-module-imports)


Fixed an issue where importing from the 'bun' module would break bytecode compilation due to the CommonJS module format. You can now successfully use bytecode compilation with any import style from the 'bun' module.

```
// This now works with bytecode compilation
import { RedisClient } from "bun";
import * as BunStar from "bun";
const bunRequire = require("bun");
// Use Redis client from any import style
const client = new RedisClient("redis://localhost:6379");
```


### [Fixed: error handling for overriding sqlite](#fixed-error-handling-for-overriding-sqlite)


Fixed a crash that occurred when failing to load a custom sqlite shared library.

```
// Now works correctly when loading a custom SQLite binary
import { Database } from "bun:sqlite";
const db = new Database("mydata.db", {
  customSQLiteBinary: "./path/to/sqlite.bin",
});
```

Thanks to @nektro for the contribution!


### [Fixed: node:crypto `setAAD` undefined checks](#fixed-node-crypto-setaad-undefined-checks)


Fixed a bug in our node:crypto implementation where `cipher.setAAD()` would throw when `options.encoding` or `options.plaintextLength` were undefined. This addresses compatibility issues with libraries like `next-auth` that regressed in Bun v1.2.6.

```
// This now works properly
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
cipher.setAAD("0123456789abcdef0123456789abcdef", {
  encoding: undefined,
});
```

Thanks to @cirospaciari for the contribution!


### [Fixed: String Finalizers in N-API (Native Modules)](#fixed-string-finalizers-in-n-api-native-modules)


Fixed a bug in Bun's N-API (Node Native Addons) implementation that caused finalizers to execute potentially while other JavaScript code was running, which is unexpected for older versions of N-API modules and could cause crashes.


### [Fixed: `rejectNonStandardBodyWrites` behavior in node.js http module](#fixed-rejectnonstandardbodywrites-behavior-in-node-js-http-module)


The `rejectNonStandardBodyWrites` option in the Node.js HTTP module now correctly handles `undefined` and `false` values, and properly implements the option's behavior to match Node.js. When enabled, this option throws errors when writing response bodies for HEAD requests, while the default behavior simply ignores such writes.

```
// Create server with rejectNonStandardBodyWrites enabled
const http = require("node:http");
const server = http.createServer({ rejectNonStandardBodyWrites: true });
server.on("request", (req, res) => {
  if (req.method === "HEAD") {
    // This will throw an error with rejectNonStandardBodyWrites: true
    // With the default false setting, this would be silently ignored
    res.write("This should not be sent");
  }
});
```

Thanks to @cirospaciari for this fix!


### [Thanks to 13 contributors!](#thanks-to-13-contributors)


-   [@190n](https://github.com/190n)
-   [@afrokick](https://github.com/afrokick)
-   [@alexandre-lavoie](https://github.com/alexandre-lavoie)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@davlgd](https://github.com/davlgd)
-   [@donisaac](https://github.com/donisaac)
-   [@hectorm](https://github.com/hectorm)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@nektro](https://github.com/nektro)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)
-   [@thexeos](https://github.com/thexeos)