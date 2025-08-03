This release fixes 39 issues (addressing 179 👍) and adds support for catalogs in `bun install`, a `--react` flag for `bun init`, improved HTTP routing with method-specific routes, better TypeScript default module settings, fixes a HTTPS proxy issue impacting Codex, and several Node.js compatibility improvements including worker\_threads reliability enhancements and http2 server improvements.


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


## [Catalogs in `bun install`](#catalogs-in-bun-install)


Bun now supports [catalogs](https://bun.sh/docs/install/catalogs), a powerful way to manage common dependency versions across monorepo workspaces.


### [How catalogs work](#how-catalogs-work)


Define dependency versions once in the root `package.json` and reference them throughout your packages with the `catalog:` protocol.

root/package.json

```
{
  "workspaces": {
    "packages": ["packages/*"],
    "catalog": {
      "react": "^19.0.0",
      "zod": "4.0.0-beta.1"
    },
  }
}
```

In your workspace packages, reference the dependency with the `catalog:` protocol.

packages/my-package/package.json

```
{
  "name": "my-package",
  "dependencies": {
    "react": "catalog:"
  }
}
```

Catalogs let you specify a single version of a dependency across all packages. When publishing or packing, Bun automatically replaces the catalog reference with the version specified in the catalog. That way, if you want to ensure your workspace uses the same version of a package like `react`, you only have to update it in one place instead of every package.
Thanks to @dylan-conway for the contribution!


## [zstd support in fetch](#zstd-support-in-fetch)


Bun now supports [Zstandard (zstd)](https://en.wikipedia.org/wiki/Zstandard) decompression in the HTTP client. The HTTP client will automatically decompress responses with `Content-Encoding: zstd` and can request zstd-compressed responses by including `zstd` in the `Accept-Encoding` header. The default `Accept-Encoding` header is now `gzip, deflate, br, zstd`.

```
// Request a zstd-compressed response
const response = await fetch("https://example.com", {
  headers: {
    "Accept-Encoding": "zstd",
  },
});
// Decompress the response
const decompressed = await response.text();
```


### [Bun.zstdCompress and Bun.zstdDecompress](#bun-zstdcompress-and-bun-zstddecompress)


Additionally, Bun now provides utilities for working with zstd compression directly:

```
// Compress data using zstd
const compressed = Bun.zstdCompressSync("hello world", { level: 5 });
// Async compression
const compressedAsync = await Bun.zstdCompress("hello world");
// Decompress zstd data
const decompressed = Bun.zstdDecompressSync(compressed);
// Async decompression
const decompressedAsync = await Bun.zstdDecompress(compressed);
```


## [`--react` flag for `bun init`](#react-flag-for-bun-init)


`bun init` now supports a `--react` flag to quickly bootstrap a React project with popular configurations including Tailwind CSS and shadcn/ui.

```
bun init --react
```

```
bun init --react=tailwind
```

```
bun init --react=shadcn
```

This builds on the React templates added in [Bun v1.2.3](https://bun.sh/blog/bun-v1.2.3) to support specifying a React template without a tty, which is useful for projects & tooling running `bun init` programmatically.


## [Better TypeScript Default Module Setting](#better-typescript-default-module-setting)


Bun's default TypeScript configuration now uses `"module": "Preserve"` instead of `"module": "ESNext"`. This is a more appropriate default as it preserves the module syntax you write rather than transforming it, giving you more control over your code output. You can [learn more about 'Preserve' on the TypeScript website](https://www.typescriptlang.org/docs/handbook/modules/reference.html#preserve).

```
// tsconfig.json
{
  "compilerOptions": {
    // Old setting
    // "module": "ESNext",
    // New setting - preserves the exact module syntax you write
    "module": "Preserve"
  }
}
```

This change applies to default configurations for new projects and is recommended for existing projects.
Thanks to @mattpocock and @alii for the contribution!


## [Improved HTTP routing](#improved-http-routing)


Bun.serve() `routes` now supports applying routes to specific HTTP methods for both static `Response` objects and HTML imports.

> In the next version of Bun
> HTML imports & static routes can be applied to specific HTTP methods instead of all HTTP methods, which is useful for CORS. [pic.twitter.com/XcYk2uHjVQ](https://t.co/XcYk2uHjVQ)
> 
> — Jarred Sumner (@jarredsumner) [May 17, 2025](https://twitter.com/jarredsumner/status/1923638623540478347?ref_src=twsrc%5Etfw)

We've also fixed a bug where `/*` would have higher precedence than method-specific routes.


## [Fixed: HTTPS client proxy reliability impacting Codex](#fixed-https-client-proxy-reliability-impacting-codex)


A reliability issue with Bun's HTTPS client when using proxies has been fixed. This issue impacted Codex, leading to hangs when installing dependencies.
Thanks to @cirospaciari for the fix!


## [Node.js compatibility improvements](#node-js-compatibility-improvements)



### [worker\_threads reliability improvements](#worker-threads-reliability-improvements)


We've continued to make improvements to `Worker` reliability. One difference between Web Workers and `worker_threads` is that when an unhandled exception occurs in a Web Worker, the `ErrorEvent` emitted only contains a stringified representation of the error. Node.js `worker_threads` on the other hand, will emit an `Error` object.

```
// Web Worker
new Worker("worker.js").onerror = (event) => {
  console.log(event.constructor.name); // "ErrorEvent"
  console.log(event.message); // "Uncaught Error: test"
};
// worker_threads
import { Worker as NodeWorker } from "node:worker_threads";
const worker = new NodeWorker("worker.js");
worker.on("error", (error) => {
  console.log(error.constructor.name); // "Error"
  console.log(error.message); // "test"
});
```

Now, `worker_threads` in Bun will emit an `Error` object when an unhandled exception occurs instead of the stringified error event from Web Workers. This improves the quality of error messages when using `worker_threads`.
Thanks to @190n for the contribution!


### [node:http2 server improvements](#node-http2-server-improvements)


Bun's `node:http2` implementation now supports `maxSendHeaderBlockLength`, which limits the size of the header block that can be sent in a single frame. This is useful for preventing memory issues when sending large headers.

```
const server = http2.createServer({
  maxSendHeaderBlockLength: 1024 * 1024, // 1MB
});
// ...
```

For the client, we've also added support for `setNextStreamID`, which allows you to set the next stream ID for the http2 connection.
Thanks to @cirospaciari for the contribution!


### [Additional bugfixes for Node.js compatibility:](#additional-bugfixes-for-node-js-compatibility)


-   numeric header names in node:http server's request.headers work as expected.
-   `BroadcastChannel.prototype.unref()` would return `undefined` instead of the `BroadcastChannel` instance.
-   `ERR_EVENT_RECURSION` is now thrown when expected.


## [Bugfixes](#bugfixes)


-   `bun --install=force <script.ts>` would not respect the `--install=force` flag.
-   `new TextDecoder("utf-8", undefined)` would throw an error instead of ignoring the `undefined` argument.
-   HTTP/1.1 chunked encoding extension are no longer rejected
-   inconsistent floating point math results in JavaScript transpiler compared to runtime behavior.
-   CSS custom property parser edgecase
-   `util.inherits` in `bun build --target=browser` did not exist. Now it exists.


### [Thanks to 13 contributors!](#thanks-to-13-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@bradeneverson](https://github.com/bradeneverson)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@devsdk](https://github.com/devsdk)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@electroid](https://github.com/electroid)
-   [@huiyifyj](https://github.com/huiyifyj)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@nektro](https://github.com/nektro)
-   [@pfgithub](https://github.com/pfgithub)
-   [@riskymh](https://github.com/riskymh)
-   [@sverp](https://github.com/sverp)