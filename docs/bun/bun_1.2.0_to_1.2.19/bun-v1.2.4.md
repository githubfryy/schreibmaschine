This release makes Bun.build up to 60% faster on macOS, introduces codesigning support for single-file executables on macOS, improves dev server stability, fixes a regression from v1.2.3 affecting Hono, fixes a regression from v1.2.3 affecting `bun init` on Windows, fixes a bug where stdin streams that were paused immediately would prevent the process from exiting, fixes a bug where `Buffer.prototype.indexOf` could return incorrect results when searching for number values with a byte offset, and fixes a bug where `net.Socket` error handlers could receive `JSC::Exception` objects instead of `Error` instances.


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


## [Bun.build gets up to 60% faster on macOS](#bun-build-gets-up-to-60-faster-on-macos)


Bun now uses a dedicated I/O threadpool for file operations during builds on macOS and Windows, significantly improving build performance. This addresses filesystem contention issues that were slowing down builds on these platforms.
This optimization is automatically enabled on macOS and Windows systems with more than 3 logical CPUs, where it provides the most benefit.


## [Codesign single-file executables on macOS](#codesign-single-file-executables-on-macos)


Previously, the executables produced for macOS by `bun build --compile` could not be code signed, due to an issue with our code handling the Mach-O executable format. Now, these executables can be code signed.
Learn how to [codesign compiled executables on macOS](https://bun.com/guides/runtime/codesign-macos-executable).


## [Fixed: bun init ↑↓ on Windows](#fixed-bun-init-on-windows)


The `bun init` command now works properly on Windows with full support for keyboard navigation. Arrow keys (up/down) work correctly for navigating options, Enter works for selection, and Ctrl+C works to cancel the operation.

```
PS C:\Users\bun\project> bun init
? Select a project template - Press return to submit.
    Blank
    React
❯   Library
```

Thanks to [@pfgithub](https://github.com/pfgithub) for the contribution!


## [Fixed: Regression from v1.2.3 affecting Hono](#fixed-regression-from-v1-2-3-affecting-hono)


When using Hono with Bun, some applications that `export default` a Hono instance would fail to start with an argument validation error for `routes` in Bun.serve due to a name conflict with the `routes` option in Hono. We've added a workaround and integration tests to avoid introducing regressions that affect Hono in the future.

```
import { Hono } from "hono";
const app = new Hono();
app.get("/", (c) => c.text("Hello World!"));
export default app; // Now works properly with Bun.serve
```


## [Node.js compatibility](#node-js-compatibility)



### [Fixed: Stat assertion failure on Windows](#fixed-stat-assertion-failure-on-windows)


We fixed a bug that in certain cases caused an assertion failure when calling `stat` in node:fs on Windows.

```
import { stat } from "node:fs/promises";
const stats = await stat("large-file.txt");
console.log(stats.size, stats.mtime);
```


### [Fixed: `net.Socket` error handling](#fixed-net-socket-error-handling)


A bug has been fixed in `node:net` socket error handling where bare `JSC::Exception` objects could be passed to JavaScript code. `JSC::Exception` is a class used internally by the JavaScript engine, and these objects exhibit strange behavior if they are passed to JavaScript code. Now, all exception objects are properly converted to JavaScript `Error` instances before being passed to error handlers.

```
const socket = new net.Socket();
socket.on("error", (err) => {
  console.log(err instanceof Error); // Now always true
});
```

Thanks to [@heimskr](https://github.com/heimskr) for fixing this!


### [`net.SocketAddress`](#net-socketaddress)


Bun now exposes the `SocketAddress` class matching Node.js' API, providing a way to represent and manipulate IP socket addresses.

```
import { SocketAddress } from "node:net";
const addr = SocketAddress.parse("[0::1]:1234");
// ipv6 ::1 1234
console.log(addr.family, addr.address, addr.port);
```

Thanks to [@DonIsaac](https://github.com/DonIsaac) for the contribution!


### [`Buffer` fixes](#buffer-fixes)



#### Fixed: `Buffer.prototype.indexOf` for number values with `byteOffset`


While improving our Node.js test coverage for `Buffer`, we introduced a bug in Bun v1.2.3 that affected `Buffer.prototype.indexOf` when searching for number values with a byte offset. This has been fixed to properly handle number searches by considering the byte offset, matching Node.js behavior. We've also submitted a PR to Node.js to improve their test coverage for this case (and ours by using their tests).

```
const buffer = Buffer.from("abcdef");
// Searching for character codes (numbers) now works correctly
buffer.indexOf(100, 2); // Returns 3 (byte value 100 = 'd' found at index 3)
buffer.indexOf(102, 5); // Returns 5 (byte value 102 = 'f' found at index 5)
buffer.indexOf(102, -1); // Returns 5 (negative offset searches from the end)
buffer.indexOf(102, 6); // Returns -1 (searching past the end of buffer)
```

Thanks to [@nektro](https://github.com/nektro) for the fix!


### [Fixed: process.argv in --print and --eval modes](#fixed-process-argv-in-print-and-eval-modes)


The `bun --print` and `bun --eval` commands (or `-p` and `-e`) no longer include `[eval]` in the `process.argv` array. Previously, this was included between the path to the Bun executable and the actual command-line arguments in place of the name of the JavaScript file being run. Now, there is no extra argument in this position which matches Node.js's behavior.

```
// Previously
$ bun --print "process.argv" arg1 arg2
["/path/to/bun", "/your/cwd/[eval]", "arg2"]
// Now (matching Node.js)
$ bun --print "process.argv" arg1 arg2
["/path/to/bun", "arg1", "arg2"]
```

Thanks to [@RiskyMH](https://github.com/RiskyMH) for the contribution!


### [Fixed: hang when calling `pause()` on `process.stdin`](#fixed-hang-when-calling-pause-on-process-stdin)


We fixed a bug where stdin streams that were paused immediately would prevent the process from exiting. This affected `readline` and other packages.

```
process.stdin.on("data", () => {});
process.stdin.pause();
// previously: the process would never exit
// now: the process exits
```

Thanks to [@pfgithub](https://github.com/pfgithub) for the fix!


## [Other improvements](#other-improvements)



### Fixed: Binary data types in PostgreSQL


Bun's PostgreSQL client now correctly handles binary data types and custom type OIDs. This resolves issues with binary format detection and custom data types when using the SQL API.

```
// Binary data and custom types are now properly handled
const result = await sql`SELECT bytea_column, custom_type_column FROM my_table`;
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Faster `array.includes`](#faster-array-includes)


WebKit [rewrote `Array.prototype.includes` in native C++ code](https://github.com/WebKit/WebKit/pull/40613), and this makes `Array.prototype.includes` 1.2 to 2.8 times faster in microbenchmarks.
This rewrite allows DFG and FTL (JavaScriptCore's optimizing JIT compilers, which convert JavaScript into native machine code to execute it as fast as possible) to leverage the fast native implementation (similar to `Array.prototype.indexOf`).
Thanks to [@sosukesuzuki](https://github.com/sosukesuzuki) for this contribution!


### [Dev server stability improvements](#dev-server-stability-improvements)


This release contains several stability improvements for Bun's new development server introduced in 1.2.3. We're excited to keep improving the development experience with Bun in future releases.
Thanks to [@paperclover](https://github.com/paperclover) for the fixes!


### [`define` support in `bunfig.toml` for static files](#define-support-in-bunfig-toml-for-static-files)


You can now set the `define` option in the `[serve.static]` section of `bunfig.toml` to inline constants into static files. This works the same way as [the existing runtime option](https://bun.com/docs/runtime/bunfig#define). Unlike environment variables, defines support arbitrary JSON, not just strings.

bunfig.toml

```
[serve.static]

# outer quotes for TOML, inner quotes for JavaScript

define = { CONFIG = "{ \"version\": \"1.0\", \"beta\": false }" }
```

index.html

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bun</title>
  </head>
  <body>
    <script src="index.ts"></script>
  </body>
</html>
```

index.ts

```
// Logs "Hello from app 1.0"
console.log("Hello from app " + CONFIG.version);
if (CONFIG.beta) {
  console.log("enable beta features!");
}
```

```
$ bun index.html
 DEV  Bun v1.2.4 ready in 6.66 ms
➜ http://localhost:3000/
Press h + Enter to show shortcuts
Bundled page in 1ms: index.html
```

Thanks to [@paperclover](https://github.com/paperclover) for adding this feature!


### [Improved accessibility in `bun init` templates](#improved-accessibility-in-bun-init-templates)


The React templates created by `bun init` now respect the `prefers-reduced-motion` media query by disabling all animations when enabled. This improves accessibility for users who are sensitive to motion or have vestibular disorders.

```
@media (prefers-reduced-motion) {
  *,
  ::before,
  ::after {
    animation: none !important;
  }
}
```

Thanks to [@jakeboone02](https://github.com/jakeboone02) for the contribution!


### [`bun pm pack --filename`](#bun-pm-pack-filename)


We've added support for the `--filename` flag in `bun pm pack`, allowing you to specify the name of the output tarball. The value is relative to the project root and can include subdirectories.

```

# output to ./lodash-4.tgz

```

```
bun pm pack --filename lodash-4.tgz
```

```

# output to ./build/lodash-4.tgz

```

```
bun pm pack --filename build/lodash-4.tgz
```

Thanks to [@versecafe](https://github.com/versecafe) for implementing this!


### [Updated SQLite to 3.49.1](#updated-sqlite-to-3-49-1)


Bun now includes SQLite 3.49.1, bringing the latest improvements and bug fixes from the SQLite project to Bun's built-in SQLite implementation.

```
import { Database } from "bun:sqlite";
const db = new Database(":memory:");
console.log(db.prepare("SELECT sqlite_version()").get());
// { "sqlite_version()": "3.49.1" }
```

You can read the [SQLite 3.49.1 release notes](https://www.sqlite.org/releaselog/3_49_1.html) for more information on the changes. On macOS, Bun continues to use the system-provided SQLite by default, which generally improves performance.


## [Bug fixes](#bug-fixes)



### [Fixed: Error handling for invalid JSON imports](#fixed-error-handling-for-invalid-json-imports)


Bun v1.2.3 regressed error handling for invalid JSON imports.

```
// This now produces a proper error
import data from "./invalid.json";
// Or with require()
const data = require("./invalid.json");
```

We've improved test coverage for JSON imports and added a fix to properly handle invalid JSON files.
Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


### [Fixed: Glob pattern parsing for nested braces](#fixed-glob-pattern-parsing-for-nested-braces)


The glob pattern matcher in Bun now correctly handles nested braces in pattern expressions. This fixes an issue where patterns with nested brace expressions like `{a,{d,e}b}/c` would not match correctly.

```
// Previously didn't work correctly
const glob = new Glob("{a,{d,e}b}/c");
// Now correctly matches
expect(glob.match("a/c")).toBeTrue();
```

Thanks to [@shulaoda](https://github.com/shulaoda) for the contribution!


### [Thanks to 17 contributors!](#thanks-to-17-contributors)


-   [@190n](https://github.com/190n)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@daniellionel01](https://github.com/daniellionel01)
-   [@donisaac](https://github.com/donisaac)
-   [@dy0gu](https://github.com/dy0gu)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@gbbelloponce](https://github.com/gbbelloponce)
-   [@heimskr](https://github.com/heimskr)
-   [@jakeboone02](https://github.com/jakeboone02)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@nektro](https://github.com/nektro)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)
-   [@pranav2612000](https://github.com/pranav2612000)
-   [@riskymh](https://github.com/riskymh)
-   [@shulaoda](https://github.com/shulaoda)
-   [@versecafe](https://github.com/versecafe)