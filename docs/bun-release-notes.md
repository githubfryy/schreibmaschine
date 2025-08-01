# Bun 1.2.0-1.2.19 Complete Developer Feature Reference

This comprehensive guide covers all practical developer features, APIs, and capabilities available in Bun releases 1.2.0 through 1.2.19.

## **Major Built-in APIs**

### **S3 Object Storage (`Bun.s3`)**
Native S3 client with **5x faster** performance than AWS SDK:

```javascript
import { s3 } from "bun";

// Reading files
const file = s3.file("folder/my-file.txt");
const content = await file.text();

// Writing files
await file.write("hello s3!");

// Streaming uploads for large files
const writer = file.writer();
for (let i = 0; i = ${65}`;

// Dynamic queries and bulk operations
const newUsers = [{ name: "Alice", age: 25 }, { name: "Bob", age: 65 }];
await sql`INSERT INTO users (name, age) VALUES ${sql(newUsers)}`;
await sql`INSERT INTO users ${sql(user, "name", "email")}`;
await sql`UPDATE users SET ${sql(user)} WHERE id = ${user.id}`;
await sql`SELECT * FROM users WHERE id IN ${sql([1, 2, 3])}`;

// Unix socket connections
const db = new SQL({
  path: "/tmp/.s.PGSQL.5432",
  user: "postgres",
  database: "mydb"
});

// Automatic pipelining for high performance
const queries = [];
for (let i = 0; i  {
      const { id } = req.params;
      const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
      return Response.json(user);
    },
    "GET /api/data": getDataHandler,
    "POST /api/users": createUserHandler,
    "/static/*": staticFileHandler, // All methods
  },
  static: {
    "/health": new Response("OK"),
    "/api/version": Response.json({ version: "1.2.0" })
  }
});
```

### **Cookie Management (`Bun.Cookie` & `Bun.CookieMap`)**
Map-like API for handling cookies with automatic `Set-Cookie` header management:

```javascript
const server = Bun.serve({
  routes: {
    "/sign-in": (request) => {
      const cookies = request.cookies; // CookieMap instance
      cookies.set("sessionId", "abc123", {
        httpOnly: true,
        sameSite: "strict",
        secure: true
      });
      return new Response("Signed in"); // Set-Cookie added automatically
    },
    "/sign-out": (request) => {
      request.cookies.delete("sessionId"); // Expires cookie
      return new Response("Signed out");
    }
  }
});

// Standalone cookie handling
const cookieMap = new Bun.CookieMap();
cookieMap.set("user", "alice");
console.log(cookieMap.toSetCookieHeaders()); // Array of Set-Cookie strings
```

### **CSRF Protection (`Bun.CSRF`)**
```javascript
const token = Bun.CSRF.generate();
const isValid = Bun.CSRF.verify(token, userProvidedToken);
```

## **Frontend Development**

### **Frontend Development Server**
Run HTML files directly with zero configuration:

```bash
bun ./index.html  # Single page apps
bun './src/**/*.html'  # Multi-page apps
bun ./index.html --console  # Stream browser console to terminal
```

Built-in features:
- React support out-of-the-box
- Hot module reloading (HMR)
- CSS Modules with automatic scoping
- TypeScript/JSX transpilation
- Automatic bundling
- Chrome DevTools integration
- Svelte support via official plugin

#### **CSS Modules Support**
```css
/* style.module.css */
.button { background: blue; }
.button:hover { background: darkblue; }
```

```javascript
import styles from './style.module.css';
button.className = styles.button; // Scoped class name
```

#### **Advanced HMR API**
```javascript
// Self-accepting modules
import.meta.hot.accept();

// Accept specific dependencies
import.meta.hot.accept("./foo", (newFoo) => {
  state.foo = newFoo;
});

// Listen to HMR events
import.meta.hot.on("bun:beforeUpdate", () => {
  console.log("Preparing for update...");
});
```

#### **Svelte Integration**
```javascript
import { SveltePlugin } from "bun-plugin-svelte";

Bun.build({
  entrypoints: ["src/index.ts"],
  plugins: [
    SveltePlugin({
      development: true,
      target: "browser" // or "bun", "node"
    })
  ]
});
```

#### **React Quick Setup**
```bash
bun init --react          # Basic React setup
bun init --react=tailwind # React with Tailwind CSS
bun init --react=shadcn   # React with shadcn/ui
```

## **Package Management**

### **Text-based Lockfile (`bun.lock`)**
JSONC format with comments and trailing commas, **30% faster** installation:

```json
{
  "lockfileVersion": 0,
  "packages": [
    ["react@18.2.0", /* ... */],
    /* more packages */
  ]
}
```

### **Installation Options**
```bash
bun install                     # Standard installation
bun install --linker=isolated  # pnpm-style isolated symlinked node_modules
bun install --analyze          # Auto-detect missing dependencies
bun update --interactive       # Interactive package updates
```

### **Package Management Commands**
```bash
# Dependency analysis
bun why react                   # Show why package is installed
bun why "@types/*"             # Glob patterns supported

