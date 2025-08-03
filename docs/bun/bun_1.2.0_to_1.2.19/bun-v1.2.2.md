We're hiring [systems engineers](https://bun.com/careers) in San Francisco to build the future of JavaScript!
This release fixes 38 bugs (addressing 129 👍). JavaScript idle memory usage drops by 10–30%. Fixes regression impacting vite build. Reliability improvements to Bun.SQL, Bun.S3Client, Bun's CSS parser. Node.js compatibility improvements: fs.glob, fs.globSync, fs.promises.glob, fs.Dir, fs.accessSync bugfixes, node:http WebSocket exports.


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


## [JavaScript uses 10% - 30% less memory at idle](#javascript-uses-10-30-less-memory-at-idle)


A scheduling issue causing JavaScriptCore's garbage collector timers to not always run has been fixed. Now Bun runs both Bun's own garbage collection timers and JavaScriptCore's garbage collection timers in Bun's event loop.


### [Next.js idle memory usage drops by 28%](#next-js-idle-memory-usage-drops-by-28)


[!](https://github.com/user-attachments/assets/a9b7723a-7851-48e8-9e80-c7fe5855dd28)


### [Elysia idle memory usage drops by 11%](#elysia-idle-memory-usage-drops-by-11)


[!](https://github.com/user-attachments/assets/e8bb78d5-cf08-4fca-888f-b078d3eb59a5)

This change impacts everything from Next.js, Express and Elysia to TypeScript (`tsc`), to CLI tools and more.


### [Timers & GC](#timers-gc)


JavaScriptCore's garbage collector has a a number of timers that are used to trigger garbage collection at the appropriate times *after* memory allocation has occurred (there are separate garbage collection runs that can occur during memory allocation).
Previously, these timers were not integrated with Bun's event loop. This is now fixed, and these garbage collection timers are now triggered when the event loop is otherwise blocked in a syscall.


### [SIGPWR GC signaling](#sigpwr-gc-signaling)


When the garbage collector runs, it needs some way to suspend threads.
On macOS and Windows, there are system APIs for suspending threads.
Linux does not offer any APIs for suspending threads, so instead garbage collectors in many language runtimes rely on POSIX signals to suspend threads.
JavaScriptCore defaults to `SIGUSR1` for this purpose, but many applications rely on `SIGUSR1` for their application logic (most common for things like restarting servers). This is a conflict, which either breaks garbage collection or breaks applications relying on `SIGUSR1`.
Bun now uses `SIGPWR` on Linux, which is the signal originally intended to alert the system that the power to the machine has been cut. This signal is also used by Mono (.NET's runtime) for the same purpose.
Thanks to [@190n](https://github.com/190n) for the contribution!


## [`Bun.SQL` reliability improvements](#bun-sql-reliability-improvements)


We fixed several bugs in Bun's builtin [PostgreSQL client](https://bun.com/docs/api/sql) that could cause queries to hang or fail unexpectedly when executing many different prepared statements simultaneously in certain edge cases.

```
import { sql } from "bun";
// Queries now execute reliably in sequence
const results = await Promise.all([
  sql`SELECT 1`,
  sql`SELECT 2`,
  sql`SELECT 3`,
]);
```

The changes also improve error handling and fixes some cases that could cause failed queries to hang when a connection closes unexpectedly.
Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


## [`$NODE_PATH` support](#node-path-support)


Bun now supports loading node\_modules from paths specified in the `$NODE_PATH` environment variable. This matches Node.js behavior for resolving modules from outside of a parent node\_modules folder.

```
export NODE_PATH="/path/to/global/modules"
```

```
bun run my-script.js
```

Run:

my-script.js

```
// Bun will now check NODE_PATH when resolving imports
import { someModule } from "some-module";
```

Thanks to [@paperclover](https://github.com/paperclover) for the contribution!


## [Fixed: `vite build` regression in Bun v1.2.1](#fixed-vite-build-regression-in-bun-v1-2-1)


The `vite build` command now works correctly again.
In Bun v1.2.1, a small change to the `fs.WriteStream` implementation exposed a bug in Bun's event loop when writing files asynchronously. This bug caused `vite build` to write incorrect or interleaved data in some cases, leading the build to fail. The underlying bug has been fixed, and we've improved our test coverage by writing more unit tests, integration tests, and also adding additional node.js tests to catch similar issues in the future.
We've also added support for automatically flushing pending writes to the filesystem before Bun's process exits, so that the `Bun.file(path).writer()` API no longer needs to call `flush` explicitly to ensure any pending writes are flushed.
Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


## [Fixed: Dynamic imports of "bun" package](#fixed-dynamic-imports-of-bun-package)


Dynamic imports of the "bun" package now work correctly in Vite 6. Previously, using `import("bun")` returned a module that resolved to `{default: globalThis.Bun}` instead of the actual `Bun` object's named exports. At build time, Bun's transpiler automatically rewrites `import("bun")` to `globalThis.Bun`, and that almost always works however Vite 6 bypassed Bun's transpiler which broke this behavior.

```
// Now works correctly
const { SQL, serve, pathToFileURL /* ... */ } = await import("bun");
// Previously returned {default: globalThis.Bun}
```


## [Node.js compatibility improvements](#node-js-compatibility-improvements)



### [Nuxt & Vite 6](#nuxt-vite-6)


The `createRequire()` API now works correctly when resolving from virtual paths that don't exist on disk. This fixes compatibility with Nuxt in Vite 6.

```
const { createRequire } = require("module");
// Virtual path that doesn't exist on disk
const req = createRequire("file:///app/@vue/server-renderer");
const vue = req("vue"); // Now resolves correctly
```

Thanks to [@paperclover](https://github.com/paperclover) for the contribution!


### [pnpm now works with Bun](#pnpm-now-works-with-bun)


Bun now reports `ResolveMessage` and `BuildMessage` errors as native errors, which allows pnpm to run correctly inside Bun. Previously, pnpm would fail due to an assertion checking error types.

```
// This now works properly
const types = require("util").types;
assert(types.isNativeError(resolveMessage)); // Previously failed
```


## [`fs.glob`, `fs.globSync`, and `fs.promises.glob`](#fs-glob-fs-globsync-and-fs-promises-glob)


You can now use glob patterns to find files with `fs.glob`, `fs.globSync`, and `fs.promises.glob`. This matches the Node.js API:

```
import { glob } from "node:fs/promises";
// Find all JavaScript files recursively
for await (const file of glob("/*.js")) {
  console.log(file);
}
// With options
for await (const file of glob("/*.js", {
  cwd: "./src",
  exclude: (path) => path.includes("node_modules"),
})) {
  console.log(file);
}
```

Thanks to [@DonIsaac](https://github.com/DonIsaac) for the contribution!
Note: The implementation currently supports single glob patterns only. Support for array patterns and `withFileTypes` option will be added in future versions.


### [Improved: fs.Dir Compatibility](#improved-fs-dir-compatibility)


The `fs.Dir` implementation now better matches Node.js behavior with improved validation and error handling. The API now throws appropriate errors when attempting to close already-closed directories or pass invalid parameters.

```
import { opendir } from "node:fs";
// Now throws if trying to use a closed directory
const dir = await opendir("./");
await dir.close();
await dir.close(); // Throws ERR_DIR_CLOSED
// Validates callback parameters
dir.read("not a function"); // Throws type error for invalid callback
```

Thanks to [@nektro](https://github.com/nektro) for the contribution!


### [Fixed: DuckDB native module in Bun](#fixed-duckdb-native-module-in-bun)


The DuckDB native module now works correctly in Bun. Previously, it would crash due to a null-returning native module in `napi_register_module_v1`.

```
// Native module that returns null
module.exports = require("./null_addon.node");
```

Thanks to [@190n](https://github.com/190n) for the contribution!


### [Fixed: file:// URL encoding](#fixed-file-url-encoding)


A regression in Bun v1.2.1 caused file:// URLs to incorrectly throw an error when it should not. This has been fixed.


### [Fixed: `node:os` loadavg() values on macOS](#fixed-node-os-loadavg-values-on-macos)


Fixed system CPU load averages reported by `os.loadavg()` on macOS. The values are now accurate and match what's reported by the `uptime` command.

```
const os = require("node:os");
// Now returns accurate values on macOS
console.log(os.loadavg()); // [0.23, 0.15, 0.12]
```

Thanks to [@190n](https://github.com/190n) for the contribution!


### [Reduced memory usage in `fs.readdir` with `withFileTypes`](#reduced-memory-usage-in-fs-readdir-with-withfiletypes)


When using `fs.readdir` with the `withFileTypes` option, memory usage has been reduced by optimizing the internal implementation of the `Dirent` class.

```
const files = await fs.readdir("./", { withFileTypes: true });
console.log(files[0] instanceof fs.Dirent); // true
```

This change affects code that uses `fs.readdir` or `fs.readdirSync` with `withFileTypes: true`. The API behavior remains the same, but uses less memory internally.


### [Fixed: fs.accessSync("../") on Windows](#fixed-fs-accesssync-on-windows)


Bun now correctly handles relative paths containing `../` segments in `node:fs` functions. Previously, path resolution would incorrectly strip these segments when converting to Windows long paths.

```
import * as fs from "node:fs";
// This now correctly resolves "../.." paths
fs.existsSync("../../config");
fs.accessSync("../../config");
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


### [Added: WebSocket exports in node:http](#added-websocket-exports-in-node-http)


`WebSocket`, `CloseEvent`, and `MessageEvent` globals are now re-exported from `node:http` for better Node.js compatibility.

```
const { WebSocket, CloseEvent, MessageEvent } = require("node:http");
// These match the global objects
assert.strictEqual(WebSocket, globalThis.WebSocket);
assert.strictEqual(CloseEvent, globalThis.CloseEvent);
assert.strictEqual(MessageEvent, globalThis.MessageEvent);
```


### [Fixed: memory leak with AbortSignal in node:fs](#fixed-memory-leak-with-abortsignal-in-node-fs)


Fixed a memory leak where `AbortSignal` objects were not being properly dereferenced in `fs.promises.writeFile`, `fs.promises.readFile` and other file system operations when signals were aborted.

```
// Previously leaked memory
const signal = AbortSignal.abort();
try {
  await fs.promises.readFile("file.txt", { signal });
} catch (e) {}
// Also fixed for later aborts
const controller = new AbortController();
const signal = controller.signal;
const promise = fs.promises.writeFile("file.txt", "data", { signal });
controller.abort();
try {
  await promise;
} catch (e) {}
```


## [CSS parser improvements](#css-parser-improvements)



### [Floating point precision](#floating-point-precision)


Printing floats in CSS has been changed to print to 6 decimal places in all cases (previously this only happened conditionally). This allows smaller bundle sizes with negligible loss in precision.


### [Updated vendor prefixing](#updated-vendor-prefixing)


At Bun's compilation time, Bun's CSS parser internally uses the [`autoprefixer`](https://github.com/postcss/autoprefixer) library to generate Zig code which vendor prefixes CSS properties. This has been updated to the latest version.


### [Stability improvements](#stability-improvements)


Over 275 tests have been added to imporove the reliability and stability of the CSS parser and several subtle bugs have been fixed.


## [More bugfixes](#more-bugfixes)



### [Improved: S3 Multipart Upload reliability](#improved-s3-multipart-upload-reliability)


We fixed an edgecase in Bun's S3 multipart upload implementation that could cause the process to crash in certain cases.


### [Fixed: `Bun.deepEquals` on empty objects with same prototype](#fixed-bun-deepequals-on-empty-objects-with-same-prototype)


`Bun.deepEquals` now correctly compares objects that share the same prototype but have different internal types. This fixes an edge case discovered in the Node.js test suite.

```
function FakeDate() {}
FakeDate.prototype = Date.prototype;
const a = new Date("2016");
const b = new FakeDate();
// Now correctly returns false in both directions
console.log(Bun.deepEquals(a, b)); // false
console.log(Bun.deepEquals(b, a)); // false
```

This also affects comparisons between objects with numeric property names and TypedArrays:

```
const a = { 0: 5, 1: 6, 2: 7 };
const b = new Uint8Array([5, 6, 7]);
console.log(Bun.deepEquals(a, b)); // was true, now false
```

Finally, because our `expect(...).toEqual()` implementation relies on `Bun.deepEquals`, this change also makes our test system more strict and aligns it more closely with Jest.
Thanks to [@DonIsaac](https://github.com/DonIsaac) for the contribution!


### [Fixed: require("my-virtual-module").default](#fixed-require-my-virtual-module-default)


The `loader: "object"` plugin now correctly handles the `__esModule` property when importing modules. This brings the behavior in line with CommonJS module loading.

```
// Plugin configuration
builder.module("my-module", () => {
  return {
    exports: {
      default: "hello",
      __esModule: true,
    },
    loader: "object",
  };
});
// Now works correctly
import myModule from "my-module";
console.log(myModule); // "hello"
// And with require
const myModule = require("my-module");
console.log(myModule); // "hello"
```

An assertion failure that could occur when handling invalid Semver versions with extra wildcards during package installation has been fixed.

```
// These no longer trigger an assertion failure
{
  "dependencies": {
    "package": "1.2.3x",
    "package2": "1.2x.3",
    "package3": "1x.2.3",
  }
}
```

Thanks to [@DonIsaac](https://github.com/DonIsaac) for the contribution!


### [Fixed: `bun init -h` shows help text](#fixed-bun-init-h-shows-help-text)


The `-h` shorthand flag for `bun init` command now correctly shows the help text, matching the behavior of `--help`.

```
bun init -h
```

Thanks to [@riskymh](https://github.com/riskymh) for the contribution!


### [Thanks to 12 contributors!](#thanks-to-12-contributors)


-   [@190n](https://github.com/190n)
-   [@aiellochan](https://github.com/aiellochan)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@donisaac](https://github.com/donisaac)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@msutkowski](https://github.com/msutkowski)
-   [@nektro](https://github.com/nektro)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)
-   [@riskymh](https://github.com/riskymh)
-   [@zackradisic](https://github.com/zackradisic)