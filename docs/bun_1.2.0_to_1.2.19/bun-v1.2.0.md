Bun is the complete toolkit for building and testing full-stack JavaScript and TypeScript applications. If you're new to Bun, you can learn more from the [Bun 1.0](https://bun.com/blog/bun-v1.0#bun-is-an-all-in-one-toolkit) blog post.


## [Bun 1.2](#bun-1-2)


Bun 1.2 is a huge update, and we're excited to share it with you.
Here's the tl;dr of what changed in Bun 1.2:

-   There's a major update on Bun's progress towards [Node.js compatibility](#node-js-compatibility)
-   Bun now has a built-in S3 object storage API: [`Bun.s3`](#s3-support-with-bun-s3)
-   Bun now has a built-in Postgres client: [`Bun.sql`](#postgres-support-with-bun-sql) (with MySQL coming soon)
-   `bun install` now uses a text-based lockfile: [`bun.lock`](#bun-is-a-package-manager)

We also made Express [3x faster](#express-is-3x-faster) in Bun.


## [Node.js compatibility](#node-js-compatibility)


Bun is designed as a drop-in replacement for Node.js.
In Bun 1.2, we started to run the Node.js test suite for every change we make to Bun. Since then, we've fixed thousands of bugs and the following Node.js modules now pass over 90% of their tests with Bun.

[!](https://github.com/user-attachments/assets/83919108-1bfa-41e3-9001-fa9624f3c554)

For each of these Node modules, Bun passes over 90% of the Node.js test suite.

Here's how we did it.


### [How do you measure compatibility?](#how-do-you-measure-compatibility)


In Bun 1.2, we changed how we test and improve Bun's compatibility with Node.js. Previously, we prioritized and fixed Node.js bugs as they were reported, usually from GitHub issues where someone tried to use an npm package that didn't work in Bun.
While this fixed actual bugs real users ran into, it was too much of a "wack-a-mole" approach. It discouraged doing the large refactors necessary for us to have a shot at 100% Node.js compatibility.
That's when we thought: what if we just run the Node.js test suite?

[![A screenshot of the Node.js test suite](https://github.com/user-attachments/assets/ee1c977f-8d85-4038-9cab-8f38a1bc81d6)](https://github.com/user-attachments/assets/ee1c977f-8d85-4038-9cab-8f38a1bc81d6)

There are so many tests in the Node.js repository, that the files can't all be listed on GitHub.


### [Running Node.js tests in Bun](#running-node-js-tests-in-bun)


Node.js has thousands of test files in its repository, with most of them in the [`test/parallel`](https://github.com/nodejs/node/tree/main/test/parallel) directory. While it might seem simple enough to "just run" their tests, it's more involved than you might think.


#### Internal APIs


For example, many tests rely on the internal implementation details of Node.js. In the following test, `getnameinfo` is stubbed to always error, to test the error handling of `dns.lookupService()`.

test/parallel/test-dns-lookupService.js

```
const { internalBinding } = require("internal/test/binding");
const cares = internalBinding("cares_wrap");
const { UV_ENOENT } = internalBinding("uv");
cares.getnameinfo = () => UV_ENOENT;
```

To run this test in Bun, we had to replace the internal bindings with our own stubs.

test/parallel/test-dns-lookupService.js

```
Bun.dns.lookupService = (addr, port) => {
  const error = new Error(`getnameinfo ENOENT ${addr}`);
  error.code = "ENOENT";
  error.syscall = "getnameinfo";
  throw error;
};
```


#### Error messages


There are also Node.js tests that check the *exact* string of error messages. And while Node.js usually doesn't change error messages, they don't guarantee it won't change between releases.

```
const common = require("../common");
const assert = require("assert");
assert.throws(
  () => Buffer.allocUnsafe(5).copy(Buffer.allocUnsafe(5), -1, 0),
  {
    name: 'RangeError',
    code: 'ERR_OUT_OF_RANGE',
    message: 'The value of "targetStart" is out of range. It must be >= 0. Received -1'
  }
);
```

To work around this, we had to change the assertion logic in some tests to check the `name` and `code`, instead of the `message`. This is also the standard practice for checking error types in Node.js. Additionally, we sometimes update the message when Bun provides more info for the user than Node.js.

```
{
  name: "RangeError",
  code: "ERR_OUT_OF_RANGE",
  message: 'The value of "targetStart" is out of range. It must be >= 0. Received -1'
  message: 'The value of "targetStart" is out of range. It must be >= 0 and <= 5. Received -1'
},
```

While we do try to match the error messages of Node.js as much as possible, there are times where we want to provide a more helpful error message, as long as the `name` and `code` are the same.


#### Progress so far


We've ported thousands of files from the Node.js test suite to Bun. That means for every commit we make to Bun, we run the Node.js test suite to ensure compatibility.

[![A screenshot of Bun's CI where we run the Node.js test suite for every commit.](https://github.com/user-attachments/assets/c04ef5b9-a8d6-4be7-90a8-6f632aefbe17)](https://github.com/user-attachments/assets/c04ef5b9-a8d6-4be7-90a8-6f632aefbe17)

A screenshot of Bun's CI where we run the Node.js test suite for every commit.

Every day, we are adding more and more passing Node.js tests to Bun, and we're excited to share more progress on Node.js compatibility very soon.
In addition to fixing existing Node.js APIs, we've also added support for the following Node.js modules.


### [`node:http2` server](#node-http2-server)


You can now use [`node:http2`](https://nodejs.org/api/http2.html#core-api) to create HTTP/2 servers. HTTP/2 is also necessary for gRPC servers, which are also now supported in Bun. Previously, there was only support for the HTTP/2 client.

```
import { createSecureServer } from "node:http2";
import { readFileSync } from "node:fs";
const server = createSecureServer({
  key: readFileSync("key.pem"),
  cert: readFileSync("cert.pem"),
});
server.on("stream", (stream, headers) => {
  stream.respond({
    ":status": 200,
    "content-type": "text/html; charset=utf-8",
  });
  stream.end("<h1>Hello from Bun!</h1>");
});
server.listen(3000);
```

In Bun 1.2, the HTTP/2 server is [2x faster](https://twitter.com/bunjavascript/status/1847014951661326396) than in Node.js. When we support new APIs to Bun, we spend a lot of time tuning performance to ensure that it not only works, but it's also faster.

[!](https://github.com/user-attachments/assets/30ebbbc3-13e1-4fb5-a3a8-a0e7374ca094)

Benchmark of a "hello world" node:http2 server running in Bun 1.2 and Node.js 22.13.


### [`node:dgram`](#node-dgram)


You can now bind and connect to UDP sockets using [`node:dgram`](https://nodejs.org/api/dgram.html#udpdatagram-sockets). UDP is a low-level unreliable messaging protocol, often used by telemetry providers and game engines.

```
import { createSocket } from "node:dgram";
const server = createSocket("udp4");
const client = createSocket("udp4");
server.on("listening", () => {
  const { port, address } = server.address();
  for (let i = 0; i < 10; i++) {
    client.send(`data ${i}`, port, address);
  }
  server.unref();
});
server.on("message", (data, { address, port }) => {
  console.log(`Received: data=${data} source=${address}:${port}`);
  client.unref();
});
server.bind();
```

This allows packages like DataDog's [`dd-trace`](https://github.com/DataDog/dd-trace-js) and [`@clickhouse/client`](https://github.com/ClickHouse/clickhouse-js) to work in Bun 1.2.


### [`node:cluster`](#node-cluster)


You can use [`node:cluster`](https://nodejs.org/api/cluster.html#cluster) to spawn multiple instances of Bun. This is often used to enable higher throughput by running tasks across multiple CPU cores.
Here's an example of how you can create a multi-threaded HTTP server using `cluster`:

-   The primary worker spawns `n` child workers (usually equal to the number of CPU cores)
-   Each child worker listens on the same port (using [`reusePort`](https://lwn.net/Articles/542629/))
-   Incoming HTTP requests are load balanced across the child workers

```
import cluster from "node:cluster";
import { createServer } from "node:http";
import { cpus } from "node:os";
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  // Start N workers for the number of CPUs
  for (let i = 0; i < cpus().length; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} exited`);
  });
} else {
  // Incoming requests are handled by the pool of workers
  // instead of the primary worker.
  createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}`);
  }).listen(3000);
  console.log(`Worker ${process.pid} started`);
}
```

Note that `reusePort` is only effective on Linux. On Windows and macOS, the operating system does not load balance HTTP connections as one would expect.


### [`node:zlib`](#node-zlib)


In Bun 1.2, we rewrote the entire [`node:zlib`](https://nodejs.org/api/zlib.html#zlib) module from JavaScript to native code. This not only fixed a bunch of bugs, but it made it [2x faster](https://x.com/bunjavascript/status/1832370723895247277) than Bun 1.1.

[!](https://github.com/user-attachments/assets/cc3760d5-352c-4f7a-a75b-2f48fec52dfa)

Benchmark of inflateSync using node:zlib in Bun and Node.js.

We also added support for [Brotli](https://github.com/google/brotli) in `node:zlib`, which was missing in Bun 1.1.

```
import { brotliCompressSync, brotliDecompressSync } from "node:zlib";
const compressed = brotliCompressSync("Hello, world!");
compressed.toString("hex"); // "0b068048656c6c6f2c20776f726c642103"
const decompressed = brotliDecompressSync(compressed);
decompressed.toString("utf8"); // "Hello, world!"
```


### [C++ addons using V8 APIs](#c-addons-using-v8-apis)


If you want to use [C++ addons](https://nodejs.org/api/addons.html#c-addons) alongside your JavaScript code, the easiest way is to use [N-API](https://bun.com/docs/api/node-api).
However, before N-API existed, some packages used the internal V8 C++ APIs in Node.js. What makes this complicated is that Node.js and Bun use different JavaScript engines: Node.js uses [V8](https://v8.dev/) (used by Chrome), and Bun uses [JavaScriptCore](https://docs.webkit.org/Deep%20Dive/JSC/JavaScriptCore.html) (used by Safari).
Previously, npm packages like [`cpu-features`](https://www.npmjs.com/package/cpu-features), which rely on these V8 APIs, would not work in Bun.

```
require("cpu-features")();
```

```
dyld[94465]: missing symbol called
fish: Job 1, 'bun index.ts' terminated by signal SIGABRT (Abort)
```

To fix this, we undertook the unprecedented engineering effort of implementing V8's public C++ API in JavaScriptCore, so these packages can "just work" in Bun. It's so complicated and nerdy to explain, we wrote a [3-part blog](https://bun.com/blog/how-bun-supports-v8-apis-without-using-v8-part-1) series on how we supported the V8 APIs... without using V8.
In Bun 1.2, packages like `cpu-features` can be imported and just work.

```
$ bun index.ts
{
  arch: "aarch64",
  flags: {
    fp: true,
    asimd: true,
    // ...
  },
}
```

The V8 C++ APIs are *very* complicated to support, so most packages will still have missing features. We're continuing to improve support, so packages like `node-canvas@v2` and `node-sqlite3` can work in the future.


### [`node:v8`](#node-v8)


In addition to the V8 C++ APIs, we've also added support for heap snapshots using [`node:v8`](https://nodejs.org/api/v8.html).

```
import { writeHeapSnapshot } from "node:v8";
// Writes a heap snapshot to the current working directory in the form:
// `Heap-{date}-{pid}.heapsnapshot`
writeHeapSnapshot();
```

In Bun 1.2, you can use [`getHeapSnapshot`](https://nodejs.org/api/v8.html#v8getheapsnapshot) and [`writeHeapSnapshot`](https://nodejs.org/api/v8.html#v8writeheapsnapshot) to read and write V8 heap snapshots. This allows you to use Chrome DevTools to inspect the heap of Bun.

[!](https://github.com/user-attachments/assets/d953c24c-b124-4baf-95e1-60482cb2d8e0)

You can view a heap snapshot of Bun using Chrome DevTools.


### [Express is 3x faster](#express-is-3x-faster)


While compatibility is important for fixing bugs, it also helps us fix performance issues in Bun.
In Bun 1.2, the popular `express` framework can serve HTTP requests up to [3x faster](https://x.com/bunjavascript/status/1820610675296940227) than in Node.js. This was made possible by improving compatibility with `node:http`, and optimizing Bun's HTTP server.

[!](https://github.com/user-attachments/assets/2c47977c-f099-4c5f-ae24-e4a259e0b240)


## [S3 support with `Bun.s3`](#s3-support-with-bun-s3)


Bun aims to be a cloud-first JavaScript runtime. That means supporting all the tools and services you need to run a production application in the cloud.
Modern applications store files in object storage, instead of the local POSIX file system. When end-users upload a file attachment to a website, it's not being stored on the server's local disk, it's being stored in a S3 bucket. Decoupling storage from compute prevents an entire class of reliability issues: low disk space, high p95 response times from busy I/O, and security issues with shared file storage.
S3 is the [defacto-standard](https://en.wikipedia.org/wiki/De_facto_standard) for object storage in the cloud. The [S3 APIs](https://docs.aws.amazon.com/AmazonS3/latest/API/API_Operations_Amazon_Simple_Storage_Service.html) are implemented by a variety of cloud services, including Amazon S3, Google Cloud Storage, Cloudflare R2, and dozens more.
That's why Bun 1.2 adds built-in support for S3. You can read, write, and delete files from an S3 bucket using APIs that are compatible with Web standards like `Blob`.


### [Reading files from S3](#reading-files-from-s3)


You can use the new [`Bun.s3`](https://bun.com/docs/api/s3#bun-s3client-bun-s3) API to access the default [`S3Client`](https://bun.com/docs/api/s3#bun-s3client-bun-s3). The client provides a `file()` method that returns a lazy-reference to an S3 file, which is the same API as Bun's [`File`](https://bun.com/docs/api/file-io#reading-files-bun-file).

```
import { s3 } from "bun";
const file = s3.file("folder/my-file.txt");
// file instanceof Blob
const content = await file.text();
// or:
//   file.json()
//   file.arrayBuffer()
//   file.stream()
```


### [5x faster than Node.js](#5x-faster-than-node-js)


Bun's S3 client is written in native code, instead of JavaScript. When you compare it to using packages like `@aws-sdk/client-s3` with Node.js, it's 5x faster at downloading files from a S3 bucket.

[!](https://bun.sh/bun-s3-node.gif)

Left: Bun 1.2 with Bun.s3. Right: Node.js with @aws-sdk/client-s3.


### [Writing files to S3](#writing-files-to-s3)


You can use the [`write()`](https://bun.com/docs/api/s3#writing-uploading-files-to-s3) method to upload a file to S3. It's that simple:

```
import { s3 } from "bun";
const file = s3.file("folder/my-file.txt");
await file.write("hello s3!");
// or:
//   file.write(new Uint8Array([1, 2, 3]));
//   file.write(new Blob(["hello s3!"]));
//   file.write(new Response("hello s3!"));
```

For larger files, you can use the [`writer()`](https://bun.com/docs/api/s3#writing-uploading-files-to-s3) method to obtain a file writer that does a [multi-part upload](https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html), so you don't have to worry about the details.

```
import { s3 } from "bun";
const file = s3.file("folder/my-file.txt");
const writer = file.writer();
for (let i = 0; i < 1000; i++) {
  writer.write(String(i).repeat(1024));
}
await writer.end();
```


### [Presigned URLs](#presigned-urls)


When your production service needs to let users upload files to your server, it's often more reliable for the user to upload directly to S3 instead of your server acting as an intermediary.
To make this work, you use the [`presign()`](https://bun.com/docs/api/s3#presigning-urls) method to generate a [presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html) for a file. This generates a URL with a signature that allows a user to securely upload that specific file to S3, without exposing your credentials or granting them unnecessary access to your bucket.

```
import { s3 } from "bun";
const url = s3.presign("folder/my-file.txt", {
  expiresIn: 3600, // 1 hour
  acl: "public-read",
});
```


### [Using `Bun.serve()`](#using-bun-serve)


Since Bun's S3 APIs extend the `File` API, you can use [`Bun.serve()`](https://bun.com/docs/api/http#bun-serve) to serve S3 files over HTTP.

```
import { serve, s3 } from "bun";
serve({
  port: 3000,
  async fetch(request) {
    const { url } = request;
    const { pathname } = new URL(url);
    // ...
    if (pathname === "/favicon.ico") {
      const file = s3.file("assets/favicon.ico");
      return new Response(file);
    }
    // ...
  },
});
```

When you use `new Response(s3.file(...))`, instead of downloading the S3 file to your server and sending it back to the user, Bun redirects the user to the presigned URL for the S3 file.

```
Response (0 KB) {
  status: 302,
  headers: Headers {
    "location": "https://s3.amazonaws.com/my-bucket/assets/favicon.ico?...",
  },
  redirected: true,
}
```

This saves you memory, time, and the bandwidth cost of downloading the file to your server.


### [Using `Bun.file()`](#using-bun-file)


If you want to access S3 files using the same code as the local file-system, you can reference them using the `s3://` URL protocol. It's the same concept as using `file://` to reference local files.

```
import { file } from "bun";
async function createFile(url, content) {
  const fileObject = file(url);
  if (await fileObject.exists()) {
    return;
  }
  await fileObject.write(content);
}
await createFile("s3://folder/my-file.txt", "hello s3!");
await createFile("file://folder/my-file.txt", "hello posix!");
```


### [Using `fetch()`](#using-fetch)


You can even use `fetch()` to read, write, and delete files from S3.

```
// Upload to S3
await fetch("s3://folder/my-file.txt", {
  method: "PUT",
  body: "hello s3!",
});
// Download from S3
const response = await fetch("s3://folder/my-file.txt");
const content = await response.text(); // "hello s3!"
// Delete from S3
await fetch("s3://folder/my-file.txt", {
  method: "DELETE",
});
```


### [Using `S3Client`](#using-s3client)


When you import `Bun.s3`, it returns a default client that is configured using [well-known](https://bun.com/docs/api/s3#credentials) environment variables, such as `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

```
import { s3, S3Client } from "bun";
// s3 instanceof S3Client
```

You can also create your own [`S3Client`](https://bun.com/docs/api/s3#s3client-objects), then set it as the default.

```
import { S3Client } from "bun";
const client = new S3Client({
  accessKeyId: "my-access-key-id",
  secretAccessKey: "my-secret-access-key",
  region: "auto",
  endpoint: "https://<account-id>.r2.cloudflarestorage.com",
  bucket: "my-bucket",
});
// Sets the default client to be your custom client
Bun.s3 = client;
```


## [Postgres support with `Bun.sql`](#postgres-support-with-bun-sql)


Just like object storage, another datastore that production applications often need is a SQL database.
Since the beginning, Bun has had a built-in [SQ*Lite*](https://bun.com/docs/api/sqlite) client. SQLite is great for smaller applications and quick scripts, where you don't want to worry about the hastle of setting up a production database.
In Bun 1.2, we're expanding Bun's support for SQL databases by introducing [`Bun.sql`](https://bun.sh/docs/api/sql), a built-in SQL client with Postgres support. We also have a [pull request](https://github.com/oven-sh/bun/pull/15274) to add MySQL support very soon.

[!](https://github.com/user-attachments/assets/ecb31227-e5e7-43a6-aff8-47452cf81578)


### [Using `Bun.sql`](#using-bun-sql)


You can use [`Bun.sql`](https://bun.sh/docs/api/sql) to run SQL queries using [tagged-template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). This allows you to pass JavaScript values as parameters to your SQL queries.
Most importantly, it escapes strings and uses prepared statements for you to prevent SQL injection.

```
import { sql } from "bun";
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 65 },
];
await sql`
  INSERT INTO users (name, age)
  VALUES ${sql(users)}
`;
```

Reading rows is just as easy. Results are returned as an array of objects, with the column name as the key.

```
import { sql } from "bun";
const seniorAge = 65;
const seniorUsers = await sql`
  SELECT name, age FROM users
  WHERE age >= ${seniorAge}
`;
console.log(seniorUsers); // [{ name: "Bob", age: 65 }]
```


### [50% faster than other clients](#50-faster-than-other-clients)


`Bun.sql` is written in native code with optimizations like:

-   Automatic prepared statements
-   Query pipelining
-   Binary wire protocol support
-   Connection pooling
-   Structure caching

Optimizations stack like buffs in World of Warcraft.
The result is that `Bun.sql` is up to 50% faster at reading rows than using the most popular Postgres clients with Node.js.

[!](https://github.com/user-attachments/assets/09066ce9-aacd-439c-ab28-f2640c0ce814)


### [Migrate from `postgres.js` to `Bun.sql`](#migrate-from-postgres-js-to-bun-sql)


The `Bun.sql` APIs are inspired by the popular [`postgres.js`](https://github.com/porsager/postgres) package. This makes it easy to migrate your existing code to using Bun's built-in SQL client.

```
import { postgres } from "postgres";
  import { postgres } from "bun";
const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "mydb",
  user: "...",
  password: "...",
});
const users = await sql`SELECT name, age FROM users LIMIT 1`;
console.log(users); // [{ name: "Alice", age: 25 }]
```


## [Bun is a package manager](#bun-is-a-package-manager)


Bun is a npm-compatible package manager that makes it easy to install and update your node modules. You can use [`bun install`](https://bun.com/docs/cli/install) to install dependencies, even if you're using Node.js as a runtime.


### [Replace `npm install` with `bun install`](#replace-npm-install-with-bun-install)


```
$ npm install
$ bun install
```

In Bun 1.2, we've made the biggest change yet to the package manager.


### [Problems with `bun.lockb`](#problems-with-bun-lockb)


Since the beginning, Bun has used a binary lockfile: `bun.lockb`.
Unlike other package managers that use text-based lockfiles, like JSON or YAML, a binary lockfile allowed us to make `bun install` almost 30x faster than `npm`.
However, we found that there were a lot of paper cuts when using a binary lockfile. First, you couldn't view the contents of the lockfile on GitHub and other platforms. This sucked.

[!](https://github.com/user-attachments/assets/c6c937c1-9074-427e-a1d2-82c7c871538e)

What happens if you receive a pull request from an external contributor that changes the `bun.lockb` file? Do you trust it? Probably not.
That's also assuming there isn't a merge conflict! Which for a binary lockfile, is almost impossible to resolve, aside from manually deleting the lockfiles and running `bun install` again.

[!](https://github.com/user-attachments/assets/e97db642-1499-40c5-b17f-3a932157d0f2)

This also made it hard for tools to read the lockfile. For example, dependency management tools like [Dependabot](https://github.com/dependabot/dependabot-core) would need an API to parse the lockfile, and we didn't offer one.

[!](https://github.com/user-attachments/assets/65ed123a-8e56-4550-ae0b-9967520e805e)

Bun will continue to support `bun.lockb` for a *long* time. However, for all these reasons, we've decided to switch to a text-based lockfile as the default in Bun 1.2.


### [Introducing `bun.lock`](#introducing-bun-lock)


In Bun 1.2, we're introducing a new, text-based lockfile: [`bun.lock`](https://bun.com/docs/install/lockfile).
You can migrate to the new lockfile by using the `--save-text-lockfile` flag.

```
bun install --save-text-lockfile
```

`bun.lock` is a JSONC file, which is JSON with added support for comments and trailing commas.

bun.lock

```
// bun.lock
{
  "lockfileVersion": 0,
  "packages": [
    ["[[email protected]](https://bun.com/cdn-cgi/l/email-protection)", /* ... */, "sha512-..."],
    ["[[email protected]](https://bun.com/cdn-cgi/l/email-protection)", /* ... */],
    /* ... and more */
  ],
  "workspaces": { /* ... */ },
}
```

This makes it much easier to view diffs in pull requests, and trailing commas make it much less likely to cause merge conflicts.

[!](https://github.com/user-attachments/assets/c873d6fe-3b44-47ca-81fd-913d9ace7b8e)

For new projects without a lockfile, Bun will generate a new `bun.lock` file.
For existing projects with a `bun.lockb` file, Bun will continue to support the binary lockfile, *without migration to the new lockfile*. We will continue to support the binary lockfile for a *long* time, so you can continue to use commands, like `bun add` and `bun update`, and it will update your `bun.lockb` file.


### [`bun install` gets 30% faster](#bun-install-gets-30-faster)


You might think that after we migrated to a text-based lockfile, `bun install` would be slower. Wrong!
Most software projects get slower as more features are added, Bun is not one of those projects. We spent a lot of time tuning and optimizing Bun, so we could make `bun install` *even* faster.
That's why in Bun 1.2, `bun install` is 30% faster than Bun 1.1

[!](https://github.com/user-attachments/assets/679db20c-dfc1-4a36-b656-8abc16733c55)


### [JSONC support in `package.json`](#jsonc-support-in-package-json)


Have you ever added something to your `package.json` and forgot why months later? Or wanted to explain to your teammates why a dependency needs a specific version? Or have you ever had a merge conflict in a package.json file due to a comma?
Often these problems are due to the fact that `package.json` is a JSON file, and that means you can't use comments or trailing commas in it.

package.json

```
{
  "dependencies": {
    // this would cause a syntax error
    "express": "4.21.2"
  }
}
```

This is a bad experience. Modern tools like TypeScript allow for comments and trailing commas in their configuration files, `tsconfig.json` for example, and it's great. We also asked the community on your thoughts, and it seemed that the status-quo needed to change.

> What JS ecosystem upgrade path would you prefer to permit comments in package.json?
> — Rob Palmer (@robpalmer2) [April 17, 2024](https://twitter.com/robpalmer2/status/1780495081637548305?ref_src=twsrc%5Etfw)

In Bun 1.2, you can use comments and trailing commas in your `package.json`. It just works.

package.json

```
{
  "name": "app",
  "dependencies": {
    // We need 0.30.8 because of a bug in 0.30.9
    "drizzle-orm": "0.30.8", /* <- trailing comma */
  },
}
```

Since there are many tools that read `package.json` files, we've added support to `require()` or `import()` these files with comments and trailing commas. You don't need to change your code.

```
const pkg = require("./package.json");
const {
  default: { name },
} = await import("./package.json");
```

Since this isn't widely supported in the JavaScript ecosystem, we'd advice you to use this feature "at your own risk." However, we think this is the right direction to go: to make things easier for you.


### [`.npmrc` support](#npmrc-support)


In Bun 1.2, we added support for reading npm's config file: [`.npmrc`](https://bun.com/docs/install/npmrc).
You can use `.npmrc` to configure your npm registry and configure scoped packages. This is often necessary for corporate environments, where you might need to authenticate to a private registry.

.npmrc

```
@my-company:registry=https://packages.my-company.com
@my-org:registry=https://packages.my-company.com/my-org
```

Bun will look for an `.npmrc` file in your project's root directory, and in your home directory.


### [`bun run --filter`](#bun-run-filter)


You can now use `bun run --filter` to run a script in multiple workspaces at the same time.

```
bun run --filter='*' dev
```

This will run the `dev` script, concurrently, in all workspaces that match the glob pattern. It will also interleave the output of each script, so you can see the output of each workspace as it runs.

[!](https://github.com/oven-sh/bun/assets/48869301/2a103e42-9921-4c33-948f-a1ad6e6bac71)

You can also pass multiple filters to `--filter`, and you can just use `bun` instead of `bun run`.

```
bun --filter 'api/*' --filter 'frontend/*' dev
```


### [`bun outdated`](#bun-outdated)


You can now view which dependencies are out-of-date using [`bun outdated`](https://bun.com/docs/cli/outdated).

[!](https://github.com/user-attachments/assets/cb41e234-d0f6-4830-9864-fb87bd568cfe)

It will show a list of your `package.json` dependencies, and which versions are out-of-date. The "update" column shows the next semver-matching version, and the "latest" column shows the latest version.
If you notice there's a specific dependency you want to update, you can use `bun update`.

```
bun update @typescript-eslint/parser # Updates to "7.18.0"
```

```
bun update @typescript-eslint/parser --latest # Updates to "8.2.0"
```

You can also filter which dependencies you want to check for updates. Just make sure to quote patterns, so your shell doesn't expand them as glob patterns!

```
bun outdated "is-*" # check is-even, is-odd, etc.
```

```
bun outdated "@discordjs/*" # check @discordjs/voice, @discordjs/rest, etc.
```

```
bun outdated jquery --filter="foo" # check jquery in the `foo` workspace
```


### [`bun publish`](#bun-publish)


You can now publish npm packages using [`bun publish`](https://bun.com/docs/cli/publish).

[!](https://github.com/user-attachments/assets/3ab14008-f874-4f70-aa12-0be550f6fda5)

It's a drop-in replacement for `npm publish`, and supports many of the same features like:

-   Reading [`.npmrc`](https://bun.com/docs/install/npmrc) files for authentication.
-   Packing tarballs, accounting for `.gitignore` and `.npmignore` files in multiple directories.
-   OTP / Two-factor authentication.
-   Handling edgecases with package.json fields like `bin`, `files`, etc.
-   Handling missing `README` files carefully.

We've also added support for commands that are useful for publishing, like:

-   [`bun pm whoami`](https://bun.com/docs/cli/pm#whoami), which prints your npm username.
-   [`bun pm pack`](https://bun.com/docs/cli/pm#pack), which creates an npm package tarball for publishing or installing locally.


### [`bun patch`](#bun-patch)


Sometimes, your dependencies have bugs or missing features. While you could fork the package, make your changes, and publish it — that's a lot of work. What if you don't want to maintain a fork?
In Bun 1.2, we've added support for patching dependencies. Here's how it works:

1.  Run `bun patch <package>` to patch a package.
2.  Edit the files in the `node_modules/<package>` directory.
3.  Run `bun patch --commit <package>` to save your changes. That's it!

Bun generates a `.patch` file with your changes in the `patches/` directory, which is automatically applied on `bun install`. You can then commit the patch file to your repository, and share it with your team.
For example, you could create a patch to replace a dependency with your own code.

```
diff --git a/index.js b/index.js
index 832d92223a9ec491364ee10dcbe3ad495446ab80..2a61f0dd2f476a4a30631c570e6c8d2d148d419a 100644
--- a/index.js
+++ b/index.js
@@ -1,14 +1 @@
- 'use strict';
-
- var isOdd = require('is-odd');
-
- module.exports = function isEven(i) {
-   return !isOdd(i);
- };
+ module.exports = (i) => (i % 2 === 0)
```

Bun clones the package from the `node_modules` directory with a fresh copy of itself. This allows you to safely make edits to files in the package's directory without impacting shared file caches.


### [Easier to use](#easier-to-use)


We've also made a bunch of small improvements to make `bun install` easier to use.


#### CA certificates


You can now configure CA certificates for `bun install`. This is useful when you need to install packages from your company's private registry, or if you want to use self-signed certificate.

bunfig.toml

```
[install]

# The CA certificate as a string

ca = "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"

# A path to a CA certificate file. The file can contain multiple certificates.

cafile = "path/to/cafile"
```

If you don't want to change your [`bunfig.toml`](https://bun.com/docs/runtime/bunfig#install-ca-and-install-cafile) file, you can also use the `--ca` and `--cafile` flags.

```
bun install --cafile=/path/to/cafile
```

```
bun install --ca="..."
```

If you are using an existing [`.npmrc`](https://bun.com/docs/install/npmrc) file, you can also configure CA certificates there.

.npmrc

```
cafile=/path/to/cafile
ca="..."
```


#### `bundleDependencies` support


You can now use [`bundleDependencies`](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#bundledependencies) in your `package.json`.

package.json

```
{
  "bundleDependencies": ["is-even"]
}
```

These are dependencies that you expect to already exist in your `node_modules` folder, and are not installed like other dependencies.


#### `bun add` respects `package.json` indentation


We fixed a bug where `bun add` would not respect the spacing and indentation in your `package.json`. Bun will now preserve the indentation of your `package.json`, no matter how wacky it is.

```
bun add is-odd
```

package.json

```
// an intentionally wacky package.json
{
  "dependencies": {
              "is-even": "1.0.0",
              "is-odd": "1.0.0"
  }
}
```


#### `--omit=dev|optional|peer` support


Bun now supports the `--omit` flag with `bun install`, which allows you to omit dev, optional, or peer dependencies.

```
bun install --omit=dev # omit dev dependencies
```

```
bun install --omit=optional # omit optional dependencies
```

```
bun install --omit=peer # omit peer dependencies
```

```
bun install --omit=dev --omit=optional # omit dev and optional dependencies
```


## [Bun is a test runner](#bun-is-a-test-runner)


Bun has a built-in test runner that makes it easy to write and run tests in JavaScript, TypeScript, and JSX. It supports many of the same APIs as Jest and Vitest, which includes the [`expect()`](https://jestjs.io/docs/expect#expect)\-style APIs.
In Bun 1.2, we've made a lot of improvements to `bun test`.


### [JUnit support](#junit-support)


To use `bun test` with CI/CD tools like Jenkins, CircleCI, and GitLab CI, you can use the `--reporter` option to output test results to a JUnit XML file.

```
bun test --reporter=junit --reporter-outfile=junit.xml
```

junit.xml

```
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="bun test" tests="1" assertions="1" failures="1" time="0.001">
  <testsuite name="index.test.ts" tests="1" assertions="1" failures="1" time="0.001">
    <!-- ... -->
  </testsuite>
</testsuites>
```

You can also enable JUnit reporting by adding the following to your [`bunfig.toml`](https://bun.com/docs/runtime/bunfig) file.

bunfig.toml

```
[test.reporter]
junit = "junit.xml"
```


### [LCOV support](#lcov-support)


You can use `bun test --coverage` to generate a text-based coverage report of your tests.
In Bun 1.2, we added support for LCOV coverage reporting. [LCOV](https://github.com/linux-test-project/lcov) is a standard format for code coverage reports, and is used by many tools like Codecov.

```
bun test --coverage --coverage-reporter=lcov
```

By default, this outputs a `lcov.info` coverage report file in the `coverage` directory. You can change the coverage directory with `--coverage-dir`.
If you want to always enable coverage reporting, you can add the following to your [`bunfig.toml`](https://bun.com/docs/runtime/bunfig) file.

bunfig.toml

```
[test]
coverage = true
coverageReporter = ["lcov"]  # default ["text"]
coverageDir = "./path/to/folder"  # default "./coverage"
```


### [Inline snapshots](#inline-snapshots)


You can now use [inline snapshots](https://jestjs.io/docs/snapshot-testing#inline-snapshots) using `expect().toMatchInlineSnapshot()`.
Unlike [`toMatchSnapshot()`](https://jestjs.io/docs/expect#tomatchsnapshotpropertymatchers-hint), which stores the snapshot in a separate file, [`toMatchInlineSnapshot()`](https://jestjs.io/docs/expect#tomatchinlinesnapshotpropertymatchers-inlinesnapshot) stores snapshots directly in the test file. This makes it easier see, and even change your snapshots.
First, write a test that uses `toMatchInlineSnapshot()`.

snapshot.test.ts

```
import { expect, test } from "bun:test";
test("toMatchInlineSnapshot()", () => {
  expect(new Date()).toMatchInlineSnapshot();
});
```

Next, update the snapshot with `bun test -u`, which is short for `--update-snapshots`.

```
bun test -u
```

Then, voilà! Bun has updated the test file with your snapshot.

snapshot.test.ts

```
import { expect, test } from "bun:test";
test("toMatchInlineSnapshot()", () => {
   expect(new Date()).toMatchInlineSnapshot();
   expect(new Date()).toMatchInlineSnapshot(`2025-01-18T02:35:53.332Z`);
});
```

You can also use these matchers, which do a similar thing:

-   [`toThrowErrorMatchingSnapshot()`](https://jestjs.io/docs/expect#tothrowerrormatchingsnapshothint)
-   [`toThrowErrorMatchingInlineSnapshot()`](https://jestjs.io/docs/expect#tothrowerrormatchinginlinesnapshotinlinesnapshot)


### [`test.only()`](#test-only)


You can use [`test.only()`](https://jestjs.io/docs/api#testonlyname-fn-timeout) to run a single test, excluding all other tests. This is useful when you're debugging a specific test, and don't want to run the entire test suite.

```
import { test } from "bun:test";
test.only("test a", () => {
  /* Only run this test  */
});
test("test b", () => {
  /* Don't run this test */
});
```

Previously, for this to work in Bun, you had to use the `--only` flag.

```
bun test --only
```

This was annoying, you'd usually forget to do it, and test runners like Jest don't need it! In Bun 1.2, we've made this "just work", without the need for flags.

```
bun test
```


### [New `expect()` matchers](#new-expect-matchers)


In Bun 1.2, we added a bunch of matchers to the [`expect()`](https://jestjs.io/docs/expect) API. These are the same matchers that are implemented by Jest, Vitest, or the [`jest-extended`](https://jest-extended.jestcommunity.dev/) library.
You can use [`toContainValue()`](https://jest-extended.jestcommunity.dev/docs/matchers/object/#tocontainvaluevalue) and derivatives to check if an object contains a value.

```
const object = new Set(["bun", "node", "npm"]);
expect(object).toContainValue("bun");
expect(object).toContainValues(["bun", "node"]);
expect(object).toContainAllValues(["bun", "node", "npm"]);
expect(object).not.toContainAnyValues(["done"]);
```

Or, use [`toContainKey()`](https://jest-extended.jestcommunity.dev/docs/matchers/object/#tocontainkeykey) and derivatives to check if an object contains a key.

```
const object = new Map([
  ["bun", "1.2.0"],
  ["node", "22.13.0"],
  ["npm", "9.1.2"],
]);
expect(object).toContainKey("bun");
expect(object).toContainKeys(["bun", "node"]);
expect(object).toContainAllKeys(["bun", "node", "npm"]);
expect(object).not.toContainAnyKeys(["done"]);
```

You can also use [`toHaveReturned()`](https://jestjs.io/docs/expect#tohavereturned) and derivatives to check if a mocked function has returned a value.

```
import { jest, test, expect } from "bun:test";
test("toHaveReturned()", () => {
  const mock = jest.fn(() => "foo");
  mock();
  expect(mock).toHaveReturned();
  mock();
  expect(mock).toHaveReturnedTimes(2);
});
```


### [Custom error messages](#custom-error-messages)


We've also added support for custom error messages using `expect()`.
You can now pass a string as the second argument to `expect()`, which will be used as the error message. This is useful when you want to document what the assertion is checking.

example.test.ts

```
import { test, expect } from 'bun:test';
test("custom error message", () => {
  expect(0.1 + 0.2).toBe(0.3);
  expect(0.1 + 0.2, "Floating point has precision error").toBe(0.3);
});
```

```
1 | import { test, expect } from 'bun:test';
2 |
3 | test("custom error message", () => {
4 |   expect(0.1 + 0.2, "Floating point has precision error").toBe(0.3);
                                                              ^
error: expect(received).toBe(expected)
error: Floating point has precision error
Expected: 0.3
Received: 0.30000000000000004
```


### [`jest.setTimeout()`](#jest-settimeout)


You can now use Jest's [`setTimeout()`](https://jestjs.io/docs/jest-object#jestsettimeouttimeout) API to change the default timeout for tests in the current scope or module, instead of setting the timeout for each test.

```
jest.setTimeout(60 * 1000); // 1 minute
test("do something that takes a long time", async () => {
  await Bun.sleep(Infinity);
});
```

You can also import `setDefaultTimeout()` from Bun's test APIs, which does the same thing. We chose a different name to avoid confusion with the global `setTimeout()` function.

```
import { setDefaultTimeout } from "bun:test";
setDefaultTimeout(60 * 1000); // 1 minute
```


## [Bun is a JavaScript bundler](#bun-is-a-javascript-bundler)


Bun is a JavaScript and TypeScript bundler, transpiler, and minifier that can be used to bundle code for the browser, Node.js, and other platforms.


### [HTML imports](#html-imports)


In Bun 1.2, we've added support for HTML imports. This allows you to replace your entire frontend toolchain with a single import statement.
To get started, pass an HTML import to the `static` option in `Bun.serve`:

```
import homepage from "./index.html";
Bun.serve({
  static: {
    "/": homepage,
  },
  async fetch(req) {
    // ... api requests
  },
});
```

When you make a request to `/`, Bun automatically bundles the `<script>` and `<link>` tags in the HTML files, exposes them as static routes, and serves the result.
An index.html file like this:

index.html

```
<!DOCTYPE html>
<html>
  <head>
    <title>Home</title>
    <link rel="stylesheet" href="./reset.css" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./sentry-and-preloads.ts"></script>
    <script type="module" src="./my-app.tsx"></script>
  </body>
</html>
```

Becomes something like this:

index.html

```
<!DOCTYPE html>
<html>
  <head>
    <title>Home</title>
    <link rel="stylesheet" href="/index-[hash].css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index-[hash].js"></script>
  </body>
</html>
```

To read more about HTML imports and how they're implemented, check out the [HTML imports](https://bun.com/docs/bundler/fullstack) documentation.


### [Standalone executables](#standalone-executables)


You can use [`bun build --compile`](https://bun.com/docs/bundler/executables) to compile your application, and Bun, into a standalone executable.
In Bun 1.2, we've added support for cross-compilation. This allows you to build a Windows or macOS binary on a Linux machine, and vice versa.
You can run the following command on a macOS or Linux machine, and it will compile a Windows binary.

```
bun build --compile --target=bun-windows-x64 app.ts
```

```
[8ms]  bundle  1 modules
[1485ms] compile  app.exe bun-windows-x64-v1.2.0
```

For Windows specific builds, you can customize the icon and hide the console window.

```
bun build --compile --windows-icon=./icon.ico --windows-hide-console app.ts
```


### [Bytecode caching](#bytecode-caching)


You can also use [`bun build --bytecode`](https://bun.com/docs/bundler#bytecode) flag to generate a bytecode cache. This improves the startup time of applications like `eslint` to be [2x faster](https://x.com/jarredsumner/status/1840729983528137043).

```
bun build --bytecode --compile app.ts
```

```
./app
```

```
Hello, world!
```

You can also use the bytecode cache without `--compile`.

```
bun build --bytecode --outdir=dist app.ts
```

```
ls dist
```

```
app.js  app.jsc
```

When Bun generates output files, it will also generate `.jsc` files, which contain the bytecode cache of its respective `.js` file. Both files are necessary to run, as the bytecode compilation doesn't currently compile async functions, generators, or eval.
The bytecode cache can be 8x larger than the source code, so this makes startup faster at a cost of increased disk space.


### [CommonJS output format](#commonjs-output-format)


You can now set the output format to CommonJS with `bun build`. Previously, only ESM was supported.

```
bun build --format=cjs app.ts
```

This makes it easier to create libraries and applications meant for older versions of Node.js.

app.ts

```
// app.ts
export default "Hello, world!";
```

app.js

```
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
// app.js
var exports_site = {};
__export(exports_site, {
  default: () => site_default
});
module.exports = __toCommonJS(exports_site);
var site_default = "Hello, world!";
```


### [Better CommonJS detection](#better-commonjs-detection)


Some packages *really* want to trick bundlers and get the current module's file path, do a runtime require, or check if the current module is the main module. They try all kinds of things to make it work, such as:

```
"use strict";
if (eval("require.main") === eval("module.main")) {
  // ...
}
```

Bun supports both CommonJS and ESM; in fact, you can use `require()` and `import` in the same file. However, one of the challenges of supporting both is that there's a lot of ambiguity.
Consider the following code, is it CommonJS or ESM?

```
console.log("123");
```

There's no way to tell. Then, how about this?

```
console.log(module.require("path"));
```

CommonJS, because it's using `module.require()` to get the `path` module. And this?

```
import path from "path";
console.log(path);
```

ESM, because it's using `import`. But, what about this?

```
import path from "path";
const fs = require("fs");
console.log(fs.readFileSync(path.resolve("package.json"), "utf8"));
```

ESM, because it's using `import`. If we said it was CommonJS due to the require, then the `import` would break the code. We want to simplify building stuff in JavaScript, so let's just say it's ESM and not be fussy.
Finally, what about this?

```
"use strict";
console.log(eval("module.require('path')"));
```

Previously, Bun would have said ESM, because it's the default when there's no way to tell (including when the file extension is ambiguous, there's no "type" field in package.json, no export, no import, etc).
In Bun 1.2, Bun will say CommonJS, because of the "use strict" directive at the top of the file. ESM is always in strict mode, so an explicit "use strict" would be redundant.
Also, most build tools that output CommonJS include "use strict" at the top of the file. So we can now use this as a last-chance heuristic when it's completely ambiguous whether the file is CommonJS or ESM.


### [Plugin API](#plugin-api)


Bun has a universal [plugin API](https://bun.com/docs/bundler/plugins) for extending the bundler *and* the runtime.
You can use plugins to intercept `import()` statements, add custom loaders for extensions like `.yaml`, and implement frameworks for Bun.


### [`onBeforeParse()`](#onbeforeparse)


In Bun 1.2, we're introducing a new lifecycle hook for plugins, [`onBeforeParse()`](https://bun.com/docs/bundler/plugins#onbeforeparse).
Unlike the existing lifecycle hooks that run JavaScript code, this hook must be a [N-API addon](https://bun.com/docs/api/node-api), which can be implemented in a compiled language like Rust, C/C++, or Zig.
The hook is called immediately before parsing, without cloning the source code, without undergoing string conversion, and with practically zero overhead.
For example, you can create a Rust plugin that replaces all occurrences of `foo` with `bar`.

```
bun add -g @napi-rs/cli
```

```
napi new
```

```
cargo add bun-native-plugin
```

From there, you can implement the `onBeforeParse()` hook. These are advanced APIs, primarily designed for plugin and framework authors who want to use native code to make their plugins really fast.

lib.rs

```
use bun_native_plugin::{define_bun_plugin, OnBeforeParse, bun, Result, anyhow, BunLoader};
use napi_derive::napi;
define_bun_plugin!("foo-bar-plugin");
#[bun]
pub fn replace_foo_with_bar(handle: &mut OnBeforeParse) -> Result<()> {
  let input_source_code = handle.input_source_code()?;
  let output_source_code = input_source_code.replace("foo", "bar");
  handle.set_output_source_code(output_source_code, BunLoader::BUN_LOADER_JSX);
  Ok(())
}
```

build.ts

```
import { build } from "bun";
import fooBarPlugin from "./foo-bar-plugin";
await build({
  entrypoints: ["./app.tsx"],
  plugins: [
    {
      name: "foo-bar-plugin",
      setup(build) {
        build.onBeforeParse(
          {
            namespace: "file",
            filter: "/*.tsx",
          },
          {
            napiModule: fooBarPlugin,
            symbol: "replace_foo_with_bar",
          },
        );
      },
    },
  ],
});
```


### [Other changes](#other-changes)


We also made a lot of other improvements to `bun build` and the `Bun.build()` APIs.


#### Inject environment variables


You can now inject environment variables from your system environment into your bundle.

CLI

```
bun build --env="PUBLIC_*" app.tsx
```

JavaScript

```
import { build } from "bun";
await build({
  entrypoints: ["./app.tsx"],
  outdir: "./out",
  // Environment variables starting with "PUBLIC_"
  // will be injected in the build as process.env.PUBLIC_*
  env: "PUBLIC_*",
});
```


#### `bun build --drop`


You can use `--drop` to remove function calls from your JavaScript bundle. For example, if you pass `--drop=console`, all calls to `console.log()` will be removed from your code.

JavaScript

```
import { build } from "bun";
await build({
  entrypoints: ["./index.tsx"],
  outdir: "./out",
  drop: ["console", "anyIdentifier.or.propertyAccess"],
});
```

CLI

```
bun build ./index.tsx --outdir ./out --drop=console --drop=anyIdentifier.or.propertyAccess
```


#### Banner and footer


You can now use the banner and footer options in `bun build` to add content above or below the bundle.

CLI

```
bun build --banner "/* Banner! */" --footer "/* Footer! */" app.ts
```

JavaScript

```
import { build } from "bun";
await build({
  entrypoints: ["./app.ts"],
  outdir: "./dist",
  banner: "/* Banner! */",
  footer: "/* Footer! */",
});
```

This is useful for appending content above or below the bundle, such as a license or copyright notice.

```
/* Banner!
 */
export default "Hello, world!";
/* Footer!
 */
```


#### `Bun.embeddedFiles()`


You can use the new `Bun.embeddedFiles()` API to see a list of all embedded files in a standalone executable, compiled with `bun build --compile`.

```
import { embeddedFiles } from "bun";
for (const file of embeddedFiles) {
  console.log(file.name); // "logo.png"
  console.log(file.size); // 1234
  console.log(await file.bytes()); // Uint8Array(1234) [...]
}
```


#### `require.main === module`


Previously, using `require.main === module` would mark the module as CommonJS. Now, Bun rewrites this into `import.meta.main`, meaning you can use this pattern alongside import statements.

```
import * as fs from "fs";
if (typeof require !== "undefined" && require.main === module) {
  console.log("main!", fs);
}
```


#### `--ignore-dce-annotations`


Some JavaScript tools support special annotations that can influence behavior during dead-code elimination. For example, the `@__PURE__` annotation tells bundlers that a function call is pure (regardless of whether it actually is), and that the call can be removed if it is not used.

```
let button = /* @__PURE__ */ React.createElement(Button, null);
```

Sometimes, a library may include incorrect annotations, which can cause Bun to remove side effects which were needed.
To workaround these issue, you can use the `--ignore-dce-annotations` flag when running `bun build` to ignore all annotations. This should only be used if dead-code elimination breaks bundles, and fixing the annotations should be preferred to leaving this flag on.


#### `--packages=external`


You can now control if package dependencies are included in your bundle or not. If the import does not start with `.`, `..` or `/`, then it is considered a package.

CLI

```
bun build ./index.ts --packages external
```

JavaScript

```
await Bun.build({
  entrypoints: ["./index.ts"],
  packages: "external",
});
```

This is useful when bundling libraries. It lets you reduce the number of files your users have to download, while continuing to support peer or external dependencies.


## [Built-in CSS parser](#built-in-css-parser)


In Bun 1.2, we implemented a new CSS parser and bundler in Bun.
It's derived from the great work of [LightningCSS](https://github.com/parcel-bundler/lightningcss), and re-written from Rust to Zig so it can be integrated with Bun's custom JavaScript and TypeScript parser, bundler, and runtime.
Bun is an complete toolkit for running and building JavaScript and TypeScript. One of the missing pieces of Bun's built-in JavaScript bundler, `bun build`, is support for bundling and minifying CSS.


### [How it works](#how-it-works)


CSS bundlers combine multiple CSS files and assets referenced using directives like `url`, `@import`, `@font-face`, into a single CSS file you can send to browsers, avoiding a waterfall of network requests.

index.css

```
@import "foo.css";
@import "bar.css";
```

foo.css

```
.foo {
  background: red;
}
```

bar.css

```
.bar {
  background: blue;
}
```

To see how it works, you can try it using `bun build`.

```
bun build ./index.css
```

You'll see how the CSS files are combined into a single CSS file.

dist.css

```
/foo.css */
.foo {
  background: red;
}
/bar.css */
.bar {
  background: blue;
}
```


### [Import `.css` files from JavaScript](#import-css-files-from-javascript)


We've also made it possible to import `.css` files in your JavaScript and TypeScript code. This will create an additional CSS entrypoint that combines all the CSS files imported from a JavaScript module graph, along with `@import` rules.

index.ts

```
import "./style.css";
import MyComponent from "./MyComponent.tsx";
// ... rest of your app
```

In this example, if `MyComponent.tsx` imports another CSS file, instead of adding extra `.css` files to the bundle, all the CSS imported per entrypoint is flattened into a single CSS file.

shell

```
bun build ./index.ts --outdir=dist
```

```
index.js     0.10 KB
  index.css    0.10 KB
[5ms] bundle 4 modules
```


### [Using `Bun.build()`](#using-bun-build)


You can also bundle CSS using the programmatic `Bun.build()` API. This allows you to bundle both CSS and JavaScript in the same build, with the same API.

api.ts

```
import { build } from "bun";
const results = await build({
  entrypoints: ["./index.css"],
  outdir: "./dist",
});
console.log(results);
```


## [Bun APIs](#bun-apis)


In addition to supporting Node.js and Web APIs, Bun also has a growing standard library that makes it easy to do common tasks, without adding more external dependencies.


### [Static routes in `Bun.serve()`](#static-routes-in-bun-serve)


Bun has a built-in HTTP server that makes it easy to respond to HTTP requests using standard APIs like `Request` and `Response`. In Bun 1.2, we added support for static routes using the new `static` property.
To define a static route, pass the request path as the key and a `Response` object as the value.

```
import { serve } from "bun";
serve({
  static: {
    "/health-check": new Response("Ok!"),
    "/old-link": Response.redirect("/new-link", 301),
    "/api/version": Response.json(
      {
        app: require("./package.json").version,
        bun: Bun.version,
      },
      {
        headers: { "X-Powered-By": "bun" },
      },
    ),
  },
  async fetch(request) {
    return new Response("Dynamic!");
  },
});
```

Static routes are up to [40% faster](https://x.com/jarredsumner/status/1828042864531833035) than doing it yourself in the `fetch()` handler. The response body, headers, and status code are cached in memory, so there's no JavaScript allocation or garbage collection.
If you want to reload the static routes, you can use the `reload()` method. This is useful if you want to update the static routes on a schedule, or when a file changes.

```
import { serve } from "bun";
const server = serve({
  static: {
    "/": new Response("Static!"),
  },
  async fetch(request) {
    return new Response("Dynamic!");
  },
});
setInterval(() => {
  const date = new Date().toISOString();
  server.reload({
    static: {
      "/": new Response(`Static! Updated at ${date}`),
    },
  });
}, 1000);
```


### [`Bun.udpSocket()`](#bun-udpsocket)


While we added support for `node:dgram` in Bun 1.2, we also introduced UDP socket support in Bun's APIs. [`Bun.udpSocket()`](https://bun.com/docs/api/udp) is a faster, modern alternative and is similar to the existing [`Bun.listen()`](https://bun.com/docs/api/tcp) API.

```
import { udpSocket } from "bun";
const server = await udpSocket({
  socket: {
    data(socket, data, port, addr) {
      console.log(`Received data from ${addr}:${port}:`, data.toString());
    },
  },
});
const client = await udpSocket({ port: 0 });
client.send("Hello!", server.port, "127.0.0.1");
```

Bun's UDP socket API is built for performance. Unlike Node.js, it can send multiple UDP datagrams with a single syscall, and supports responding to backpressure from the operating system.

```
const socket = await Bun.udpSocket({
  port: 0,
  socket: {
    drain(socket) {
      // Socket is no longer under backpressure
    },
  },
});
// Send multiple UDP datagrams with a single syscall:
// [ <data>, <port>, <address> ][]
socket.sendMany([
  ["Hello", 12345, "127.0.0.1"],
  ["from", 12346, "127.0.0.1"],
  ["Bun 1.2", 12347, "127.0.0.1"],
]);
```

This is great for building game servers that need to broadcast game state updates to every peer.


### [`Bun.file()`](#bun-file)


Bun has a built-in [`Bun.file()`](https://bun.com/docs/api/file-io#reading-files-bun-file) API that makes it easy to read and write files. It extends the Web-standard `Blob` API, and makes it easier to work with files in a server environment.
In Bun 1.2, we've added support for even more `Bun.file()` APIs.


#### `delete()`


You can now delete files using the `delete()` method. An alias of `unlink()` is also supported.

```
import { file } from "bun";
await file("./package.json").delete();
await file("./node_modules").unlink();
```


#### `stat()`


You can now use the `stat()` method to get a file's metadata. This returns the same [`Stats`](https://nodejs.org/api/fs.html#class-fsstats) object as `fs.stat()` in Node.js.

```
import { file } from "bun";
const stat = await file("./package.json").stat();
console.log(stat.size); // => 1024
console.log(stat.mode); // => 33206
console.log(stat.isFile()); // => true
console.log(stat.isDirectory()); // => false
console.log(stat.ctime); // => 2025-01-21T16:00:00+00:00
```


#### Support for S3 files


With newly added built-in support for S3, you can use the same `Bun.file()` APIs with a S3 file.

```
import { s3 } from "bun";
const stat = await s3("s3://folder/my-file.txt").stat();
console.log(stat.size); // => 1024
console.log(stat.type); // => "text/plain;charset=utf-8"
await s3("s3://folder/").unlink();
```


### [`Bun.color()`](#bun-color)


To support CSS with `bun build`, we implemented our own CSS parser in Bun 1.2. In doing this work, we decided to expose some useful APIs for working with colors.
You can use [`Bun.color()`](https://bun.com/docs/api/color) to parse, normalize, and convert colors into a variety of formats. It supports CSS, ANSI color codes, RGB, HSL, and more.

```
import { color } from "bun";
color("#ff0000", "css"); // => "red"
color("rgb(255, 0, 0)", "css"); // => "red"
color("red", "ansi"); // => "\x1b[31m"
color("#f00", "ansi-16m"); // => "\x1b[38;2;255;0;0m"
color(0xff0000, "ansi-256"); // => "\u001b[38;5;196m"
color({ r: 255, g: 0, b: 0 }, "number"); // => 16711680
color("hsl(0, 0%, 50%)", "{rgba}"); // => { r: 128, g: 128, b: 128, a: 1 }
```


### [`dns.prefetch()`](#dns-prefetch)


You can use the new [`dns.prefetch()`](https://bun.com/docs/api/dns#dns-prefetch) API to prefetch DNS records before they are needed. This is useful if you want to pre-warm the DNS cache on startup.

```
import { dns } from "bun";
// ...on startup
dns.prefetch("example.com");
// ...later on
await fetch("https://example.com/");
```

This will prefetch the DNS record for example.com and make it available for use in `fetch()` requests. You can also use the [`dns.getCacheStats()`](https://bun.com/docs/api/dns#dns-getcachestats) API to observe the DNS cache.

```
import { dns } from "bun";
await fetch("https://example.com/");
console.log(dns.getCacheStats());
// {
//   cacheHitsCompleted: 0,
//   cacheHitsInflight: 0,
//   cacheMisses: 1,
//   size: 1,
//   errors: 0,
//   totalCount: 1,
// }
```


### [Helpful utilities](#helpful-utilities)


We also added a few random utilities to Bun's APIs.


#### `Bun.inspect.table()`


You can now use `Bun.inspect.table()` to format tabular data into a string. It's similar to [`console.table`](https://developer.mozilla.org/en-US/docs/Web/API/console/table_static), except it returns a string rather than printing to the console.

```
console.log(
  Bun.inspect.table([
    { a: 1, b: 2, c: 3 },
    { a: 4, b: 5, c: 6 },
    { a: 7, b: 8, c: 9 },
  ]),
);
// ┌───┬───┬───┬───┐
// │   │ a │ b │ c │
// ├───┼───┼───┼───┤
// │ 0 │ 1 │ 2 │ 3 │
// │ 1 │ 4 │ 5 │ 6 │
// │ 2 │ 7 │ 8 │ 9 │
// └───┴───┴───┴───┘
```


#### `Bun.randomUUIDv7()`


You can use `Bun.randomUUIDv7()` to generate a [UUID v7](https://www.ietf.org/archive/id/draft-peabody-dispatch-new-uuid-format-01.html#name-uuidv7-layout-and-bit-order), a monotonic UUID suitable for sorting and databases.

index.ts

```
import { randomUUIDv7 } from "bun";
const uuid = randomUUIDv7();
// => "0192ce11-26d5-7dc3-9305-1426de888c5a"
```


## [New in Bun's built-in SQLite client](#new-in-bun-s-built-in-sqlite-client)


Bun has a built-in [SQLite client](https://bun.com/docs/api/sqlite) that makes it easy to query SQLite databases. In Bun 1.2, we've added a few new features to make it even easier to use.


### [ORM-less object mapping](#orm-less-object-mapping)


When you query a SQL database, you often want to map your query results to a JavaScript object. That's why there's so many popular [ORM](https://www.prisma.io/dataguide/types/relational/what-is-an-orm#do-i-need-an-orm) (Object-Relational Mapping) packages like Prisma and TypeORM.
You can now use [`query.as(Class)`](https://bun.com/docs/api/sqlite#as-class-map-query-results-to-a-class) to map query results to instances of a class. This lets you attach methods, getters, and setters without using an ORM.

```
import { Database } from "bun:sqlite";
class Tweet {
  id: number;
  text: string;
  username: string;
  get isMe() {
    return this.username === "jarredsumner";
  }
}
const db = new Database("tweets.db");
const tweets = db.query("SELECT * FROM tweets").as(Tweet);
for (const tweet of tweets.all()) {
  if (!tweet.isMe) {
    console.log(`${tweet.username}: ${tweet.text}`);
  }
}
```

For performance reasons, class constructors, default initializers, and private fields are not supported. Instead, it uses the equivalent of `Object.create()` to create a new object with the class's prototype and assigns the values of the row to it.
It's also important to note that this is *not* an ORM. It doesn't manage relationships, generate SQL queries, or anything like that. However, it does remove a lot of boilerplate to get JavaScript objects from SQLite!


### [Iterable queries](#iterable-queries)


You can now use [`query.iterate()`](https://bun.com/docs/api/sqlite#iterate-iterator) to get an iterator that yields rows as they are returned from the database. This is useful when you want to process rows at a time, without loading them all into memory.

```
import { Database } from "bun:sqlite";
class User {
  id: number;
  email: string;
}
const db = new Database("users.db");
const rows = db.query("SELECT * FROM users").as(User).iterate();
for (const row of rows) {
  console.log(row);
}
```

You can also iterate over the query using a `for` loop, without calling `iterate()`.

```
for (const row of db.query("SELECT * FROM users")) {
  console.log(row); // { id: 1, email: "[[email protected]](https://bun.com/cdn-cgi/l/email-protection)" }
}
```


### [Strict query parameters](#strict-query-parameters)


You can now omit the `$`, `@`, or `:` prefix when passing JavaScript values as query parameters.

```
import { Database } from "bun:sqlite";
const db = new Database(":memory:", {
  strict: false,
  strict: true,
});
const query = db.query(`select $message;`);
query.all({
  $message: "Hello world"
  message: "Hello world"
});
```

To use this behavior, enable the [`strict`](https://bun.com/docs/api/sqlite#strict-mode) option. This will allow you to omit the `$`, `@`, or `:` prefixes, and will throw an error if a parameter is missing.


### [Tracking changed rows](#tracking-changed-rows)


You can now access the number of rows changed and the last inserted row ID when running queries.

```
import { Database } from "bun:sqlite";
const db = new Database(":memory:");
db.run(`CREATE TABLE users (id INTEGER, username TEXT)`);
const { changes, lastInsertRowid } = db.run(
  `INSERT INTO users VALUES (1, 'jarredsumner')`,
);
console.log({
  changes, // => 1
  lastInsertRowid, // => 1
});
```


### [BigInt support](#bigint-support)


If you want to use 64-bit integers, you can enable the [`safeIntegers`](https://bun.com/docs/api/sqlite#safeintegers-true) option. This will return integers as as a `BigInt`, instead of a truncated `number`.

```
import { Database } from "bun:sqlite";
const db = new Database(":memory:", { safeIntegers: true });
const query = db.query(
  `SELECT ${BigInt(Number.MAX_SAFE_INTEGER) + 1n} as maxInteger`,
);
const { maxInteger } = query.get();
console.log(maxInteger); // => 9007199254740992n
```

You can also enable this on a per-query basis using the [`safeIntegers()`](https://bun.com/docs/api/sqlite#safeintegers-true) method.

```
import { Database } from "bun:sqlite";
const db = new Database(":memory:", { strict: true });
const query = db.query("SELECT $value as value").safeIntegers(true);
const { value } = query.get({
  value: BigInt(Number.MAX_SAFE_INTEGER) + 1n,
});
console.log(value); // => 9007199254740992n
```


### [Reliable cleanup with `using`](#reliable-cleanup-with-using)


With JavaScript's [`using`](https://github.com/tc39/proposal-explicit-resource-management?tab=readme-ov-file#ecmascript-explicit-resource-management) syntax, you can automatically close statements and databases when their variables go out of scope. This allows you to clean up database resources, even if there's a thrown error. [Read on](#resource-management-with-using) for more details on Bun's support for this new JavaScript feature.

```
import { Database } from "bun:sqlite";
{
  using db = new Database("file.db");
  using query = db.query("SELECT * FROM users");
  for (const row of query.all()) {
    throw new Error("Oops!"); // no try/catch block needed!
  }
}
// scope ends here, so `db` and `query` are automatically closed
```


## [Compile and run C from JavaScript](#compile-and-run-c-from-javascript)


We've added experimental support for compiling and running C from JavaScript. This is a simple way to use C system libraries from JavaScript *without a build step*.

random.c

```
#include <stdio.h>
#include <stdlib.h>
int random() {
  return rand() + 42;
}
```

random.ts

```
import { cc } from "bun:ffi";
const { symbols: { random } } = cc({
  source: "./random.c",
  symbols: {
    random: {
      returns: "int",
      args: [],
    },
  },
});
console.log(random()); // 42
```


### [Why is this useful?](#why-is-this-useful)


For advanced use-cases or where performance is really important, you sometimes need to use system libraries from JavaScript. Today, the most common way to do this is by compiling a [N-API addon](https://nodejs.org/api/n-api.html) using [`node-gyp`](https://github.com/nodejs/node-gyp). You might notice if a package uses this, because it runs a postinstall script when you install it.
However, this isn't a great experience. Your system needs a modern version of Python and a C compiler, which is usually installed using a command like `apt install build-essential`.
And hopefully you don't run into a compiler or node-gyp error, which can be quite frustrating.

```
gyp ERR! command "/usr/bin/node" "/tmp/node-gyp@latest--bunx/node_modules/.bin/node-gyp" "configure" "build"
gyp ERR! cwd /bun/test/node_modules/bktree-fast
gyp ERR! node -v v12.22.9
gyp ERR! node-gyp -v v9.4.0
gyp ERR! Node-gyp failed to build your package.
gyp ERR! Try to update npm and/or node-gyp and if it does not help file an issue with the package author.
error: "node-gyp" exited with code 7 (SIGBUS)
```


### [How does it work?](#how-does-it-work)


In case you didn't know, Bun embeds a built-in C compiler called [`tinycc`](https://github.com/TinyCC/tinycc). Surprise!
Unlike traditional C compilers, like `gcc` or `clang`, that can take seconds to compile a simple program, `tinycc` compiles simple C code in milliseconds. This makes it possible for Bun to compile your C code on-demand, without a build step.
Using the [`bun:ffi`](https://bun.com/docs/api/cc) APIs, you can compile and run C code from JavaScript. Here's an example project that uses the [N-API](https://bun.com/docs/api/node-api) to return a JavaScript string from C code.

hello-napi.c

```
#include <node/node_api.h>
napi_value hello_napi(napi_env env) {
  napi_value result;
  napi_create_string_utf8(env, "Hello, N-API!", NAPI_AUTO_LENGTH, &result);
  return result;
}
```

hello-napi.js

```
import { cc } from "bun:ffi";
import source from "./hello-napi.c" with { type: "file" };
const hello = cc({
  source,
  symbols: {
    hello_napi: {
      args: ["napi_env"],
      returns: "napi_value",
    },
  },
});
console.log(hello());
// => "Hello, N-API!"
```

Instead of requiring a build step with `node-gyp`, as long as you have Bun, this just works.


## [musl support](#musl-support)


In Bun 1.2, we've introduced a new build of Bun that works on Linux distros that use the [musl libc](https://www.musl-libc.org/) instead of glibc, like [Alpine Linux](https://www.alpinelinux.org/). This is supported on both Linux x64 and aarch64.
You can also use the [alpine version](https://hub.docker.com/r/oven/bun) of Bun in Docker.

```
docker run --rm -it oven/bun:alpine bun --print 'Bun.file("/etc/alpine-release").text()'
```

```
3.20.5
```

While musl enables smaller container images, it tends to perform slightly slower than the glibc version of Bun. We recommend using glibc unless you have a specific reason to use musl.


## [JavaScript features](#javascript-features)


JavaScript is a language that is constantly evolving. In Bun 1.2, even more JavaScript features are available thanks to the collaboration of the [TC39](https://tc39.es/) committees, and the hard work of the [WebKit](https://webkit.org/) team.


### [Import attributes](#import-attributes)


You can now specify an [import attribute](https://github.com/tc39/proposal-import-attributes) when importing a file. This is useful when you want to import a file that isn't JavaScript code, like a JSON object or a text file.

```
import json from "./package.json" with { type: "json" };
typeof json; // "object"
import html from "./index.html" with { type: "text" };
typeof html; // "string"
import toml from "./bunfig.toml" with { type: "toml" };
typeof toml; // "object"
```

You can also specify import attributes using `import()`.

```
const { default: json } = await import("./package.json", {
  with: { type: "json" },
});
typeof json; // "object"
```


### [Resource management with `using`](#resource-management-with-using)


With the newly introduced [`using`](https://github.com/tc39/proposal-explicit-resource-management?tab=readme-ov-file#ecmascript-explicit-resource-management) syntax in JavaScript, you can automatically close resources when a variable goes out of scope.
Instead of defining a variable with `let` or `const`, you can now define a variable with `using`.

```
import { serve } from "bun";
{
  using server = serve({
    port: 0,
    fetch(request) {
      return new Response("Hello, world!");
    },
  });
  doStuff(server);
}
function doStuff(server) {
  // ...
}
```

In this example, the server is automatically closed when the `server` variable goes out of scope, even if an exception is thrown. This is useful for ensuring that resources are properly cleaned up, especially in tests.
To support this, an object's prototype must define a `[Symbol.dispose]` method, or `[Symbol.asyncDispose]` method if it's an async resource.

```
class Resource {
  [Symbol.dispose]() { /* ... */ }
}
using resource = new Resource();
class AsyncResource {
  async [Symbol.asyncDispose]() { /* ... */ }
}
await using asyncResource = new AsyncResource();
```

We've also added support for `using` in dozens of Bun APIs, including `Bun.spawn()`, `Bun.serve()`, `Bun.connect()`, `Bun.listen()`, and `bun:sqlite`.

```
import { spawn } from "bun";
import { test, expect } from "bun:test";
test("able to spawn a process", async () => {
  using subprocess = spawn({
    cmd: [process.execPath, "-e", "console.log('Hello, world!')"],
    stdout: "pipe",
  });
  // Even if this expectation fails, the subprocess will still be closed.
  const stdout = new Response(subprocess.stdout).text();
  await expect(stdout).resolves.toBe("Hello, world!");
});
```


### [`Promise.withResolvers()`](#promise-withresolvers)


You can use [`Promise.withResolvers()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers) to create a promise that resolves or rejects when you call the `resolve` or `reject` functions.

```
const { promise, resolve, reject } = Promise.withResolvers();
setTimeout(() => resolve(), 1000);
await promise;
```

This is a useful alternative to `new Promise()`, since you don't need to create a new scope.

```
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve(), 1000);
});
await promise;
```


### [`Promise.try()`](#promise-try)


You can use [`Promise.try()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try) to create a promise that wraps a synchronous or asynchronous function.

```
const syncFn = () => 1 + 1;
const asyncFn = async (a, b) => 1 + a + b;
await Promise.try(syncFn); // => 2
await Promise.try(asyncFn, 2, 3); // => 6
```

This is useful if you don't know if a function is synchronous or asynchronous. Previously, you would have to do something like this:

```
await new Promise((resolve) => resolve(syncFn()));
await new Promise((resolve) => resolve(asyncFn(2, 3)));
```


### [`Error.isError()`](#error-iserror)


You can now check if an object is an `Error` instance using [`Error.isError()`](https://github.com/tc39/proposal-is-error/tree/main?tab=readme-ov-file#erroriserror).

```
Error.isError(new Error()); // => true
Error.isError({}); // => false
Error.isError(new (class Error {})()); // => false
Error.isError({ [Symbol.toStringTag]: "Error" }); // => false
```

This is more correct than using `instanceof` because the prototype chain can be tampered with, and `instanceof` can return false-negatives when using `node:vm`.

```
import { runInNewContext } from "node:vm";
const crossRealmError = runInNewContext("new Error()");
crossRealmError instanceof Error; // => false
Error.isError(crossRealmError); // => true
```


### [`Uint8Array.toBase64()`](#uint8array-tobase64)


You can now encode and decode base64 strings using `Uint8Array`.

-   `toBase64()` converts a `Uint8Array` to a base64 string
-   `fromBase64()` converts a base64 string to a `Uint8Array`

```
new Uint8Array([1, 2, 3, 4, 5]).toBase64(); // "AQIDBA=="
Unit8Array.fromBase64("AQIDBA=="); // [1, 2, 3, 4, 5]
```

These APIs are standard alternatives to the usage of `Buffer.toString("base64")` in Node.js.


### [`Uint8Array.toHex()`](#uint8array-tohex)


You can also convert `Uint8Array` to and from hex strings.

-   `toHex()` converts a `Uint8Array` to a hex string
-   `fromHex()` converts a hex string to a `Uint8Array`

```
new Uint8Array([1, 2, 3, 4, 5]).toHex(); // "0102030405"
Unit8Array.fromHex("0102030405"); // [1, 2, 3, 4, 5]
```

These APIs are standard alternatives to the usage of `Buffer.toString("hex")` in Node.js.


### [Iterator helpers](#iterator-helpers)


There are new APIs that make it easier to work with JavaScript iterators and generators.


#### `iterator.map(fn)`


Returns an iterator that yields the results of the `fn` function applied to each value of the original iterator, similar to `Array.prototype.map`.

```
function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
const result = range(3, 5).map((x) => x * 2);
result.next(); // { value: 6, done: false }
```


#### `iterator.flatMap(fn)`


Returns an iterator that yields the values of the original iterator, but flattens the results of the `fn` function, similar to `Array.prototype.flatMap`.

```
function* randomThoughts(): Generator<string> {
  yield "Bun is written in Zig";
  yield "Bun runs JavaScript and TypeScript";
}
const result = randomThoughts().flatMap((x) => x.split(" "));
result.next(); // { value: "Bun", done: false }
result.next(); // { value: "is", done: false }
// ...
result.next(); // { value: "TypeScript", done: false }
```


#### `iterator.filter(fn)`


Returns an iterator that only yields values that pass the `fn` predicate, similar to `Array.prototype.filter`.

```
function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
const result = range(3, 5).filter((x) => x % 2 === 0);
result.next(); // { value: 4, done: false }
```


#### `iterator.take(n)`


Returns an iterator that yields the first `n` values of the original iterator.

```
function* odds(): Generator<number> {
  let i = 1;
  while (true) {
    yield i;
    i += 2;
  }
}
const result = odds().take(1);
result.next(); // { value: 1, done: false }
result.next(); // { done: true }
```


#### `iterator.drop(n)`


Returns an iterator that yields all values of the original iterator, except the first `n` values.

```
function* evens(): Generator<number> {
  let i = 0;
  while (true) {
    yield i;
    i += 2;
  }
}
const result = evens().drop(2);
result.next(); // { value: 4, done: false }
result.next(); // { value: 6, done: false }
```


#### `iterator.reduce(fn, initialValue)`


Reduces the values of an iterator with a function, similar to `Array.prototype.reduce`.

```
function* powersOfTwo(): Generator<number> {
  let i = 1;
  while (true) {
    yield i;
    i *= 2;
  }
}
const result = powersOfTwo()
  .take(5)
  .reduce((acc, x) => acc + x, 0);
console.log(result); // 15
```


#### `iterator.toArray()`


Returns an array that contains all the values of the original iterator. Make sure that the iterator is finite, otherwise this will cause an infinite loop.

```
function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
const result = range(1, 5).toArray();
console.log(result); // [1, 2, 3, 4]
```


#### `iterator.forEach(fn)`


Calls the `fn` function on each value of the original iterator, similar to `Array.prototype.forEach`.

```
function* randomThoughts(): Generator<string> {
  yield "Bun is written in Zig";
  yield "Bun runs JavaScript and TypeScript";
}
const result = randomThoughts().forEach((x) => console.log(x));
// Bun is written in Zig
// Bun runs JavaScript and TypeScript
```


#### `iterator.find(fn)`


Returns the first value of the original iterator that passes the `fn` predicate, similar to `Array.prototype.find`. If no such value exists, it returns `undefined`.

```
function* range(start: number, end: number): Generator<number> {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
const result = range(0, 99).find((x) => x % 100 === 0);
console.log(result); // undefined
```


### [`Float16Array`](#float16array)


There's now support for 16-bit floating point arrays using [`Float16Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array). While 16-bit floating point numbers are less precise than 32-bit floating point numbers, they are much more memory efficient.

```
const float16 = new Float16Array(3);
const float32 = new Float32Array(3);
for (let i = 0; i < 3; i++) {
  float16[i] = i + 0.123;
  float32[i] = i + 0.123;
}
console.log(float16); // Float16Array(3) [ 0, 1.123046875, 2.123046875 ]
console.log(float32); // Float32Array(3) [ 0, 1.1230000257492065, 2.122999906539917 ]
```


## [Web APIs](#web-apis)


In addition to new JavaScript features, there are also new Web-standard APIs that you can use in Bun.


### [`TextDecoderStream`](#textdecoderstream)


You can now use [`TextDecoderStream`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoderStream) and [`TextEncoderStream`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoderStream) to encode and decode streams of data. These APIs are the streaming equivalents of [`TextDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextDecoder) and [`TextEncoder`](https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder).
You can use `TextDecoderStream` to decode a stream of bytes into a stream of UTF-8 strings.

```
const response = await fetch("https://example.com");
const body = response.body.pipeThrough(new TextDecoderStream());
for await (const chunk of body) {
  console.log(chunk); // typeof chunk === "string"
}
```

Or you can use `TextEncoderStream` to encode a stream of UTF-8 strings into a stream of bytes. In Bun, this is up to [30x faster](https://twitter.com/jarredsumner/status/1822221334056935771) than in Node.js.

```
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue("Hello, world!");
    controller.close();
  },
});
const body = stream.pipeThrough(new TextEncoderStream());
for await (const chunk of body) {
  console.log(chunk); // chunk instanceof Uint8Array
}
```


### [`TextDecoder` with `stream` option](#textdecoder-with-stream-option)


There is also support for the `stream` option in `TextDecoder`. This tells the decoder that chunks are part of a larger stream, and it should not throw an error if chunk is not a complete UTF-8 code point.

```
const decoder = new TextDecoder("utf-8");
const first = decoder.decode(new Uint8Array([226, 153]), { stream: true });
const second = decoder.decode(new Uint8Array([165]), { stream: true });
console.log(first); // ""
console.log(second); // "♥"
```


### [`bytes()` API](#bytes-api)


You can now use the `bytes()` method on streams, which returns a `Uint8Array` of the stream's data.

```
const response = await fetch("https://example.com/");
const bytes = await response.bytes();
console.log(bytes); // Uint8Array(1256) [ 60, 33, ... ]
```

Previously, you'd have to use `arrayBuffer()`, then create a new `Uint8Array`:

```
const blob = new Blob(["Hello, world!"]);
const buffer = await blob.arrayBuffer();
const bytes = new Uint8Array(buffer);
```

The `bytes()` method is supported by several APIs, including `Response`, `Blob`, and `Bun.file()`.

```
import { file } from "bun";
const content = await file("./hello.txt").bytes();
console.log(content); // Uint8Array(1256) [ 60, 33, ... ]
```


### [Streaming `fetch()` uploads](#streaming-fetch-uploads)


You can now send a [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) request with a streaming body. This is useful for uploading large files, or streams of data where the content length is not known ahead of time.

```
await fetch("https://example.com/upload", {
  method: "POST",
  body: async function* () {
    yield "Hello";
    yield " ";
    yield "world!";
  },
});
```


### [`console.group()`](#console-group)


You can now use [`console.group()`](https://developer.mozilla.org/en-US/docs/Web/API/console/group_static) and [`console.groupEnd()`](https://developer.mozilla.org/en-US/docs/Web/API/console/groupEnd_static) to create a nested log messages. Previously, these were not implemented in Bun, and it would do nothing.

index.js

```
console.group("begin");
console.log("indent!");
console.groupEnd();
// begin
//   indent!
```


### [`URL.createObjectURL()`](#url-createobjecturl)


There is now support for [`URL.createObjectURL()`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL), which creates a URL from a Blob object. These urls can then be used in APIs like `fetch()`, `Worker`, and `import()`.
When combined with `Worker`, it allows for an easy way to spawn additional threads without creating a new separate URL for the worker's script. Since worker scripts also run through Bun's transpiler, TypeScript syntax is supported.

worker.ts

```
const code = `
  const foo: number = 123;
  postMessage({ foo } satisfies Data);
`;
const blob = new File([code], "worker.ts");
const url = URL.createObjectURL(blob);
const worker = new Worker(url);
worker.onmessage = ({ data }) => {
  console.log("Received data:", data);
};
```


### [`AbortSignal.any()`](#abortsignal-any)


You can use [`AbortSignal.any()`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static) to combine multiple instances of `AbortSignal`. If one of the child signals is aborted, the parent signal is also aborted.

```
const { signal: firstSignal } = new AbortController();
fetch("https://example.com/", { signal: firstSignal });
const { signal: secondSignal } = new AbortController();
fetch("https://example.com/", { signal: secondSignal });
// Cancels if either `firstSignal` or `secondSignal` is aborted
const signal = AbortSignal.any([firstSignal, secondSignal]);
await fetch("https://example.com/slow", { signal });
```


## [Behaviour changes](#behaviour-changes)


Bun 1.2 contains a few behaviour tweaks to that you should be aware of, but we think is unlikely to break your code. We avoid making these changes unless we think the status-quo is *so broken* that it's worth it.


### [`bun run` uses the correct directory](#bun-run-uses-the-correct-directory)


Previously, when you ran a `package.json` script using `bun run`, the working directory of the script was the same as the current working directory of your shell.
In most cases, you don't notice a difference, because your shell's working directory is *usually* the same as the parent directory of your `package.json` file.

```
cd /path/to/project
```

```
ls
```

```
package.json
```

```
bun run pwd
```

```
/path/to/project
```

However, if you `cd` into a different directory, you'll notice the difference.

```
cd dist
```

```
bun run pwd
```

```
/path/to/project/dist
```

This does not match what other package managers do, like `npm` or `yarn`, and more-often-than-not causes unexpected behaviour.
In Bun 1.2, the working directory of the script is now the parent directory of the `package.json` file, instead of the current working directory of your shell.

```
cd /path/to/project/dist
```

```
bun run pwd
```

```
/path/to/project/dist
/path/to/project
```


### [Uncaught errors in `bun test`](#uncaught-errors-in-bun-test)


Previously, `bun test` would not fail when there was an uncaught error or rejection between test cases.

```
import { test, expect } from "bun:test";
test("should have failed, but didn't", () => {
  setTimeout(() => {
    throw new Error("Oops!");
  }, 1);
});
```

In Bun 1.2, this has now been fixed, and `bun test` will report the failure.

```

# Unhandled error between tests

-------------------------------
1 | import { test, expect } from "bun:test";
2 |
3 | test("should have failed, but didn't", () => {
4 |   setTimeout(() => {
5 |     throw new Error("Oops!");
              ^
error: Oops!
      at foo.test.ts:5:11
-------------------------------
```


### [`server.stop()` returns a Promise](#server-stop-returns-a-promise)


Previously, there was no way to gracefully wait for connections to close from Bun's HTTP server.
To make this possible, we made `stop()` return a promise, which resolves when in-flight HTTP connections are closed.

```
interface Server {
   stop(): void;
   stop(): Promise<void>;
}
```


### [`Bun.build()` rejects when it fails](#bun-build-rejects-when-it-fails)


Previously, when `Bun.build()` would fail, it would report the error in the `logs` array. This was often confusing, because the promise would resolve successfully.

```
import { build } from "bun";
const result = await build({
  entrypoints: ["./bad.ts"],
});
console.log(result.logs[0]); // error: ModuleNotFound resolving "./bad.ts" (entry point)
```

In Bun 1.2, `Bun.build()` will now reject when it fails, instead of returning errors in the `logs` array.

```
const result = build({
  entrypoints: ["./bad.ts"],
});
await result; // error: ModuleNotFound resolving "./bad.ts" (entry point)
```

If you want to restore to the old behaviour, you can set the `throw: false` option.

```
const result = await build({
  entrypoints: ["./bad.ts"],
  throw: false,
});
```


### [`bun -p` is an alias for `bun --print`](#bun-p-is-an-alias-for-bun-print)


Previously, `bun -p` was an alias for `bun --port`, which was used to change the port of `Bun.serve()`. The alias was added before Bun supported `bun --print`.
To match Node.js, we've changed `bun -p` to be an alias for `bun --print`.

```
bun -p 'new Date()'
```

```
2025-01-17T22:55:27.659Z
```


### [`bun build --sourcemap`](#bun-build-sourcemap)


Previously, using `bun build --sourcemap` would default to inlined source maps.

```
bun build --sourcemap ./index.ts --outfile ./index.js
```

index.js

```
console.log("Hello Bun!");
//# sourceMappingURL=data:application/json;base64,...
```

This was confusing, because it is the opposite of what other tools do, like `esbuild`.
In Bun 1.2, `bun build --sourcemap` now defaults to `linked` source maps.

index.js

```
console.log("Hello Bun!");
```

index.js.map

```
{
  "version": 3,
  "sources": ["index.ts"],
  // ...
}
```

If you want to restore to the old behaviour, you can use `--sourcemap=inline`.


## [Bun is even faster](#bun-is-even-faster)


We spend a lot of time improving performance in Bun. We post almost daily updates of "[In the next version of Bun](https://x.com/search?q=from%3Abunjavascript%20%22In%20the%20next%20version%20of%20Bun%22&src=typed_query&f=live)" which you can follow on [@bunjavascript](https://x.com/bunjavascript).
Here's a preview of some of the performance improvements we made in Bun 1.2.

`node:http2` is 2x faster

> In the next version of Bun
> node:http2 server support is implemented. For the same code:
> Bun v1.1.31: 128,879 req/s (2.4x faster)  
> Node v23.0.0: 52,785 req/s [pic.twitter.com/SIM0I0Td4T](https://t.co/SIM0I0Td4T)
> 
> — Bun (@bunjavascript) [October 17, 2024](https://twitter.com/bunjavascript/status/1847014951661326396?ref_src=twsrc%5Etfw)

`node:http` is 5x faster at uploading to S3

> — Ciro Spaciari (@cirospaciari) [August 21, 2024](https://twitter.com/cirospaciari/status/1826086715393716457?ref_src=twsrc%5Etfw)

Not to be confused with Bun's built-in S3 client, which is even 5x faster.
`path.resolve()` is 30x faster

> — Jarred Sumner (@jarredsumner) [September 12, 2024](https://twitter.com/jarredsumner/status/1834353346318401915?ref_src=twsrc%5Etfw)

`fetch()` is 2x faster at DNS resolution

> yOu cAnT mAkE fEtCh fAsTeR [pic.twitter.com/Ie8a6YM8Js](https://t.co/Ie8a6YM8Js)
> — Bun (@bunjavascript) [May 18, 2024](https://twitter.com/bunjavascript/status/1791678083449393219?ref_src=twsrc%5Etfw)

`bun --hot` uses 2x less memory

> In the next version of Bun
> bun --hot uses less memory after many runs
> left: Bun v1.1.22 (new)  
> right: Bun v1.1.21 (old) [pic.twitter.com/eDl5iqZsme](https://t.co/eDl5iqZsme)
> 
> — Jarred Sumner (@jarredsumner) [August 1, 2024](https://twitter.com/jarredsumner/status/1818918642022858847?ref_src=twsrc%5Etfw)

`fs.readdirSync()` is 5% faster on macOS

> — Jarred Sumner (@jarredsumner) [June 24, 2024](https://twitter.com/jarredsumner/status/1805067761103814828?ref_src=twsrc%5Etfw)

`String.at()` is 44% faster

> — Bun (@bunjavascript) [December 12, 2024](https://twitter.com/bunjavascript/status/1867203604777676961?ref_src=twsrc%5Etfw)

`atob()` is 8x faster
For large string inputs, `atob()` is up to 8x faster.

> — Bun (@bunjavascript) [May 15, 2024](https://twitter.com/bunjavascript/status/1790658507479646469?ref_src=twsrc%5Etfw)

`fetch()` decompresses 30% faster

> — Jarred Sumner (@jarredsumner) [July 27, 2024](https://twitter.com/jarredsumner/status/1817067294591451208?ref_src=twsrc%5Etfw)

`Buffer.from(String, "base64")` is 30x faster
For large string inputs, `Buffer.from(string, "base64")` is up to 30x faster.

> — Jarred Sumner (@jarredsumner) [June 19, 2024](https://twitter.com/jarredsumner/status/1803570321309704258?ref_src=twsrc%5Etfw)

`JSON.parse()` is up to 4x faster
For large string inputs, `JSON.parse()` is between 2x and 4x faster.  
For object inputs, it's 6% faster.

> — Bun (@bunjavascript) [May 10, 2024](https://twitter.com/bunjavascript/status/1788826914570019245?ref_src=twsrc%5Etfw)

`Bun.serve()` has 2x more throughput
The fast path for `request.json()` and similar methods now works after accessing the request `body`. This makes throughput for some `Bun.serve()` applications up to 2x faster.

> In the next version of Bun
> The fast path in request.json() & similar methods now works after accessing "body"
> New: 65,000 req/s  
> Prev: 29,000 req/s [pic.twitter.com/2EqYyCoq4G](https://t.co/2EqYyCoq4G)
> 
> — Jarred Sumner (@jarredsumner) [September 3, 2024](https://twitter.com/jarredsumner/status/1830900845778743450?ref_src=twsrc%5Etfw)

`Error.captureStackTrace()` is 9x faster

> — Jarred Sumner (@jarredsumner) [October 14, 2024](https://twitter.com/jarredsumner/status/1845736532298383391?ref_src=twsrc%5Etfw)

`fs.readFile()` is 10% faster
For small files, `fs.readFile()` is up to 10% faster.

> In the next version of Bun
> fs.readFile gets up to 10% faster at reading small files (reminder: 1 µs == 1000ns) [pic.twitter.com/3vgg8FRfMs](https://t.co/3vgg8FRfMs)
> 
> — Jarred Sumner (@jarredsumner) [November 10, 2024](https://twitter.com/jarredsumner/status/1855427363133333870?ref_src=twsrc%5Etfw)

`console.log(String)` is 50% faster
When you use `console.log()` with a string as an argument, it's now 50% faster.

> — Bun (@bunjavascript) [August 13, 2024](https://twitter.com/bunjavascript/status/1823263542067536197?ref_src=twsrc%5Etfw)

JavaScript is faster on Windows
In Bun 1.2, we enabled the [JIT](https://www.webkit.org/blog/5852/introducing-the-b3-jit-compiler/) on Windows. Previously, the JIT was only available on macOS and Linux.

> — Jarred Sumner (@jarredsumner) [July 9, 2024](https://twitter.com/jarredsumner/status/1810497635624890391?ref_src=twsrc%5Etfw)

JIT, or just-in-time compilation, is a technique that compiles code at runtime, instead of ahead-of-time compilation. This makes JavaScript faster, but it's also a lot more complex to implement.
JavaScript, across the board, now runs faster on Windows. For example:

-   `Object.entries()` is 20% faster
-   `Array.map()` is 50% faster

The JIT does a lot, it's over 25,000 lines of C++ code!


## [Getting started](#getting-started)


That's it — that's Bun 1.2, and it's still just the beginning for Bun.
We've added a ton of new features and APIs that make it easier than ever to build full-stack JavaScript and TypeScript applications.


### [Install Bun](#install-bun)


To get started, run any of the following commands in your terminal.

curl

```
curl -fsSL https://bun.sh/install | bash
```

powershell

```
powershell -c "irm bun.sh/install.ps1 | iex"
```

npm

```
npm install -g bun
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


### [Upgrade Bun](#upgrade-bun)


If you already installed Bun, you can upgrade with the following command.

```
bun upgrade
```


## [We're hiring](#we-re-hiring)


We're hiring engineers, designers, and contributors to JavaScript engines like V8, WebKit, Hermes, and SpiderMonkey to join our team in-person in San Francisco to build the future of JavaScript.
You can check out our [careers](https://bun.com/careers) page or send us an [email](https://bun.com/cdn-cgi/l/email-protection#fb91949988bb998e95d58893).


## [Thank you!](#thank-you)


Bun is free, open source, and MIT-licensed.
We receive a lot of open source contributions from the community. So, we'd like to thank everyone who has fixed a bug or contributed a feature. We appreciate your help!

-   [@nektro](https://github.com/nektro)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@pfgithub](https://github.com/pfgithub)
-   [@heimskr](https://github.com/heimskr)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@Devanand-Sharma](https://github.com/Devanand-Sharma)
-   [@lgarron](https://github.com/lgarron)
-   [@zackradisic](https://github.com/zackradisic)
-   [@DonIsaac](https://github.com/DonIsaac)
-   [@RiskyMH](https://github.com/RiskyMH)
-   [@paperclover](https://github.com/paperclover)
-   [@rgarcia](https://github.com/rgarcia)
-   [@fel1x-developer](https://github.com/fel1x-developer)
-   [@190n](https://github.com/190n)
-   [@lcrespom](https://github.com/lcrespom)
-   [@versecafe](https://github.com/versecafe)
-   [@dtinth](https://github.com/dtinth)
-   [@yooneskh](https://github.com/yooneskh)
-   [@sroussey](https://github.com/sroussey)
-   [@ArnaudBarre](https://github.com/ArnaudBarre)
-   [@kjjd84](https://github.com/kjjd84)
-   [@cainba](https://github.com/cainba)
-   [@robertshuford](https://github.com/robertshuford)
-   [@Gobd](https://github.com/Gobd)
-   [@citkane](https://github.com/citkane)
-   [@marcosrjjunior](https://github.com/marcosrjjunior)
-   [@thecrypticace](https://github.com/thecrypticace)
-   [@metonym](https://github.com/metonym)
-   [@ianzone](https://github.com/ianzone)
-   [@chawyehsu](https://github.com/chawyehsu)
-   [@komiya-atsushi](https://github.com/komiya-atsushi)
-   [@jbergstroem](https://github.com/jbergstroem)
-   [@sirmews](https://github.com/sirmews)
-   [@laesse](https://github.com/laesse)
-   [@WingLim](https://github.com/WingLim)
-   [@martinamps](https://github.com/martinamps)
-   [@brainkim](https://github.com/brainkim)
-   [@Electroid](https://github.com/Electroid)
-   [@01101sam](https://github.com/01101sam)
-   [@eventualbuddha](https://github.com/eventualbuddha)
-   [@snoglobe](https://github.com/snoglobe)
-   [@nattui](https://github.com/nattui)
-   [@swen128](https://github.com/swen128)
-   [@hex2f](https://github.com/hex2f)
-   [@imide](https://github.com/imide)
-   [@cdfzo](https://github.com/cdfzo)
-   [@alii](https://github.com/alii)
-   [@Kapsonfire-DE](https://github.com/Kapsonfire-DE)
-   [@NReilingh](https://github.com/NReilingh)
-   [@SunsetTechuila](https://github.com/SunsetTechuila)
-   [@luavixen](https://github.com/luavixen)
-   [@rtzll](https://github.com/rtzll)
-   [@advaith1](https://github.com/advaith1)
-   [@gvilums](https://github.com/gvilums)
-   [@Nanome203](https://github.com/Nanome203)
-   [@ippsav](https://github.com/ippsav)
-   [@guest271314](https://github.com/guest271314)
-   [@yamalight](https://github.com/yamalight)
-   [@ceymard](https://github.com/ceymard)
-   [@adhamu](https://github.com/adhamu)
-   [@gjungb](https://github.com/gjungb)
-   [@kaioduarte](https://github.com/kaioduarte)
-   [@BjornTheProgrammer](https://github.com/BjornTheProgrammer)
-   [@arthurvanl](https://github.com/arthurvanl)
-   [@lirantal](https://github.com/lirantal)
-   [@Eckhardt-D](https://github.com/Eckhardt-D)
-   [@CanadaHonk](https://github.com/CanadaHonk)
-   [@sourcegr](https://github.com/sourcegr)
-   [@alexlamsl](https://github.com/alexlamsl)
-   [@refi64](https://github.com/refi64)
-   [@huseeiin](https://github.com/huseeiin)
-   [@FaSe22](https://github.com/FaSe22)
-   [@deiga](https://github.com/deiga)
-   [@Skywalker13](https://github.com/Skywalker13)
-   [@KiwiZ0](https://github.com/KiwiZ0)
-   [@lewismiddleton](https://github.com/lewismiddleton)
-   [@matubu](https://github.com/matubu)
-   [@mjomble](https://github.com/mjomble)
-   [@wpaulino](https://github.com/wpaulino)
-   [@Xmarmalade](https://github.com/Xmarmalade)
-   [@bakkot](https://github.com/bakkot)
-   [@stilt0n](https://github.com/stilt0n)
-   [@levabala](https://github.com/levabala)
-   [@DannyJJK](https://github.com/DannyJJK)
-   [@Marukome0743](https://github.com/Marukome0743)
-   [@sacsbrainz](https://github.com/sacsbrainz)
-   [@mohit-s96](https://github.com/mohit-s96)
-   [@fmorency](https://github.com/fmorency)
-   [@jakeboone02](https://github.com/jakeboone02)
-   [@17hz](https://github.com/17hz)
-   [@jakebailey](https://github.com/jakebailey)
-   [@oddyamill](https://github.com/oddyamill)
-   [@MARCROCK22](https://github.com/MARCROCK22)
-   [@vktrl](https://github.com/vktrl)
-   [@mroyme](https://github.com/mroyme)
-   [@inad9300](https://github.com/inad9300)
-   [@billywhizz](https://github.com/billywhizz)
-   [@pythonmcpi](https://github.com/pythonmcpi)
-   [@m1212e](https://github.com/m1212e)
-   [@dariushalipour](https://github.com/dariushalipour)
-   [@eval](https://github.com/eval)
-   [@davidstevens37](https://github.com/davidstevens37)
-   [@zpix1](https://github.com/zpix1)
-   [@HibanaSama](https://github.com/HibanaSama)
-   [@mangs](https://github.com/mangs)
-   [@victor-homyakov](https://github.com/victor-homyakov)
-   [@silverwind](https://github.com/silverwind)
-   [@ghoshArnab](https://github.com/ghoshArnab)
-   [@Ptitet](https://github.com/Ptitet)
-   [@ThatOneBro](https://github.com/ThatOneBro)
-   [@Imgodmaoyouknow](https://github.com/Imgodmaoyouknow)
-   [@lmmfranco](https://github.com/lmmfranco)
-   [@farcaller](https://github.com/farcaller)
-   [@ryuujo1573](https://github.com/ryuujo1573)
-   [@otecd](https://github.com/otecd)
-   [@bjon](https://github.com/bjon)
-   [@rista404](https://github.com/rista404)
-   [@trcio](https://github.com/trcio)
-   [@kdrag0n](https://github.com/kdrag0n)
-   [@speelbarrow](https://github.com/speelbarrow)
-   [@0livare](https://github.com/0livare)
-   [@exoego](https://github.com/exoego)
-   [@vadzim](https://github.com/vadzim)
-   [@umarfchy](https://github.com/umarfchy)
-   [@jmho](https://github.com/jmho)
-   [@panva](https://github.com/panva)
-   [@vitch](https://github.com/vitch)
-   [@perkrlsn](https://github.com/perkrlsn)
-   [@ibanks42](https://github.com/ibanks42)
-   [@erik-dunteman](https://github.com/erik-dunteman)
-   [@nmarks413](https://github.com/nmarks413)
-   [@forcefieldsovereign](https://github.com/forcefieldsovereign)
-   [@bomberstudios](https://github.com/bomberstudios)
-   [@mohiwalla](https://github.com/mohiwalla)
-   [@surprisedpika](https://github.com/surprisedpika)
-   [@ShrootBuck](https://github.com/ShrootBuck)
-   [@oscarfsbs](https://github.com/oscarfsbs)
-   [@diogomdp](https://github.com/diogomdp)
-   [@LudvigHz](https://github.com/LudvigHz)
-   [@nacmartin](https://github.com/nacmartin)
-   [@nithinkjoy-tech](https://github.com/nithinkjoy-tech)
-   [@Sushants-Git](https://github.com/Sushants-Git)
-   [@tobycm](https://github.com/tobycm)
-   [@creator318](https://github.com/creator318)
-   [@janos-r](https://github.com/janos-r)
-   [@AbhiPrasad](https://github.com/AbhiPrasad)
-   [@JonnyBurger](https://github.com/JonnyBurger)
-   [@HUMORCE](https://github.com/HUMORCE)
-   [@zawodskoj](https://github.com/zawodskoj)
-   [@eigilsagafos](https://github.com/eigilsagafos)
-   [@jess-render](https://github.com/jess-render)
-   [@gaurishhs](https://github.com/gaurishhs)
-   [@ridiculousfish](https://github.com/ridiculousfish)
-   [@jakeg](https://github.com/jakeg)
-   [@ananis25](https://github.com/ananis25)
-   [@DaleSeo](https://github.com/DaleSeo)
-   [@ahaoboy](https://github.com/ahaoboy)
-   [@lafkpages](https://github.com/lafkpages)
-   [@henrikstorck](https://github.com/henrikstorck)
-   [@rcaselles](https://github.com/rcaselles)
-   [@yhdgms1](https://github.com/yhdgms1)
-   [@e3dio](https://github.com/e3dio)
-   [@jrmccannon](https://github.com/jrmccannon)
-   [@anchan828](https://github.com/anchan828)
-   [@ghost](https://github.com/ghost)
-   [@fzn0x](https://github.com/fzn0x)
-   [@windwiny](https://github.com/windwiny)
-   [@RanolP](https://github.com/RanolP)
-   [@dsernst](https://github.com/dsernst)
-   [@yus-ham](https://github.com/yus-ham)
-   [@jlucaso1](https://github.com/jlucaso1)
-   [@KilianB](https://github.com/KilianB)
-   [@josephjclark](https://github.com/josephjclark)
-   [@Uziniii](https://github.com/Uziniii)
-   [@erikbrinkman](https://github.com/erikbrinkman)
-   [@boyer-victor](https://github.com/boyer-victor)
-   [@welfuture](https://github.com/welfuture)
-   [@jwigert](https://github.com/jwigert)
-   [@Deckluhm](https://github.com/Deckluhm)
-   [@liudonghua123](https://github.com/liudonghua123)
-   [@tuttarealstep](https://github.com/tuttarealstep)
-   [@LukasKastern](https://github.com/LukasKastern)
-   [@jdfwarrior](https://github.com/jdfwarrior)
-   [@evanshortiss](https://github.com/evanshortiss)
-   [@jdalton](https://github.com/jdalton)
-   [@jprinaldi](https://github.com/jprinaldi)
-   [@yoavbls](https://github.com/yoavbls)
-   [@tomerh2001](https://github.com/tomerh2001)
-   [@Bellisario](https://github.com/Bellisario)
-   [@sitiom](https://github.com/sitiom)