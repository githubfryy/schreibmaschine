Bun is the complete toolkit for building and testing full-stack JavaScript and TypeScript applications. If you're new to Bun, you can learn more from the [Bun 1.0](https://bun.com/blog/bun-v1.0#bun-is-an-all-in-one-toolkit) blog post.


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


## [`bun install --linker=isolated`](#bun-install-linker-isolated)


> In the next version of Bun
> bun install --linker=isolated brings pnpm-style isolated, symlinked node\_modules to bun install.
> This is a big improvement for using bun install in monorepos. [pic.twitter.com/85MG1HYslu](https://t.co/85MG1HYslu)
> 
> — Bun (@bunjavascript) [July 17, 2025](https://twitter.com/bunjavascript/status/1945745238490071321?ref_src=twsrc%5Etfw)

Isolated installs also yield significant performance improvements on Windows.


## [`bun update --interactive`](#bun-update-interactive)



## [`bun pm pkg` helps you manage `package.json`](#bun-pm-pkg-helps-you-manage-package-json)


A new command, `bun pm pkg`, has been introduced for programmatically managing your `package.json` file. This command simplifies scripting and automating changes to your project's configuration.
It supports four subcommands:

-   `get`: Retrieve one or more values.
-   `set`: Add or update key-value pairs.
-   `delete`: Remove keys.
-   `fix`: Automatically correct common errors.

You can access nested fields using dot notation (`scripts.build`) or bracket notation for keys with special characters (`scripts['test:watch']`).

```

# Get a single property

```

```
bun pm pkg get name
```

```

# Get multiple properties

```

```
bun pm pkg get name version
```

```

# Set a simple property

```

```
bun pm pkg set name="my-package"
```

```

# Set multiple properties, including a nested one

```

```
bun pm pkg set scripts.test="jest" version=2.0.0
```

```

# Delete a single property

```

```
bun pm pkg delete description
```

```

# Delete multiple nested properties

```

```
bun pm pkg delete scripts.test contributors[0]
```

Thanks to [@riskymh](https://github.com/riskymh) for the contribution!


### [Faster `bun install` in workspaces](#faster-bun-install-in-workspaces)


A bug that caused workspace packages to be re-evaluated multiple times during the installation process has been fixed. This results in faster and more reliable installations in monorepos that use Bun workspaces.
Thanks to [@dylan-conway](https://github.com/dylan-conway) for the improvement!


#### devDependencies > optionalDependencies > dependencies > peerDependencies


Ambiguity in the dependency resolution logic has been fixed that could cause an unexpected version of a package to be installed when the same package listed in multiple dependency groups, such as `dependencies` and `devDependencies`. The dependency resolution priority has been adjusted to `devDependencies` > `optionalDependencies` > `dependencies` > `peerDependencies`.
What are we supposed to do in a scenario like this?

package.json

```
{
  "dependencies": {
    "react": "18.2.0"
  },
  "devDependencies": {
    "react": "18.3.0"
  },
  "peerDependencies": {
    "react": "18.2.1"
  }
}
```

The correct answer: what other package managers do, as the status quo is least likely to break applications.


## [`bun pm pack` gets a `--quiet` flag](#bun-pm-pack-gets-a-quiet-flag)


The `bun pm pack` command now supports a `--quiet` flag. When used, it suppresses all verbose output and only prints the resulting tarball's filename to `stdout`. This is particularly useful for scripting and automation workflows where you need to capture the filename.

```

# Default output is verbose

```

```
bun pm pack
```

```
bun pack v1.2.18
packed 131B package.json
packed 40B index.js
my-package-1.0.0.tgz
Total files: 2
Shasum: f2451d6eb1e818f500a791d9aace80b394258a90
Unpacked size: 171B
Packed size: 249B

# --quiet makes it easy to capture the filename in a script

```

```
TARBALL=$(bun pm pack --quiet)
```

```
echo "Created: $TARBALL"
```

```

# > Created: my-package-1.0.0.tgz

```


### [`link-workspace-packages` and `save-exact` from `.npmrc`](#link-workspace-packages-and-save-exact-from-npmrc)


`bun install` and `bun add` now read and apply the `link-workspace-packages` and `save-exact` settings from your project's `.npmrc` file. This allows for more granular control over dependency management, consistent with other package managers.
For example, to always save exact versions instead of using a `^` prefix, you can set `save-exact=true`.

```

# ./.npmrc

save-exact=true
```

```

# With the .npmrc file above...

```

```
bun add is-odd
```

```

# ...bun adds the exact version to package.json


# "dependencies": {


#   "is-odd": "3.0.1"


# }

```


## [`bun why` explains why a package is installed](#bun-why-explains-why-a-package-is-installed)


To help you debug your `node_modules` directory, Bun now includes the `bun why <package>` command. It traces the dependency chain that leads to a package being installed, showing you exactly why it's part of your project.
The command supports glob patterns for querying multiple packages at once—such as `bun why "@types/*"`—and flags like `--depth` and `--top` to control the output's verbosity.

```
// See the dependency path to a package
$ bun why react
react@18.2.0
  └─ my-app@1.0.0 (requires ^18.0.0)
// Use glob patterns to query multiple packages
$ bun why "@types/*"
@types/react@18.2.15
  └─ dev my-app@1.0.0 (requires ^18.0.0)
@types/react-dom@18.2.7
  └─ dev my-app@1.0.0 (requires ^18.0.0)
```

Thanks to [@riskymh](https://github.com/riskymh) for the contribution!


### [Top-level `catalog` and `catalogs` in `package.json`](#top-level-catalog-and-catalogs-in-package-json)


To simplify configuration, `bun install` now supports defining dependency [catalogs](https://bun.sh/docs/install/catalogs) at the top-level of your root `package.json`. Previously, these fields had to be nested inside the `workspaces` object, which could be unintuitive. Now, you can declare them at the root level for a cleaner setup.

```
// package.json
{
  "name": "my-monorepo",
  "workspaces": ["packages/*"],
  // `catalog` and `catalogs` can now be defined at the top-level
  // instead of being nested inside the `workspaces` object.
  "catalog": {
    "react": "18.2.0"
  },
  "catalogs": {
    "testing": {
      "@testing-library/react": "16.0.0",
    }
  }
}
```


## [VS Code Test Explorer Integration](#vs-code-test-explorer-integration)


The official Bun VS Code extension now integrates with the native Test Explorer UI. `bun test` can now communicate with the extension to report test discovery, progress, and results.

> In the next version of Bun's VSCode extension
> 'Test Explorer' is implemented, proactively showing tests with bun test in the UI. This gif is at 1x speed. [pic.twitter.com/mkRMm7Md1x](https://t.co/mkRMm7Md1x)
> 
> — Bun (@bunjavascript) [July 15, 2025](https://twitter.com/bunjavascript/status/1944930682855415978?ref_src=twsrc%5Etfw)

Thanks to [@riskymh](https://github.com/riskymh) for the contribution!


## [Compact output for AI agents](#compact-output-for-ai-agents)


`bun test` output is more compact when run in AI agents like Claude Code, conserving context window.

> In the next version of Bun
> bun test output is more compact when run in ai agents like Claude Code, conserving context window [pic.twitter.com/VzGIk0vhgP](https://t.co/VzGIk0vhgP)
> 
> — Jarred Sumner (@jarredsumner) [July 18, 2025](https://twitter.com/jarredsumner/status/1946052520130076694?ref_src=twsrc%5Etfw)


## [`$variable` substitution in `test.each`](#variable-substitution-in-test-each)


`bun test` now supports variable substitution in `test.each` titles. This allows you to create more descriptive test names by directly referencing properties from each test case object, including nested properties. This aligns `bun:test` with the popular API used by Jest and Vitest, and is often more readable than using printf-style format specifiers.

```
import { test, expect } from "bun:test";
const testCases = [
  { user: { name: "Alice" }, a: 1, b: 2, expected: 3 },
  { user: { name: "Bob" }, a: 5, b: 5, expected: 10 },
];
// The test runner will generate titles like:
// ✓ Add 1 and 2 for Alice
// ✓ Add 5 and 5 for Bob
test.each(testCases)("Add $a and $b for $user.name", ({ a, b, expected }) => {
  expect(a + b).toBe(expected);
});
```

Thanks to [@riskymh](https://github.com/riskymh) for the contribution!


### [Ignore files in test coverage reports with `test.coveragePathIgnorePatterns`](#ignore-files-in-test-coverage-reports-with-test-coveragepathignorepatterns)


You can now exclude files from test coverage reports using the new `test.coveragePathIgnorePatterns` option in `bun.toml`. This is useful for ignoring test files, fixtures, or other non-source code that you don't want to include in your coverage metrics.
The option accepts a single glob pattern or an array of patterns. Files with paths matching these patterns will be omitted from the generated coverage report.

```

# bun.toml

[test]

# You can use a single pattern as a string


# coveragePathIgnorePatterns = "/__tests__/"


# Or an array of glob patterns

coveragePathIgnorePatterns = [
  "/__tests__/",
  "/test-fixtures.ts",
]
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution
The header comment in generated snapshot files (`.snap`) contained a `goo.gl` link, a URL shortening service that is being deprecated. This link has been updated to `https://bun.sh/docs/test/snapshots` to point to Bun's official documentation for snapshot testing.

test.test.ts.snap

```
- // Bun Snapshot v1, https://goo.gl/fbAQLP
+ // Bun Snapshot v1, https://bun.sh/docs/test/snapshots
```

Thanks to [@xanth3](https://github.com/xanth3) for the contribution


## [`Bun.sql` is now up to 5x faster](#bun-sql-is-now-up-to-5x-faster)


Bun's builtin PostgreSQL client, `Bun.sql`, now automatically pipelines queries, which can dramatically improve performance. Pipelining allows multiple queries to be sent to the server without waiting for the response to the previous one, reducing the impact of network latency. This is particularly effective when executing many small, independent queries in parallel (such as an API server serving multiple concurrent requests).
This change is enabled by default and requires no code changes. In benchmarks, `Bun.sql` is now ~3.4x faster than the `postgres` package running in Bun and ~6x faster than `postgres` in Node.js for high-concurrency workloads.

```
import { SQL } from "bun:sql";
const db = new SQL("postgres://user:pass@host:port/db");
// Bun automatically pipelines these queries,
// sending them to the server without waiting for each response individually.
const queries = [];
for (let i = 0; i < 100; i++) {
  // .execute() is used for fire-and-forget queries
  queries.push(db`SELECT ${i}`.execute());
}
// Await all results
const results = await Promise.all(queries);
console.log(results.length); // 100
await db.end();
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution


### [Reduce first-query latency with `--sql-preconnect`](#reduce-first-query-latency-with-sql-preconnect)


A new `--sql-preconnect` CLI flag has been introduced to reduce first-query latency when using a PostgreSQL database. When this flag is used, Bun establishes a database connection at startup, before your application code executes. This "warms up" the connection so it's immediately available for the first query.
Bun uses the `DATABASE_URL` environment variable to determine the connection details. If the preconnection attempt fails, your application will not crash; the error will be handled gracefully, and a connection will be attempted again on the first query.

```

# To use, set your DATABASE_URL and run Bun with the flag.

export DATABASE_URL="postgres://user:pass@host:port/db"

# Bun will connect to PostgreSQL before index.js is executed.

bun --sql-preconnect index.js
```


## [Code-signed standalone executables on Windows](#code-signed-standalone-executables-on-windows)


Standalone executables created with `bun build --compile` on Windows now support Authenticode code signing.
Previously, Bun would append a custom archive format to the end of the executable file. This technique is incompatible with how Windows validates code signatures, as it modifies the file after it has been signed.
To resolve this, Bun now embeds the bundled source code and assets into a dedicated `.bun` section within the PE (Portable Executable) file. This approach preserves the integrity of the executable's structure, allowing it to be signed with tools like `signtool.exe` without invalidating the signature.
This approach is similar to how we support codesigning for macOS executables.

```

# Build a standalone executable on Windows

```

```
bun build ./my-script.ts --compile --outfile my-app.exe
```

```

# After building, the executable can be signed

```

```
signtool.exe sign /f MyCert.pfx /p MyPassword /t http://timestamp.digicert.com my-app.exe
```


## [1ms faster startup, 3MB less memory usage.](#1ms-faster-startup-3mb-less-memory-usage)


Bun now starts up approximately 1ms faster and uses about 3MB less RAM.
This improvement comes from a low-level optimization in our Zig codebase. Certain large struct assignments in Zig currently lead to unnecessary `memcpy` operations, causing extra pages of memory to be page faulted into the process's address space.


## [`--console-depth=N` configures `console.log` depth](#console-depth-n-configures-console-log-depth)


You can now configure the inspection depth for objects logged with `console.log`, which is useful for debugging deeply nested data structures. The default depth continues to be `2` (matching Node.js).
This can be configured per-run using the `--console-depth` CLI flag, or persistently in your `bunfig.toml` via the `console.depth` setting. The CLI flag takes precedence over the `bunfig.toml` configuration.

```
// index.js
const nested = {
  a: {
    b: {
      c: {
        d: "I am deeply nested",
      },
    },
  },
};
console.log(nested);
// By default, the output is truncated to a depth of 2.
// $ bun run index.js
// { a: { b: [Object] } }
// Run with `--console-depth=4` to see the full object.
// $ bun --console-depth=4 run index.js
// { a: { b: { c: { d: 'I am deeply nested' } } } }
// Alternatively, configure this in `bunfig.toml`:
// [run]
// console.depth = 4
```


#### Configuring `console.log` depth in `bunfig.toml`


bunfig.toml

```
[run]
console.depth = 4
```

Or use the `--console-depth` CLI flag:

```
bun --console-depth=4 index.js
```

Bun's JavaScript & TypeScript parser now uses SIMD instructions to more quickly scan over large multiline comments. This can significantly improve performance when parsing pathologically long multiline comments.

```
/*
  This is a very, very, very, very, very, very, very, very,
  very, very, very, very, very, very, very, very, very,
  very, very, very, very, very, very, very, very, very,
  very, very, very, very, very, very, very, very, very,
  very, very, very, very, very, very, very, very, very,
  very, very, very, very, very, very, very, very, very,
  very, very, very, very, very, very, very, very, very,
  ... and so on for many many many thousands of lines ...
  very, very, very, very, very, very, very, very, very,
  very, very, very, very, very, very, very, very, long
  multiline comment.
  Bun's lexer now uses SIMD instructions to skip over
  this block of text much faster than before.
*/
console.log("This file now parses much faster!");
```


## [Improved tree-shaking for dead `try...catch` blocks](#improved-tree-shaking-for-dead-try-catch-blocks)


Bun's bundler can now eliminate `try...catch...finally` blocks that are part of a dead code path, for instance, after a `return` statement. This improvement helps reduce bundle sizes by removing unreachable code more effectively.

```
// input.js
function test() {
  return "foo";
  // This code is unreachable and will be removed.
  try {
    return "bar";
  } catch (e) {
    console.log(e);
  }
}
// bun build --minify ./input.js
// Before:
function test() {
  return "foo";
  try {
    return "bar";
  } catch (e) {
    console.log(e);
  }
}
// After:
function test() {
  return "foo";
}
```

Thanks to [@evanw](https://github.com/evanw) for the original implementation from esbuild.


## [Bundler removes unused `Symbol.for()` calls](#bundler-removes-unused-symbol-for-calls)


Bun's minifier is now smarter about dead code elimination. Unused calls to `Symbol.for()` with primitive arguments (like strings or numbers) are now removed, as they are side-effect free if the resulting symbol is not used. This leads to smaller bundle sizes.
Input:

input.js

```
Symbol.for("this will be removed");
const a = Symbol.for("this will be kept");
console.log(a);
```

Output:

output.js

```
var o=Symbol.for("this will be kept");console.log(o);
```


### [Node.js compatibility improvements](#node-js-compatibility-improvements)



## [v8 C++ API improvements](#v8-c-api-improvements)


Bun's implementation of the V8 C++ API, which allows native Node.js addons to run in Bun, has been significantly improved. This release adds support for several core functions for interacting with arrays and objects, including `v8::Array::New`, `v8::Object::Get`, `v8::Object::Set`, and `v8::Value::StrictEquals`.
This brings Bun's API closer to full ABI compatibility with Node.js v24, meaning more native modules will work out-of-the-box without requiring a recompile.
Thanks to [@Jarred-Sumner](https://github.com/Jarred-Sumner) and [@190n](https://github.com/190n) for the contribution


## [`vm.constants.DONT_CONTEXTIFY` is now supported](#vm-constants-dont-contextify-is-now-supported)


When `DONT_CONTEXTIFY` is passed in place of the `context` object to `node:vm` functions, the new context's `globalThis` value will have less special behavior and work more like a typical `globalThis`, matching Node.js behavior with that option:

```
import vm from "node:vm";
const contextified = vm.createContext({});
// false: globalThis in child context is a different object than the parent's reference to the context
console.log(vm.runInContext("globalThis", contextified) === contextified);
const notContextified = vm.createContext(vm.constants.DONT_CONTEXTIFY);
// true: parent and child context have the same object
console.log(vm.runInContext("globalThis", notContextified) === notContextified);
```

Thanks to [@heimskr](https://github.com/heimskr) for the contribution!


## [`os.networkInterfaces()` now correctly returns `scopeid`](#os-networkinterfaces-now-correctly-returns-scopeid)


A bug has been fixed in `os.networkInterfaces()` where the `scope_id` property was returned for IPv6 network interfaces. To improve compatibility with Node.js, this property has been renamed to `scopeid`.

```
import { networkInterfaces } from "os";
const interfaces = networkInterfaces();
for (const name of Object.keys(interfaces)) {
  for (const net of interfaces[name]) {
    // For IPv6, the `scopeid` property is now correctly named.
    if (net.family === "IPv6") {
      console.log(net.scopeid);
      // => 0 (or another number)
      console.log(net.scope_id);
      // => undefined
    }
  }
}
```

Thanks to [@riskymh](https://github.com/riskymh) for the contribution!


## [`process.features.typescript` is now supported](#process-features-typescript-is-now-supported)


To improve compatibility with Node.js, `process.features.typescript` is now implemented. This property returns the string `"transform"`, reflecting that Bun's runtime transpiles TypeScript by default. Additionally, `process.features.require_module` and `process.features.openssl_is_boringssl` are now supported.

```
console.log(process.features.typescript);
// "transform"
console.log(process.features.require_module);
// true
console.log(process.features.openssl_is_boringssl);
// true
```

Thanks to [@riskymh](https://github.com/riskymh) for the contribution!


## [`fs.glob` now supports arrays for patterns and `exclude`](#fs-glob-now-supports-arrays-for-patterns-and-exclude)


The `node:fs` module's `glob`, `globSync`, and `promises.glob` functions have been enhanced to align more closely with `node-glob`.
You can now pass an array of glob patterns as the first argument to match against multiple patterns simultaneously. Additionally, the `exclude` option now accepts an array of glob patterns to filter out results, providing a powerful alternative to the existing function-based filtering.

```
import { globSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
// Create some dummy files for demonstration
mkdirSync("a", { recursive: true });
mkdirSync("b", { recursive: true });
writeFileSync("a/file.js", "");
writeFileSync("a/file.ts", "");
writeFileSync("a/style.css", "");
writeFileSync("b/component.js", "");
// Match all .js and .ts files, but exclude anything in the 'b' directory.
const files = globSync(["/*.js", "/*.ts"], {
  ignore: ["b/"], // or `exclude`
});
console.log(files.sort());
// => ["a/file.js", "a/file.ts"]
```

Thanks to [@riskymh](https://github.com/riskymh) for the contribution!


## [`node:module`: `SourceMap` class and `findSourceMap()`](#node-module-sourcemap-class-and-findsourcemap)


Bun now implements the `SourceMap` class and `findSourceMap()` function from the `node:module` built-in module. This allows for programmatic parsing, inspection, and searching of sourcemaps, improving compatibility with Node.js and tools that rely on this API.
This implementation also fixes a bug with parsing sourcemaps containing a `names` field and resolves a potential memory leak when sourcemap parsing fails.

```
import { SourceMap } from "node:module";
const payload = {
  version: 3,
  file: "output.js",
  sources: ["input.js"],
  sourcesContent: ["() => {}"],
  names: ["add"],
  mappings: "AAAA,SAASA,GAAG",
};
const map = new SourceMap(payload);
// The payload getter returns the object used to construct the SourceMap
console.log(map.payload);
// { version: 3, file: 'output.js', ... }
// Find the original source location for a given generated location
const entry = map.findEntry(0, 9);
console.log(entry);
// {
//   generatedLine: 0,
//   generatedColumn: 9,
//   originalLine: 0,
//   originalColumn: 9,
//   originalSource: 'input.js',
//   name: 'add'
// }
```


## [`@types/bun` gets smarter](#types-bun-gets-smarter)


This release fixes a long-standing annoyance with Bun's built-in TypeScript types. Previously, global types that exist in both browsers and Node.js-like environments (such as `EventSource`, `Performance`, and `BroadcastChannel`) were declared with empty interfaces like `interface EventSource {}`. This allowed them to merge with the DOM's built-in types when you included `"lib": ["dom"]` in your `tsconfig.json`.
However, if you did *not* include the DOM library then any usage of these interfaces would appear empty, with no properties existing.
Bun's types are now smarter. They detect if `"lib": ["dom"]` is present in your `tsconfig.json` and if it's not, they automatically extend the corresponding Node.js-compatible types from modules like `undici-types`, `node:perf_hooks`, and `node:worker_threads`.
Thanks to [@alii](https://github.com/alii) for the contribution!


### [Node.js compatibility bugfixes](#node-js-compatibility-bugfixes)


-   `NODE_NO_WARNINGS` environment variable is now respected
-   `node:http2` no longer sends multiple RST frames when it should only send one


### [`bun:test` bugfixes](#bun-test-bugfixes)


-   The `-t` filter now hides skipped and todo tests from the output
-   Memory corruption that could cause the names of later tests to be corrupted when a `beforeEach` hook threw an error has been fixed


### [Runtime bugfixes](#runtime-bugfixes)


-   A rare hypothetical crash in `Bun.which()` has been fixed
-   The `Request` constructor now stores the `redirect` option, fixing a bug where `fetch()` would not prevent redirects when the input `Request` had passed `redirect: "manual"` in the constructor.
-   Fixed a bug that could remove the `Content-Type` header after accessing `request.body` when the input `Request` came from a `FormData` object or from `ReadableStream` objects constructed from some code paths.
-   `Bun.inspect` now shows file size for `Response` objects when a `Bun.file` is passed in.
-   Fixed a bug that could cause unref'd `setTimeout` or `setInterval` to not be executed in very tiny applications
-   A crash that could occur on Windows when using `async` macros inside the bundler has been fixed. This impacted OpenCode.
-   The `"error"` event on `WebSocket` now includes an `Error` object instead of just a string.
-   Bun.S3 presigned URLs now sort query parameters alphabetically, fixing a bug that could lead to invalid signature generation.
-   `fetch()` now allows users to override the `Connection` header, fixing a bug that could cause `fetch()` to always set the `Connection` header to `keep-alive`.
-   A bug in Bun.s3 when loading HTTP-only `S3_ENDPOINT` from environment variables has been fixed.


### [Bundler bugfixes](#bundler-bugfixes)


-   Fixed a bug that could cause a "identifier has already been declared" error with React HMR when referencing a default exported component from a sibling scope
-   Fixed a bug that could occur when using `onLoad` plugins and `loader: "file"`
-   Fixed a CSS parser bug that could occur when parsing CSS with `calc()` and `color-mix()` involving hsl()
-   Fixed a bug when `sourcemap: true` was passed to `Bun.build`, the sourcemap would not be generated. Previously it would only accept a string enum.


### [TypeScript type improvements](#typescript-type-improvements)


-   `ReadableStream` now includes `.text()`, `.json()`, `.bytes()`, and `.blob()`
-   `process.env` types no longer incorrectly inherit from `import.meta.env`
-   TypeScript types for `Bun.serve` now correctly support `Bun.file()`


### [bun install bugfixes](#bun-install-bugfixes)


-   A bug when passing multiple packages via CLI to add to the project when using certain dependency types in `bun install` has been fixed.
-   `bunx yarn` no longer fails on Windows due to an unnecessary postinstall script
-   `bun install` summary output is now buffered, which in large monorepos makes bun install about 20ms faster
-   A bug when a lifecycle script failed due to the directory being deleted during `bun install` has been fixed


### [bun shell bugfixes](#bun-shell-bugfixes)


-   A bug when using `$`\-prefixed variables in `package.json` scripts has been fixed.
-   A bug due to incorrect handling of `EPIPE` errors has been fixed.


### [Thanks to 18 contributors!](#thanks-to-18-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@countbleck](https://github.com/countbleck)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@ericc-ch](https://github.com/ericc-ch)
-   [@heimskr](https://github.com/heimskr)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@jarred-sumner-bot](https://github.com/jarred-sumner-bot)
-   [@josag98](https://github.com/josag98)
-   [@nektro](https://github.com/nektro)
-   [@pfgithub](https://github.com/pfgithub)
-   [@riskymh](https://github.com/riskymh)
-   [@robobun](https://github.com/robobun)
-   [@santosant](https://github.com/santosant)
-   [@taylordotfish](https://github.com/taylordotfish)
-   [@xanth3](https://github.com/xanth3)
-   [@zackradisic](https://github.com/zackradisic)