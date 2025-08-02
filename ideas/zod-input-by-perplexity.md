Based on my research of Zod's evolution from v4.0 to the current version, here's a comprehensive, modern 2025 guide for integrating Zod 4.0.4 with BiomeJS 2.1.3 for your Schreibmaschine project:

# Zod 4.0.4 + BiomeJS 2.1.3 Configuration Guide for Schreibmaschine (2025)

## Zod 4.0 Major Changes & Improvements

### Performance Breakthroughs

**Up to 14x Faster String Parsing**[1] - Critical for your German slugification and form validation.

**3x Overall Performance Improvement**[1] - Especially beneficial for complex nested schemas in your activity system.

**57% Smaller Bundle Size**[1] - Perfect for your local-first workshop deployment model where every byte matters.

**Memory Efficiency**[1] - Improved for complex nested schemas, ideal for your document and activity structures.

### New Features in Zod 4.0-4.0.4

**Enhanced `z.discriminatedUnion()`**[2] - Now supports unions and pipes, perfect for your activity type system:

```typescript
// Perfect for your activity types
const ActivitySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("collaborative_pad"),
    editingRights: z.enum(["all", "teamer_only"]),
  }),
  z.object({
    type: z.literal("rhyming_chain"),
    turnOrder: z.array(z.string()),
    skipEnabled: z.boolean(),
  }),
  z.object({
    type: z.literal("individual_pad"),
    autoSave: z.boolean(),
  }),
]);
```

**Multiple Values in `z.literal()`**[2] - Simplifies your enum-like validations:

```typescript
// Before Zod 4
const StatusSchema = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("archived")
]);

// Zod 4
const StatusSchema = z.literal("active", "inactive", "archived");
```

**Refinements Inside Schemas**[2] - No more `ZodEffects` wrapper, enabling method chaining:

```typescript
// Now works in Zod 4
const SlugSchema = z.string()
  .min(3)
  .refine(slug => /^[a-z0-9_]+$/.test(slug), "Invalid slug format")
  .max(100);
```

**New `.overwrite()` Method**[2] - Type-safe transforms for your German string processing:

```typescript
const GermanStringSchema = z.string()
  .overwrite(str => str.replace(/ä/g, 'ae'))
  .overwrite(str => str.replace(/ö/g, 'oe'))
  .overwrite(str => str.replace(/ü/g, 'ue'))
  .overwrite(str => str.replace(/ß/g, 'ss'));
```

## Installation & Setup

### Install Zod 4.0.4

```bash
bun add zod@4.0.4
```

### Import Strategy

With Zod 4.0.0+ published to npm, use the simplified imports[3][4]:

```typescript
// Modern Zod 4 import (recommended)
import { z } from "zod";

// Zod 4 Mini for frontend (smaller bundle)
import { z } from "zod/mini";

// Legacy Zod 3 if needed
import { z } from "zod/v3";
```

## Enhanced Environment Configuration for Schreibmaschine

Update your `src/config/env.ts` with Zod 4's improved performance:

```typescript
import { z } from "zod";

// Database configuration with enhanced discriminated unions
const DatabaseConfigSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("sqlite"),
    path: z.string().min(1),
    pragma: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  }),
  z.object({
    type: z.literal("memory"),
    name: z.string().default(":memory:"),
  }),
]);

// Environment schema with new literal syntax
const EnvSchema = z.object({
  NODE_ENV: z.literal("development", "production", "test").default("development"),
  PORT: z.coerce.number().int().min(1000).max(65535).default(3000),
  HOST: z.string().ip({ version: "v4" }).default("127.0.0.1"),
  DATABASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(32),
  ADMIN_PASSWORD: z.string().min(8),
  
  // Workshop-specific configurations
  WORKSHOP_TIMEOUT_MS: z.coerce.number().int().min(1000).default(300000), // 5 minutes
  MAX_PARTICIPANTS_PER_GROUP: z.coerce.number().int().min(1).max(50).default(20),
  
  // German locale settings
  LOCALE: z.literal("de-DE", "de-AT", "de-CH").default("de-DE"),
  TIMEZONE: z.string().default("Europe/Berlin"),
}).transform(env => ({
  ...env,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
}));

export type Environment = z.infer;

// Enhanced validation with better error messages
export function validateEnvironment(): Environment {
  const result = EnvSchema.safeParse(process.env);
  
  if (!result.success) {
    const issues = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    
    throw new Error(`Environment validation failed:\n${issues}`);
  }
  
  return result.data;
}
```

