# Bun 1.2.18+ Documentation for Claude Code

## Overview
Bun is an all-in-one JavaScript runtime, bundler, test runner, and package manager built on Zig and JavaScriptCore. Version 1.2.18 brings significant performance improvements, built-in services, and enhanced Node.js compatibility.

## Key Features in v1.2.18+
- **Built-in PostgreSQL**: Native `Bun.sql()` client
- **Built-in S3**: Native `Bun.s3()` support
- **Express 3x Faster**: Performance improvements
- **TypeScript Stripping**: `--experimental-strip-types`
- **New Lockfile**: Text-based `bun.lock` format
- **Math.sumPrecise**: TC39 Stage 3 proposal
- **Node.js v24.3.0**: Updated compatibility target

## Installation

### Install Bun
```bash
# Install latest version
curl -fsSL https://bun.sh/install | bash

# Install specific version
curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.18"

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Upgrade existing installation
bun upgrade
```

### Verify Installation
```bash
bun --version  # Should show 1.2.18+
bun --revision # Shows exact commit
```

## Package Management

### Project Initialization
```bash
# Create new project
bun init

# Create with React template
bun init --react

# Create TypeScript project
bun init --typescript
```

### Installing Dependencies
```bash
# Install packages
bun add react react-dom
bun add -d typescript @types/react

# Install from specific source
bun add github:user/repo
bun add https://example.com/package.tgz

# Install exact version
bun add react@18.2.0

# Install globally
bun add -g create-react-app
```

### Dependency Management
```bash
# Update dependencies
bun update
bun update react
bun update --latest  # Updates to latest available

# Remove packages
bun remove react

# Install frozen lockfile
bun install --frozen-lockfile

# Check outdated packages
bun outdated

# Audit dependencies
bun audit
```

### Publishing
```bash
# Publish to npm
bun publish

# Publish with OTP
bun publish --otp 123456

# View package info
bun pm view package-name
```

## Runtime & Execution

### Running Files
```bash
# Run JavaScript/TypeScript
bun run index.js
bun run script.ts

# Run with TypeScript stripping (experimental)
bun --experimental-strip-types script.ts

# Run package.json scripts
bun run dev
bun run build
bun run test

# Run with environment variables
NODE_ENV=production bun run build
```

### File System & I/O
```javascript
// Reading files
const file = Bun.file("./package.json");
const text = await file.text();
const json = await file.json();
const buffer = await file.arrayBuffer();

// File stats
const stat = await file.stat();
console.log(stat.size);
console.log(stat.isFile());
console.log(stat.isDirectory());

// Writing files
await Bun.write("output.txt", "Hello, World!");
await Bun.write("data.json", { name: "Bun", version: "1.2.18" });

// Binary data
await Bun.write("image.png", new Uint8Array([...]));
```

### Environment & Process
```javascript
// Environment variables
console.log(Bun.env.NODE_ENV);

// Process information
console.log(process.cwd());
console.log(process.argv);

// Exit
process.exit(0);
```

## Built-in Services

### PostgreSQL Client
```javascript
import { sql } from "bun";

// Connect to database
const db = sql({
  host: "localhost",
  port: 5432,
  database: "mydb",
  username: "user",
  password: "password"
});

// Query data
const users = await db`
  SELECT * FROM users 
  WHERE active = ${true}
  ORDER BY created_at DESC
`;

// Insert data
await db`
  INSERT INTO posts (title, content, author_id)
  VALUES (${title}, ${content}, ${authorId})
`;

// Transactions
await db.transaction(async (tx) => {
  await tx`INSERT INTO users (name) VALUES (${name})`;
  await tx`INSERT INTO profiles (user_id) VALUES (${userId})`;
});

// Unix socket connection
const db = sql("postgresql:///dbname?host=/var/run/postgresql");
```

### S3 Object Storage
```javascript
import { s3 } from "bun";

// Read from S3
const file = s3("s3://bucket/path/file.txt");
const content = await file.text();
const stat = await file.stat();

// Write to S3
await s3("s3://bucket/uploads/image.jpg").write(imageData);

// List objects
const files = await s3("s3://bucket/").list();

// Delete objects
await s3("s3://bucket/old-file.txt").unlink();

// Set storage class
await s3("s3://bucket/archive/data.zip").write(data, {
  storageClass: "GLACIER"
});
```

## Web Server & HTTP

### HTTP Server
```javascript
// Basic server
const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    
    if (url.pathname === "/") {
      return new Response("Hello, Bun!");
    }
    
    if (url.pathname === "/api/users") {
      return Response.json({ users: [] });
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
```

