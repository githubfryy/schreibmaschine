# Elysia.js 1.0-1.3 Complete Developer Feature Reference

Building on Elysia's journey from the initial stable release to the current "magic" refinement, here's a comprehensive guide covering all practical developer features, APIs, and capabilities available in Elysia releases 1.0 through 1.3.19.

## **Major Performance & Architecture Improvements**

### **Exact Mirror - Revolutionary Validation Performance** (1.3+)
Drop-in replacement for TypeBox's Value.Clean with massive performance gains:

```typescript
import { Elysia, t } from 'elysia';

// Up to 500x faster validation for small objects
// Up to 30x faster for large objects
new Elysia()
  .post('/user', ({ body }) => body, {
    body: t.Object({
      name: t.String(),
      age: t.Number()
    }),
    // Normalization now has  `User ${params.id}`)
  .get('/static', () => 'Hello'); // Uses Bun router when available
```

### **Sucrose Static Analysis** (1.0+)
Hybrid AST-based pattern matching replacing RegEx:

- Up to 37% faster inference time
- Significantly reduced memory usage
- JIT compilation instead of AOT
- 6.5-14x faster startup time

## **Core API Features**

### **Standalone Validator** (1.3+)
Merge schemas instead of overriding them:

```typescript
import { Elysia, t } from 'elysia';

new Elysia()
  .guard({
    schema: 'standalone', 
    response: t.Object({
      title: t.String()
    })
  })
  .get('/post', ({ body }) => ({ title: 'Hello', content: 'World' }), {
    // This response schema merges with guard schema
    response: t.Object({
      content: t.String()
    })
  });
```

### **Enhanced Validation Features**

#### **Encode Schema & Transform**
```typescript
new Elysia()
  .get('/transform', () => ({ value: "hi" }), {
    response: t.Object({
      value: t.Transform(t.String())
        .Decode(value => value.toUpperCase()) // "hi" -> "HI"
        .Encode(value => value.toLowerCase()) // "HI" -> "hi"
    })
  });
```

#### **Sanitize for Security**
```typescript
import { Elysia } from 'elysia';

new Elysia({
  sanitize: [
    (value) => Bun.escapeHTML(value), // XSS protection
    (value) => value.replace(/dorothy/g, 'doro') // Custom sanitization
  ]
})
  .post('/comment', ({ body }) => body, {
    body: t.Object({
      text: t.String() // Automatically sanitized
    })
  });
```

#### **Form Validation with t.Form**
```typescript
new Elysia()
  .post('/upload', ({ body }) => body, {
    body: t.Form({
      name: t.String(),
      file: t.File({
        type: ['image/jpeg', 'image/png'], // File type validation
        maxSize: '5m'
      })
    })
  });
```

#### **Advanced Validation Options**
```typescript
// Skip validation but keep types
body: t.NoValidate(t.Object({
  data: t.Any() // No runtime validation, keeps TypeScript types
}))

// Reference models with auto-completion
new Elysia()
  .model({
    User: t.Object({
      name: t.String()
    })
  })
  .post('/user', ({ body }) => body, {
    body: Elysia.Ref('User') // Auto-completion for model names
  });
```

### **Normalization & Data Coercion** (1.1+)
Automatic data normalization and type coercion:

```typescript
new Elysia()
  .get('/search', ({ query }) => query, {
    query: t.Object({
      page: t.Number(), // Automatically coerces string to number
      active: t.Boolean(), // "true"/"false" -> boolean
      tags: t.Array(t.String()) // Handles array parameters
    })
  })
  .post('/user', ({ body }) => body, {
    body: t.Object({
      name: t.String(),
      age: t.Number()
      // Additional fields automatically removed
    }),
    response: t.Object({
      name: t.String()
      // 'age' removed from response automatically
    })
  });
```

## **HTTP Server & Routing**

### **Hook System with Scoping** (1.0+ Breaking Change)
Precise control over hook inheritance:

```typescript
const plugin = new Elysia()
  .onBeforeHandle({ as: 'global' }, () => console.log('Global'))
  .onBeforeHandle({ as: 'scoped' }, () => console.log('Scoped'))
  .onBeforeHandle(() => console.log('Local')) // Default
  .get('/test', () => 'test');

const app = new Elysia()
  .use(plugin)
  .get('/main', () => 'main'); // Only global hooks apply here
```

