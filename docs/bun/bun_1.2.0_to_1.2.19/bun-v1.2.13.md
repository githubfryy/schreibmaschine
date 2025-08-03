This release fixes 17 bugs (addressing 28 👍, adding +28 passing Node.js tests). Improved --hot stability and Node.js compatibility. Better `node:worker_threads` support, environment data, reduced memory usage for child\_process IPC and worker\_threads. Fixes BOM handling in `.npmrc` files. Fixes hot reloading on older versions of chrome.


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


## [Improved support for `worker_threads`](#improved-support-for-worker-threads)


We made Bun's `worker_threads` implementation more compatible with Node.js.


#### Environment Data


Share data between parent threads and workers with the `environmentData` API:

```
// Share data between workers with environmentData
import {
  Worker,
  getEnvironmentData,
  setEnvironmentData,
} from "node:worker_threads";
// Set data in parent thread
setEnvironmentData("config", { timeout: 1000 });
// Create a worker
const worker = new Worker("./worker.js");
// In worker.js:
import { getEnvironmentData } from "node:worker_threads";
const config = getEnvironmentData("config");
console.log(config.timeout); // 1000
```


#### process.emit `worker` event


You can now listen for `"worker"` events on the `process` object:

```
import { Worker } from "node:worker_threads";
// Listen for the 'worker' event on process
process.on("worker", (worker) => {
  console.log(`New worker created with id: ${worker.threadId}`);
});
const worker = new Worker("./worker.js");
```

This lets you know when a worker is created, and get the `threadId` of the worker.


#### Worker stability improvements


