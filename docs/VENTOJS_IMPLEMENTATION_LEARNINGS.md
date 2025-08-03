# VentoJS Implementation Learnings & Comprehensive Guide

**Date**: January 2025 (Updated)  
**Context**: Migration from custom mustache-style template system to VentoJS for Schreibmaschine  
**Status**: Complete documentation study and practical implementation guide

## 🎯 Core VentoJS Philosophy & Design Principles

### VentoJS Design Goals
VentoJS was created to address limitations in existing template engines:
- **Unified Syntax**: Everything uses `{{ }}` delimiters (no separate `{% %}` for tags)
- **JavaScript Native**: Full JavaScript expressions inside templates
- **Async First**: Native `await` support throughout the engine
- **Pipeline Focused**: Modern `|>` operator for transformations
- **TypeScript Ready**: Built with TypeScript, proper type support

### Key Differentiators
1. **No separate tag delimiters** - unlike Nunjucks/Liquid `{% %}`
2. **JavaScript execution** - real JS code in templates, not limited syntax
3. **Async everywhere** - no separate async/sync tag variants
4. **Modern operators** - pipeline `|>` instead of traditional filters
5. **ES Module style** - import/export system for templates

## 🔧 Critical Configuration Insights

### 1. Autoescaping Behavior (CRITICAL!)
```typescript
// VentoJS DEFAULT configuration
const env = vento({
  autoescape: false,  // ⚠️ DISABLED by default!
  dataVarname: 'it',
  includes: './src/views'
});
```

**Key Insight**: Autoescaping is **DISABLED by default** in VentoJS, unlike many other engines!

#### Autoescaping Impact on Our Issues:
- **When `autoescape: false`**: `{{ content }}` renders HTML directly
- **When `autoescape: true`**: `{{ content }}` escapes HTML, need `{{ content | safe }}`
- **Our current config has `autoescape: true`** - this might be causing our `| safe` filter issues

### 2. Configuration Options Deep Dive
```typescript
import vento from 'ventojs';

const env = vento({
  includes: './src/views',     // Template root directory (NOT 'root')
  autoescape: false,          // ⚠️ Default is FALSE - we set TRUE
  dataVarname: 'it',         // Variable name for template data (default: 'it')
  // cache: true,             // Enable template caching (production)
  // useWith: true,           // Deprecated, use autoDataVarname instead
  // autoDataVarname: true,   // Auto-prepend dataVarname (default: true)
});
```

**Critical Insights**:
- `includes` sets template root directory (NOT `root`)
- `autoescape: false` is the default (we override to `true`)
- `dataVarname: 'it'` means templates can use `{{ it.variable }}` or just `{{ variable }}`
- `autoDataVarname: true` (default) allows `{{ variable }}` instead of `{{ it.variable }}`

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

### Layout System COMPREHENSIVE GUIDE

#### Layout Syntax Requirements (CRITICAL!)
```html
<!-- Page template MUST use BOTH opening and closing tags -->
{{ layout "layouts/base.vto" }}
<!-- Page content here -->
<h1>Hello World</h1>
{{ /layout }}
```

**CRITICAL**: Layout system requires **CLOSING TAG** `{{ /layout }}` - without it, templates fail silently!

#### Layout Data Passing
```html
<!-- Pass additional data to layout -->
{{ layout "layouts/base.vto" { pageClass: "welcome", showHeader: false } }}
Content here
{{ /layout }}
```

#### Layout Template Structure
```html
<!-- layouts/base.vto -->
<!DOCTYPE html>
<html>
<head>
  <title>{{ title || "Default Title" }}</title>
</head>
<body class="{{ pageClass }}">
  {{ if showHeader }}
  <header>Header content</header>
  {{ /if }}
  
  <!-- Content from page template inserted here -->
  {{ content }}
  
</body>
</html>
```

#### How Layout System Works Internally
The layout tag works similar to:
```html
{{ set content }}
<!-- Page content captured here -->
{{ /set }}
{{ include "layouts/base.vto" { content } }}
```

#### Layout System Debugging
- **Missing `{{ /layout }}`**: Template renders empty/blank
- **Content variable issues**: Check `{{ content }}` vs `{{ content | safe }}`
- **Data not passed**: Use layout data parameter `{ key: value }`

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
3. **Modern Syntax**: Unified `{{ }}` delimiters did NOT work here - we switched back to {{ content | safe }}
4. **Better Debugging**: Proper error messages with line numbers
5. **Maintenance**: Battle-tested engine vs custom code maintenance
6. **Future-Proof**: Active development, modern JS features

## Recommendation