## Enhanced Type Definitions with Zod 4

Update your `src/types/database.ts` with Zod 4's improved features:

```typescript
import { z } from "zod";

// German-aware slug validation with overwrite
const SlugSchema = z.string()
  .min(3)
  .max(100)
  .refine(
    slug => /^[a-z0-9_]+$/.test(slug),
    "Slug must contain only lowercase letters, numbers, and underscores"
  )
  .overwrite(str => str.toLowerCase());

// Enhanced participant schema
export const ParticipantSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2).max(100),
  display_name: z.string().min(2).max(50),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

// Activity schema with discriminated unions
export const ActivitySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("collaborative_pad"),
    id: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    editing_rights: z.literal("all", "teamer_only").default("all"),
    created_at: z.coerce.date(),
  }),
  z.object({
    type: z.literal("rhyming_chain"),
    id: z.string().uuid(),
    title: z.string().min(1).max(200),
    turn_order: z.array(z.string().uuid()),
    skip_enabled: z.boolean().default(true),
    current_turn: z.number().int().min(0),
    created_at: z.coerce.date(),
  }),
  z.object({
    type: z.literal("individual_pad"),
    id: z.string().uuid(),
    title: z.string().min(1).max(200),
    auto_save_interval: z.number().int().min(1000).default(5000),
    created_at: z.coerce.date(),
  }),
]);

// Workshop schema with enhanced validation
export const WorkshopSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  slug: SlugSchema,
  description: z.string().max(2000).optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  is_active: z.boolean().default(true),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
}).refine(
  data => data.end_date > data.start_date,
  "End date must be after start date"
);

// Document schema with metadata
export const DocumentSchema = z.object({
  id: z.string().uuid(),
  activity_id: z.string().uuid(),
  participant_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  content: z.string().max(50000), // 50KB limit
  metadata: z.record(z.unknown()).optional(),
  is_published: z.boolean().default(false),
  version: z.number().int().min(1).default(1),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

// Export inferred types
export type Participant = z.infer;
export type Activity = z.infer;
export type Workshop = z.infer;
export type Document = z.infer;
```

## API Validation with Enhanced Error Handling

Update your API routes to use Zod 4's improved performance and error handling:

```typescript
// src/routes/api/workshops.ts
import { z } from "zod";
import { Elysia, t } from "elysia";

const CreateWorkshopSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(2000).optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
}).refine(
  data => new Date(data.end_date) > new Date(data.start_date),
  {
    message: "End date must be after start date",
    path: ["end_date"],
  }
);

export const workshopRoutes = new Elysia({ prefix: "/api/workshops" })
  .post("/", async ({ body, set }) => {
    const validation = CreateWorkshopSchema.safeParse(body);
    
    if (!validation.success) {
      set.status = 400;
      return {
        error: "Validation failed",
        issues: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      };
    }
    
    // Create workshop with validated data
    const workshop = await WorkshopService.create(validation.data);
    return { workshop };
  })
  .get("/:id", async ({ params, set }) => {
    const idValidation = z.string().uuid().safeParse(params.id);
    
    if (!idValidation.success) {
      set.status = 400;
      return { error: "Invalid workshop ID format" };
    }
    
    const workshop = await WorkshopService.findById(idValidation.data);
    if (!workshop) {
      set.status = 404;
      return { error: "Workshop not found" };
    }
    
    return { workshop };
  });
```

## German Slugification with Zod 4 Overwrite

Enhance your German slugification using Zod 4's `.overwrite()` method:

```typescript
// src/utils/slugify.ts
import { z } from "zod";

const GermanCharacterMap = {
  'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
  'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
  'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Å': 'A',
  'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E',
} as const;

// Zod 4 schema with overwrite transformations
export const SlugifySchema = z.string()
  .min(1, "Input cannot be empty")
  .max(200, "Input too long for slugification")
  .overwrite(str => {
    // Replace German characters
    let result = str;
    for (const [char, replacement] of Object.entries(GermanCharacterMap)) {
      result = result.replaceAll(char, replacement);
    }
    return result;
  })
  .overwrite(str => 
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
  )
  .refine(
    slug => slug.length >= 3,
    "Slug must be at least 3 characters after processing"
  );

export function createSlug(input: string): string {
  const result = SlugifySchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Slugification failed: ${result.error.issues[0]?.message}`);
  }
  return result.data;
}

