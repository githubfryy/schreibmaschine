This release fixes 128 bugs (addressing 349 👍). Bun gets a full-featured frontend development toolchain with incredibly fast hot reloading and bundling. Built-in routing for Bun.serve() makes it simpler to build web applications. Bun.SQL gets sql.array, sql fragments, sql.file, and many bugfixes. Node.js compatibility improvements for Buffer & Node-API (napi).


###### To install Bun


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


## [Develop frontend apps with `bun ./index.html`](#develop-frontend-apps-with-bun-index-html)


Before Bun became a JavaScript runtime (and test runner, package manager), Bun started as a frontend dev server - and today, in Bun v1.2.3, we're bringing that back.
You can now use Bun as a frontend dev server for static sites, landing pages, and web applications by directly executing `.html` files.
This uses Bun's bundler, JavaScript/JSX/TypeScript transpiler and CSS parser to provide a modern frontend development toolchain with zero configuration.
For single-page apps:

bun ./index.html

Bunv1.2.19ready in6.62ms
http://localhost:3000/
Pressh+Enterto show shortcuts

For multi-page apps, pass a glob pattern to the command:

bun './\*\*/\*.html'

Bunv1.2.19ready in6.62ms
http://localhost:3000/
Routes:

/./index.html
/dashboard./dashboard.html

Pressh+Enterto show shortcuts

React is supported out of the box. Hot reloading just works. Plugins for Svelte and Vue are coming soon, with the same plugin API as our existing Bun.build() API.


## [Built-in routing for Bun.serve()](#built-in-routing-for-bun-serve)


Running the frontend and backend parts of your app together should be simple. It shouldn't mean multiple commands coordinated to run together. You shouldn't need a proxy server. You shouldn't need to rewrite URLs or headers. Locally, your backend and frontend should run in the same process, from the same server.
For that to work nicely, Bun needs to know which routes go to frontend code and which go to backend code. That's why we're introducing a new `routes` option for `Bun.serve()`.
Bun.serve() now supports built-in routing with dynamic path parameters. Routes can return async responses and have access to type-safe route parameters.
Here's a database-backed full-stack application in 25 lines of code:

```
import { serve, sql } from "bun";
import App from "./myReactSPA.html";
serve({
  port: 3000,
  routes: {
    "/*": App,
    "/api/users": {
      GET: async () => Response.json(await sql`SELECT * FROM users LIMIT 10`),
      POST: async (req) => {
        const { name, email } = await req.json();
        const [user] =
          await sql`INSERT INTO users (name, email) VALUES (${name}, ${email}) RETURNING *`;
        return Response.json(user);
      },
    },
    "/api/users/:id": async (req) => {
      const { id } = req.params;
      const [user] = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
      if (!user) {
        return new Response("User not found", { status: 404 });
      }
      return Response.json(user);
    },
  },
});
```

