To use Cookie, you can extract the cookie property and access its name and value directly.

There's no get/set, you can extract the cookie name and retrieve or update its value directly.

ts

```
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        // Get
        name.value

        // Set
        name.value = "New Value"
    })
```

By default, Reactive Cookie can encode/decode type of object automatically allowing us to treat cookie as an object without worrying about the encoding/decoding. **It just works**.

## Reactivity [](https://elysiajs.com/patterns/cookie.html#reactivity)

The Elysia cookie is reactive. This means that when you change the cookie value, the cookie will be updated automatically based on approach like signal.

A single source of truth for handling cookies is provided by Elysia cookies, which have the ability to automatically set headers and sync cookie values.

Since cookies are Proxy-dependent objects by default, the extract value can never be **undefined**; instead, it will always be a value of `Cookie<unknown>`, which can be obtained by invoking the **.value** property.

We can treat the cookie jar as a regular object, iteration over it will only iterate over an already-existing cookie value.

## Cookie Attribute [](https://elysiajs.com/patterns/cookie.html#cookie-attribute)

To use Cookie attribute, you can either use one of the following:

1.  Setting the property directly
2.  Using `set` or `add` to update cookie property.

See [cookie attribute config](https://elysiajs.com/patterns/cookie.html#config) for more information.

### Assign Property [](https://elysiajs.com/patterns/cookie.html#assign-property)

You can get/set the property of a cookie like any normal object, the reactivity model synchronizes the cookie value automatically.

ts

```
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        // get
        name.domain

        // set
        name.domain = 'millennium.sh'
        name.httpOnly = true
    })
```

## set [](https://elysiajs.com/patterns/cookie.html#set)

**set** permits updating multiple cookie properties all at once through **reset all property** and overwrite the property with a new value.

ts

```
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        name.set({
            domain: 'millennium.sh',
            httpOnly: true
        })
    })
```

## add [](https://elysiajs.com/patterns/cookie.html#add)

Like **set**, **add** allow us to update multiple cookie properties at once, but instead, will only overwrite the property defined instead of resetting.

## remove [](https://elysiajs.com/patterns/cookie.html#remove)

To remove a cookie, you can use either:

1.  name.remove
2.  delete cookie.name

ts

```
import { Elysia } from 'elysia'

new Elysia()
    .get('/', ({ cookie, cookie: { name } }) => {
        name.remove()

        delete cookie.name
    })
```

## Cookie Schema [](https://elysiajs.com/patterns/cookie.html#cookie-schema)

You can strictly validate cookie type and providing type inference for cookie by using cookie schema with `t.Cookie`.

ts

```
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        // Set
        name.value = {
            id: 617,
            name: 'Summoning 101'
        }
    }, {
        cookie: t.Cookie({
            name: t.Object({
                id: t.Numeric(),
                name: t.String()
            })
        })
    })
```

## Nullable Cookie [](https://elysiajs.com/patterns/cookie.html#nullable-cookie)

To handle nullable cookie value, you can use `t.Optional` on the cookie name you want to be nullable.

ts

```
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { name } }) => {
        // Set
        name.value = {
            id: 617,
            name: 'Summoning 101'
        }
    }, {
        cookie: t.Cookie({
            name: t.Optional(
                t.Object({
                    id: t.Numeric(),
                    name: t.String()
                })
            )
        })
    })
```

## Cookie Signature [](https://elysiajs.com/patterns/cookie.html#cookie-signature)

With an introduction of Cookie Schema, and `t.Cookie` type, we can create a unified type for handling sign/verify cookie signature automatically.

Cookie signature is a cryptographic hash appended to a cookie's value, generated using a secret key and the content of the cookie to enhance security by adding a signature to the cookie.

This make sure that the cookie value is not modified by malicious actor, helps in verifying the authenticity and integrity of the cookie data.

## Using Cookie Signature [](https://elysiajs.com/patterns/cookie.html#using-cookie-signature)

By provide a cookie secret, and `sign` property to indicate which cookie should have a signature verification.

ts

```
import { Elysia, t } from 'elysia'

new Elysia()
    .get('/', ({ cookie: { profile } }) => {
        profile.value = {
            id: 617,
            name: 'Summoning 101'
        }
    }, {
        cookie: t.Cookie({
            profile: t.Object({
                id: t.Numeric(),
                name: t.String()
            })
        }, {
            secrets: 'Fischl von Luftschloss Narfidort',
            sign: ['profile']
        })
    })
```

Elysia then sign and unsign cookie value automatically.

## Constructor [](https://elysiajs.com/patterns/cookie.html#constructor)

You can use Elysia constructor to set global cookie `secret`, and `sign` value to apply to all route globally instead of inlining to every route you need.

ts

```
import { Elysia, t } from 'elysia'

new Elysia({
    cookie: {
        secrets: 'Fischl von Luftschloss Narfidort',
        sign: ['profile']
    }
})
    .get('/', ({ cookie: { profile } }) => {
        profile.value = {
            id: 617,
            name: 'Summoning 101'
        }
    }, {
        cookie: t.Cookie({
            profile: t.Object({
                id: t.Numeric(),
                name: t.String()
            })
        })
    })
```

## Cookie Rotation [](https://elysiajs.com/patterns/cookie.html#cookie-rotation)

Elysia handle Cookie's secret rotation automatically.

Cookie Rotation is a migration technique to sign a cookie with a newer secret, while also be able to verify the old signature of the cookie.

ts

```
import { Elysia } from 'elysia'

new Elysia({
    cookie: {
        secrets: ['Vengeance will be mine', 'Fischl von Luftschloss Narfidort']
    }
})
```

## Config [](https://elysiajs.com/patterns/cookie.html#config)

Below is a cookie config accepted by Elysia.

### secret [](https://elysiajs.com/patterns/cookie.html#secret)

The secret key for signing/un-signing cookies.

If an array is passed, will use Key Rotation.

Key rotation is when an encryption key is retired and replaced by generating a new cryptographic key.

___

Below is a config that extends from [cookie](https://npmjs.com/package/cookie)

### domain [](https://elysiajs.com/patterns/cookie.html#domain)

Specifies the value for the [Domain Set-Cookie attribute](https://tools.ietf.org/html/rfc6265#section-5.2.3).

By default, no domain is set, and most clients will consider the cookie to apply to only the current domain.

### encode [](https://elysiajs.com/patterns/cookie.html#encode)

@default `encodeURIComponent`

Specifies a function that will be used to encode a cookie's value.

Since the value of a cookie has a limited character set (and must be a simple string), this function can be used to encode a value into a string suited for a cookie's value.

The default function is the global `encodeURIComponent`, which will encode a JavaScript string into UTF-8 byte sequences and then URL-encode any that fall outside of the cookie range.

### expires [](https://elysiajs.com/patterns/cookie.html#expires)

Specifies the Date object to be the value for the [Expires Set-Cookie attribute](https://tools.ietf.org/html/rfc6265#section-5.2.1).

By default, no expiration is set, and most clients will consider this a "non-persistent cookie" and will delete it on a condition like exiting a web browser application.

TIP

The [cookie storage model specification](https://tools.ietf.org/html/rfc6265#section-5.3) states that if both `expires` and `maxAge` are set, then `maxAge` takes precedence, but not all clients may obey this, so if both are set, they should point to the same date and time.

### httpOnly [](https://elysiajs.com/patterns/cookie.html#httponly)

@default `false`

Specifies the boolean value for the [HttpOnly Set-Cookie attribute](https://tools.ietf.org/html/rfc6265#section-5.2.6).

When truthy, the HttpOnly attribute is set, otherwise, it is not.

By default, the HttpOnly attribute is not set.

TIP

be careful when setting this to true, as compliant clients will not allow client-side JavaScript to see the cookie in `document.cookie`.

### maxAge [](https://elysiajs.com/patterns/cookie.html#maxage)

@default `undefined`

Specifies the number (in seconds) to be the value for the [Max-Age Set-Cookie attribute](https://tools.ietf.org/html/rfc6265#section-5.2.2).

The given number will be converted to an integer by rounding down. By default, no maximum age is set.

TIP

The [cookie storage model specification](https://tools.ietf.org/html/rfc6265#section-5.3) states that if both `expires` and `maxAge` are set, then `maxAge` takes precedence, but not all clients may obey this, so if both are set, they should point to the same date and time.

### path [](https://elysiajs.com/patterns/cookie.html#path)

Specifies the value for the [Path Set-Cookie attribute](https://tools.ietf.org/html/rfc6265#section-5.2.4).

By default, the path handler is considered the default path.

### priority [](https://elysiajs.com/patterns/cookie.html#priority)

Specifies the string to be the value for the [Priority Set-Cookie attribute](https://tools.ietf.org/html/draft-west-cookie-priority-00#section-4.1). `low` will set the Priority attribute to Low. `medium` will set the Priority attribute to Medium, the default priority when not set. `high` will set the Priority attribute to High.

More information about the different priority levels can be found in [the specification](https://tools.ietf.org/html/draft-west-cookie-priority-00#section-4.1).

TIP

This is an attribute that has not yet been fully standardized and may change in the future. This also means many clients may ignore this attribute until they understand it.

### sameSite [](https://elysiajs.com/patterns/cookie.html#samesite)

Specifies the boolean or string to be the value for the [SameSite Set-Cookie attribute](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-09#section-5.4.7). `true` will set the SameSite attribute to Strict for strict same-site enforcement. `false` will not set the SameSite attribute. `'lax'` will set the SameSite attribute to Lax for lax same-site enforcement. `'none'` will set the SameSite attribute to None for an explicit cross-site cookie. `'strict'` will set the SameSite attribute to Strict for strict same-site enforcement. More information about the different enforcement levels can be found in [the specification](https://tools.ietf.org/html/draft-ietf-httpbis-rfc6265bis-09#section-5.4.7).

TIP

This is an attribute that has not yet been fully standardized and may change in the future. This also means many clients may ignore this attribute until they understand it.

### secure [](https://elysiajs.com/patterns/cookie.html#secure)

Specifies the boolean value for the [Secure Set-Cookie attribute](https://tools.ietf.org/html/rfc6265#section-5.2.5). When truthy, the Secure attribute is set, otherwise, it is not. By default, the Secure attribute is not set.

TIP

Be careful when setting this to true, as compliant clients will not send the cookie back to the server in the future if the browser does not have an HTTPS connection.