We're hiring [systems engineers](https://bun.com/careers) in San Francisco to build the future of JavaScript!
This release fixes 32 bugs. S3 storage class support, X25519 support in crypto.generateKeyPair. fs.stat uses less memory. node:fs, node:child\_process, and node:process compatibility improvements. CSS parser bugfixes. Zero-filled buffers with `--zero-fill-buffers` flag. Indented inline snapshots in bun test. Improved: String GC Reporting Accuracy. Fixed memory leaks in Bun.serve(), Bun.pathToFileURL, and with some strings. Disable minification in HTML imports.


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


## [S3 storage class support](#s3-storage-class-support)


You can now pass a `storageClass` option to Bun's builtin S3 client.
This lets you configure how S3 object storage stores your objects, so that you can optimize for cost or latency.

```
it("should work with storage class", async () => {
  const s3file = s3("s3://bucket/credentials-test", s3Options);
  const url = s3file.presign({
    expiresIn: 10,
    storageClass: "GLACIER_IR",
  });
  expect(url).toBeDefined();
  expect(url.includes("X-Amz-Expires=10")).toBe(true);
  expect(url.includes("x-amz-storage-class=GLACIER_IR")).toBe(true);
  expect(url.includes("X-Amz-Date")).toBe(true);
  expect(url.includes("X-Amz-Signature")).toBe(true);
  expect(url.includes("X-Amz-Credential")).toBe(true);
  expect(url.includes("X-Amz-Algorithm")).toBe(true);
  expect(url.includes("X-Amz-SignedHeaders")).toBe(true);
});
```


## [X25519 support in crypto.generateKeyPair](#x25519-support-in-crypto-generatekeypair)


The `crypto.generateKeyPair` API now supports the X25519 curve for key generation and Diffie-Hellman key exchange.

```
import crypto from "node:crypto";
// Generate Alice's keys
const alice = crypto.generateKeyPairSync("x25519", {
  publicKeyEncoding: {
    type: "spki",
    format: "der",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "der",
  },
});
// Generate Bob's keys
const bob = crypto.generateKeyPairSync("x25519", {
  publicKeyEncoding: {
    type: "spki",
    format: "der",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "der",
  },
});
// Convert keys for DH computation
const alicePrivateKey = crypto.createPrivateKey({
  key: alice.privateKey,
  format: "der",
  type: "pkcs8",
});
const bobPublicKey = crypto.createPublicKey({
  key: bob.publicKey,
  format: "der",
  type: "spki",
});
```

Previously, this would throw a `DOMException`:

```
NotSupportedError: The operation is not supported.
```


## [Indented inline snapshots in bun test](#indented-inline-snapshots-in-bun-test)


Jest-style inline snapshots in tests now support indentation, making test files more readable. The indentation is automatically detected and preserved when updating snapshots.

```
test("my test", () => {
  expect(value).toMatchInlineSnapshot(`
    {
      "foo": "bar",
      "baz": 123
    }
  `);
});
```