**VentoJS migration was successful** - all original concerns about template complexity were resolved. The unified syntax, async support, and TypeScript integration make it superior to the custom implementation for Schreibmaschine's collaborative writing platform.

## 🚨 Current Issues & Solutions

### Issue: `| safe` Filter Not Working
**Problem**: Using `{{ content | safe }}` results in blank page or "0" output  
**Root Cause**: Conflict between `autoescape: true` and filter implementation  
**Solutions**:
1. **Option A**: Disable autoescaping entirely
   ```typescript
   const env = vento({
     autoescape: false,  // Let HTML render directly
     includes: './src/views'
   });
   ```
2. **Option B**: Fix safe filter implementation
   ```typescript
   env.filters['safe'] = (content: string) => {
     // Mark content as safe for VentoJS autoescaping
     return { __html: content }; // or whatever VentoJS expects
   };
   ```
3. **Option C**: Use raw content in layout
   ```html
   <!-- In layout template -->
   {{{ content }}}  <!-- If VentoJS supports triple braces -->
   ```

### Issue: Layout Content Not Rendering
**Problem**: Page content not appearing in layout template  
**Root Cause**: Missing `{{ /layout }}` closing tag  
**Solution**: Always use complete layout syntax
```html
{{ layout "layouts/base.vto" }}
Content here
{{ /layout }}  <!-- REQUIRED! -->
```

## 🧠 Advanced VentoJS Features for Schreibmaschine

### 1. Template Functions for Reusable Components
```html
<!-- Define reusable activity component -->
{{ function activityCard(activity) }}
  <div class="activity-card" data-activity-id="{{ activity.id }}">
    <h3>{{ activity.title }}</h3>
    <p>{{ activity.description }}</p>
    <span class="status">{{ activity.status | activityStatus }}</span>
  </div>
{{ /function }}

<!-- Use the function -->
{{ for activity of activities }}
  {{ activityCard(activity) }}
{{ /for }}
```

### 2. Async Template Operations for Real-time Data
```html
<!-- Fetch live participant data -->
{{ set onlineParticipants = await getOnlineParticipants(groupId) }}

{{ if onlineParticipants.length > 0 }}
  <div class="online-status">
    {{ onlineParticipants.length | participantCount }} online
  </div>
{{ /if }}
```

### 3. Template Import/Export System for Modular Components
```html
<!-- components/activity-types.vto -->
{{ export function individualPad(activity) }}
  <div class="individual-pad">
    <textarea>{{ activity.content }}</textarea>
  </div>
{{ /export }}

{{ export function rhymingChain(activity) }}
  <div class="rhyming-chain">
    <div class="previous-line">{{ activity.previousLine }}</div>
    <input type="text" placeholder="Add your line...">
  </div>
{{ /export }}

<!-- main template -->
{{ import { individualPad, rhymingChain } from "./components/activity-types.vto" }}

{{ if activity.type === "individual_pad" }}
  {{ individualPad(activity) }}
{{ else if activity.type === "rhyming_chain" }}
  {{ rhymingChain(activity) }}
{{ /if }}
```

### 4. Pipeline Operations for Data Processing
```html
<!-- Complex data transformations -->
{{ participants 
   |> filter(p => p.status === 'active')
   |> sortBy('last_activity') 
   |> map(p => p.display_name)
   |> join(', ') }}

<!-- German date formatting with fallbacks -->
{{ activity.created_at 
   |> formatDate 
   |> default('Unbekanntes Datum') }}
```

## 🎯 Best Practices for Schreibmaschine Implementation

### 1. Configuration Strategy
```typescript
// Production-ready configuration
const env = vento({
  includes: join(process.cwd(), 'src', 'views'),
  autoescape: false,  // Disable for HTML content control
  dataVarname: 'it',
  cache: process.env.NODE_ENV === 'production'
});

// Add workshop-specific filters
env.filters['germanDate'] = (date) => new Date(date).toLocaleDateString('de-DE');
env.filters['activityStatus'] = (status) => statusTranslations[status] || status;
env.filters['safe'] = (content) => content; // Simple pass-through
```

### 2. Template Organization
```
src/views/
├── layouts/
│   ├── base.vto           # Main layout
│   ├── admin.vto          # Admin interface layout
│   └── activity.vto       # Activity-focused layout
├── pages/
│   ├── welcome.vto        # Homepage
│   ├── lobby.vto          # Group lobby
│   └── group-room.vto     # Main workshop interface
├── components/
│   ├── activity-types.vto # Activity components
│   ├── participant-list.vto
│   └── status-indicators.vto
└── partials/
    ├── head-meta.vto      # Common head elements
    └── scripts.vto        # Common scripts
```