### **Guard Enhancement**
Apply multiple hooks and schemas with scoping:

```typescript
const authPlugin = new Elysia()
  .guard({
    as: 'scoped', // Apply to parent instance too
    beforeHandle: ({ headers }) => {
      if (!headers.authorization) throw new Error('Unauthorized');
    },
    response: t.String()
  })
  .get('/profile', () => 'Profile data');
```

### **Bulk Scope Casting**
Lift hook scopes efficiently:

```typescript
const plugin = new Elysia()
  .guard({
    response: t.String()
  })
  .onBeforeHandle(() => console.log('called'))
  .get('/ok', () => 'ok')
  .as('plugin'); // Casts all hooks to 'scoped'

// Or cast to global
.as('global'); // All hooks become global
```

### **Response Status Reconciliation** (1.1+)
Merge response schemas from different scopes by status code:

```typescript
const plugin = new Elysia()
  .guard({
    as: 'global',
    response: {
      200: t.Literal('ok'),
      418: t.Literal('Teapot')
    }
  });

const app = new Elysia()
  .use(plugin)
  .guard({
    response: {
      418: t.String() // Overrides global 418 response
    }
  })
  .get('/test', ({ error }) => error(418, 'Custom message'));
```

### **Inline Error Handling** (1.0+)
Type-safe error responses with status code narrowing:

```typescript
new Elysia()
  .get('/user/:id', ({ params, error }) => {
    const user = findUser(params.id);
    if (!user) return error(404, 'User not found');
    if (!user.active) return error(418, 'User inactive');
    return user;
  }, {
    response: {
      200: t.Object({ name: t.String() }),
      404: t.Literal('User not found'),
      418: t.Literal('User inactive')
    }
  });
```

### **Optional Path Parameters** (1.1+)
```typescript
new Elysia()
  .get('/posts/:id?', ({ params }) => {
    // params.id can be undefined
    return params.id ? `Post ${params.id}` : 'All posts';
  })
  .get('/posts/:id?/:slug?', ({ params }) => {
    // Multiple optional parameters
    return { id: params.id, slug: params.slug };
  });

// With default values
.get('/posts/:id?', ({ params }) => params.id || 1, {
  params: t.Object({
    id: t.Number({ default: 1 })
  })
});
```

## **Streaming & Real-time**

### **Generator Response Streaming** (1.1+)
Built-in streaming with type inference:

```typescript
import { Elysia } from 'elysia';
import { treaty } from '@elysiajs/eden';

const app = new Elysia()
  .get('/stream', function* () {
    yield 'chunk 1';
    yield 'chunk 2';
    yield { data: 'json chunk' };
  })
  .get('/sse', function* () {
    for (let i = 0; i  setTimeout(resolve, 1000));
    }
  });

// Client-side with Eden Treaty
const api = treaty(app);
const stream = await api.stream.get();

for await (const chunk of stream.data) {
  console.log(chunk); // Type-safe streaming
}
```

### **Server-Sent Events Helper** (1.3.4+)
```typescript
import { sse } from 'elysia/sse';

new Elysia()
  .get('/events', function* () {
    yield sse({ data: 'Connected' });
    
    for (let i = 0; i  setTimeout(r, 1000));
    }
  });
```

### **Enhanced WebSocket** (1.2+)
Rewritten for performance and Bun API compatibility:

```typescript
new Elysia()
  .ws('/chat', {
    // New ping/pong handlers
    ping: (ws, message) => {
      console.log('Ping received:', message);
      return message; // Echo back
    },
    pong: (ws, message) => {
      console.log('Pong received:', message);
    },
    
    message: (ws, message) => {
      ws.send(`Echo: ${message}`);
      // No more method chaining - matches Bun API
      ws.publish('chat', message);
    },
    
    // Lifecycle events
    open: (ws) => {
      ws.subscribe('chat');
    },
    
    close: (ws) => {
      console.log('Connection closed');
    }
  });
```

## **Adapters & Runtime Support** (1.2+)

### **Universal Runtime Support**
Run Elysia on multiple runtimes with consistent APIs:

```typescript
import { Elysia, file, form } from 'elysia';
import { node } from '@elysiajs/node';

// Node.js adapter
new Elysia({ adapter: node() })
  .get('/', () => 'Hello Node')
  .get('/file', () => file('./public/index.html')) // Works on all runtimes
  .post('/upload', ({ body }) => form({ received: body }))
  .listen(3000);

// Bun (default)
new Elysia()
  .get('/', () => 'Hello Bun')
  .listen(3000);
```

### **Universal API Functions**
Runtime-agnostic utilities:

```typescript
import { file, form, server } from 'elysia';

// File responses work everywhere
.get('/download', () => file('./document.pdf'))

// Form responses
.post('/form', ({ body }) => form({
  message: 'Received',
  data: body
}))

// Server type compatibility
const app: server = new Elysia().listen(3000);
```

## **Enhanced Developer Experience**

### **Named Parsers** (1.2+)
Custom parsers with explicit selection:

```typescript
new Elysia()
  .parser('custom', ({ contentType }) => {
    if (contentType === "application/kivotos") {
      return 'nagisa';
    }
  })
  .post('/custom', ({ body }) => body, {
    parse: ['custom', 'json'] // Try custom first, then json
  })
  .post('/json-only', ({ body }) => body, {
    parse: 'json' // Only use JSON parser
  });
```

### **Macro with Resolve** (1.2+)
Simplified macro syntax with resolve support:

```typescript
new Elysia()
  .macro({
    user: (enabled: boolean) => ({
      resolve: ({ cookie: { session } }) => ({
        user: session.value || null
      })
    }),
    
    auth: (role: 'admin' | 'user') => ({
      beforeHandle: ({ user }) => {
        if (!user) throw new Error('Unauthorized');
        if (role === 'admin' && !user.isAdmin) {
          throw new Error('Admin required');
        }
      }
    })
  })
  .get('/profile', ({ user }) => user, {
    user: true
  })
  .get('/admin', ({ user }) => 'Admin panel', {
    auth: 'admin',
    user: true
  });
```

### **Improved TypeScript Performance**
- Removed ~40 routes/instance limitation
- Up to 3.8x faster type inference
- Up to 82% performance improvement in most cases
- 13x faster Eden Treaty type inference
- Reduced type instantiation by half (1.3+)

## **Testing & Observability**

### **OpenTelemetry Integration** (1.1+)
First-party observability support:

```typescript
import { Elysia } from 'elysia';
import { opentelemetry, record } from '@elysiajs/opentelemetry';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

const app = new Elysia()
  .use(opentelemetry({
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: 'https://api.axiom.co/v1/traces',
          headers: {
            Authorization: `Bearer ${process.env.AXIOM_TOKEN}`,
            'X-Axiom-Dataset': process.env.AXIOM_DATASET
          }
        })
      )
    ]
  }))
  .get('/users', async () => {
    return record('database.query', async () => {
      return await db.query('SELECT * FROM users');
    });
  });

// Name your functions for better traces
.derive(async function getProfile({ cookie: { session } }) {
  return { user: await getProfile(session) };
});
```

### **Trace v2** (1.1+ Breaking Change)
Synchronous, microsecond-accurate tracing:

```typescript
new Elysia()
  .trace(({ onBeforeHandle, set }) => {
    onBeforeHandle(({ onEvent }) => {
      onEvent(({ onStop, name }) => {
        onStop(({ elapsed }) => {
          console.log(`${name} took ${elapsed}ms`);
          set.headers['x-trace-time'] = elapsed.toString();
        });
      });
    });
  })
  .get('/traced', () => 'Hello');
```

## **Eden Treaty 2** (1.0+)

### **Improved Client API**
More ergonomic syntax with end-to-end type safety:

```typescript
import { Elysia } from 'elysia';
import { treaty } from '@elysiajs/eden';

const app = new Elysia()
  .post('/users', ({ body }) => ({ id: 1, ...body }), {
    body: t.Object({
      name: t.String(),
      email: t.String()
    }),
    response: {
      200: t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String()
      }),
      422: t.Object({
        message: t.String(),
        errors: t.Array(t.String())
      })
    }
  });

const api = treaty(app);

// Type-safe client calls
const { data, error } = await api.users.post({
  name: 'Alice',
  email: 'alice@example.com'
});

if (error) {
  switch (error.status) {
    case 422:
      console.log('Validation errors:', error.value.errors);
      break;
    default:
      console.error('Unexpected error:', error);
  }
} else {
  console.log('Created user:', data.id, data.name);
}
```