# Package information (formerly bun pm view)
bun info react                 # Basic package info
bun info react version         # Specific field
bun info react repository.url  # Nested field

# Version management
bun pm version patch            # 0.1.0 → 0.1.1
bun pm version minor            # 0.1.0 → 0.2.0
bun pm version major            # 0.1.0 → 1.0.0
bun pm version prerelease       # 0.1.0 → 0.1.1-0
bun pm version 1.2.3            # Set specific version
bun pm version --no-git-tag-version

# Package.json manipulation
bun pm pkg get name version     # Get properties
bun pm pkg set scripts.test="jest" version=2.0.0  # Set properties
bun pm pkg delete description scripts.test        # Delete properties
bun pm pkg fix                  # Fix common errors

# Publishing and packaging
bun publish                     # Publish to npm
bun pm pack --quiet            # Only outputs filename for scripting
bun patch             # Create patches for dependencies
bun audit                      # Security vulnerability scan
bun outdated                   # Check for dependency updates
```

### **Workspace & Catalog Dependencies**
```json
{
  "name": "my-monorepo",
  "workspaces": {
    "packages": ["packages/*"],
    "catalog": {
      "react": "^19.0.0",
      "zod": "4.0.0-beta.1"
    }
  },
  "catalogs": {
    "testing": {
      "@testing-library/react": "16.0.0"
    }
  }
}
```

```json
// In workspace package
{
  "name": "my-package",
  "dependencies": {
    "react": "catalog:"
  }
}
```

### **JSONC Support in `package.json`**
```json
{
  "name": "app",
  "dependencies": {
    // We need 0.30.8 because of a bug in 0.30.9
    "drizzle-orm": "0.30.8", //  {
  expect(data).toMatchInlineSnapshot(`
    {
      "name": "Alice",
      "age": 25
    }
  `);
});

// Variable substitution in test.each
test.each([
  { user: { name: "Alice" }, a: 1, b: 2, expected: 3 }
])("Add $a and $b for $user.name", ({ a, b, expected }) => {
  expect(a + b).toBe(expected);
});
// Generates: "Add 1 and 2 for Alice"

// Enhanced matchers
expect(object).toContainValue("bun");
expect(object).toContainKeys(["name", "age"]);
expect(mock).toHaveReturned();

// Custom error messages
expect(0.1 + 0.2, "Floating point precision error").toBe(0.3);

// Test control
test.only("focused test", () => { /* runs */ });
test.failing("expected failure", () => { /* expected to fail */ });

// Node.js test API support
import test from "node:test";
test("basic functionality", (t) => {
  // Your test code here
});
```

### **Coverage Configuration**
```toml
# bun.toml
[test]
coveragePathIgnorePatterns = [
  "/__tests__/",
  "/test-fixtures.ts"
]
```

## **Node.js Compatibility**

### **New Module Support**
- **`node:http2`** - HTTP/2 server (2x faster than Node.js)
- **`node:dgram`** - UDP sockets
- **`node:cluster`** - Multi-process applications
- **`node:zlib`** - Compression (2x faster, includes zstd support)
- **`node:vm`** - Virtual machine contexts with enhanced features
- **`node:worker_threads`** - Worker threads with environment data sharing

### **VM Module Enhancements**
```javascript
import vm from "node:vm";

// Cached bytecode compilation
const script = new vm.Script('console.log("Hello world!")', {
  produceCachedData: true,
});
const cachedData = script.createCachedData();
const newScript = new vm.Script('console.log("Hello world!")', {
  cachedData: cachedData,
});

// ES Module evaluation
const context = vm.createContext({ initialValue: 10 });
const source = `
  import { multiply } from './operations.js';
  export const finalResult = multiply(initialValue, 5);
`;

const module = new vm.SourceTextModule(source, {
  identifier: "my-entry-module.js",
  context: context,
});

await module.link(async (specifier, referencingModule) => {
  if (specifier === "./operations.js") {
    const libSource = `export function multiply(a, b) { return a * b; }`;
    return new vm.SourceTextModule(libSource, { context });
  }
  throw new Error(`Failed to resolve module: ${specifier}`);
});

await module.evaluate();
console.log(module.namespace.finalResult); // 50

// Synthetic modules
const synthModule = new vm.SyntheticModule(["x"], function () {
  this.setExport("x", 42);
});
await synthModule.link(() => {});
await synthModule.evaluate();
console.log(synthModule.namespace.x); // 42

