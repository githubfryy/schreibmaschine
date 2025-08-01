This release fixes 73 issues (addressing 124 👍), and adds +119 passing Node.js tests. Serve files with `Bun.serve` through `routes`, `install.linkWorkspacePackages` option in `bunfig.toml`, `bun outdated` support for catalogs, `Bun.hash.rapidhash`, `node:net` compatibility, `vm.SyntheticModule` support, `HTTPParser` binding, and memory leak fixes.


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


## [Serve files with `Bun.serve` through `routes`](#serve-files-with-bun-serve-through-routes)


Bun v1.2.16 adds support for returning files for routes, making it easier to serve files directly without needing to manually read and buffer them.


## [`install.linkWorkspacePackages` in bunfig.toml](#install-linkworkspacepackages-in-bunfig-toml)


Bun now supports a `linkWorkspacePackages` configuration option that controls workspace package linking behavior. This is particularly useful in CI environments where installing pre-built packages from the registry is faster than building from source.

```
[install]
linkWorkspacePackages = false
```

When set to `false`, Bun installs workspace dependencies from the registry instead of linking them locally. The default value is `true` to maintain backward compatibility. Note that `workspace:*` protocol is still respected even when this option is disabled.
Thanks to [@THEjacob1000](https://github.com/THEjacob1000) for the contribution!


## [`bun outdated` support for catalog dependencies](#bun-outdated-support-for-catalog-dependencies)


`bun outdated` now supports catalog dependencies, making it easier to check for updates across a monorepo.

package.json

```
{
  "name": "my-monorepo",
  "workspaces": {
    "packages": ["packages/*"],
    "catalog": {
      "react": "^18.0.0",
      "react-dom": "^18.0.0",
      "typescript": "^4.0.0"
    }
  }
}
```

packages/app/package.json

```
{
  "name": "app",
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:",
    "typescript": "catalog:"
  }
}
```

Running `bun outdated` for this workspace package now shows updates available for its catalog dependencies:

```
bun outdated -F app
```

```
|----------------------------------------|
| Package    | Current | Update | Latest |
|------------|---------|--------|--------|
| react      | 18.3.1  | 18.3.1 | 19.1.0 |
|------------|---------|--------|--------|
| react-dom  | 18.3.1  | 18.3.1 | 19.1.0 |
|------------|---------|--------|--------|
| typescript | 4.9.5   | 4.9.5  | 5.8.3  |
|----------------------------------------|
```

Thanks to [@juliesaia](https://github.com/juliesaia) for the contribution!


## [`Bun.hash.rapidhash`](#bun-hash-rapidhash)


Bun v1.2.16 adds support for rapidhash in `Bun.hash`.

```
const hash = Bun.hash.rapidhash("hello world");
console.log(hash); // 6388527444622164108n
```

Rapidhash shows competitive performance, especially for larger inputs, making it a great choice for non-cryptographic hashing needs.
Thanks to [@joelshepherd](https://github.com/joelshepherd) for the contribution!


## [Node.js compatibility improvements](#node-js-compatibility-improvements)



### [Major `node:net` rework](#major-node-net-rework)


Bun v1.2.16 includes a rework of the `node:net` module, significantly improving Node.js compatibility. Highlights:

-   Adds 43 new passing Node.js `node:net` tests
-   `server.maxConnections`
-   Improves socket connection callback behavior
-   Fixes TLS upgrade functionality
-   Correctly recognizes custom methods on extended Socket classes
-   `socket.localAddress()` and `socket.remoteAddress()` fixed
-   `node:net` now calls `dns.lookup` similarly to Node.js
-   `net.BlockList` support for `net.Socket` and `net.Server`

Thanks to [@nektro](https://github.com/nektro)!


### [`vm.SyntheticModule` support](#vm-syntheticmodule-support)


Bun now implements `vm.SyntheticModule`, enabling creation and evaluation of synthetic modules in the VM context.

```
import vm from "node:vm";
const module = new vm.SyntheticModule(["x"], function () {
  this.setExport("x", 42);
});
await module.link(() => {});
await module.evaluate();
console.log(module.namespace.x); // 42
```

This also includes support for `createCachedData`, `produceCachedData`, and `cachedDataProduced` properties, along with custom inspection for `vm.Module`.
Implemented thanks to [@heimskr](https://github.com/heimskr)!


### [`HTTPParser` binding](#httpparser-binding)


Bun v1.2.16 adds `process.binding('http_parser')` (also adding `HTTPParser` to `node:_http_common`), improving compatibility with Node.js HTTP internals.

index.js

```
const { HTTPParser } = process.binding('http_parser');
const parser = new HTTPParser();
parser.initialize(HTTPParser.REQUEST, {});
const input = Buffer.from("GET / HTTP/1.1\r\nHost: example.com\r\n\r\n");
parser[HTTPParser.kOnHeaders] = function () {
    console.log("Headers!");
};
parser.execute(input);
```

The implementation uses the [`llhttp`](https://github.com/nodejs/llhttp) library for parsing in order to match Node.js behavior exactly.
Thanks to [@dylan-conway](https://github.com/dylan-conway)!


### [`node:timers/promises` accepts `AbortController` for `options` argument](#node-timers-promises-accepts-abortcontroller-for-options-argument)


The functions in the `node:timers/promises` module accept an `options` argument which supports several properties, such as `signal` to provide an `AbortSignal` for cancelling the timer. Since `AbortController` objects also have a `signal` property, it should be possible to pass an `AbortController` directly in order to use its signal to cancel the timer:

```
import { setTimeout } from "node:timers/promises";
const controller = new AbortController();
const promise = setTimeout(100, undefined, controller);
controller.abort();
promise.catch((e) => console.error(e)); // AbortError
```

Previously, Bun's object validation was too strict and would reject the `AbortController` because it is not a plain object. Now this pattern is supported in Bun. This has fixed compatibility for certain [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/) subcommands when run in Bun.
Thanks to [@SunsetTechuila](https://github.com/SunsetTechuila) for this fix!


## [Memory leak fixes](#memory-leak-fixes)


This release fixes a few memory leaks:

-   N-API handle scopes: Fixed rare race condition and memory leak in `NapiHandleScopeImpl` where garbage collection wasn't properly cleaning up handle scope implementations
-   Bun.spawn stdio: Fixed memory leak when piped stdio from `Bun.spawn` was never read.


## [Bugfixes](#bugfixes)


Runtime bugfixes:

-   Fixed: `bytesWritten` calculation in `node:net` when handling buffered string writes
-   Fixed: process.stdin buffering issue on macOS where input wasn't being emitted incrementally
-   Fixed: potential exit signal hanging in loops
-   Fixed: duplicate Transfer-Encoding header sent in `node:http` in certain cases
-   Fixed: SharedArrayBuffer crashing on transfer
-   Fixed: crash when accessing cookies before proper initialization
-   Fixed: `"undefined is not an object"` error when interrupting Next.js dev server with Ctrl+C
-   Fixed: DevServer crash when using Tailwind CSS
-   Fixed: TOML parser incorrectly handling table array headers after inline tables

JavaScript parser bugfixes:

-   Fixed: crash with malformed function definitions

CSS parser bugfixes:

-   Fixed: CSS `calc()` expressions causing stack overflow with nested calculations
-   Fixed: radians incorrectly converted to degrees in CSS transform functions

FFI bugfixes:

-   Fixed: `bun:ffi` new CString() ignoring byteOffset argument when byteLength not provided

TLS bugfixes:

-   Fixed: TLS server identity verification improvements
-   Fixed: proper handling of IP range normalization (e.g., "8.8.8.0/24")

HTTP/2 bugfixes:

-   Fixed: HTTP/2 flow control and protocol handling issues

Windows bugfixes:

-   Fixed: crash handler now uses `abort()` instead of `quick_exit(134)` for better debugging
-   Fixed: WebKit and libpas dependencies updated for Windows builds

Environment variables:

-   Added: `BUN_BE_BUN` environment variable for running the Bun binary instead of the entry point of a single-file executable

CLI improvements:

-   Improved: help text formatting and documentation links for package manager commands
-   Removed: `audit` from `bun pm` help (use `bun audit` directly)

TypeScript types:

-   Fixed: `RedisClient.prototype.del` accepts one or more keys as arguments


### [Thanks to 25 contributors!](#thanks-to-25-contributors)


-   [@190n](https://github.com/190n)
-   [@39ali](https://github.com/39ali)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@connerlphillippi](https://github.com/connerlphillippi)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@electroid](https://github.com/electroid)
-   [@familyboat](https://github.com/familyboat)
-   [@gameroman](https://github.com/gameroman)
-   [@heimskr](https://github.com/heimskr)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@joelshepherd](https://github.com/joelshepherd)
-   [@juliesaia](https://github.com/juliesaia)
-   [@justinyaodu](https://github.com/justinyaodu)
-   [@leanderpaul](https://github.com/leanderpaul)
-   [@nektro](https://github.com/nektro)
-   [@nobkd](https://github.com/nobkd)
-   [@pfgithub](https://github.com/pfgithub)
-   [@pxseu](https://github.com/pxseu)
-   [@sponte](https://github.com/sponte)
-   [@sunsettechuila](https://github.com/sunsettechuila)
-   [@thdxr](https://github.com/thdxr)
-   [@thejacob1000](https://github.com/thejacob1000)
-   [@wldfngrs](https://github.com/wldfngrs)
-   [@zackradisic](https://github.com/zackradisic)