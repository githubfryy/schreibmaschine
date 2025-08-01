This release fixes 50 issues (addressing 80 👍), and adds +24 passing Node.js tests. Ahead-of-time bundling for HTML imports, more reliable Bun Shell, `setTimeout` and `setImmediate` use 8-15% less memory, `columnTypes` & `declaredTypes` in `bun:sqlite`, `bun info` is the new `bun pm view`, Node.js compatibility improvements to `child_process.fork`, `fs.glob` options are now optional, `tls.getCACertificates()` is now implemented, `bun init` generates `CLAUDE.md` when claude code is installed, and more.


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


## [Ahead-of-time bundling for HTML imports](#ahead-of-time-bundling-for-html-imports)


[HTML imports](https://bun.sh/docs/bundler/html) in Bun now support ahead of time bundling in server-side code.
That means you can now use `bun build` to bundle a full-stack application by importing an `.html` file directly into your server-side code. Bun will parse the HTML, bundle any referenced client-side JavaScript (`<script src>`) and CSS (`<link rel="stylesheet">`), and automatically configure the server to serve all the bundled assets.
This eliminates runtime bundling overhead in production. When combined with the `--compile` flag, you can create a single, self-contained executable for your entire application, frontend and backend included. The development workflow remains unchanged; running your server with `bun --hot` will still provide on-demand bundling and Hot Module Replacement.

src/server.ts

```
import { serve } from "bun";
import homePage from "./index.html";
// This server will serve the HTML file and all its bundled assets.
serve({
  routes: {
    "/": homePage,
  },
});
```

src/index.html

```
<!DOCTYPE html>
<html>
  <head>
    <title>My Full-Stack App</title>
    <link rel="stylesheet" href="./style.css" />
  </head>
  <body>
    <h1>Hello, Bun!</h1>
    <script src="./client.ts" type="module"></script>
  </body>
</html>
```

src/client.ts

```
console.log("Hello from the client-side script!");
```

src/style.css

```
body {
  background-color: #f0f0f0;
}
```

To create a full-stack production build, run `bun build` with the `--target=bun` flag.

```
bun build ./src/server.ts --target=bun  --outdir ./dist
```

To create a full-stack self-contained executable, run `bun build` with the `--compile` flag.

```
bun build ./src/server.ts --compile --outfile=my-app
```

```

# Run via ./my-app

```

Previously, HTML imports were only supported at either runtime or as entry points. You couldn't mix server-side and client-side code in the same build. You had to do it at runtime. Now you can do it at build time.
And also, it's fast.


## [Bun Shell reliability improvements](#bun-shell-reliability-improvements)


Bun's [cross-platform bash-like shell](https://bun.sh/docs/runtime/shell), `Bun.$`, no longer uses the native call stack for execution, preventing stack overflow errors in deeply-nested or complex shell scripts. This was a large refactor of the shell's internals.
Thanks to @zackradisic for the contribution
An internal optimization to how Bun manages Strong references to JavaScript values from native code reduced the memory footprint for each `setTimeout` and `setImmediate` call. By removing a layer of pointer indirection, Bun now uses 8% to 15% less RAM for each timer, improving performance in applications with many concurrent timers.

```
// Each of these timers now consumes less memory.
for (let i = 0; i < 10000; i++) {
  setTimeout(() => {
    // ...
  }, 1000);
}
```


## [`columnTypes` & `declaredTypes` in `bun:sqlite`](#columntypes-declaredtypes-in-bun-sqlite)


The `Statement` object in `bun:sqlite` now has two new properties for introspecting column types: `declaredTypes` and `columnTypes`.
`stmt.declaredTypes` returns an array of type strings as defined in your `CREATE TABLE` schema. For expressions or computed columns not backed by the schema, the value in the array will be `null`.
`stmt.columnTypes` returns an array of type strings based on the actual values in the first row of the result set. This is particularly useful for determining the type of computed columns. These additions are a key step toward enabling a Prisma driver adapter for `bun:sqlite`.

```
import { Database } from "bun:sqlite";
const db = new Database(":memory:");
db.run("CREATE TABLE users (id INTEGER, name TEXT)");
db.run("INSERT INTO users (id, name) VALUES (1, 'Alice')");
const stmt = db.query("SELECT id, name FROM users LIMIT 1");
// .get() must be called to populate the statement before accessing these properties
stmt.get();
// Types from the `CREATE TABLE` schema
// Note: `
console.log(stmt.declaredTypes);
// => ["INTEGER", "TEXT"]
// Types from the actual values in the first row
console.log(stmt.columnTypes);
// => ["INTEGER", "TEXT"]
```

Thanks to @crishoj for the contribution!


## [`bun info` is the new `bun pm view`](#bun-info-is-the-new-bun-pm-view)


The `bun pm view` command has been renamed to the more intuitive `bun info`, which was reserved for this usecase originally. This command fetches and displays package metadata from the npm registry, such as its description, versions, and dependencies. The previous `bun pm view` command is preserved as an alias for backward compatibility.
You can also query for specific top-level or nested fields in a package's `package.json`.

```
// View basic package information
$ bun info react
react@18.2.0 | MIT | 3 dependencies
React is a JavaScript library for building user interfaces.
https://react.dev/
// Get a specific field, like the latest version
$ bun info react version
// "18.2.0"
// Get a nested field
$ bun info react repository.url
// "git+https://github.com/facebook/react.git"
// The old command still works as an alias
$ bun pm view react
```


## [`bun init` + Claude Code](#bun-init-claude-code)


When you run `bun init`, Bun will now automatically generate a `CLAUDE.md` file if the `claude` CLI tool is detected in your `PATH`. This file provides contextual instructions to AI coding assistants like Anthropic's Claude, which helps improve the quality of its suggestions for your project.
If you also use the Cursor editor, `bun init` will intelligently create a `CLAUDE.md` file and symlink Cursor's rule file (`.cursor/rules/`) to it. This helps keep your AI instructions consistent across different tools.
You can disable this behavior by setting the `BUN_AGENT_RULE_DISABLED` or `CLAUDE_CODE_AGENT_RULE_DISABLED` environment variables.


## [Node.js compatibility improvements](#node-js-compatibility-improvements)



### [`child_process.fork()` now supports `execArgv`](#child-process-fork-now-supports-execargv)


The `execArgv` option in `child_process.fork()` is now correctly implemented, improving Node.js compatibility. This allows you to pass command-line arguments to the forked Bun process. Previously, this option was ignored.
Additionally, the Node.js-specific `process._eval` property is now supported. It contains the code string when Bun is run with the `-e` or `--eval` flags.

```
// parent.js
import { fork } from "child_process";
// Fork a new Bun process. The first argument is the module path.
// The `execArgv` option passes arguments to the new `bun` process.
const child = fork("./child.js", {
  execArgv: ["--smol", "--hot"],
});
child.on("message", (message) => {
  console.log("Message from child:", message);
  // => Message from child: [ '--smol', '--hot' ]
});
```

```
// child.js
// The child process receives the arguments in `process.execArgv`.
process.send(process.execArgv);
```

Thanks to @riskymh for the contribution


### [Zstandard (zstd) support in `node:zlib`](#zstandard-zstd-support-in-node-zlib)


Bun's built-in `node:zlib` module now supports Zstandard (zstd) compression and decompression. This includes the synchronous, asynchronous, and streaming APIs. Zstandard is a fast lossless compression algorithm, providing high compression ratios.
Thanks to @nektro for the contribution


### [`fs.glob` options are now optional](#fs-glob-options-are-now-optional)


The `options` argument for `fs.glob`, `fs.promises.glob`, and `fs.globSync` is now optional, aligning Bun's behavior with Node.js. Previously, an error would be thrown if the `options` argument was omitted.

```
import { globSync } from "node:fs";
// This previously threw an error in Bun.
// It now works, just like in Node.js.
const files = globSync("*.js");
console.log(files);
```

Thanks to @riskymh for the contribution


### [`tls.getCACertificates()` is now implemented](#tls-getcacertificates-is-now-implemented)


The `tls.getCACertificates()` function from Node.js is now implemented in Bun. It returns an array of trusted root CA certificates in PEM format that are bundled with Bun.
This is useful for inspecting the root certificates Bun uses for establishing secure TLS connections. Note that loading system-wide CA certificates is not yet supported.

```
import { getCACertificates } from "node:tls";
const certs = getCACertificates();
// Logs the number of bundled CA certificates
console.log(`Loaded ${certs.length} CA certificates.`);
// Each element is a certificate in PEM format
console.log(certs[0]);
// -----BEGIN CERTIFICATE-----
// MIIDdzCCAl+gAwIBAgIBADANBgkqhkiG9w0BAQsFADBdMQswCQYDVQQGEwJVUzEX
// ...
// -----END CERTIFICATE-----
```

Thanks to @pfgithub for the contribution


### [Customize unhandled promise rejection behavior with `--unhandled-rejections`](#customize-unhandled-promise-rejection-behavior-with-unhandled-rejections)


Bun now supports the Node.js-compatible `--unhandled-rejections` command-line flag. This allows you to configure how the runtime handles promises that are rejected without a `.catch()` handler, providing finer-grained control for debugging and improving compatibility with Node.js applications.
The following modes are supported:

-   `throw`: Raise an uncaught exception, immediately terminating the process.
-   `strict`: Raise an uncaught exception. If the promise is handled later, the `rejectionHandled` event is emitted on `process`, but the process will still exit with a non-zero code.
-   `warn`: Print a warning to stderr but allow the process to continue execution. This is the default in modern Node.js.
-   `none`: Silently ignore unhandled rejections.

Bun's default behavior remains unchanged. As part of this change, the `process.on('rejectionHandled', ...)` event is now also supported.

```
// file: unhandled.js
const promise = Promise.reject(new Error("Something went wrong!"));
// Run this file with different flags to observe the behavior.
// Throws an exception and exits with a non-zero exit code.
// $ bun --unhandled-rejections=throw unhandled.js
// error: Uncaught Error: This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason "Error: Something went wrong!".
// ...
// Prints a warning and continues execution.
// $ bun --unhandled-rejections=warn unhandled.js
// (bun:87363) UnhandledPromiseRejectionWarning: Error: Something went wrong!
//     at unhandled.js:2:23
// (Use `bun --trace-warnings ...` to show where the warning was created)
// (bun:87363) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). To terminate the process on unhandled promise rejection, use the CLI flag `--unhandled-rejections=throw` or `process.on('unhandledRejection', (err) => { throw err; })`. (rejection id: 1)
// Exits silently with a zero exit code.
// $ bun --unhandled-rejections=none unhandled.js
```

Thanks to @pfgithub for the contribution


## [JavaScriptCore upgrade](#javascriptcore-upgrade)


This release also upgrades JavaScriptCore, bringing several performance improvements thanks to the JavaScriptCore team.


#### String Operations


-   Patterns like `str += str` now generate more efficient code in the JIT compiler
-   `String.prototype.charCodeAt()` and `charAt()` are now folded at JIT compile-time when both the string and index are constants, eliminating runtime operations.
-   String type tracking improvements: JavaScriptCore's DFG JIT now tracks rope strings vs resolved strings, enabling more aggressive optimizations and avoiding unnecessary string resolution checks.
-   Patterns like `obj["prefix" + variable]` get special treatment in the JIT compiler, where one part of the string concatenation is constant.


#### Array Operations


-   Fast path for `[Symbol.toPrimitive]("Array")`
-   `Array.prototype.toReversed()` optimization: Improved performance when reversing arrays that contain holes by using more efficient algorithms.


#### Number and Math Operations


-   `Number.isSafeInteger` is now JIT compiled, which makes it about 16% faster in microbenchmarks
-   `Math.sumPrecise` implements Radford M. Neal's xsum algorithm with a large superaccumulator for arrays with more than 1,000 elements, which is 10% faster on large datasets
-   `Math.hypot` avoids unnecessary vector allocation when called with no arguments


#### JSON Stringification


-   Zero-copy JSON stringifier: The fast JSON stringifier now adopts dynamically allocated buffers directly without copying when converting to strings, eliminating memory allocation and copying for large JSON strings.


#### Optimizer improvements


-   The integer range optimizer now handles `CheckInBounds` operations with constant bounds and provides range analysis for `ArithBitAnd` operations with constant masks, enabling elimination of more runtime bounds checks.
-   Megamorphic inline cache for `in` operator now uses a threshold-based approach


#### Security Hardening


-   Eliminated semi-pinned register vulnerability in JavaScriptCore's WebAssembly In-Place Interpreter by removing the instruction base register and using dynamic base address calculation.
-   Added proper bounds checking for SIMD prefix opcodes.
-   Added additional security checks to ensure SIMD opcodes are always less than 0x100.


## [Bugfixes](#bugfixes)


Package manager bugfixes:

-   `bun audit` now respects proxy settings via `HTTP_PROXY` and `HTTPS_PROXY` environment variables
-   A potential infinite loop when installing packages in projects with a very large number of dependencies has been fixed

Parser bugfixes:

-   TypeScript non-null assertions with the `new` operator: `new obj!.a()` work as expected
-   Nested objects in macros that contain numeric property keys now work as expected
-   `require.main === module` with `--target=node` was incorrectly rewritten to `require.main === require.module`. Now it's preserved as expected.

Bundler bugfixes:

-   `bun build --compile` is slightly smarter about picking a default output filename. Previously, if the input file was named `index`, it would pick the directory name as the output filename, which meant `./src/index.ts` would attempt to save to `./src`, which was a directory and not a file - leading it to fail. Now it will detect that the path was a directory and will save to `./src/index` (without the extension) instead.
-   A missing `async` in function declarations when top-level await is present in circular dependencies has been fixed
-   A regression from Bun v1.2.16 causing the displayed output filename in the embedded `--compile` binary to be incorrect has been fixed

Runtime bugfixes:

-   Fixed a rare crash in `Bun.spawn`
-   Fixed a crash in `bun:ffi` with pointers encoded as 32 bit integers
-   Several missing JavaScript exception checks in native code have been added, along with an automated way of detecting missing exception checks to prevent regressions in the future
-   Strong references to native values avoid extra memory allocations

Misc:

-   Windows icon is now properly set in the executable
-   `bunx` now works on Windows when installed with `npm`
-   `bun init --react=tailwind` now logs the server URL to the console when the development server starts
-   A console warning in Bun's runtime error page has been fixed


### [Thanks to 15 contributors!](#thanks-to-15-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@berzanorg](https://github.com/berzanorg)
-   [@crishoj](https://github.com/crishoj)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@familyboat](https://github.com/familyboat)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@micmelesse](https://github.com/micmelesse)
-   [@nektro](https://github.com/nektro)
-   [@pfgithub](https://github.com/pfgithub)
-   [@pxseu](https://github.com/pxseu)
-   [@riskymh](https://github.com/riskymh)
-   [@ssahillppatell](https://github.com/ssahillppatell)
-   [@sunsettechuila](https://github.com/sunsettechuila)
-   [@zackradisic](https://github.com/zackradisic)