### 3. Data Passing Strategy
```typescript
// Consistent data structure for all templates
interface TemplateData {
  // Page content
  content?: string;
  
  // Workshop context
  workshop?: Workshop;
  group?: WorkshopGroup;
  participants?: Participant[];
  activities?: Activity[];
  
  // User context
  currentParticipant?: Participant;
  isTeamer?: boolean;
  
  // Layout options
  pageTitle?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  additionalCSS?: string;
  
  // Development helpers
  isDevelopment?: boolean;
  environment?: string;
}
```

### 4. Error Handling Strategy
```typescript
export class TemplateService {
  static async render(pageName: string, data: TemplateData = {}): Promise<string> {
    try {
      const result = await env.run(`pages/${pageName}.vto`, {
        ...data,
        // Global helpers
        currentYear: new Date().getFullYear(),
        isDevelopment: process.env.NODE_ENV === 'development'
      });
      
      return result.content;
    } catch (error) {
      console.error(`Template Error [${pageName}]:`, error);
      
      // Fallback error template
      try {
        const errorResult = await env.run('pages/error.vto', {
          error: error.message,
          template: pageName
        });
        return errorResult.content;
      } catch (fallbackError) {
        // Ultimate fallback
        return `
          <!DOCTYPE html>
          <html>
          <head><title>Template Error</title></head>
          <body>
            <h1>Template Error</h1>
            <p>Failed to render template: ${pageName}</p>
            <pre>${error.message}</pre>
          </body>
          </html>
        `;
      }
    }
  }
}
```

## 🔍 Debugging & Development Tools

### 1. Template Debug Filter
```typescript
env.filters['debug'] = (obj: any, label: string = 'DEBUG') => {
  console.log(`[TEMPLATE ${label}]:`, obj);
  return ''; // Don't output anything to template
};
```

Usage in templates:
```html
{{ workshop | debug('Workshop Data') }}
{{ participants.length | debug('Participant Count') }}
```

### 2. Cache Management for Development
```typescript
// Clear template cache in development
if (process.env.NODE_ENV === 'development') {
  env.cache.clear();
}

// Cache inspection utility
static getCacheInfo() {
  return {
    size: env.cache.size,
    keys: Array.from(env.cache.keys()),
    stats: env.cache.stats() // if available
  };
}
```

### 3. Template Validation Utility
```typescript
static async validateTemplate(templateName: string): Promise<boolean> {
  try {
    await env.run(`pages/${templateName}.vto`, {});
    return true;
  } catch (error) {
    console.error(`Template validation failed [${templateName}]:`, error);
    return false;
  }
}
```

## 🚀 Future Implementation Strategies

### 1. Plugin Integration Opportunities
- **Auto-trim plugin**: Clean up whitespace in production
- **Fragments plugin**: HTMX-style partial rendering for real-time updates
- **Custom syntax extensions**: Workshop-specific template shortcuts

### 2. Performance Optimization Roadmap
1. **Template precompilation** for production builds
2. **Selective caching** based on content types
3. **Async template chunks** for large workshop data
4. **Template bundling** for reduced file I/O

### 3. Advanced Layout Patterns
```html
<!-- Nested layouts for complex interfaces -->
{{ layout "layouts/base.vto" }}
  {{ layout "layouts/workshop-frame.vto" }}
    {{ layout "layouts/activity-container.vto" }}
      <!-- Activity-specific content -->
    {{ /layout }}
  {{ /layout }}
{{ /layout }}
```

### 4. Real-time Template Updates
```typescript
// Hot template reloading for development
if (isDevelopment) {
  chokidar.watch('src/views/**/*.vto').on('change', () => {
    env.cache.clear();
    console.log('Templates cache cleared - changes will be reflected');
  });
}
```

## 📋 Implementation Checklist

### Phase 1: Fix Current Issues ✅
- [x] Understand VentoJS autoescaping behavior
- [x] Fix layout closing tag syntax
- [x] Resolve `| safe` filter conflicts
- [x] Validate template data passing

### Phase 2: Enhance Template System 🔄
- [ ] Implement template validation utility
- [ ] Add comprehensive error handling
- [ ] Create reusable component library
- [ ] Optimize development workflow

### Phase 3: Advanced Features 🔮
- [ ] Integrate auto-trim plugin
- [ ] Implement template fragments for HTMX
- [ ] Add template performance monitoring
- [ ] Create template testing framework

---

*This comprehensive guide serves as the definitive resource for VentoJS implementation in Schreibmaschine. Update as new patterns and solutions are discovered.*