Bun v1.2.13 includes fixes for several worker-related stability issues. We're not ready to mark Worker in Bun as stable yet, but we're getting closer and will update the docs when we do.
Thanks to [@190n](https://github.com/190n) for the contribution!


## [`--hot` stability fixes](#hot-stability-fixes)


This release fixes a crash that could occur when using the `--hot` flag in conjunction with Bun's frontend dev server.
Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


### [Fixed: hot reloading on older versions of chrome](#fixed-hot-reloading-on-older-versions-of-chrome)


Older browsers didn't support using `http:` or `https:` protocol in the `WebSocket` constructor, which could cause HMR to fail. We now normalize to `ws:` or `wss:` protocol.


## [Embedded native addons cleanup](#embedded-native-addons-cleanup)


`bun build --compile` has supported embedding Node.js native addons for a while. To make it work, we copy the native addon into a temporary directory and load it from there. Previously, we relied on the operating system to eventually delete the temporary file from the filesystem (on macOS, this can take 3 days and on Linux, usually when you reboot). Now, we delete these temporary files immediately after loading them.


## [Node.js compatibility improvements](#node-js-compatibility-improvements)



### [Support for passing port as string in net.listen](#support-for-passing-port-as-string-in-net-listen)


Fixed an issue where string ports in Node.js compatibility mode weren't being properly converted to numbers. Now, when a string is passed as the port argument to methods like `net.listen()`, it will be automatically converted to a number if possible.

```
import { createServer } from "net";
// Now works correctly
const server = createServer();
server.listen("3000", () => {
  console.log("Server listening on port " + server.address().port);
});
```

Thanks to [@alii](https://github.com/alii) for the contribution!


### [Include NT prefix in return value of fs.mkdirSync on Windows](#include-nt-prefix-in-return-value-of-fs-mkdirsync-on-windows)


Recursive `fs.mkdirSync` returns the path of the first directory it had to create, if any. When creating an absolute path recursively on Windows, the return value is updated to include the NT prefix to match new versions of Node.js.

```
// On Windows, better error detection and path preservation
import { mkdirSync } from "fs";
const path = mkdirSync("C:\\path\\to\\directory", { recursive: true });
console.log(path);
// Previously outputted C:\path. Now, outputs \\?\C:\path
```


### [util.promisify preserves the function name](#util-promisify-preserves-the-function-name)


`util.promisify` now preserves the name of the wrapped function

```
// Preserves the function name
const promisified = util.promisify(fs.readFile);
console.log(promisified.name); // readFile
```


### [Added warning for `util.promisify` on already-async function](#added-warning-for-util-promisify-on-already-async-function)


`util.promisify` now emits a warning when attempting to promisify a function that already returns a promise.

```
// Now shows proper warnings when promisifying a function that returns a Promise
const util = require("node:util");
const asyncFn = async () => "result";
const promisified = util.promisify(asyncFn);
// Warning: Calling promisify on a function that returns a Promise is likely a mistake.
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for these enhancements to Node.js compatibility!


### [DOMException supports `name` and `cause`](#domexception-supports-name-and-cause)


Added support for creating a DOMException with the `name` and `cause` properties through an options object, matching Node.js behavior.

```
// Create a DOMException with name and cause
const error = new DOMException("Something went wrong", {
  name: "CustomError",
  cause: new Error("Underlying cause"),
});
console.log(error.name); // "CustomError"
console.log(error.cause); // Error: Underlying cause
```

Thanks to [@pfgithub](https://github.com/pfgithub) for this enhancement to Node.js compatibility!


### [NAPI Addon Control with --no-addons Flag](#napi-addon-control-with-no-addons-flag)


Bun now lets you disable Node.js native addons with the new `--no-addons` flag and `"node-addons"` export condition support.

```
// Disable native addons at runtime
bun --no-addons app.js
process.dlopen(module, "addon.node");
// error: Cannot load native addon because loading addons is disabled.
// code: "ERR_DLOPEN_DISABLED"
// Packages can use the "node-addons" export condition
// for conditional exports when addons are enabled/disabled
```

When `--no-addons` is used, any call to `process.dlopen()` will throw an `ERR_DLOPEN_DISABLED` error, and the `"node-addons"` export condition is disabled in the package resolution algorithm.


## [Bugfixes and Performance Improvements](#bugfixes-and-performance-improvements)



### [Faster "numeric hot loops"](#faster-numeric-hot-loops)


Bun has been updated to use a newer version of WebKit (017930ebf). This update includes an optimization for unrolling some numeric loops.
Thanks to [@hyjorc1](https://github.com/hyjorc1) from the JavaScriptCore team for this optimization!


### [Support `toMatchInlineSnapshot` on files indented with hard tabs](#support-tomatchinlinesnapshot-on-files-indented-with-hard-tabs)


Fixed a bug in `toMatchInlineSnapshot` where tab characters weren't properly recognized in indentation matching. This ensures tests with tabbed indentation in inline snapshots now work correctly.

```
test("inline snapshots", () => {
  expect([1, 2]).toMatchInlineSnapshot(`
    [
      1,
      2,
    ]
  `);
});
```

Thanks to [@pfgithub](https://github.com/pfgithub) for the contribution!


### [BOM-aware `.npmrc` file parsing](#bom-aware-npmrc-file-parsing)


Bun now correctly handles Byte Order Mark (BOM) conversions when reading `.npmrc` configuration files. This resolves issues with parsing configuration files, particularly on Windows systems or when files are encoded in UTF-16.

```
// Even if your .npmrc has a UTF-16 BOM marker, Bun will now parse it correctly
// ~/.npmrc with UTF-16 BOM
registry=https://registry.npmjs.org/
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


### [Bun.SQL sql() helper type fixes](#bun-sql-sql-helper-type-fixes)


The TypeScript types for the `sql()` function have been updated

```
// Improved helper function for inserting objects
const user = { name: "John", age: 30 };
await sql`INSERT INTO users ${sql(user)} RETURNING *`;
// The types for this overload are now functional
await sql`INSERT INTO users ${sql(user, "name")} RETURNING *`;
// You can also specify column names with arrays of objects
const usersToInsert = [
  { name: "Bob", age: 30 },
  { name: "Alice", age: 25 },
];
await sql`INSERT INTO users ${sql(usersToInsert, "name")} RETURNING *`;
// You can still pass arrays
await sql`SELECT * FROM users WHERE id IN ${sql([1, 2, 3])}`;
```

Thanks to [@alii](https://github.com/alii) for the contribution!


### [Bun.RedisClient `getBuffer()` method](#bun-redisclient-getbuffer-method)


You can now use `RedisClient#getBuffer` to retrieve binary data

```
import { redis } from "bun";
const buffer = await redis.getBuffer(key);
buffer; // => Uint8Array | null
```

Thanks to [@alii](https://github.com/alii) for the contribution!


### [Reduced memory usage in child process IPC](#reduced-memory-usage-in-child-process-ipc)


Repeatedly spawning multiple child processes using IPC (Inter-Process Communication) uses less memory now.

```
// This would previously leak memory
for (let i = 0; i < 1000; i++) {
  const child = Bun.spawn({
    cmd: ["bun", "worker.js"],
    ipc: () => {},
  });
  child.send({ data: "some message" });
  await child.exited;
}
```

Thanks to [@pfgithub](https://github.com/pfgithub) for the contribution!


### [Thanks to 7 contributors!](#thanks-to-7-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@electroid](https://github.com/electroid)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@pfgithub](https://github.com/pfgithub)