// Example usage:
// "Schöne Hörspiele im Winter & danach" → "schoene_hoerspiele_im_winter_danach"
```

## BiomeJS 2.1.3 Integration with Zod

Update your `biome.json` to work optimally with Zod 4 patterns:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.1.3/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".git/**",
      "data/**"
    ]
  },
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "arrowParentheses": "asNeeded",
      "jsxQuoteStyle": "double",
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all",
      "bracketSpacing": true,
      "bracketSameLine": false
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "recommended": true,
        "noExcessiveCognitiveComplexity": "warn"
      },
      "correctness": {
        "recommended": true,
        "noUnusedFunctionParameters": {
          "level": "warn",
          "options": {
            "ignoreRestSiblings": true
          }
        }
      },
      "style": {
        "recommended": true,
        "noNonNullAssertion": "warn",
        "useTemplate": "error"
      },
      "suspicious": {
        "recommended": true,
        "noMagicNumbers": {
          "level": "warn",
          "options": {
            "ignore": [0, 1, -1, 2, 3, 4, 5, 100, 1000, 3000, 5000, 8080]
          }
        }
      }
    }
  },
  "overrides": [
    {
      "include": ["src/types/**/*.ts"],
      "linter": {
        "rules": {
          "style": {
            "useTemplate": "off"
          },
          "suspicious": {
            "noMagicNumbers": "off"
          }
        }
      }
    }
  ]
}
```

## Claude Code Integration

Update your `.claude/settings.json` for optimal Zod + Biome workflow:

```json
{
  "permissions": {
    "deny": [
      "Read(node_modules)",
      "Read(.git)",
      "Read(dist)",
      "Read(build)",
      "Read(.next)",
      "Read(data)"
    ]
  },
  "hooks": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command", 
          "command": "biome format --write \"$CLAUDE_FILE_PATHS\""
        }
      ]
    },
    {
      "matcher": "Edit",
      "hooks": [
        {
          "type": "command",
          "command": "if [[ \"$CLAUDE_FILE_PATHS\" =~ \\.(ts|tsx|js|jsx|json)$ ]]; then biome check \"$CLAUDE_FILE_PATHS\" || echo '⚠️ Biome found issues in your code'; fi"
        }
      ]
    }
  ]
}
```

## Package.json Scripts

Update your scripts to use both Zod and Biome optimally:

```json
{
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "start": "bun dist/index.js",
    "type-check": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "check": "biome check --write .",
    "test:static": "bun run type-check && bun run lint && bun run test:templates",
    "test:templates": "node test-templates.js",
    "test:validation": "bun test src/**/*.test.ts",
    "db:migrate": "bun src/database/migrate.ts",
    "db:seed": "bun src/database/seed.ts"
  }
}
```

## Validation Testing for Your Project

Create comprehensive validation tests leveraging Zod 4's performance:

```typescript
// src/types/validation.test.ts
import { describe, it, expect } from "bun:test";
import { z } from "zod";
import { WorkshopSchema, ActivitySchema, SlugifySchema } from "./database";

describe("Zod 4 Validation Performance", () => {
  it("should validate German workshop names quickly", () => {
    const testData = {
      id: crypto.randomUUID(),
      name: "Kreatives Schreiben für Anfänger",
      slug: "kreatives_schreiben_fuer_anfaenger",
      start_date: new Date("2025-09-01"),
      end_date: new Date("2025-12-15"),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const start = performance.now();
    const result = WorkshopSchema.safeParse(testData);
    const duration = performance.now() - start;

    expect(result.success).toBe(true);
    expect(duration).toBeLessThan(5); // Should be under 5ms with Zod 4
  });

  it("should handle complex activity schemas efficiently", () => {
    const rhymingActivity = {
      type: "rhyming_chain" as const,
      id: crypto.randomUUID(),
      title: "Gemeinsame Gedichte schreiben",
      turn_order: [crypto.randomUUID(), crypto.randomUUID()],
      skip_enabled: true,
      current_turn: 0,
      created_at: new Date(),
    };

    const result = ActivitySchema.safeParse(rhymingActivity);
    expect(result.success).toBe(true);
    expect(result.data.type).toBe("rhyming_chain");
  });

  it("should validate German slugification correctly", () => {
    const testCases = [
      {
        input: "Schöne Hörspiele im Winter & danach",
        expected: "schoene_hoerspiele_im_winter_danach"
      },
      {
        input: "Müller & Weiß GmbH",
        expected: "mueller_weiss_gmbh"
      },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = SlugifySchema.safeParse(input);
      expect(result.success).toBe(true);
      expect(result.data).toBe(expected);
    });
  });
});
```

