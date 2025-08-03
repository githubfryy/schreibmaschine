This release fixes 35 bugs (addressing 219 👍). Bun.CookieMap is a Map-like API for getting & setting cookies. Bun's TypeScript type declarations have been rewritten to eliminate conflicts with Node.js and DOM type definitions. Several bugfixes for node:http, node:crypto, and node:vm.


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


## [Bun.Cookie & Bun.CookieMap](#bun-cookie-bun-cookiemap)


Most production web applications read and write cookies. Today in server-side JavaScript, you must choose either a single-purpose cookie parsing library like `tough-cookie`, or adopting a web framework like Express or Elysia. Cookie parsing & serialization is a well-understood problem. We can simplify this by moving it up the stack from the framework or library to the web server in Bun.
Bun's HTTP server now has built-in support for reading and writing cookies using a Map-like API. `request.cookies` detects changes and automatically adds the `Set-Cookie` header to the `Response` when needed. This is one less library to shop for when building web applications with Bun.

```
import { randomUUIDv7, serve, CookieMap } from "bun";
const server = Bun.serve({
  routes: {
    "/api/users/sign-in": (request) => {
      const cookies: CookieMap = request.cookies;
      const sessionId = randomUUIDv7();
      cookies.set("sessionId", sessionId, {
        httpOnly: true,
        sameSite: "strict",
      });
      // Modifying cookies tells Bun.serve() to automatically
      // add the Set-Cookie header to the response
      return new Response("Signed in");
    },
    "/api/users/sign-out": (request) => {
      // .delete makes the Set-Cookie header expire & set the cookie to an empty value
      request.cookies.delete("sessionId");
      return new Response("Signed out");
    },
  },
});
```

For performance reasons, the `Cookie` header is not parsed until you access the `request.cookies` property. So you don't pay the cost of this feature unless you need it.
When you modify a cookie, Bun.serve() automatically adds the `Set-Cookie` header to the Response, so that you don't have to worry about conditionally remembering to add the exact number of `Set-Cookie` headers necessary to correctly decide & modify which cookies to send to the client.


### [Cookies outside of Bun.serve()](#cookies-outside-of-bun-serve)


You can also read and write cookies outside of Bun.serve() using the `Bun.Cookie` and `Bun.CookieMap` classes.

```
const cookie = new Bun.Cookie("sessionId", "123");
cookie.value = "456";
console.log(cookie.value); // "456"
console.log(cookie.serialize()); // "sessionId=456; Path=/; SameSite=lax"
const cookieMap = new Bun.CookieMap();
cookieMap.set("user1", "hello");
console.log(cookieMap.get("user1")); // "hello"
cookieMap.set("user2", "world");
console.log(cookieMap.toSetCookieHeaders());
// => [ "user1=hello; Path=/; SameSite=Lax", "user2=world; Path=/; SameSite=Lax" ]
```

Thanks to [@pfgithub](https://github.com/pfgithub)!


## [TypeScript type improvements](#typescript-type-improvements)


Bun's TypeScript declarations have been completely rewritten to eliminate conflicts with Node.js and DOM type definitions, providing a better developer experience with fewer type errors.

index.ts

```
Buffer.from("foo").equals(Buffer.from("bar"))
```

Previously, in certain setups this could fail to type check with:

```
Argument of type 'Buffer' is not assignable to parameter of type 'Uint8Array'.
  The types returned by 'entries()' are incompatible between these types.
    Type 'IterableIterator<[number, number]>' is missing the following properties from type 'ArrayIterator<[number, number]>': map, filter, take, drop, and 9 more.ts(2345)
```

This update fixes numerous type-related issues, improves documentation generation, and refines the overall TypeScript experience in Bun.
Thanks to [@alii](https://github.com/alii) for the contribution!


## [Fixed: `node:http` regression from v1.2.6](#fixed-node-http-regression-from-v1-2-6)


Fixed a regression from v1.2.6 where `node:http` could crash in certain cases.
Fixed thanks to [@heimskr](https://github.com/heimskr)!


## [Fixed: `node:crypto` Hash Name Regression](#fixed-node-crypto-hash-name-regression)


Fixed a regression in `node:crypto` module where hash names in `crypto.getHashes()` and `crypto.getCiphers()` were incorrectly returned in uppercase instead of the expected lowercase format. This ensures compatibility with Node.js behavior and proper hash name detection.

```
// Before (incorrect)
crypto.getHashes(); // Returns ["MD5", "SHA1", "SHA256", ...]
// After (fixed)
crypto.getHashes(); // Returns ["md5", "sha1", "sha256", ...]
```

Thanks to [@dylan-conway](https://github.com/dylan-conway) for the contribution!


## [Fixed: `node:http` set-cookie handling](#fixed-node-http-set-cookie-handling)


Bun v1.2.7 enhances Node.js compatibility in the HTTP module with better cookie handling. The update improves how Set-Cookie headers are processed and adds validation for HTTP options.

```
// Set multiple cookies using array format
const server = http.createServer((req, res) => {
  res.writeHead(200, [
    ["set-cookie", "SessionID=123"],
    ["set-cookie", "Preferences=dark-mode"],
    ["content-type", "application/json"],
  ]);
  res.end(JSON.stringify({ success: true }));
```

Thanks to [@cirospaciari](https://github.com/cirospaciari) for the contribution!


## [Fixed: `node:vm` options object bug](#fixed-node-vm-options-object-bug)


A bug in `node:vm` where `undefined` in options could cause it to throw an error instead of treating as a default value has been fixed.

```
// This now works correctly
const vm = require("node:vm");
vm.runInNewContext(
  "console.log('hello')",
  {},
  {
    timeout: undefined,
    cachedData: undefined,
    produceCachedData: undefined,
  },
);
```

Thanks to [@SunsetTechuila](https://github.com/SunsetTechuila) for the contribution!


## [Improved: error message when using libuv functions on unsupported platforms](#improved-error-message-when-using-libuv-functions-on-unsupported-platforms)


Bun now provides better error messages when a NAPI module attempts to access libuv functions that aren't supported. Previously, these attempts would result in cryptic crash messages like `dyld[1795]: missing symbol called`. Now, Bun provides clear, descriptive error messages that help identify the unsupported libuv function.

```
- dyld[1795]: missing symbol called
- zsh: abort      bun index.js
+ Bun encounter a crash when running a NAPI module that tried to call
+ the uv_hrtime libuv function.
```

Thanks to [@zackradisic](https://github.com/zackradisic) for the contribution!


### [Thanks to 13 contributors!](#thanks-to-13-contributors)


-   [@190n](https://github.com/190n)
-   [@alii](https://github.com/alii)
-   [@cirospaciari](https://github.com/cirospaciari)
-   [@donisaac](https://github.com/donisaac)
-   [@dylan-conway](https://github.com/dylan-conway)
-   [@gwer](https://github.com/gwer)
-   [@heimskr](https://github.com/heimskr)
-   [@jarred-sumner](https://github.com/jarred-sumner)
-   [@nanome203](https://github.com/nanome203)
-   [@pfgithub](https://github.com/pfgithub)
-   [@sunsettechuila](https://github.com/sunsettechuila)
-   [@twlite](https://github.com/twlite)
-   [@zackradisic](https://github.com/zackradisic)