Thanks to [@pfgithub](https://github.com/pfgithub) for the fix!


## [Improved: String GC Reporting Accuracy](#improved-string-gc-reporting-accuracy)


In WebKit (and Bun), strings are reference-counted. JavaScript strings (which are garbage collected) hold a reference to the reference-counted string. The garbage collector reports the memory usage of the reference-counted string as the [byte length of the string divided by the reference count](https://github.com/WebKit/WebKit/blob/47b66cb0dc7c2146fa7576555c720080708667f3/Source/WTF/wtf/text/StringImpl.h#L1099-L1102):

Source/WTF/wtf/text/StringImpl.h

```
inline size_t StringImpl::costDuringGC()
{
    if (isStatic())
        return 0;
    if (bufferOwnership() == BufferSubstring)
        return divideRoundedUp(substringBuffer()->costDuringGC(), refCount());
    size_t result = m_length;
    if (!is8Bit())
        result <<= 1;
    return divideRoundedUp(result, refCount());
}
```

Previously, Bun's JavaScriptCore bindings would typically have a pattern like this for creating a string for JavaScript to consume:

bun.zig

```
fn myFunction(globalObject: *JSC.JSGlobalObject, input: []const u8) JSC.JSValue {
  // Reference count: 1
  const string = bun.String.createUTF8(input);
  // - Reference count: 1 (after the function returns)
  defer string.deref();
  // + Reference count: 2 (before the function returns)
  return string.toJS(globalObject);
}
```

So, if you used a function like `fs.readFileSync(path, "utf-8")` to read a file containing 64 KB of ASCII data, the memory usage would be reported to JavaScriptCore's garbage collector as *32 KB* instead of *64 KB*.We've updated our bindings to use a different pattern which combines creating the string for JavaScript in a single step, so that the reference count is not incremented an extra time before the JavaScript string is returned.

bun.zig

```
fn myFunction(globalObject: *JSC.JSGlobalObject, input: []const u8) JSC.JSValue {
  // Reference count: 1
  return bun.String.createUTF8ForJS(globalObject, input);
}
```

Will this reduce memory usage?Probably sometimes.


## [Disable minification in HTML imports](#disable-minification-in-html-imports)


You can now disable minification for [HTML imports](https://bun.com/docs/bundler/fullstack) by configuring the `minify` option in `bunfig.toml`:

bunfig.toml

```
[serve.static]
plugins = ["bun-plugin-tailwind"]
minify = false

# or


# minify.whitespace = false


# minify.identifiers = false


# minify.syntax = false

```

If you run into any issues that only occur when `development: false`, try disabling minification.
If unspecified:

-   When you pass `development: true` to Bun.serve(), `minify` is `false`
-   When you pass `development: false` to Bun.serve(), `minify` is `true`

Minification helps in production when you want to have optimized builds with less code to send to the client.
We will expose the rest of the options from `Bun.build` in the near future.


## [Zero-filled buffers with `--zero-fill-buffers` flag](#zero-filled-buffers-with-zero-fill-buffers-flag)


Bun now supports Node.js's `--zero-fill-buffers` flag, which forces all newly allocated buffers to be zero-filled for improved security. When enabled, methods like `Buffer.allocUnsafe()` will always return zero-filled buffers.

```
// Run with: bun --zero-fill-buffers script.js
const buf = Buffer.allocUnsafe(20);
console.log(buf); // Will contain all zeros instead of arbitrary memory
```

Thanks to [@nektro](https://github.com/nektro)!


## [node:process compatibility improvements](#node-process-compatibility-improvements)


-   A bug causing `process.stdin.ref` and `process.stdin.unref` to be `undefined` when it shouldn't have been was fixed.
-   A bug that could cause `process.stdout.write` in rare cases to not prevent the process from exiting was fixed.

Together, these fix a regression impacting `ink`.


## [node:fs compatibility improvements](#node-fs-compatibility-improvements)


This release fixes several compatibility issues with:

-   `fs.{s,f}statSync`
-   `fs.promises.{s,f}stat`
-   `fs.promises.{s,f}statSync`


### [fs.Stats](#fs-stats)


The `fs.Stats` constructor is now consistent with Node.js' behavior.
The following diff;

```
const fs = require("fs");
const stats = new fs.Stats();
console.log(stats);
```

Before vs now:

```
Stats {
 atime: 1970-01-01T00:00:00.000Z,
 atime: Invalid Date,
 atimeMs: 0,
 atimeMs: undefined,
 birthtime: 1970-01-01T00:00:00.000Z,
 birthtime: Invalid Date,
 birthtimeMs: 0,
 birthtimeMs: undefined,
 blksize: 0,
 blksize: undefined,
 blocks: 0,
 blocks: undefined,
 ctime: 1970-01-01T00:00:00.000Z,
 ctime: Invalid Date,
 ctimeMs: 0,
 ctimeMs: undefined,
 dev: 0,
 dev: undefined,
 gid: 0,
 gid: undefined,
 ino: 0,
 ino: undefined,
 isBlockDevice: [Function: isBlockDevice],
 isCharacterDevice: [Function: isCharacterDevice],
 isDirectory: [Function: isDirectory],
 isFIFO: [Function: isFIFO],
 isFile: [Function: isFile],
 isSocket: [Function: isSocket],
 isSymbolicLink: [Function: isSymbolicLink],
 mode: 0,
 mode: undefined,
 mtime: 1970-01-01T00:00:00.000Z,
 mtime: Invalid Date,
 mtimeMs: 0,
 mtimeMs: undefined,
 nlink: 0,
 nlink: undefined,
 rdev: 0,
 rdev: undefined,
 size: 0,
 size: undefined,
 uid: 0,
 uid: undefined,
}
```

Node.js:

```
Stats {
  dev: undefined,
  mode: undefined,
  nlink: undefined,
  uid: undefined,
  gid: undefined,
  rdev: undefined,
  blksize: undefined,
  ino: undefined,
  size: undefined,
  blocks: undefined,
  atimeMs: undefined,
  mtimeMs: undefined,
  ctimeMs: undefined,
  birthtimeMs: undefined,
  atime: Invalid Date,
  mtime: Invalid Date,
  ctime: Invalid Date,
  birthtime: Invalid Date
}
```


### [fs.fstatSync bigint support](#fs-fstatsync-bigint-support)


Previously, the `fs.fstatSync` method ignored the `bigint` option.

```
const fs = require("fs");
const stats = fs.fstatSync(0, { bigint: true });
console.log(stats);
```

Now it supports it.

```
BigIntStats {
  dev: 0n,
  ino: 15807n,
  mode: 8592n,
  nlink: 1n,
  uid: 501n,
  gid: 4n,
  rdev: 268435812n,
  size: 0n,
  blksize: 65536n,
  blocks: 0n,
  atimeMs: 1737726280078n,
  mtimeMs: 1737726280452n,
  ctimeMs: 1737726280452n,
  birthtimeMs: 0n,
  atimeNs: 1737726280078692000n,
  mtimeNs: 1737726280452662000n,
  ctimeNs: 1737726280452662000n,
  birthtimeNs: 0n,
  atime: 2025-01-24T13:44:40.078Z,
  mtime: 2025-01-24T13:44:40.452Z,
  ctime: 2025-01-24T13:44:40.452Z,
  birthtime: 1970-01-01T00:00:00.000Z,
}
```


### [EINTR](#eintr)


There were a few cases where Bun was not handling EINTR in `fs.writeFile` and `fs.readFile`.
These have been fixed. EINTR can interrupt system calls like `read()`, `write()`, `truncate()`, `ftruncate()`, `fchmod()`, and more. The correct behavior is to retry the system call on interruption.


### [Stat uses less memory](#stat-uses-less-memory)



## [node:child\_process bugfix](#node-child-process-bugfix)


A race condition involving multiple sockets as extra file descriptors closing before the handle was associated with the subprocess in `child_process.spawn` was fixed, thanks to [@anaisbetts](https://github.com/anaisbetts).


## [Worker reliability improvements](#worker-reliability-improvements)


We made several reliability improvements to Bun's `Worker` implementation. Worker continues to be experimental (as noted in the [documentation](https://bun.com/docs/api/workers)), but it's now more reliable.

-   A case where events like "close" would not be emitted was fixed.
-   A case where `terminate`'s Promise would not resolve was fixed.


## [More bugfixes](#more-bugfixes)



### [`bun run` no longer tries to execute JSON files](#bun-run-no-longer-tries-to-execute-json-files)


Previously, if you did `bun .` and there was an `index.json` file, Bun would attempt to execute it. Now, Bun won't do that.
Thanks to [@pfgithub](https://github.com/pfgithub) for the fix!


### [Fixed: fs.Dir.close regression](#fixed-fs-dir-close-regression)


A regression in fs.Dir.close was fixed, thanks to [@DonIsaac](https://github.com/DonIsaac).


### [Buffer.prototype.toLocaleString === Buffer.prototype.toString](#buffer-prototype-tolocalestring-buffer-prototype-tostring)


Buffer.prototype.toLocaleString is now an alias for Buffer.prototype.toString, matching Node.js behavior.

```
const buf = Buffer.from("Hello world");
console.log(buf.toString === buf.toLocaleString); // true
```


### [Fixed: dgram socket address/port reuse](#fixed-dgram-socket-address-port-reuse)


The `reuseAddr` and `reusePort` options in UDP sockets now work more reliably across platforms. On Linux, `reusePort` enables load balancing between multiple processes. On other platforms, `reuseAddr` allows reusing an address that is already in use.

```
import { createSocket } from "node:dgram";
// Enable address reuse
const socket = createSocket({
  reuseAddr: true, // Allow reusing address
  reusePort: true, // Enable load balancing on Linux
});
socket.bind(8000);
```

Thanks to [@heimskr](https://github.com/heimskr)!


### [Fixed: Symbol() formatting in Bun.inspect](#fixed-symbol-formatting-in-bun-inspect)


Empty Symbols and Symbols with empty descriptions are now correctly formatted with parentheses when using `Bun.inspect()` or `console.log()`.

```
console.log(Symbol()); // Symbol()
console.log(Symbol("")); // Symbol()
```


### [Fixed: memory leak in Bun.pathToFileURL](#fixed-memory-leak-in-bun-pathtofileurl)


A memory leak in `Bun.pathToFileURL` was fixed. This was caused by incrementing a reference count too many times.


### [Fixed: memory leak in Bun.serve() impacting some requests](#fixed-memory-leak-in-bun-serve-impacting-some-requests)


In some cases, a memory leak could occur for requests with certain URLs. This was fixed. This was caused by not decrementing a reference count in one code path.


### [Fixed: memory leak regression with some strings in Bun v1.2](#fixed-memory-leak-regression-with-some-strings-in-bun-v1-2)


An issue with Bun's JavaScriptCore <> Zig bindings led to certain strings having a reference count that was not decremented. This was fixed.


### [Fixed: AbortSignal GC'ing too early](#fixed-abortsignal-gc-ing-too-early)


A bug where `AbortSignal` could be garbage collected too early was fixed. This occurred when passing to `fetch` or `Bun.spawn` and not having an `"abort"` event listener attached. This bug could cause the `"abort"` event to not be emitted.


## [Thanks to 16 contributors!](#thanks-to-16-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@anaisbetts](https://github.com/anaisbetts)
-   [@andrewbarba](https://github.com/andrewbarba)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@donisaac](https://github.com/donisaac)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@heimskr](https://github.com/heimskr)
-   [@inqnuam](https://github.com/inqnuam)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@kory-smith](https://github.com/kory-smith)
-   [@kwaitsing](https://github.com/kwaitsing)
-   [@nektro](https://github.com/nektro)
-   [@pfgithub](https://github.com/pfgithub)
-   [@riskymh](https://github.com/riskymh)
-   [@zackradisic](https://github.com/zackradisic)