## Performance Benefits for Schreibmaschine

### Zod 4 Improvements Specific to Your Project

1. **German String Processing**: 14x faster string validation perfect for your slugification system[1]
2. **Complex Activity Schemas**: 3x performance improvement for your discriminated union activity types[1]
3. **Real-time Validation**: Reduced memory usage for SSE validation scenarios[1]
4. **Bundle Size**: 57% smaller for your local-first deployment[1]

### BiomeJS Integration Benefits

1. **Unified Tooling**: Single tool for linting and formatting Zod schemas
2. **Type-aware Linting**: Biome understands TypeScript types inferred from Zod
3. **Fast Validation**: 25x faster than ESLint for your development workflow
4. **Claude Code Friendly**: Perfect static validation without server management

## Migration Summary

### From Your Current Setup

1. **Install Zod 4.0.4**: Simple upgrade with backward compatibility
2. **Simplify Imports**: Use `import { z } from "zod"` instead of subpaths
3. **Enhance Schemas**: Leverage discriminated unions for your activity system
4. **Add Overwrite Methods**: Use for your German string processing
5. **Improve Error Handling**: Better validation messages for your API

### Key Advantages for Workshop App

- **Performance**: Critical for real-time workshop interactions
- **Type Safety**: Enhanced validation for German text and complex activities
- **Developer Experience**: Better error messages and Claude Code integration
- **Bundle Efficiency**: Smaller size for your local-first deployment
- **Future-Proof**: Modern validation architecture ready for Loro CRDT integration

This configuration provides you with a modern, performant, and maintainable validation system that perfectly complements your collaborative writing app architecture while ensuring optimal integration with Claude Code development workflows.

[1] https://blog.logrocket.com/zod-4-update/
[2] https://zod.dev/v4
[3] https://github.com/colinhacks/zod/releases
[4] https://zod.dev/v4/versioning
[5] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/964bafbb-f107-42e9-ac56-887595752036/CLAUDE.md
[6] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/235ea02f-bc1d-4629-9add-41d1d9ae8d86/PROJECT-HISTORY.md
[7] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/aacbff6f-577e-4a52-b35f-8d63bcb6e068/TODO.md
[8] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/01d72b33-9180-4c45-96be-488aefdd15a4/CURRENT-STATUS.md
[9] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/889f4bf1-8bd8-4d6f-9c82-1116dc03d194/README.md
[10] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/72a3fbab-d237-49ee-88d7-78b37585561d/DEVELOPMENT.md
[11] https://github.com/colinhacks/zod/releases?id=changelog
[12] https://peerlist.io/jagss/articles/deep-dive-into-zod-v4-whats-new-and-why-it-matters
[13] https://blog.appsignal.com/2025/05/07/migrating-a-javascript-project-from-prettier-and-eslint-to-biomejs.html
[14] https://peerlist.io/blog/engineering/zod-4-is-here-everything-you-need-to-know
[15] https://javascript.plainenglish.io/deep-dive-into-zod-v4-whats-new-and-why-it-matters-e3b281ecc2c6
[16] https://blog.tericcabrel.com/nodejs-typescript-biome/
[17] https://app.folo.is/share/feeds/87143497888462852
[18] https://www.youtube.com/watch?v=T4Q1NvSePxs
[19] https://dev.to/ramunarasinga-11/biomejs-a-toolchain-to-format-and-lint-your-web-project-4bmn
[20] https://zod.dev/library-authors
[21] https://github.com/colinhacks/zod/releases?id=x7ax6fx6464x3146x30x2ex31x31
[22] https://github.com/biomejs/biome/issues/2599
[23] https://news.ycombinator.com/item?id=44030850
[24] https://biomejs.dev
[25] https://blog.bitsrc.io/7-powerful-use-cases-for-zod-schemas-b6df6d77bebc
[26] https://biomejs.dev/reference/configuration/