This release includes a new `--console` flag for `bun ./index.html` to stream browser console logs to the terminal. Bun's frontend dev server now uses less memory, and Node.js compatibility improvements for timers, vm, net, http, and bugfixes for TextDecoder, hot reloading reliability bugfixes.


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


## [Stream browser console logs to your terminal](#stream-browser-console-logs-to-your-terminal)


The `--console` flag for `bun ./index.html` streams console logs from the browser to the terminal.

[!](https://bun.com/images/bun-browser-console-log.png)

Stream browser console logs to your terminal

This lets AI tools see console logs & errors from browserswithout worrying about MCP or browser extensions.
Here are two ways to enable console log streaming:
For full-stack development, use the `console: true` option in `Bun.serve()`

fullstack.ts

```
import homepage from "./index.html";
import { serve } from "bun";
serve({
  development: {
    // New: enable console log streaming
    console: true,
    // Enable hot module reloading
    hmr: true,
  },
  routes: {
    "/": homepage,
  },
});
```

For frontend development, use the `--console` flag

bun ./index.html --console

Bunv1.2.19ready in6.62ms
http://localhost:3000/
Pressh+Enterto show shortcuts

When enabled, all browser console.log and console.error calls will be broadcast to the terminal that started the server, reusing the existing WebSocket connection from hot module reloading. This is useful for debugging frontend code by seeing the browser console output in the same place you run your server.
console logs from the browser are prefixed with `[browser]` to make them easy to spot. In future versions of Bun, we might enable this by default.
Thanks to @zackradisic for the contribution!


## [Dev Server uses less memory](#dev-server-uses-less-memory)


Bun's full-stack & frontend dev servers now use significantly less memory.
The below screenshot comparison is a simple React app that imports the entire `lucide-react` library and hot reloads 307 times.

[!](https://bun.com/images/bun-memory-reduction-devserver.png)

272 MB in 1.2.11 vs 150 MB in 1.2.12

This involved several optimizations & architecture changes related to sourcemaps.


## [Fixed: Global package postinstall scripts](#fixed-global-package-postinstall-scripts)


Bun previously blocked global postinstall scripts from running, even when those explicitly opted into running with trusted dependencies. This was vestigal behavior from before Bun supported [`trustedDependencies`](https://bun.sh/guides/install/trusted) to control which packages are allowed to run postinstall scripts.
This impacted popular packages like Claude Code where it could cause an error with `better-sqlite3` to appear.
Thanks to @dylan-conway for the contribution!


### [Micro-optimization: 30μs faster startup](#micro-optimization-30-s-faster-startup)


Bun now starts 30μs faster.

```
❯ poop "bun-1.2.11 --version" "bun --version"
Benchmark 1 (7065 runs): bun-1.2.11 --version
  measurement          mean ± σ            min … max
  wall_time           697us ± 43.8us     546us … 1.14ms
Benchmark 2 (7898 runs): bun --version
  measurement          mean ± σ            min … max
  wall_time           626us ± 35.9us     494us …  914us
```


### [Node.js compatibility improvements](#node-js-compatibility-improvements)



### [98.4% of Node's `timers` tests pass in Bun](#98-4-of-node-s-timers-tests-pass-in-bun)



## node:vm `cachedData` Support


Bun now supports the `cachedData` and `produceCachedData` options in the Node.js `vm.Script` API, along with the `createCachedData` method. This allows for improved performance by caching and reusing compiled JavaScript code.

```
// Create a script with cached bytecode
const script = new vm.Script('console.log("Hello world!")', {
  produceCachedData: true,
});
// Later use the cached data
const cachedData = script.createCachedData();
// Create a new script with the cached bytecode
const newScript = new vm.Script('console.log("Hello world!")', {
  cachedData: cachedData,
});
```

Thanks to @heimskr for the contribution!


## [node:net BlockList support](#node-net-blocklist-support)


Bun now implements the `BlockList` class from the Node.js `net` module, allowing you to create rules to block specific IP addresses, ranges, or subnets.

```
// Create a new BlockList
const blockList = new net.BlockList();
// Add rules
blockList.addAddress("123.123.123.123");
blockList.addRange("10.0.0.1", "10.0.0.10");
blockList.addSubnet("8.8.8.8", 24);
// Check if an address is blocked
blockList.check("123.123.123.123"); // true
blockList.check("8.8.8.9"); // true
blockList.check("192.168.1.1"); // false
```

Thanks to @nektro for the contribution!


### [node:http compatibility improvements](#node-http-compatibility-improvements)


This release fixes several edge cases in the `node:http` module, including:

-   `Agent` abort handling
-   Extra arguments passed to urls in `http.request`


## [More bugfixes](#more-bugfixes)



### [Fixed: rare crash when importing invalid file URLs](#fixed-rare-crash-when-importing-invalid-file-urls)


Fixed an issue where importing invalid file URLs could sometimes cause Bun to crash.


### [Fixed: Erroring in TextDecoder encoding label handling](#fixed-erroring-in-textdecoder-encoding-label-handling)


Fixed issues with TextDecoder encoding label handling, bringing implementation in line with the WHATWG spec. Invalid labels containing null bytes now properly throw errors, and TextDecoder.encoding correctly returns the normalized encoding name for all supported encodings.

```
// Previously allowed, now correctly throws:
try {
  new TextDecoder("utf-8\0");
} catch (e) {
  console.error("Error:", e); // RangeError: ERR_ENCODING_NOT_SUPPORTED
}
// Now correctly returns the normalized encoding name
const decoder = new TextDecoder("utf-16be");
console.log(decoder.encoding); // "utf-16be" (previously returned empty string)
```

Thanks to @pfgithub for the contribution!


### [Fixed: TextDecoder 'fatal' option coercion](#fixed-textdecoder-fatal-option-coercion)


The TextDecoder's `fatal` option now properly coerces values to boolean instead of requiring strict boolean types. This matches browser behavior where values like `0`, `1`, `null`, or strings are automatically converted to appropriate boolean values.

```
// Now works without errors
const decoder1 = new TextDecoder("utf-8", { fatal: 1 });
console.log(decoder1.fatal); // true
const decoder2 = new TextDecoder("utf-8", { fatal: 0 });
console.log(decoder2.fatal); // false
const decoder3 = new TextDecoder("utf-8", { fatal: "any string" });
console.log(decoder3.fatal); // true
const decoder4 = new TextDecoder("utf-8", { fatal: null });
console.log(decoder4.fatal); // false
```

Thanks to @albus-droid for the contribution!


### [Hot reloading reliability bugfixes](#hot-reloading-reliability-bugfixes)


A couple bugs have been fixed that could cause `bun --hot` to spuriously crash after a long time.


### [Thanks to 10 contributors!](#thanks-to-10-contributors)


-   [@190n](https://github.com/190n)
-   [@albus-droid](https://github.com/albus-droid)
-   [@alii](https://github.com/alii)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@electroid](https://github.com/electroid)
-   [@heimskr](https://github.com/heimskr)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@nektro](https://github.com/nektro)
-   [@paperclover](https://github.com/paperclover)
-   [@pfgithub](https://github.com/pfgithub)