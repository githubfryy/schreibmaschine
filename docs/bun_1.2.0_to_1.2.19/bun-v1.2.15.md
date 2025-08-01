This release fixes 11 issues (addressing 261 👍). `bun audit` scans dependencies for security vulnerabilities, `bun pm view` shows package metadata from npm, `bun init` adds a Cursor rule to use Bun instead of Node.js/Vite/npm/pnpm, `node:vm SourceTextModule` and `node:perf_hooks createHistogram` are now implemented.


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


## [`bun audit`](#bun-audit)


`bun audit` performs security audits of your project's dependencies defined in `bun.lock`. It's like `npm audit` but for Bun.

```
esbuild  <=0.24.2
  (direct dependency)
  moderate: esbuild enables any website to send any requests to the development server and read the response - https://github.com/advisories/GHSA-67mh-4wv8-2f99
1 vulnerabilities (1 moderate)
To update all dependencies to the latest compatible versions:
  bun update
To update all dependencies to the latest versions (including breaking changes):
  bun update --latest
```

This uses the same API endpoint that `npm audit` uses.
Thanks to @alii for the contribution!


## [`bun pm view`](#bun-pm-view)


`bun pm view <pkg>` fetches and pretty-prints detailed information about a specified package, including its latest version, description, dependencies, and more.

```
bun pm view react
```

```
bun pm view next property.path
```

```
bun pm view bun --json
```

Like `npm view`, you can pass it properties from the JSON response.


## [`bun init` Cursor rule](#bun-init-cursor-rule)