### File System Routing
```javascript
import { FileSystemRouter } from "bun";

const router = new FileSystemRouter({
  style: "nextjs",
  dir: "./pages",
});

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    const match = router.match(req.url);
    
    if (match) {
      return import(match.filePath).then(module => 
        module.default(req, match.params)
      );
    }
    
    return new Response("Not Found", { status: 404 });
  },
});
```

### WebSockets
```javascript
const server = Bun.serve({
  port: 3000,
  websocket: {
    message(ws, message) {
      console.log("Received:", message);
      ws.send(`Echo: ${message}`);
    },
    open(ws) {
      console.log("WebSocket opened");
    },
    close(ws) {
      console.log("WebSocket closed");
    },
  },
  fetch(req, server) {
    if (server.upgrade(req)) {
      return; // WebSocket upgrade
    }
    return new Response("Hello HTTP!");
  },
});
```

## Bundler & Build Tools

### Bundling Applications
```javascript
// Basic bundling
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  minify: true,
  target: "browser",
});

// Multiple entry points
await Bun.build({
  entrypoints: ["./src/app.ts", "./src/worker.ts"],
  outdir: "./build",
  splitting: true,
  format: "esm",
});

// Node.js target
await Bun.build({
  entrypoints: ["./src/server.ts"],
  outdir: "./dist",
  target: "node",
  external: ["fs", "path"],
});
```

### Plugins
```javascript
import { plugin } from "bun";

const result = await Bun.build({
  entrypoints: ["./app.tsx"],
  plugins: [
    {
      name: "env-plugin",
      setup(build) {
        build.onLoad({ filter: /\.env$/ }, async (args) => {
          const text = await Bun.file(args.path).text();
          const exports = text
            .split("\n")
            .filter(line => line.includes("="))
            .map(line => {
              const [key, value] = line.split("=");
              return `export const ${key} = ${JSON.stringify(value)};`;
            })
            .join("\n");
          
          return { contents: exports };
        });
      },
    },
  ],
});
```

### HTML Imports
```javascript
// Import HTML directly
import html from "./template.html";

// Bundling with HTML
await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  minify: true,
});
```

## Testing Framework

### Basic Testing
```javascript
import { expect, test, describe, beforeAll, afterAll } from "bun:test";

describe("Math operations", () => {
  test("addition", () => {
    expect(2 + 2).toBe(4);
  });
  
  test("async operation", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
```

### Test Matchers
```javascript
import { expect, test } from "bun:test";

test("matchers", () => {
  // Basic matchers
  expect(42).toBe(42);
  expect("hello").toEqual("hello");
  expect([1, 2, 3]).toContain(2);
  
  // Snapshot testing
  expect(new Date()).toMatchInlineSnapshot();
  
  // Custom matchers
  expect(() => {
    throw new Error("Failed");
  }).toThrow("Failed");
});
```

### Test Configuration
```javascript
// bun.config.js
export default {
  test: {
    preload: ["./setup.ts"],
    timeout: 5000,
    coverage: {
      dir: "./coverage",
      reporter: ["text", "html"],
    },
  },
};
```

### Running Tests
```bash
# Run all tests
bun test

# Run specific file
bun test math.test.ts

# Run with filter
bun test --grep "addition"

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

## Performance Features

### Password Hashing
```javascript
// Argon2 password hashing
const password = "secure-password";
const hash = await Bun.password.hash(password);
const isValid = await Bun.password.verify(password, hash);
```

### Crypto & Hashing
```javascript
// Hashing
const hasher = new Bun.CryptoHasher("sha256");
hasher.update("Hello");
hasher.update(" World");
const hash = hasher.digest("hex");

// Random bytes
const randomBytes = crypto.getRandomValues(new Uint8Array(32));
```

### Color Utilities
```javascript
// Parse and convert colors
const color = Bun.color("#ff0000");
console.log(color.rgb);    // { r: 255, g: 0, b: 0 }
console.log(color.hex);    // "#ff0000"
console.log(color.hsl);    // { h: 0, s: 100, l: 50 }

// ANSI colors
const red = Bun.color.ansi(31);
console.log(`${red}Red text${Bun.color.ansi(0)}`);
```

### Math Extensions
```javascript
// High-precision summation (TC39 Stage 3)
const numbers = [0.1, 0.2, 0.3, -0.5, 0.1];
const result = Math.sumPrecise(numbers); // More accurate than reduce
```

## TypeScript Support

### Native TypeScript
```bash
# Run TypeScript directly
bun run app.ts

# Experimental type stripping
bun --experimental-strip-types app.ts
```

### Type Definitions
```typescript
// Types are built-in for Bun APIs
declare module "bun" {
  export interface Serve {
    port: number;
    hostname?: string;
    fetch: (req: Request) => Response | Promise<Response>;
  }
  
