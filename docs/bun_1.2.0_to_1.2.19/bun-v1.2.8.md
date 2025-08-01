This release fixes 18 bugs (addressing 18 👍). napi improvements make node-sdl 100x faster. Headers.get() is 2x faster. Several node:http bugfixes. node:fs improvements. `bun install --frozen-lockfile` now works with `overrides`. `bun pack` now handles directory-specific pattern exclusion.


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


## [NAPI improvement makes node-sdl 100x faster](#napi-improvement-makes-node-sdl-100x-faster)


Fixed an issue where `napi_create_double` was encoding all values as double-precision floating point numbers in JSC, which could lead to performance degradation.
Thanks to @dylan-conway for the contribution!
[`Headers.prototype.get()`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/get), [`Headers.prototype.has()`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/has), and [`Headers.prototype.delete()`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/delete) get 2x faster for common header names like "Content-Type".

```
const headers = new Headers({ "Content-Type": "text/plain" });
// These operations are now 2x faster in Bun
headers.get("Content-Type"); // ~16ns vs ~31ns in 1.2.5
headers.has("Content-Type"); // ~15ns vs ~30ns in 1.2.5
headers.delete("Content-Type"); // ~16ns vs ~31ns in 1.2.5
```


## [Fixed: node:http regressions from v1.2.5](#fixed-node-http-regressions-from-v1-2-5)


In Bun v1.2.5, we rewrote node:http to improve compatibility with Node.js. This introduced some regressions that are now fixed:

-   Fixed a regression where `socket.end()` could cause unexpected errors like `ECONNRESET` and `ERR_STREAM_WRITE_AFTER_END`.
-   Fixed a regression where HTTP POST requests could fail in certain cases with frameworks like Astro, Nuxt, Koa, and Next.js.
-   Fixed a regression where `http.request()` could incorrectly include `Transfer-Encoding: chunked` header in empty requests leading to hanging requests.

Please let us know if you run into any more issues with `node:http`.
Thanks to @cirospaciari & @heimskr for the contribution!


## [node:fs compatibility improvements](#node-fs-compatibility-improvements)


-   Fixed a bug where `Object.assign()` couldn't correctly copy properties from `StatFs` class instances to target objects. This issue was specific to Bun and didn't occur in Node.js.

```
import { statfsSync } from "node:fs";
const target = { existingProp: "value" };
const stats = statfsSync("/");
// Now works correctly
const result = Object.assign(target, stats);
console.log(result); // Contains values from the StatFs object
```

Thanks to @dylan-conway for the contribution!


## [Fixed: `bun install --frozen-lockfile` bug when using `overrides`](#fixed-bun-install-frozen-lockfile-bug-when-using-overrides)


Fixed handling of overrides in the lockfile generation, addressing two specific issues:

1.  Overrides are now sorted consistently before comparing
2.  Even unused overrides are included in the text lockfile

Thanks to @dylan-conway for the contribution!


## [`Bun.write()` improvements](#bun-write-improvements)


-   `Bun.write()` now correctly throws an error when called on a `Blob` created from a `Buffer` or `TypedArray`. Blobs created from bytes are always read-only.
-   `Bun.write()` now properly handles creating directory trees when writing an empty file. This fixes an issue where writing an empty string or writing to a non-existent directory would fail with misleading error messages.

```
// Now works properly - creates directory and file
await Bun.write("./new/directory/empty.txt", "");
```

Thanks to @DonIsaac for the contribution!


## [TypeScript Declaration Improvements](#typescript-declaration-improvements)


This release includes several improvements to Bun's TypeScript type definitions:

-   Fixed AbortSignal static methods (`timeout()`, `abort()`, and `any()`) to work properly in environments where the DOM is missing, also fixing BroadcastChannel issues in non-DOM environments.
-   Fixed TypeScript declarations so that types declared in `Bun.Env` correctly apply to `process.env`, ensuring consistent typing across both access methods.
-   Improved `URLSearchParams` type definitions for better compatibility with `@types/node`, working correctly whether `lib.dom` is enabled or disabled.
-   Fixed generic type parameters for `ReadableStream` and `WritableStream`, updated S3 documentation, and corrected server interface types to properly handle unix sockets and optional properties.

Thanks to @alii for the contribution!


## [Fixed: `bun pack` directory-specific pattern exclusion](#fixed-bun-pack-directory-specific-pattern-exclusion)


`bun pack` now correctly handles excluding entries that are nested within included directories. Previously, exclusion patterns only worked at the top level, but now you can properly exclude specific files or subdirectories within an included path.

```
// Example: Pack a project but exclude nested test files
bun pack --exclude "src//test/" --include "src/"
```

Thanks to @DonIsaac for the contribution!


## [Thanks to 10 contributors!](#thanks-to-10-contributors)


-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@donisaac](https://github.com/donisaac)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@hahalosah](https://github.com/hahalosah)
-   [@heimskr](https://github.com/heimskr)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@nanome203](https://github.com/nanome203)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)