// Function compilation with context
const context = vm.createContext({ x: 42 });
const fn = vm.compileFunction("return x + y", ["y"], {
  contextExtension: context
});
console.log(fn(8)); // 50
```

### **Enhanced Worker Threads**
```javascript
import { Worker, getEnvironmentData, setEnvironmentData } from "node:worker_threads";

// Environment data sharing
setEnvironmentData("config", { timeout: 1000 });
const worker = new Worker("./worker.js");

// In worker.js:
import { getEnvironmentData } from "node:worker_threads";
const config = getEnvironmentData("config");
console.log(config.timeout); // 1000

// Process worker events
process.on("worker", (worker) => {
  console.log(`New worker created with id: ${worker.threadId}`);
});

// Worker heap snapshots
const snapshot = await Worker.getHeapSnapshot();
```

### **Network & Security**
```javascript
import net from "node:net";

// IP blocking with BlockList
const blockList = new net.BlockList();
blockList.addAddress("123.123.123.123");
blockList.addRange("10.0.0.1", "10.0.0.10");
blockList.addSubnet("8.8.8.8", 24);

console.log(blockList.check("123.123.123.123")); // true

// String ports automatically converted
const server = createServer();
server.listen("3000", () => {
  console.log("Server listening on port " + server.address().port);
});
```

### **Enhanced Crypto APIs**
Native implementations with significant performance improvements:

```javascript
import crypto from "node:crypto";

// HKDF key derivation
const derivedKey = crypto.hkdfSync("sha256", "secret", "salt", "info", 32);

// Prime number generation
const prime = crypto.generatePrimeSync(2048);
const isPrime = crypto.checkPrimeSync(prime);

// Much faster Sign/Verify/Hash/Hmac operations
const hash = crypto.createHash("sha256");
const hmac = crypto.createHmac("sha256", "secret");
```

### **File System Enhancements**
```javascript
import { glob } from "node:fs";

// Enhanced glob with arrays and exclusions
const files = await glob(["src/**/*.js", "test/**/*.js"], {
  exclude: ["node_modules/**"]
});
```

### **Module System**
```javascript
// SourceMap support
import { SourceMap, findSourceMap } from "node:module";

// Module relationships
const child = require("./child-module");
console.log(module.children); // [Module { ... }]
console.log(module.id); // "." for entry point

// Process features
console.log(process.features.typescript);        // "transform"
console.log(process.features.require_module);    // true
console.log(process.features.openssl_is_boringssl); // true
```

## **Built-in APIs & Utilities**

### **Networking**
```javascript
import { udpSocket } from "bun";

// UDP networking
const server = await udpSocket({
  socket: {
    data(socket, data, port, addr) {
      console.log(`Received from ${addr}:${port}:`, data.toString());
    }
  }
});

// DNS utilities
import { dns } from "bun";
dns.prefetch("example.com");              // Pre-warm DNS cache
console.log(dns.getCacheStats());        // Monitor cache
```

### **ReadableStream Enhancements**
Direct consumption methods without wrapping:

```javascript
const {stdout} = Bun.spawn({
  cmd: ["echo", '{"hello": "world"}'],
  stdout: "pipe",
});

// Direct methods instead of new Response(stdout).json()
const data = await stdout.json();
const text = await stdout.text();
const bytes = await stdout.bytes();
const blob = await stdout.blob();

// Can also pass ReadableStream as stdin to spawn
Bun.spawn({
  cmd: ["cat"],
  stdin: someReadableStream
});
```

### **WebSocket Client Compression**
Built-in permessage-deflate support:

```javascript
const ws = new WebSocket("wss://echo.websocket.org");
ws.onopen = () => {
  console.log("Negotiated extensions:", ws.extensions);
  // => "permessage-deflate"
  ws.send("This message will be compressed!");
};
```

### **Compression Support**
```javascript
// Native Zstandard compression
const compressed = Bun.zstdCompressSync("hello world", { level: 5 });
const compressedAsync = await Bun.zstdCompress("hello world");
const decompressed = Bun.zstdDecompressSync(compressed);
const decompressedAsync = await Bun.zstdDecompress(compressed);

// HTTP client automatically handles zstd
const response = await fetch("https://example.com", {
  headers: { "Accept-Encoding": "zstd" }
});

// Node.js zlib with zstd support
import zlib from "node:zlib";
// Full sync/async/streaming zstd support
```

### **Utilities**
```javascript
import { randomUUIDv7, inspect, color, hash } from "bun";

// Monotonic UUID for databases
const uuid = randomUUIDv7();

// Format tabular data
console.log(inspect.table(data));

