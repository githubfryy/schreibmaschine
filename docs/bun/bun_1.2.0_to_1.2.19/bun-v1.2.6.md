This release fixes 74 bugs (addressing 36 👍). node:crypto gets faster & more compatible. `timeout` option in Bun.spawn. Support for `module.children` in `node:module`. Connect to PostgreSQL via unix sockets with `Bun.SQL`. Dev Server stability improvements. vm.compileFunction. Initial support for node:test. Faster Express & Fastify.


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


## [Faster Express & Fastify](#faster-express-fastify)


node:http compatibility improvements led to performance improvements for Express and Fastify.


## [Faster, more compatible `node:crypto`](#faster-more-compatible-node-crypto)


In the previous release we rewrote the implementation of `crypto.Sign`, `crypto.Verify`, `crypto.Hash`, and `crypto.Hmac` from JavaScript to native code using BoringSSL.
In Bun v1.2.6, we've continued this work by rewriting `Cipheriv`, `Decipheriv`, `DiffieHellman`, `DiffieHellmanGroup`, `ECDH`, `randomFill(Sync)`, and `randomBytes` with their tests from Node.js passing. Most notable performance improvements are seen in `DiffieHellman`, `Cipheriv/Decipheriv`, and `scrypt`.

New

```
bun crypto-benchmark.mjs
```

```
cpu: Apple M1 Max
runtime: bun 1.2.6 (arm64-darwin)
benchmark                                  time (avg)             (min … max)       p75       p99      p995
----------------------------------------------------------------------------- -----------------------------
createDiffieHellman - 512              150.61 ms/iter  (23.13 ms … 339.16 ms) 201.08 ms 339.16 ms 339.16 ms
Cipheriv and Decipheriv - aes-256-gcm    3.54 µs/iter     (3.43 µs … 3.98 µs)   3.62 µs   3.98 µs   3.98 µs
scrypt - N=16384, p=1, r=1              47.37 ms/iter   (46.69 ms … 48.12 ms)  47.59 ms  48.12 ms  48.12 ms
```

Previous

```
bun-1.2.5 crypto-benchmark.mjs
```

```
cpu: Apple M1 Max
runtime: bun 1.2.5 (arm64-darwin)
benchmark                                  time (avg)             (min … max)       p75       p99      p995
----------------------------------------------------------------------------- -----------------------------
createDiffieHellman - 512               105.15 s/iter    (23.29 s … 319.92 s)  128.47 s  319.92 s  319.92 s
Cipheriv and Decipheriv - aes-256-gcm    1.15 ms/iter     (1.04 ms … 3.72 ms)   1.14 ms    3.3 ms   3.65 ms
scrypt - N=16384, p=1, r=1              365.4 ms/iter (362.31 ms … 368.73 ms) 366.56 ms 368.73 ms 368.73 ms
```

crypto-benchmark.mjs