This makes it simpler to build full-featured web applications with Bun.
Previously, you had to think about "How do I read the URL to figure out which route to call?" or reach for a library like `path-to-regexp`. Now, you can just define your routes and let Bun match them for you. Along the way, we also made the `fetch` handler optional when routes are specified. The `static` option has been renamed to `routes`.
Learn more in the [Bun.serve() docs](https://bun.sh/docs/api/http).


## [`bun init` to start a new React project](#bun-init-to-start-a-new-react-project)


You can run frontend apps with Bun now, but how do you get started with an empty project?

```
bun init
```

```
? Select a project template - Press return to submit.
❯   Blank
    React
    Library
```

You can choose the React template in `bun init` to get a new React project.
If you've used Create React App before, this should feel familiar. Unlike CRA, Bun's React template includes a lightweight backend server as well as frontend tooling.


## [`bun create ./MyComponent.tsx`](#bun-create-mycomponent-tsx)


For existing projects and LLM-generated React code, you can use `bun create ./MyComponent.tsx` to configure Bun's frontend dev server to bundle and serve your project. This:

1.  Uses Bun's bundler & JSX/TypeScript transpiler to scan your source code for imported dependencies
2.  Uses `bun install` to install any missing dependencies
3.  Detects common frontend tooling like TailwindCSS and shadcn/ui and automatically configures the dev server to use them

This makes it easier to get started with Bun's new frontend tooling.


### [New: `bun install --analyze`](#new-bun-install-analyze)


`bun install --analyze` scans imported packages from source files and adds any missing ones to package.json.

```
bun install --analyze src//*.ts
```

This command analyzes JavaScript/TypeScript source files using Bun's bundler to detect imported packages and ensures they are added to package.json.


## [Buffer and Node.js Compatibility](#buffer-and-node-js-compatibility)


Bun now supports loading full certificate bundles from the `NODE_EXTRA_CA_CERTS` environment variable, matching Node.js behavior. This allows you to specify additional trusted CA certificates for TLS connections.

```
export NODE_EXTRA_CA_CERTS="/path/to/full/bundle.crt"
```


### [Buffer compatibility improvements](#buffer-compatibility-improvements)


Several more Node.js Buffer tests are now passing, impacting methods like:

-   `Buffer.copy()`
-   `Buffer.from()`
-   `Buffer.prototype.writeInt8()`
-   `Buffer.prototype.writeUInt8()`
-   `Buffer.prototype.writeInt16LE()`
-   `Buffer.prototype.writeUInt16BE()`
-   `Buffer.prototype.compare()`
-   `Buffer.prototype.includes()`
-   `Buffer.prototype.indexOf()`
-   `Buffer.prototype.lastIndexOf()`
-   `Buffer.prototype.write()`
-   `process.binding('buffer')`

Thanks to [@nektro](https://github.com/nektro) for the contribution!


### [Fixed: Buffer resizing behavior in `node:buffer`](#fixed-buffer-resizing-behavior-in-node-buffer)


Fixed a bug where `node:buffer` would not properly handle resizable or growable shared buffers. This improves compatibility with Node.js's buffer implementation.

```
const buffer = new ArrayBuffer(16, { maxByteLength: 32 });
const uint8 = new Uint8Array(buffer);
buffer.resize(32); // Now works correctly
```

Thanks to [@nektro](https://github.com/nektro) for the contribution!


### [Fixed: `create-midway` package now works](#fixed-create-midway-package-now-works)


Calling `process.binding("fs")` used to throw an Error that was preventing being able to use the `create-midway` package and others. This is now implemented.

[!](https://bun.com/images/bun-1.2.3-create-midway.png)

bun --bun create midway@latest now works

Thanks to [@nektro](https://github.com/nektro) for the contribution!


### [`Buffer.prototype.inspect()` now prints hexadecimal](#buffer-prototype-inspect-now-prints-hexadecimal)


Consider the following example,

```
let b = Buffer.allocUnsafe(4);
b.fill("1234");
b.specialnumber = 42;
console.log(b);
```

In Bun v1.2.3, this will now print the byte content in hexadecimal and additional fields that were not previously shown.

```
❯ bun ./test.js
-Buffer(4) [ 49, 50, 51, 52 ]
+<Buffer 31 32 33 34, specialnumber: 42>
```

This behavior is supported in `console.log()` (and other Console functions), `Bun.inspect()`, and `node:util.inspect()`.
Thanks to [@nektro](https://github.com/nektro) for the contribution!


### [Node-API improvements for ArrayBuffer handling](#node-api-improvements-for-arraybuffer-handling)


Bun's Node-API implementation now correctly handles ArrayBuffers and TypedArrays in `napi_is_buffer()` and `napi_is_typedarray()`. This matches Node.js's behavior and improves compatibility with native addons.

```
// napi_is_buffer() now correctly returns true for:
new Uint8Array();
new BigUint64Array();
Buffer.alloc(0);
new DataView(new ArrayBuffer());
// napi_is_typedarray() returns true for:
new Uint8Array();
new BigUint64Array();
```


### [`node:fs` support for embedded files in Single-File Executables](#node-fs-support-for-embedded-files-in-single-file-executables)


Embedded files in Bun's [single-file executables](https://bun.com/docs/bundler/executable) now support Node.js filesystem APIs like `fs.stat`, `fs.readFile`, and `fs.existsSync`. Previously, only the sync version of `fs.readFile` was supported for embedded files.

```
// These now work in single-file executables:
import { promises as fs } from "node:fs";
import myEmbeddedFile from "./myEmbeddedFile.txt" with {type: "file"};
await fs.readFile(myEmbeddedFile);
await fs.stat(myEmbeddedFile);
import fs from "node:fs";
fs.readFileSync(myEmbeddedFile);
fs.statSync(myEmbeddedFile);
fs.existsSync(myEmbeddedFile);
```

Previously, you could only use real files from the filesystem with node:fs. Now you can use embedded files too, which makes it easier to interop with existing code and libraries.
Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


## [New in Bun.SQL](#new-in-bun-sql)



### [`.simple()` - Multi-statement queries](#simple-multi-statement-queries)


Bun.sql now supports the PostgreSQL simple query protocol, allowing multiple statements to be executed in a single query.

```
// Multiple statements in one query
await sql`
  SELECT 1;
  SELECT 2;
`.simple();
```

This is useful for running migrations or other multi-statement queries that need to be executed in a single round trip to the database.\`
Note that simple queries cannot use parameters (`${value}`). If you need parameters, you must split your query into separate statements.


### [`prepare: false` - configurable prepared statements](#prepare-false-configurable-prepared-statements)


You can now disable prepared statements in Bun.sql by setting `prepare: false` in the connection options.

```
const sql = new SQL({
  // ... other options ...
  prepare: false, // Disable prepared statements
});
```

This is useful when working with PGBouncer in transaction mode, debugging query execution plans, or working with dynamic SQL where query plans need to be regenerated frequently.


### [Improved: Arrays support in Bun.sql](#improved-arrays-support-in-bun-sql)


Bun.sql now supports retrieving array values from PostgreSQL, including arrays of integers, text, dates, timestamps, and more. Arrays properly handle null values, always returning `null` for null elements. Previously, in many cases Bun would return an error.

```
const result = await sql`SELECT ARRAY[0, 1, 2, 3, 4, 5, NULL]::integer[]`;
console.log(result[0].array); // [0, 1, 2, 3, 4, 5, null]
const strings = await sql`SELECT ARRAY['Hello', 'World', NULL]::text[]`;
console.log(strings[0].array); // ['Hello', 'World', null]
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [sql must be called as a tagged template literal](#sql-must-be-called-as-a-tagged-template-literal)


Previously, Bun's SQL client would not throw an error if you called it as a function instead of a tagged template literal.

```
// ✅ Correct: Use as tagged template literal
const users = await sql`SELECT * FROM users`;
// ❌ Incorrect: Will throw ERR_POSTGRES_NOT_TAGGED_CALL
const users = await sql("SELECT * FROM users");
```

Instead, it should be called as a tagged template literal, or an explicit `sql.unsafe(query)` call.
This prevents a footgun where you might unknowingly introduce SQL injection vulnerabilities.


### [Fixed: Binary numeric values in Bun.sql](#fixed-binary-numeric-values-in-bun-sql)


For safety and consistency with postgres.js, numeric values from PostgreSQL are now always returned as strings when using binary format.

```
import { sql } from "bun";
import { expect } from "bun:test";
const result = await sql`SELECT 1.23::numeric`;
expect(result).toEqual([{ "?column?": "1.23" }]);
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Fixed: SQL idle timeout disconnect during query processing](#fixed-sql-idle-timeout-disconnect-during-query-processing)


Fixed an issue where PostgreSQL connections could incorrectly time out and disconnect while still processing query results. The idle timeout is now properly disabled when actively processing data from the database.

```
const sql = new SQL({
  url: "postgres://localhost:5432/mydb",
  idleTimeout: 30, // Won't disconnect while processing results
});
const results = await sql`SELECT * FROM large_table`;
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Fixed: URL-encoded credentials in Bun.sql connection strings](#fixed-url-encoded-credentials-in-bun-sql-connection-strings)


The SQL client now properly handles URL-encoded usernames, passwords and database names in PostgreSQL connection strings.

```
// This now works correctly
const sql = new Bun.SQL(
  "postgres://user%40domain:pass%40word@localhost/db%40name",
);
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Fixed: SQL template literal fragments](#fixed-sql-template-literal-fragments)


Bun.sql now properly handles nested SQL template literal fragments and concatenation of parameters. This allows for more flexible query composition.

```
// Create reusable query fragments
const orderBy = (field) => sql`ORDER BY ${sql(field)} DESC`;
// Use fragments in queries
const results = await sql`
  SELECT * FROM posts
  WHERE author_id = ${userId}
  ${shouldSort ? orderBy("created_at") : sql``}
`;
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Fixed: ReadyForQuery state](#fixed-readyforquery-state)


A bug that could cause the PostgreSQL connection to disconnect with an error after some amount of time has passed has been fixed. It was caused by assuming the server was ready for a new query too early.


### [Fixed: memory leak in SQL query strings](#fixed-memory-leak-in-sql-query-strings)


A memory leak in SQL query strings has been fixed. This improves memory usage when executing many SQL queries, especially with large query strings.

```
import { sql } from "bun";
// Memory is now properly released after each query
for (let i = 0; i < 1000; i++) {
  await sql`SELECT * FROM large_table WHERE id = ${i}`;
}
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Fixed: `verify-full` & `verify-ca` SSL modes](#fixed-verify-full-verify-ca-ssl-modes)


Fixed an issue where TLS certificate verification for PostgreSQL connections was incorrectly handling different SSL modes like `verify-ca` and `verify-full`, leading to throwing certificate errors when not expected to do so.
Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


## [Faster WebAssembly startup & lower memory usage with IPInt](#faster-webassembly-startup-lower-memory-usage-with-ipint)



### [Tiered WebAssembly execution](#tiered-webassembly-execution)


More libraries are starting to adopt WebAssembly (Wasm) to run performance-critical code, or existing libraries written in systems languages, without the hassle of distributing binaries for every OS and architecture. JavaScriptCore, which powers Bun's JS and Wasm execution, has long used just-in-time (JIT) compilation to extract maximum performance from Wasm code, just like it does for JS. This allows hot-path Wasm functions to be compiled to optimized machine code that runs directly on the user's CPU.
But JIT compilation has a cost that isn't always worth paying. It takes time to compile code, and during that time you can't run the code at all. So JSC has also included an interpreter, called LLInt (low-level interpreter), which reduces the latency before Wasm code can start running and improves performance for functions that don't run enough times to be worth JIT compilation.


### [A new WebAssembly interpreter](#a-new-webassembly-interpreter)


The *in-place interpreter*, or IPInt, is a new interpreter for Wasm that replaces LLInt. LLInt had to first convert the entire Wasm module into a different bytecode format in order to be executed, which takes a long time and requires a lot of memory. Instead, IPInt mostly executes the Wasm code directly, in the same format it is stored on the filesystem or transferred over the network. IPInt only uses additional metadata for certain instructions, and this metadata is stored separately so that the Wasm code doesn't need to be modified. This has two benefits:

-   Wasm code can now start running more quickly, because generating metadata is less expensive than compiling the entire module to bytecode.
-   Less memory is needed to run Wasm code, because the metadata is smaller than the bytecode.

IPInt has been included behind a flag for some time, but with this release we're following WebKit's lead in enabling it by default. If you encounter new bugs with Wasm modules in this release, you can revert to the old interpreter with the environment variable `BUN_JSC_useWasmIPInt=0`, but please also report such bugs to us so that we can help the WebKit team track them down.
Many thanks to Daniel Liu and the WebKit team for this improvement!


## [Other Improvements](#other-improvements)



### [Bun.file(path).stream() uses less memory](#bun-file-path-stream-uses-less-memory)


We've optimized memory usage when working with the web-based ReadableStream from `Bun.file(path).stream` in Bun, particularly for scenarios involving reading large amounts of data or long-running streams.

```
const reader = Bun.file(path).stream().getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(value);
}
```


### [Improved Flags Display in CLI Help](#improved-flags-display-in-cli-help)


When running `--help`, CLI flags that accept values now show `=<val>` to indicate they accept a value.

```
--outfile                  Write to a file
--outfile=<val>            Write to a file
```

This makes it more obvious which flags expect a value versus flags that are simple toggles.


### [Support for Virtual Hosted-Style S3 Endpoints](#support-for-virtual-hosted-style-s3-endpoints)


Bun's S3 client now supports Virtual Hosted-Style endpoints for S3-compatible services. When using this style, the bucket name is part of the hostname rather than the path.

```
import { S3Client } from "bun";
const s3 = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  bucket: "my-bucket",
  virtualHostedStyle: true,
});
// Or specify the endpoint directly
const s3WithEndpoint = new S3Client({
  accessKeyId: "access-key",
  secretAccessKey: "secret-key",
  endpoint: "https://my-bucket.s3.us-east-1.amazonaws.com",
  virtualHostedStyle: true,
});
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


### [Fixed: expect().toEqual() with error.cause](#fixed-expect-toequal-with-error-cause)


The deep equality comparison logic for Error objects has been enhanced to handle additional properties like `.cause` and enumerable properties, while properly respecting strict mode comparisons.

```
import { expect } from "bun:test";
const err1 = new Error("message");
err1.cause = "cause";
err1.extra = "data";
const err2 = new Error("message");
err2.cause = "cause";
err2.extra = "data";
expect(err1).toEqual(err2); // Now passes
```

Thanks to [@DonIsaac](https://github.com/DonIsaac) for the contribution!


### [`bun pm pack`: fix "files" starting with "./"](#bun-pm-pack-fix-files-starting-with)


Packing paths starting with `"./"` from `"files"` in `package.json` have been fixed, and will be correctly included in the resulting package.

```
{
  "name": "my-package",
  "version": "1.0.0",
  "files": ["./dist", "!./subdir", "./src/index.ts"]
}
```

Thanks to [@RiskyMH](https://github.com/RiskyMH) for the contribution!


### [Environment Variables in HTML imports](#environment-variables-in-html-imports)


You can now pass environment variables to your HTML files by setting `env` in the `[serve.static]` section of your `bunfig.toml` file.

```
[serve.static]

# Make all BUN_PUBLIC_* environment variables available to client-side code via process.env.BUN_PUBLIC_MY_VAR

env = "BUN_PUBLIC_*"
```


### [Improved: `Bun.Glob`](#improved-bun-glob)


We fixed several bugs in Bun.Glob, especially related to matching directories and handling of `` patterns. Big thanks to [@probably-neb](https://github.com/probably-neb) and [@zackradisic](https://github.com/zackradisic) for the contribution!


### [CSS Improvements](#css-improvements)


This release includes several improvements to CSS handling, including fixes for light/dark mode, color down-leveling, and box-shadow minification.

```
// Light/dark mode CSS now works correctly
const css = `
@media (prefers-color-scheme: dark) {
  body { background: black; }
}
`;
// Box-shadow values are minified
  const minified = `box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)`;
  const minified = `box-shadow:0 4px 6px -1px #0000001a,0 2px 4px -1px #0000000f`;
```


## [Bug Fixes](#bug-fixes)



### [Fixed CSS parsing of @-webkit-keyframes](#fixed-css-parsing-of-webkit-keyframes)


The CSS parser now correctly handles the `@-webkit-keyframes` rule in stylesheets.

```
@-webkit-keyframes slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100px);
  }
}
```

Thanks to [@ricky-pan](https://github.com/ricky-pan) for the contribution!


### [Fixed: file writer could prematurely close file descriptors](#fixed-file-writer-could-prematurely-close-file-descriptors)


Fixed an issue where Bun's file writer would close file descriptors it didn't own when calling `writer.end()`. This could lead to errors when the descriptor was still needed by other parts of the application.

```
const fileHandle = await fsPromises.open("file.txt", "w");
const fd = fileHandle.fd;
// Previously this would incorrectly close the fd
await Bun.file(fd).writer().end();
// Now the fd remains open for use
await fsPromises.close(fd);
```

Thanks to [@pfgithub](https://github.com/pfgithub) for the contribution!


### Fixed: FormData boundary quotes in fetch


The `Content-Type` header for multipart form data no longer includes quotes around the boundary parameter, matching Node.js behavior and improving compatibility with some servers.

index.js

```
const form = new FormData();
form.append("file", "content");
const req = new Request("https://example.com", {
  method: "POST",
  body: form,
});
  // Content-Type: multipart/form-data; boundary="..."
  // Content-Type: multipart/form-data; boundary=...
```


### [Fixed: bunx "exec" error on Windows](#fixed-bunx-exec-error-on-windows)


In certain cases, `bunx` could throw an error when executing a command on Windows where it treated the command as "exec" instead of the actual command. This has been fixed, thanks to [@riskymh](https://github.com/riskymh).


### [Fixed bun.lock formatting](#fixed-bun-lock-formatting)


Bun's lockfile now consistently formats package bin entries and dependencies with proper newlines and spacing between keys and values.

```
// Before
{
"pkg1-1": "bin-1.js""pkg1-2": "bin-2.js"
}
// After
{
  "pkg1-1": "bin-1.js",
  "pkg1-2": "bin-2.js"
}
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


### [Fixed: React JSX development runtime for static files](#fixed-react-jsx-development-runtime-for-static-files)


When using Bun's static file serving with React, development vs production runtime loading now works correctly based on `NODE_ENV`. Previously, there could be mismatches between `react-jsx` and `react-jsxdev` loading.

```
// Development (NODE_ENV=development)
import * as jsx from "react/jsx-dev-runtime";
// Production (NODE_ENV=production)
import * as jsx from "react/jsx-runtime";
```

Thanks to [@paperclover](https://github.com/paperclover) for the contribution!


### [Fixed: UDP multicast membership crash](#fixed-udp-multicast-membership-crash)


The `node:dgram` module no longer crashes when calling `addMembership()` or `dropMembership()` without specifying an interface address.

```
import dgram from "node:dgram";
const socket = dgram.createSocket("udp4");
socket.addMembership("224.0.0.1"); // No longer crashes
```


### [Fixed: stdin waking up after unref/ref](#fixed-stdin-waking-up-after-unref-ref)


The process.stdin stream now correctly resumes reading input after being unref'd and ref'd again. Previously, stdin could become unresponsive in certain scenarios involving unref/ref cycles.

```
// This now works correctly
process.stdin.ref();
process.stdin.unref();
process.stdin.ref();
process.stdin.on("readable", () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    console.log(chunk.toString());
  }
});
```


### [Fixed: HTTP error handling in bun install](#fixed-http-error-handling-in-bun-install)


Fixed a potential crash that could occur when printing HTTP errors during `bun install`. This makes error reporting more reliable when package downloads fail.


### [Fixed: computed property names in legacy TypeScript decorators](#fixed-computed-property-names-in-legacy-typescript-decorators)


A bug with computed property names in legacy TypeScript decorators has been fixed.

```
// Simple logging decorator
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    return originalMethod.apply(this, args);
  };
}
const kGreet = Symbol("greet");
class Example {
  @log
  [kGreet](name: string) {
    return `Hello ${name}!`;
  }
}
```

tsconfig.json

```
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```


### [Fixed: Non-ASCII paths in Bun.file().stat() and Bun.file().delete/unlink()](#fixed-non-ascii-paths-in-bun-file-stat-and-bun-file-delete-unlink)


A bug that caused `Bun.file().stat()` and `Bun.file().delete()` to not work correctly with non-ASCII paths has been fixed.

```
const file = Bun.file("😀.txt");
await file.stat();
await file.delete();
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


### [Thanks to 23 contributors!](#thanks-to-23-contributors)


-   [@190n](https://github.com/190n)
-   [@carlaiau](https://github.com/carlaiau)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@donisaac](https://github.com/donisaac)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@fel1x-developer](https://github.com/fel1x-developer)
-   [@gbbelloponce](https://github.com/gbbelloponce)
-   [@heimskr](https://github.com/heimskr)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@khajimatov](https://github.com/khajimatov)
-   [@nektro](https://github.com/nektro)
-   [@okineadev](https://github.com/okineadev)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)
-   [@pikdum](https://github.com/pikdum)
-   [@pjeweb](https://github.com/pjeweb)
-   [@probably-neb](https://github.com/probably-neb)
-   [@riskymh](https://github.com/riskymh)
-   [@sculpt0r](https://github.com/sculpt0r)
-   [@shlomocode](https://github.com/shlomocode)
-   [@snoepnfts](https://github.com/snoepnfts)
-   [@viniciuspjardim](https://github.com/viniciuspjardim)
-   [@zackradisic](https://github.com/zackradisic)