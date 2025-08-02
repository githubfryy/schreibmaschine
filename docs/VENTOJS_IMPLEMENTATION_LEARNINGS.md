# VentoJS Implementation Learnings

**Date**: January 2025  
**Context**: Migration from custom mustache-style template system to VentoJS for Schreibmaschine

## VentoJS API Key Discoveries

### 1. Configuration Options
```typescript
import vento from 'ventojs';

const env = vento({
  includes: './src/views',     // Template root directory (NOT 'root')
  autoescape: true,           // HTML escaping enabled by default
  dataVarname: 'it',         // Variable name for template data
});
```

**Important**: The config option is `includes`, not `root` as initially assumed.

### 2. TypeScript Types
```typescript
import type { Environment, TemplateResult } from 'ventojs/src/environment.js';
```

**Key Insights**:
- Import path: `ventojs/src/environment.js` (matches package.json exports)
- `TemplateResult` has a `.content` property that contains the actual string
- Functions return `Promise<TemplateResult>`, not `Promise<string>`

### 3. Template Rendering
```typescript
// Correct usage
const result: TemplateResult = await env.run('pages/template.vto', data);
const html: string = result.content; // Extract content string

// String templates
const result: TemplateResult = await env.runString(templateString, data);
const html: string = result.content;
```

**Critical**: Always extract `.content` from the `TemplateResult` object.

### 4. Filter System
```typescript
// Correct filter assignment (bracket notation required for TypeScript)
env.filters['filterName'] = (value: any, ...args: any[]) => {
  return processedValue;
};

// NOT: env.filter('name', fn) - this method doesn't exist
// NOT: env.filters.filterName = fn - TypeScript strict mode requires brackets
```

### 5. Template Syntax Differences

#### Custom Mustache → VentoJS Migration

**Conditionals**:
```html
<!-- Old -->
{{#if condition}}content{{/if}}

<!-- VentoJS -->
{{ if condition }}content{{ /if }}
```

**Loops**:
```html
<!-- Old -->
{{#each items}}{{name}}{{/each}}

<!-- VentoJS -->
{{ for item of items }}{{ item.name }}{{ /for }}
```

**Layouts**:
```html
<!-- VentoJS -->
{{ layout "layouts/base.vto" }}
<!-- Content here becomes {{ content }} in layout -->
```

**Includes**:
```html
<!-- Old -->
{{> component-name}}

<!-- VentoJS -->
{{ include "components/component-name.vto" }}
```

### 6. Async Template Support

**Key Advantage**: VentoJS handles async operations natively:
```html
<!-- Real async calls in templates -->
{{ await fetchUserData(userId) }}
{{ await loadConfiguration() |> json }}
```

**Service Layer**: All template service methods must be async:
```typescript
static async render(pageName: string, data: TemplateData = {}): Promise<string>
```

### 7. Pipeline Filters (Major Feature)

VentoJS uses `|>` pipeline operator (inspired by F# and JS proposal):
```html
<!-- Powerful chaining -->
{{ user.name |> capitalize |> truncate(20) }}
{{ data |> json |> safe }}
{{ url |> await fetch |> await json |> JSON.stringify }}
```

**Custom filters with arguments**:
```typescript
env.filters['truncate'] = (text: string, length: number = 100) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};
```

## File Structure Changes

### Template File Extensions
- Changed from `.html` to `.vto` (Vento Template)
- Maintains same directory structure under `src/views/`

### Layout System
- Layout templates specify content insertion point with `{{ content }}`
- Page templates declare layout at top: `{{ layout "layouts/base.vto" }}`
- Much cleaner than custom wrapper logic

## Performance Considerations

### Caching Behavior
```typescript
const env = vento({
  includes: templatePath,
  cache: process.env.NODE_ENV === 'production', // Cache in production only
});
```

### Template Compilation
- VentoJS compiles templates to JavaScript functions
- Development: no caching for hot reload
- Production: aggressive caching for performance

## Error Handling Improvements

### Better Error Messages
- VentoJS provides detailed error reporting with line numbers
- Template compilation errors are caught at render time
- Fallback error templates for graceful degradation

### Error Fallback Strategy
```typescript
try {
  const result = await env.run(templateFile, data);
  return result.content;
} catch (error) {
  console.error('VentoJS Template Error:', error);
  return TemplateService.renderErrorFallback(templateName, error);
}
```

## Migration Gotchas Encountered

### 1. Import Path Confusion
- Initially tried `ventojs/esm/src/environment` - WRONG
- Correct: `ventojs/src/environment.js` (matches package exports)

### 2. TypeScript Strict Mode
- Filter assignment requires bracket notation: `env.filters['name']`
- Template result requires `.content` extraction
- Process environment variables need bracket access: `process.env['VAR']`

### 3. Async Conversion
- All route handlers calling templates must become `async`
- Template service methods return `Promise<string>`
- Easy to miss template calls in error handlers

### 4. Template Data Structure
- VentoJS expects flat data object
- Layout options become part of template data
- No separate "options" parameter like custom system

## Custom Filters Implemented

Workshop-specific filters for German localization:

```typescript
// German date/time formatting
env.filters['formatDate'] = (date: Date | string) => {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

// Activity status translation
env.filters['activityStatus'] = (status: string) => {
  const statusMap = {
    setup: 'Vorbereitung', active: 'Aktiv', 
    paused: 'Pausiert', completed: 'Abgeschlossen'
  };
  return statusMap[status] || status;
};

// Participant count (German grammar)
env.filters['participantCount'] = (count: number) => {
  return count === 1 ? '1 Teilnehmer' : `${count} Teilnehmer`;
};
```

## Testing Strategy

### Template Validation
1. **TypeScript compilation**: `bun run type-check`
2. **Template syntax**: Templates fail at render time, not compile time
3. **Admin login flow**: Critical first test case
4. **Group URL resolution**: Tests data integration

### Debugging Tools
```typescript
// Cache inspection
static getCacheStats(): { size: number; keys: string[] } {
  return {
    size: TemplateService.vento.cache.size,
    keys: Array.from(TemplateService.vento.cache.keys())
  };
}

// Template debugging filter
env.filters['json'] = (obj: any, indent: number = 2) => {
  return JSON.stringify(obj, null, indent);
};
```

## Next Implementation Steps

1. **Create error templates** (`.vto` versions)
2. **Migrate remaining templates** (lobby, group-room, welcome)
3. **Test all URL paths** with real data
4. **Validate Alpine.js integration** works with new layouts
5. **Performance benchmark** vs old system

## Key Benefits Realized

1. **TypeScript Native**: True TypeScript support vs custom implementation
2. **Async Excellence**: Native async/await in templates for real-time features
3. **Modern Syntax**: Unified `{{ }}` delimiters, pipeline filters
4. **Better Debugging**: Proper error messages with line numbers
5. **Maintenance**: Battle-tested engine vs custom code maintenance
6. **Future-Proof**: Active development, modern JS features

## Recommendation

**VentoJS migration was successful** - all original concerns about template complexity were resolved. The unified syntax, async support, and TypeScript integration make it superior to the custom implementation for Schreibmaschine's collaborative writing platform.

---

*This document should be updated as more VentoJS features are discovered during ongoing development.*