Thanks to [@dylan-conway](https://github.com/dylan-conway)!


### [`hkdf` support](#hkdf-support)


Bun v1.2.6 now implements `hkdf` (HMAC-based Extract-and-Expand Key Derivation Function) and `hkdfSync` from `node:crypto`. These functions allow you to derive keys of a specific length from an algorithm, input key, salt, and optional info.

```
import crypto from "node:crypto";
const derivedKey = crypto.hkdfSync(
  "sha256",
  "secret-key",
  "salt",
  "info", // optional info
  32, // length of output key
);
crypto.hkdf("sha256", "secret-key", "salt", "info", 32, (err, derivedKey) => {
  // console.log(derivedKey);
});
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for implementing this!


### [prime functions support](#prime-functions-support)


Bun now implements the `generatePrime`, `generatePrimeSync`, `checkPrime`, and `checkPrimeSync` functions from the `node:crypto` module, allowing you to generate and verify prime numbers.

```
import crypto from "node:crypto";
// Generate a 512-bit prime number synchronously
const prime = crypto.generatePrimeSync(512);
const isPrime = crypto.checkPrimeSync(prime); // true
crypto.generatePrime(2048, (err, prime) => {
  // `prime` is a 2048-bit prime number
});
crypto.checkPrime(prime, (err, result) => {
  // `result` is true
});
```

Thanks to [@dylan-conway](https://github.com/dylan-conway)!


### [Fixed: ED25519 crypto key generation from private keys](#fixed-ed25519-crypto-key-generation-from-private-keys)


Fixed a memory error in the Crypto API when generating ED25519 public keys from private keys. The previous implementation incorrectly read out of bounds from the private key, which could lead to unpredictable behavior or crashes.

```
// Creating an ED25519 key pair and exporting the public key now works correctly
import { generateKeyPair } from "crypto";
const { publicKey, privateKey } = await generateKeyPair("ed25519");
const publicKeyObject = privateKey.export({ type: "spki", format: "pem" });
// This operation is now safer and more reliable
```

Thanks to @DonIsaac for finding this issue!


## [Initial support for `node:test`](#initial-support-for-node-test)


Bun now includes initial support for the `node:test` module, leveraging `bun:test` under the hood to provide a unified testing experience. This implementation allows you to run Node.js tests with the same performance benefits of Bun's native test runner.

```
// Use the Node.js test API in your Bun projects
import test from "node:test";
test("basic functionality", (t) => {
  // Your test code here
});
```

While most basic tests should work, some advanced features are not yet implemented:

-   Tests within tests (subtests)
-   Mocks
-   Snapshots
-   Timers
-   Custom reporters
-   Programmatic API

Thanks to [@Electroid](https://github.com/electroid) for the contribution!


## [Dev Server stability improvements](#dev-server-stability-improvements)


This release fixes several bugs in [Bun's dev server](https://bun.sh/docs/bundler/html), including:

-   Issues with Hot Module Replacement
-   Windows path handling
-   Filesystem watcher

Thanks to @paperclover for the contribution!


## [`timeout` in `Bun.spawn`](#timeout-in-bun-spawn)


The `timeout` option in `Bun.spawn` is now supported.

```
const result = Bun.spawnSync({
  cmd: ["sleep", "1000"],
  timeout: 1000, // Will terminate after 1 second
});
console.log(result.exitedDueToTimeout); // true
```

You can still pass an `AbortSignal` to the `spawn` function, but people more frequently guess the `timeout` option instead of using `AbortSignal.timeout`.
Thanks to [@pfgithub](https://github.com/pfgithub)!


## [Connect to PostgreSQL via unix sockets with `Bun.SQL`](#connect-to-postgresql-via-unix-sockets-with-bun-sql)


Bun's SQL API now supports connecting to PostgreSQL via Unix sockets, offering improved performance for local database connections.

```
import { SQL } from "bun";
await using sql = new SQL({
  // Connect via unix socket
  path: "/tmp/.s.PGSQL.5432", // Full path to socket
  // or just specify the directory
  // path: "/tmp", // Bun will append /.s.PGSQL.{port}
  user: "postgres",
  password: "postgres",
  database: "mydb"
});
const result = await sql`SELECT * FROM users`;
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for implementing this!


## [Support for `module.children` in `node:module`](#support-for-module-children-in-node-module)


The `module.children` array tracks child modules that are loaded by a parent module. This is now supported in Bun.

```
// The children will be tracked automatically
const childModule = require("./child-module");
console.log(module.children); // [Module { ... }]
```

Previously, the array was always empty.
Thanks to [@paperclover](https://github.com/paperclover) for implementing this!


## [Bun.SQL query parameter options](#bun-sql-query-parameter-options)


Fixed an issue with PostgreSQL connection options, allowing you to properly set runtime configurations like `search_path` either through the connection URL or via the `connection` object.

```
// Use via connection string query parameters
await using db = new SQL(
  "postgres://user:pass@localhost:5432/mydb?search_path=information_schema",
  { max: 1 }
);
// Or use via connection options object
await using db = new SQL("postgres://user:pass@localhost:5432/mydb", {
  connection: {
    search_path: "information_schema"
  },
  max: 1
});
// Query tables from the specified schema
const count = await db`SELECT COUNT(*)::INT FROM columns LIMIT 1`.value();
```

Thanks to @cirospaciari for the contribution!


## [Improved: `Database.deserialize` in `bun:sqlite`](#improved-database-deserialize-in-bun-sqlite)


`bun:sqlite` now allows passing configuration options to `Database.deserialize()`, including support for strict mode and other database settings. This enhancement provides more control when working with serialized SQLite databases.

```
// Before: Limited configuration
const db = Database.deserialize(serializedData);
// Now: Configure database settings during deserialization
const db = Database.deserialize(serializedData, {
  readonly: true,
  strict: true,
  safeIntegers: true,
});
```

Thanks to [@ubirdio](https://github.com/ubirdio) for the contribution!


## [Improved: TLS certificate handling](#improved-tls-certificate-handling)


Improved compatibility with TLS certificate handling, adding support for the `translatePeerCertificate` function which converts certificate data into a more idiomatic JavaScript representation.

```
// Now you can use translatePeerCertificate from the _tls_common module
const { translatePeerCertificate } = require("_tls_common");
// Convert raw certificate data to a more developer-friendly format
const formattedCert = translatePeerCertificate(rawCertificate);
```

This change also adds proper error handling for TLS protocol version issues with the new error types `ERR_TLS_INVALID_PROTOCOL_VERSION` and `ERR_TLS_PROTOCOL_VERSION_CONFLICT`.
Thanks to [@nektro](https://github.com/nektro)!


## [Improved: ReferenceError message](#improved-referenceerror-message)


The error message for ReferenceError has been updated in Bun's implementation of the node:vm module to match Node.js and V8 behavior. Reference errors now use "X is not defined" instead of "Can't find variable: X".

index.js

```
foo.bar = 5;
  // ReferenceError: Can't find variable: foo
  // ReferenceError: foo is not defined
```

Thanks to [@zackradisic](https://github.com/zackradisic)!


## [HTTP2 Node.js Compatibility Improvements](#http2-node-js-compatibility-improvements)


Significant improvements to Bun's `node:http2` implementation. This update fixes several issues including proper stream management, response handling, and window size configuration.
Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


## [Implemented `vm.compileFunction` from `node:vm`](#implemented-vm-compilefunction-from-node-vm)


Bun now supports Node.js `vm.compileFunction` API, allowing developers to compile JavaScript code into a function with specific arguments and context.

```
// Compile a function in a specific context
const vm = require("node:vm");
const context = vm.createContext({ x: 42 });
const fn = vm.compileFunction("return x + y", ["y"], {
  contextExtension: context,
});
// Call the compiled function
console.log(fn(8)); // 50
```

Thanks to [@zackradisic](https://github.com/zackradisic) for the contribution!


## [1.4 MB smaller binary size](#1-4-mb-smaller-binary-size)


On top of all these fixes, Bun gets 1.4 MB smaller in this release.

```
❯ ls -lSh ~/Build/bun-v1.2.5/bun-darwin-aarch64/bun
... 56M ...
```

```
❯ ls -lSh ~/Build/bun-v1.2.6/bun-darwin-aarch64/bun
... 55M ...
```


## [Bugfixes](#bugfixes)



### [Fixed: Cached UDP socket address reset after connection](#fixed-cached-udp-socket-address-reset-after-connection)


The UDP Socket implementation now correctly resets the cached `address` property after connecting. This ensures that the socket's address information reflects the current connection state, fixing an issue in both `Bun.udpSocket` and the `node:dgram` module.

```
// Before
import { createSocket } from "node:dgram";
const socket = createSocket("udp4");
await new Promise((resolve) => {
  socket.bind(resolve);
});
socket.connect(60865, "127.0.0.1", () => {
  console.log(socket.address().address);
  // Before:     0.0.0.0
  // Bun 1.2.6:  127.0.0.1
});
```

Thanks to [@heimskr](https://github.com/heimskr) for fixing this!


### [Fixed: `"svelte"` export conditions in `bun-plugin-svelte`](#fixed-svelte-export-conditions-in-bun-plugin-svelte)


`bun-plugin-svelte` now properly handles the `"svelte"` export condition when resolving packages. This ensures better compatibility with Svelte ecosystem packages like @threlte/core that use this export condition.

```
// Now works with packages that use the "svelte" export condition
import { Canvas } from "@threlte/core";
```

Thanks to @jarred for the contribution!


### [Fixed: warning emitted in `setTimeout` regression](#fixed-warning-emitted-in-settimeout-regression)


Fixed an issue where calling `setTimeout` without specifying a delay parameter would incorrectly emit a `TimeoutNaNWarning`. Now, only explicitly passing `NaN` as the delay will trigger the warning.

```
// Does not emit a warning
setTimeout(() => {});
// This still emits a warning (as expected)
setTimeout(() => {}, NaN);
```

Thanks to [@Electroid](https://github.com/electroid) for the contribution!


### [Fixed: trailing slashes in Bun.s3 presign](#fixed-trailing-slashes-in-bun-s3-presign)


Fixed an issue in `Bun.s3` presign where trailing slashes in paths weren't removed, potentially causing incorrect URL generation when using Bun's S3 client.
Thanks to [@nikeee](https://github.com/nikeee) for fixing this!


### [Fix for `:global` selector in CSS modules](#fix-for-global-selector-in-css-modules)


Fixed an issue where the `:global()` selector in CSS modules wasn't being processed correctly. The `:global()` selector is now properly handled, preserving global class names without applying CSS module scoping.

```
// Before this fix, global selectors wouldn't work correctly
// index.module.css
:global(.button) {
  color: blue;
}
// Now properly outputs as
.button {
  color: blue;
}
```

Thanks to [@DonIsaac](https://github.com/DonIsaac)!


### [Fixed: global catch-all routes with callback handlers in Bun.serve()](#fixed-global-catch-all-routes-with-callback-handlers-in-bun-serve)


Fixed an issue where global catch-all routes using a callback handler function weren't working properly, while static response objects (`'/*': new Response()`) worked as expected. Now both approaches work correctly.

```
// Now works properly
serve({
  routes: {
    "/*": () => new Response("Global catch-all"),
  },
});
```

Thanks to [@pfgithub](https://github.com/pfgithub) for fixing this!


### [Fixed: `node:` prefix consistency](#fixed-node-prefix-consistency)


Bun now maintains the `node:` prefix in module resolution, correctly handling Node.js built-in modules and providing more accurate error messages when resolving modules.

```
// Previously
import fs from "node:fs";
// Would be resolved as just "fs"
// Now
import fs from "node:fs";
// Correctly maintains "node:" prefix
// When an unknown built-in module is requested
import nonexistent from "node:nonexistent";
// Throws ERR_UNKNOWN_BUILTIN_MODULE: "No such built-in module: node:nonexistent"
```

This improves compatibility with Node.js module resolution and provides clearer error messages for missing built-in modules.


### [Fixed: `module.id` for entrypoints](#fixed-module-id-for-entrypoints)


The `module.id` property now correctly reports `.` for the entry point module, matching Node.js behavior.

```
// When this file is executed as the main script
console.log(module.id); // "."
// When imported as a module from elsewhere
console.log(module.id); // "/path/to/file.js"
```

This change increases compatibility with Node.js module handling.


### [Fixed: N-API string conversion](#fixed-n-api-string-conversion)


Fixed several bugs in `napi_get_value_string_*` and `napi_create_string_*` functions to better handle edge cases during string conversions between JavaScript and native code. These improvements provide more reliable behavior when working with different string encodings in native addons.

```
// This should now handle edge cases more reliably
const addon = require("./build/Release/my_addon.node");
const result = addon.convertString("Hello, 世界");
```

Thanks to @190n for the contribution!


### [Fixed: svelte module imports in `bun-plugin-svelte`](#fixed-svelte-module-imports-in-bun-plugin-svelte)


The Svelte plugin for Bun now correctly handles Svelte module imports with proper TypeScript transpilation. This fixes issues with module compilation where errors like "unknown option 'css'" were being thrown. The plugin now uses separate options when compiling Svelte modules versus Svelte components, and transpiles `.svelte.ts` modules with `Bun.Transpiler` before calling `compileModule`.

```
// Now you can properly import .svelte.ts modules
import { myHelper } from "./helper.svelte.ts";
// And use them in your Svelte components
<script>
  import {myHelper} from './helper.svelte.ts'; const result = myHelper();
</script>;
```

Thanks to [@DonIsaac](https://github.com/DonIsaac) for the contribution!


### [Fixed: memory leak edgecase in Bun.spawn with piped output](#fixed-memory-leak-edgecase-in-bun-spawn-with-piped-output)


Fixed a memory leak that occurred when using `Bun.spawn` with stdout or stderr set to `"pipe"`. Previously, when output pipes completed reading from file descriptors, the associated resources weren't properly cleaned up, resulting in memory leaks.

```
// Before: Memory would leak when spawning many processes
for (let i = 0; i < 1000; i++) {
  const proc = Bun.spawn({
    cmd: ["echo", "hello world"],
    stdout: "pipe",
  });
  await proc.exited;
}
// Now: Memory is properly released when processes complete
```

Thanks to @DonIsaac for the contribution!


### [Fixed: edgecase in CSS parser number formatting](#fixed-edgecase-in-css-parser-number-formatting)


Fixed handling of infinity values in CSS to ensure proper rendering in Safari. Specifically when bundling Tailwind v4, `rounded-full` class now correctly outputs `border-radius: 3.40282e38px` instead of `1e999px`, matching Tailwind's official approach for representing infinity values in CSS.

```
// Before - caused rendering issues in Safari
// .rounded-full { border-radius: 1e999px; }
// After - properly renders in all browsers
// .rounded-full { border-radius: 3.40282e38px; }
```

Thanks to [@zackradisic](https://github.com/zackradisic) for the contribution!


### [Fixed: shell crash under high process load](#fixed-shell-crash-under-high-process-load)


Fixed an issue where spawning many processes very quickly using Bun's shell API (`$`) could cause crashes. The fix properly handles cases where processes exit immediately after being spawned, ensuring proper resource cleanup and exit notification handling.

```
// This would previously crash after spawning many processes
import { $, which } from "bun";
const cat = which("cat");
// Spawn hundreds of processes in quick succession
const promises = [];
for (let i = 0; i < 100; i++) {
  promises.push($`${cat} some_file.txt`.text());
}
await Promise.all(promises);
```


### [Thanks to 23 contributors!](#thanks-to-23-contributors)


-   [@190n](https://github.com/190n)
-   [@aabccd021](https://github.com/aabccd021)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@donisaac](https://github.com/donisaac)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@electroid](https://github.com/electroid)
-   [@gewenyu99](https://github.com/gewenyu99)
-   [@heimskr](https://github.com/heimskr)
-   [@ippsav](https://github.com/ippsav)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@nanome203](https://github.com/nanome203)
-   [@nektro](https://github.com/nektro)
-   [@nicholas-livery](https://github.com/nicholas-livery)
-   [@nikeee](https://github.com/nikeee)
-   [@nmarks413](https://github.com/nmarks413)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)
-   [@riskymh](https://github.com/riskymh)
-   [@sunsettechuila](https://github.com/sunsettechuila)
-   [@ubirdio](https://github.com/ubirdio)
-   [@xuxucode](https://github.com/xuxucode)
-   [@zackradisic](https://github.com/zackradisic)