// Color manipulation
color("#ff0000", "css");        // => "red"
color("red", "ansi");           // => "\x1b[31m"
color({ r: 255, g: 0, b: 0 }, "number"); // => 16711680

// Hash functions
hash.rapidhash(data);

// High-precision array summation
Math.sumPrecise([0.1, 0.2, 0.3]);
```

### **File Operations**
```javascript
import { file } from "bun";

// Enhanced file API
await file("./package.json").delete();
const stat = await file("./package.json").stat();

// Works with S3 files too
await file("s3://bucket/file.txt").write("content");
```

### **Process Management**
```javascript
// Timeout support in spawn operations
const result = Bun.spawnSync({
  cmd: ["sleep", "1000"],
  timeout: 1000 // Terminates after 1 second
});
console.log(result.exitedDueToTimeout); // true

// Child process improvements
import { fork } from "child_process";
const child = fork("./worker.js", [], {
  execArgv: ["--inspect"] // Now supported
});
```

### **Performance Monitoring**
```javascript
import { createHistogram } from "perf_hooks";

const histogram = createHistogram({
  lowest: 1,
  highest: 1_000_000,
  figures: 3,
});

histogram.record(100);
histogram.record(200);
histogram.record(1000);

console.log("Min:", histogram.min);
console.log("Max:", histogram.max);
console.log("Mean:", histogram.mean);
console.log("Percentile 50:", histogram.percentile(50));
```

## **JavaScript Standards Support**

### **Import Attributes**
```javascript
import json from "./package.json" with { type: "json" };
import html from "./index.html" with { type: "text" };
import toml from "./bunfig.toml" with { type: "toml" };
```

### **Resource Management (`using`)**
```javascript
{
  using server = serve({ port: 3000, fetch: handler });
  // Server automatically closed when out of scope
}

using subprocess = spawn({ cmd: ["echo", "hello"] });
// Process automatically cleaned up

using db = new Database("file.db");
using query = db.query("SELECT * FROM users");
```

### **Promise Utilities**
```javascript
// Promise.withResolvers()
const { promise, resolve, reject } = Promise.withResolvers();

// Promise.try()
await Promise.try(() => maybeAsyncFunction());
```

### **Enhanced APIs**
```javascript
// Error checking
Error.isError(new Error()); // => true

// Base64/Hex encoding
new Uint8Array([1, 2, 3]).toBase64(); // "AQID"
Uint8Array.fromBase64("AQID");        // [1, 2, 3]
new Uint8Array([1, 2, 3]).toHex();   // "010203"

// Iterator helpers
[1, 2, 3, 4, 5].values().map(x => x * 2).toArray(); // [2, 4, 6, 8, 10]
```

## **Configuration & Environment**

### **Global Bun Options (`BUN_OPTIONS`)**
Set persistent command-line arguments:

```bash
# Always use Bun runtime
BUN_OPTIONS="--bun" bun next dev

# Pass multiple options with config file
BUN_OPTIONS="--config='./my config.toml' --silent" bun run dev.ts
```

### **Preload with Environment Variable**
```bash
BUN_INSPECT_PRELOAD=./setup.js bun run index.js
# Same as: bun --preload ./setup.js run index.js
```

### **Console Configuration**
```bash
bun --console-depth=4 index.js
```

```toml
# bunfig.toml
[run]
console.depth = 4

[serve.static]
define = { CONFIG = '{ "version": "1.0", "beta": false }' }
```

### **TypeScript Configuration**
```json
// tsconfig.json - recommended setting
{
  "compilerOptions": {
    "module": "Preserve" // Preserves module syntax
  }
}
```

## **IDE & Developer Experience**

### **VS Code Test Explorer Integration**
Native Test Explorer UI support in the official VS Code extension.

### **AI Integration**
- `bun init` automatically detects Cursor and adds rules to guide AI agents
- `bun init` generates `CLAUDE.md` when Claude CLI is detected
- Compact AI agent output in test results

### **Chrome DevTools Integration**
"Automatic workspace folders" support for editing files in the browser.

## **Performance Highlights**

- **S3**: 5x faster than AWS SDK
- **SQL**: 50% faster than popular clients, 5x improvement with pipelining
- **HTTP/2**: 2x faster than Node.js
- **Compression**: 2x faster zlib, 30x faster TextDecoder/Encoder streams
- **Build**: Up to 60% faster on macOS, 2x faster startup with bytecode
- **Package Manager**: 30% faster installation with text lockfile
- **Static Routes**: 40% faster than dynamic routes
- **Memory**: 10-30% reduction in idle JavaScript memory usage

This comprehensive reference covers all major features available in Bun 1.2.0-1.2.19, providing developers with a complete toolkit for full-stack JavaScript development with particular strengths in performance, built-in cloud services, and modern development workflows.
