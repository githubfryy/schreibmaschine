This release fixes 62 bugs (addressing 77 👍). It adds support for `process.ref` and `process.unref`, `util.parseArgs` negative options, `BUN_INSPECT_PRELOAD`, Highway SIMD, Node.js compatibility improvements for `node:http`, `node:https`, `node:crypto`, `node:tls`, and `node:readline`.


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


## [`util.parseArgs` negative options and default arguments](#util-parseargs-negative-options-and-default-arguments)


This release adds support for negative options in `util.parseArgs` with `allowNegative`. This allows you to prefix options with `no-` for a false value.

```
const { parseArgs } = require('util');
const args = parseArgs({
  args: ['--no-foo'],
  allowNegative: true,
  options: {
    foo: { type: 'boolean' },
  }
});
console.log(args.values.foo); // false
```

Also supported in this release: calling `parseArgs` without `args` will now default to `process.argv`.

```
bun -p \
```

```
'require("util").parseArgs({options:{foo:{type:"boolean"}}}).values.foo' \
      -- --foo
true
```

Thanks to [@dylan-conway](https://github.com/dylan-conway)!


## [Highway SIMD](#highway-simd)


Bun v1.2.11 adds Google's Highway SIMD library, shrinking the performance gap between baseline and non-baseline builds by selecting the best SIMD implementation at runtime. While adding the library, lexing inline sourcemaps in our JavaScript parser was refactored and is now ~40% faster.


## [Preload with `BUN_INSPECT_PRELOAD`](#preload-with-bun-inspect-preload)


Bun now supports using the `BUN_INSPECT_PRELOAD` environment variable as an equivalent to the `--preload` flag. This allows you to specify a file to be preloaded before running a script.

```
$ BUN_INSPECT_PRELOAD=./setup.js bun run index.js
// Same as:
$ bun --preload ./setup.js run index.js
```

Thanks to [@zackradisic](https://github.com/zackradisic)!


## [DevServer reliability improvements](#devserver-reliability-improvements)


Fixed multiple DevServer crashes related to source map handling and event processing. New stress testing has been added to ensure future reliability.
Thanks to [@paperclover](https://github.com/paperclover)!


## [Support `process.ref` and `process.unref`](#support-process-ref-and-process-unref)


Bun now supports `process.ref()` and `process.unref()` methods, which provide a standardized way to control whether objects prevent the event loop from exiting.

```
const customTimer = {
  ref() { },
  unref() { }
};
process.ref(customTimer);   // Calls customTimer.ref()
process.unref(customTimer); // Calls customTimer.unref()
// Also works with symbols
const symbolTimer = {
  [Symbol.for('nodejs.ref')]() { },
  [Symbol.for('nodejs.unref')]() { }
};
process.ref(symbolTimer);
process.unref(symbolTimer);
// And with native timers
const interval = setInterval(() => {}, 1000);
process.unref(interval);
process.ref(interval);
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


## [Fixed `require.extensions` index out of bounds](#fixed-require-extensions-index-out-of-bounds)


An edge case in `require.extensions` handling that could lead to an "index out of bounds" crash has been fixed. This issue could occur when assigning and removing multiple custom extension handlers. The fix can be seen [here](https://github.com/oven-sh/bun/pull/19231).
Thanks to [@paperclover](https://github.com/paperclover)!


## [`node:crypto` compatibility improvements](#node-crypto-compatibility-improvements)


Bun v1.2.11 improves `node:crypto` by reimplementing the full `KeyObject` class hierarchy (`SecretKeyObject`, `PublicKeyObject`, `PrivateKeyObject`) and adding `structuredClone` support for both `KeyObject` and `CryptoKey` class instances.

```
const secretKey = crypto.generateKeySync("aes", { length: 128 });
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
// Keys are now clonable
const secretKeyClone = structuredClone(secretKey);
const publicKeyClone = structuredClone(publicKey);
const privateKeyClone = structuredClone(privateKey);
console.log(
  publicKey.equals(publicKeyClone),   // true
  privateKey.equals(privateKeyClone), // true
  secretKey.equals(secretKeyClone),   // true
);
console.log(
    publicKey.constructor.name,  // PublicKeyObjet
    privateKey.constructor.name, // PrivateKeyObject
    secretKey.constructor.name,  // SecretKeyObject
);
```

Thanks to [@dylan-conway](https://github.com/dylan-conway)!


## [`crypto.generatePrime(Sync)` return type fix](#crypto-generateprime-sync-return-type-fix)


The `crypto.generatePrime` and `crypto.generatePrimeSync` functions now correctly return `ArrayBuffer` instead of `Buffer`.

```
const prime = crypto.generatePrimeSync(512);
console.log(prime instanceof ArrayBuffer); // true
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


## [Fix boolean check in `node:https` `createServer`](#fix-boolean-check-in-node-https-createserver)


Fixed a compatibility issue with `node:https` where the `rejectUnauthorized` option was not properly validated as a boolean.

```
// This code will now properly validate boolean options
const https = require('https');
const server = https.createServer({
  key: key,
  cert: cert,
  rejectUnauthorized: "not a boolean" // Will throw a TypeError
});
```

Thanks to [@alii](https://github.com/alii)!


## [Fix `node:readline/promises` error handling](#fix-node-readline-promises-error-handling)


Fixed an issue with error handling in `node:readline/promises`. The fix properly rejects promises when errors occur during readline operations.

```
// Before, errors could be silently ignored
const readline = new Readline(writable);
await readline.clearLine(0).commit(); // Could silently fail
// Now errors are properly propagated
try {
  await readline.clearLine(0).commit();
} catch (err) {
  console.error(err);
}
```

Thanks to [@alii](https://github.com/alii) for the contribution!


## [TypeScript improvements for `Bun.$`](#typescript-improvements-for-bun)


The `Bun.$` shell API can now be used as a type, allowing for better TypeScript integration when working with shell instances.

```
class Wrapper {
  shell: Bun.$; // Bun.$ is now available as a type
  constructor() {
    this.shell = Bun.$.nothrow();
  }
}
```

Thanks to [@alii](https://github.com/alii) for the contribution!


## [Fix for PostgreSQL flush method](#fix-for-postgresql-flush-method)


Fixed an issue where the `flush()` method on PostgreSQL connections was undefined. The method is now properly implemented and works as expected.

```
await sql`SELECT * FROM users WHERE id = ${userId}`;
sql.flush(); // Works correctly now
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


## [Fixed type validation in HTTP/2 client options](#fixed-type-validation-in-http-2-client-options)


The HTTP/2 client request method now properly validates option parameters, throwing appropriate type errors when incorrect values are provided for `endStream`, `weight`, `parent`, `exclusive`, and `silent` options.

```
// This will now properly throw a type error
const client = http2.connect(`http://localhost:${port}`);
client.request({
  ':method': 'GET',
  ':path': '/'
}, {
  silent: "yes",  // Error: options.silent must be a boolean
  weight: "high"  // Error: options.weight must be a number
});
```

Thanks to [@alii](https://github.com/alii) for the contribution!


## [Fixed HTTP/2 client port stringification](#fixed-http-2-client-port-stringification)


Fixed an issue in the HTTP/2 client implementation where ports were not stringified correctly.

```
const connect = net.connect;
net.connect = (...args) => {
  console.log(args[0].port === '80'); // true
  return connect(...args);
}
const client = http2.connect('http://localhost:80');
```

Thanks to [@alii](https://github.com/alii) for the contribution!


## [Fix dead code elimination for unused calls in comma expressions](#fix-dead-code-elimination-for-unused-calls-in-comma-expressions)


Bun now correctly eliminates unused function calls inside comma expressions during minification when the functions are pure. In the previous version, this could cause syntax errors for valid code.

```
const result = (/* @__PURE__ */ funcWithNoSideEffects(), 456);
// Output was previously incorrectly transformed into:
const result = ( , 456);
```

Thanks to [@paperclover](https://github.com/paperclover)!


## [Fixed `queueMicrotask` error handling](#fixed-queuemicrotask-error-handling)


Error handling in `queueMicrotask` has been improved. When passing an invalid argument (like `null`) it now throws an error with code `ERR_INVALID_ARG_TYPE` matching Node.js behavior.

```
queueMicrotask(null);
```

Thanks to [@dylan-conway](https://github.com/dylan-conway)!


## [Fixed typo in `ReadableStream.prototype.tee`](#fixed-typo-in-readablestream-prototype-tee)


Fixed a bug in the implementation of `ReadableStream.prototype.tee()` where a typo in the property name (`fllags` instead of `flags`) could cause incorrect behavior when checking for canceled stream states.

```
if (teeState.fllags & (TeeStateFlags.canceled1 | TeeStateFlags.canceled2))
if (teeState.flags & (TeeStateFlags.canceled1 | TeeStateFlags.canceled2))
```


## [Fixed crash in `Bun.plugin`](#fixed-crash-in-bun-plugin)


Fixed an issue where using `Bun.plugin` in certain scenarios (particularly with recursive plugin calls) could crash. Proper exception handling has been added to prevent crashes when plugins encounter errors.

```
Bun.plugin({
  name: "recursion",
  setup(builder) {
    builder.onResolve({ filter: /.*/, namespace: "recursion" }, ({ path }) => ({
      path: require.resolve("recursion:" + path),
      namespace: "recursion",
    }));
  },
});
```


## [Fixed TLSSocket `allowHalfOpen` behavior](#fixed-tlssocket-allowhalfopen-behavior)


Bun now correctly matches Node.js behavior for the `allowHalfOpen` property in `TLSSocket`. When a socket is passed to the `TLSSocket` constructor that is either a `net.Socket` or a `stream.Duplex`, the `allowHalfOpen` option is now properly ignored and set to `false`, regardless of the value specified in options.

```
const socket = new tls.TLSSocket(new net.Socket(), { allowHalfOpen: true });
console.log(socket.allowHalfOpen); // false
const customSocket = new tls.TLSSocket(undefined, { allowHalfOpen: true });
console.log(customSocket.allowHalfOpen); // false
```

Thanks to [@alii](https://github.com/alii) for the contribution!


## [Thanks to 14 contributors!](#thanks-to-14-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@eckhardt-d](https://github.com/eckhardt-d)
-   [@electroid](https://github.com/electroid)
-   [@heimskr](https://github.com/heimskr)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@mastermakrela](https://github.com/mastermakrela)
-   [@nektro](https://github.com/nektro)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)
-   [@x04](https://github.com/x04)
-   [@zackradisic](https://github.com/zackradisic)