### **Unit Testing Integration**
End-to-end type safety for tests:

```typescript
import { describe, expect, it } from 'bun:test';
import { treaty } from '@elysiajs/eden';

const app = new Elysia()
  .get('/hello', () => 'hi')
  .post('/echo', ({ body }) => body);

const api = treaty(app);

describe('API Tests', () => {
  it('should return greeting', async () => {
    const { data } = await api.hello.get();
    expect(data).toBe('hi');
  });

  it('should echo body', async () => {
    const { data } = await api.echo.post({ message: 'test' });
    expect(data).toEqual({ message: 'test' });
  });
});
```

### **Interceptors**
Middleware for client requests:

```typescript
const api = treaty(app, {
  onRequest: (request) => {
    request.headers.set('Authorization', `Bearer ${token}`);
  },
  onResponse: (response) => {
    if (response.status === 401) {
      // Handle unauthorized
      redirectToLogin();
    }
  }
});
```

## **Status Error Handling** (1.3+)

### **Renamed from `error` to `status`**
```typescript
// Deprecated (still works)
import { error } from 'elysia';
return error(418, 'Teapot');

// Recommended new syntax
new Elysia()
  .get('/user/:id', ({ params, status }) => {
    const user = findUser(params.id);
    if (!user) return status(404, 'User not found');
    return user;
  });
```

## **Memory & Performance Optimizations**

### **Reduced Memory Usage** (1.2+)
Significant memory improvements through refactoring:
- Up to 2x memory reduction in large applications
- ~36% reduced memory usage during route registration
- Optimized object reuse instead of cloning
- Sucrose compilation caching

### **Route Registration Improvements** (1.3+)
- Up to 5.6x reduced memory usage
- Up to 2.7x faster route registration
- Reused object references instead of cloning

### **Instance Optimization** (1.3+)
- Up to 10x reduced memory usage for multiple instances
- Up to 3x faster plugin creation

## **TypeBox 0.34 Support** (1.2+)

### **Circular Reference Support**
```typescript
new Elysia()
  .model({
    Node: t.Object({
      value: t.String(),
      children: t.Optional(t.Array(t.Ref('Node'))) // Circular reference
    })
  })
  .post('/tree', ({ body }) => body, {
    body: 'Node'
  });
```

## **Breaking Changes Summary**

### **1.0 Breaking Changes:**
- Hook inheritance changed from global-first to local-first
- Must specify `{ as: 'global' }` for global hooks

### **1.2 Breaking Changes:**
- `type` property merged with `parse`
- FormData responses require explicit `form()` wrapper
- WebSocket methods no longer chainable
- Removed `scoped` constructor option

### **1.3 Breaking Changes:**
- Removed `.index` from Eden Treaty
- `error` deprecated in favor of `status` (maintains compatibility)

## **Migration Examples**

### **From 1.0 to 1.3**
```typescript
// Before (1.0)
import { error } from 'elysia';

new Elysia()
  .onBeforeHandle(() => console.log('global'))
  .get('/test', ({ params }) => {
    if (!params.id) return error(400, 'Missing ID');
    return 'ok';
  });

// After (1.3)
new Elysia()
  .onBeforeHandle({ as: 'global' }, () => console.log('global'))
  .get('/test', ({ params, status }) => {
    if (!params.id) return status(400, 'Missing ID');
    return 'ok';
  });
```

### **Eden Treaty Migration**
```typescript
// Before
const result = await api.posts.index.get();

// After  
const result = await api.posts.get();
```

This comprehensive guide covers the evolution of Elysia from its stable 1.0 release through the current 1.3.19, showcasing how it has refined into a mature, high-performance web framework with excellent developer experience, type safety, and runtime flexibility.

[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/da6dc8be-cf23-4cbb-b5d1-099d9376009d/elysia-1.3.md
[2] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/92f1320f-66d7-4298-bb3f-f9d9170b1b69/elysia-1.2.md
[3] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/e8c10ef4-66cd-4c55-8a46-bb178151cdae/elysia-1.1.md
[4] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/58f9fc61-bc0f-43f6-bd35-56fafdfbb338/elysia-1.0.md