> In the next version of Bun
> bun init detects if you're using Cursor and adds a Cursor rule to guide the agent to use Bun's CLI & APIs [pic.twitter.com/KzxoXKmMsZ](https://t.co/KzxoXKmMsZ)
> 
> — Jarred Sumner (@jarredsumner) [May 28, 2025](https://twitter.com/jarredsumner/status/1927551961445888440?ref_src=twsrc%5Etfw)


## [`BUN_OPTIONS` prepends command-line arguments](#bun-options-prepends-command-line-arguments)


Bun now supports the `BUN_OPTIONS` environment variable, allowing you to pass command-line arguments and flags to Bun for any command execution. This is analogous to Node.js's `NODE_OPTIONS` and is particularly useful for persistent configurations, CI/CD environments, or when you need to apply global flags without modifying individual scripts and without `~/.bunfig.toml`.

```

# Always use Bun

```

```
BUN_OPTIONS="--bun" bun next dev
```

The `BUN_OPTIONS` variable is parsed with shell-like rules, supporting quoted strings and spaces. Arguments specified via `BUN_OPTIONS` are inserted at the beginning of Bun's argument list, before any arguments specified directly on the command line.

```

# Pass multiple options, including those with spaces or quotes, and use a config file

```

```
BUN_OPTIONS="--config='./my config.toml' --silent" bun run dev.ts
```


## [Edit files in the browser](#edit-files-in-the-browser)


Bun's frontend dev server now supports "automatic workspace folders" in Chrome DevTools.

> In the next version of Bun
> Bun's frontend dev server gets "automatic workspaces" support in Chrome DevTools, so you can edit files in the browser. [pic.twitter.com/5wZ05ihlOX](https://t.co/5wZ05ihlOX)
> 
> — Jarred Sumner (@jarredsumner) [May 28, 2025](https://twitter.com/jarredsumner/status/1927599856798867792?ref_src=twsrc%5Etfw)


## [Node.js compatibility improvements](#node-js-compatibility-improvements)



### [`SourceTextModule` in `node:vm`](#sourcetextmodule-in-node-vm)


Bun v1.2.15 adds support for `vm.SourceTextModule` in `node:vm`, enabling evaluation of ECMAScript modules within different contexts. This update significantly improves compatibility with the `node:vm` module, including handling of module linking, caching mechanisms, and error propagation.

```
import vm from "node:vm";
const context = vm.createContext({
  initialValue: 10,
});
const source = `
  import { multiply } from './operations.js';
  export const finalResult = multiply(initialValue, 5);
`;
// Create a SourceTextModule instance
const module = new vm.SourceTextModule(source, {
  identifier: "my-entry-module.js",
  context: context,
});
// Define the linker function to resolve imports
await module.link(async (specifier, referencingModule) => {
  if (specifier === "./operations.js") {
    const libSource = `export function multiply(a, b) { return a * b; }`;
    return new vm.SourceTextModule(libSource, { context });
  }
  throw new Error(`Failed to resolve module: ${specifier}`);
});
// Evaluate the module within the sandboxed context
await module.evaluate();
// Access the exported namespace
console.log(module.namespace.finalResult); // Expected output: 50
```

Thanks to @heimskr for the contribution!


### [`Worker.getHeapSnapshot` in `node:worker_threads`](#worker-getheapsnapshot-in-node-worker-threads)


Bun now supports `Worker.getHeapSnapshot` in `node:worker_threads`, which lets you track heap usage for a `Worker` with a V8 Heap Snapshot. [Read more about V8 heap snapshots in Bun](https://bun.sh/blog/debugging-memory-leaks).
Thanks to @190n for the contribution!


### [`createHistogram` in `node:perf_hooks`](#createhistogram-in-node-perf-hooks)


Bun now implements `perf_hooks.createHistogram()`, enabling precise tracking of statistical distributions for sampled values. This gets Bun closer to unblocking the popular thread pool library `piscina` from working.

```
import { createHistogram } from "perf_hooks";
// Create a histogram that can record values between 1 and 1,000,000,
// maintaining 3 significant figures of precision.
const histogram = createHistogram({
  lowest: 1,
  highest: 1_000_000,
  figures: 3,
});
histogram.record(100);
histogram.record(200);
histogram.record(1000);
histogram.record(100); // Record a duplicate
console.log("Min:", histogram.min);
console.log("Max:", histogram.max);
console.log("Mean:", histogram.mean);
console.log("Standard Deviation:", histogram.stddev);
console.log("Total Count:", histogram.totalCount);
console.log("Percentile 50 (Median):", histogram.percentile(50));
```

Thanks to @alii for the contribution!


## [JavaScriptCore upgrade](#javascriptcore-upgrade)


This release upgrades JavaScriptCore, which:

-   Fixes a crash that can occur with `await` in very rare cases
-   Improves `NaN` constant folding
-   Fixes a spec edgecase in `eval`
-   Fixes a spec edgecase with bitshifting to the right on an object that implements a `toString` method


## [Bugfixes](#bugfixes)


JavaScript parser bugfixes:

-   Fixed: `await using` in browser bundles using `Symbol.dispose` instead of `Symbol.asyncDispose`
-   Fixed: parsing JSX namespaced attributes with numeric identifiers
-   Fixed: regression from Bun v1.2.14 with `node:assert` module when bundled in the browser
-   Fixed: cache invalidation issue causing the `"browser"` field in `package.json` to be ignored when bundling for the browser after importing the file on the server. For example, when importing `axios` in both the server and browser, it would lead to errors that would not happen if you only imported it in the browser. This has been fixed.

Runtime bugfixes:

-   Fixed: stability issue with `Bun.plugin` module resolution plugins that sometimes could lead to crashes
-   Fixed: `BunRequest.clone()` now preserves `cookies` and `params`
-   Fixed: `bun run --filter` ignoring `NO_COLOR` on Windows
-   Fixed: `new Bun.CookieMap(object)` incorrectly validated the object passed to it as a valid HTTP header, causing errors that should not have happened.

Node.js compatibility bugfixes:

-   Fixed: memory leak in error handling for DNS resolution from c-ares (`node:dns`)
-   Fixed: `ERR_SSL_NO_CIPHER_MATCH` when attempting to establish a TLS connection or create a TLS server with an unsupported or invalid cipher suite.
-   Fixed: `net.Socket` constructor validation for `fd` option

TypeScript type fixes:

-   Fixed: `spyOn` Type Inference for Optional Methods
-   Fixed: `CryptoKeyPair` global type


### [Thanks to 15 contributors!](#thanks-to-15-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@arrowana](https://github.com/arrowana)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@electroid](https://github.com/electroid)
-   [@familyboat](https://github.com/familyboat)
-   [@getchoo](https://github.com/getchoo)
-   [@heimskr](https://github.com/heimskr)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@li-yechao](https://github.com/li-yechao)
-   [@nektro](https://github.com/nektro)
-   [@pfgithub](https://github.com/pfgithub)
-   [@sculas](https://github.com/sculas)
-   [@water-sucks](https://github.com/water-sucks)