  export function serve(options: Serve): Server;
}
```

### Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "types": ["bun-types"]
  }
}
```

## Process Management

### Child Processes
```javascript
// Spawn processes
const proc = Bun.spawn(["ls", "-la"], {
  stdout: "pipe",
  stderr: "pipe",
});

const output = await new Response(proc.stdout).text();
console.log(output);

// With timeout
const proc = Bun.spawn(["sleep", "10"], {
  timeout: 5000, // 5 seconds
});
```

### Environment Variables
```javascript
// Load .env files automatically
console.log(Bun.env.DATABASE_URL);

// Manual env loading
import { loadEnv } from "bun";
loadEnv("production");
```

## Advanced Features

### Foreign Function Interface (FFI)
```javascript
import { dlopen, FFIType, suffix } from "bun:ffi";

const lib = dlopen(`libm.${suffix}`, {
  cos: {
    args: [FFIType.double],
    returns: FFIType.double,
  },
});

const result = lib.symbols.cos(Math.PI); // -1
```

### Streams
```javascript
// Transform streams
const file = Bun.file("large-file.txt");
const stream = file.stream();

const transformed = stream.pipeThrough(new TransformStream({
  transform(chunk, controller) {
    const text = new TextDecoder().decode(chunk);
    const upper = text.toUpperCase();
    controller.enqueue(new TextEncoder().encode(upper));
  },
}));

await Bun.write("output.txt", transformed);
```

### Memory Management
```javascript
// Garbage collection
if (Bun.gc) {
  Bun.gc(); // Force garbage collection
}

// Memory usage
console.log(process.memoryUsage());
```

## Configuration Files

### bunfig.toml
```toml
# Global Bun configuration
[install]
# Default registry
registry = "https://registry.npmjs.org/"

# Workspace linking
linkWorkspacePackages = true

# Cache directory
cache = "~/.bun/install/cache"

[run]
# Auto-install missing packages
auto = true

# Shell to use for scripts
shell = "bash"

[test]
# Test runner configuration
timeout = 5000
coverage = true
```

### package.json Integration
```json
{
  "name": "my-app",
  "scripts": {
    "dev": "bun --hot src/index.ts",
    "build": "bun build src/index.ts --outdir dist",
    "test": "bun test",
    "start": "bun dist/index.js"
  },
  "dependencies": {
    "react": "^18.0.0"
  },
  "trustedDependencies": ["@example/trusted-package"]
}
```

## Best Practices for 2025

### Modern Development
```javascript
// Use top-level await
const config = await import("./config.js");
const data = await fetch("/api/data").then(r => r.json());

// Use built-in services
const db = sql({ /* connection */ });
const users = await db`SELECT * FROM users`;

// Leverage TypeScript
interface User {
  id: number;
  name: string;
  email: string;
}

const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const [newUser] = await db`
    INSERT INTO users (name, email) 
    VALUES (${user.name}, ${user.email})
    RETURNING *
  `;
  return newUser;
};
```

### Performance Optimization
```javascript
// Use Bun.file for efficient I/O
const large = Bun.file("large-dataset.json");
const stream = large.stream();

// Prefer native APIs
const hashedPassword = await Bun.password.hash(password);
const colors = Bun.color("#ff0000");

// Use built-in bundling
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  minify: true,
  splitting: true,
});
```

### Error Handling
```javascript
// Graceful error handling
try {
  const result = await Bun.build({
    entrypoints: ["./src/app.ts"],
    outdir: "./dist",
  });
  
  if (!result.success) {
    console.error("Build failed:", result.logs);
  }
} catch (error) {
  console.error("Build error:", error);
}
```

## Troubleshooting

### Common Issues
```bash
# Clear Bun cache
rm -rf ~/.bun/install/cache

# Debug installation issues
bun install --verbose

# Check for conflicts
bun install --dry-run

# Update Bun
bun upgrade --canary  # For latest features
```

### Performance Debugging
```javascript
// Profile code
console.time("operation");
await heavyOperation();
console.timeEnd("operation");

// Memory usage
const used = process.memoryUsage();
console.log(`Memory: ${used.heapUsed / 1024 / 1024} MB`);
```

## Resources

- **Official Site**: https://bun.sh/
- **Documentation**: https://bun.sh/docs/
- **GitHub**: https://github.com/oven-sh/bun
- **Discord**: https://bun.sh/discord
- **Blog**: https://bun.sh/blog
- **Examples**: https://github.com/oven-sh/bun/tree/main/examples