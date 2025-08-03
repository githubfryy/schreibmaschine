This plugin adds support for using [tRPC](https://trpc.io/)
Install with:

bash
```
bun add @elysiajs/trpc @trpc/server @elysiajs/websocket
```

Then use it:

typescript
```
import { Elysia, t as T } from 'elysia'
import { initTRPC } from '@trpc/server'
import { compile as c, trpc } from '@elysiajs/trpc'
const t = initTRPC.create()
const p = t.procedure
const router = t.router({
	greet: p
		// 💡 Using Zod
		//.input(z.string())
		// 💡 Using Elysia's T
		.input(c(T.String()))
		.query(({ input }) => input)
})
export type Router = typeof router
const app = new Elysia().use(trpc(router)).listen(3000)
```


## trpc [​](#trpc)


Accept the tRPC router and register to Elysia's handler.

typescript
```
trpc(
	router: Router,
	option?: {
	    endpoint?: string
	}
): this
```

`Router` is the TRPC Router instance.


### endpoint [​](#endpoint)


The path to the exposed TRPC endpoint.