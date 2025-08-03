# VentoJS Implementation Guide for Claude Code

Based on our extensive debugging session and the VentoJS documentation, here's a comprehensive implementation guide to help Claude Code correctly work with VentoJS templates in the future.

## 🔍 Summary of Our Debugging Journey

We encountered several critical VentoJS syntax issues that caused template compilation failures:

### **Issues Discovered:**
1. **Incorrect comment syntax** - Used `{{/* */}}` instead of `{{# #}}`
2. **Wrong filter syntax** - Used `|` instead of `|>` for pipes
3. **Complex variable assignments** - Tried to use template literals in `{{ set }}` tags
4. **Import statements** - Attempted ES6-style imports which VentoJS doesn't support
5. **Layout syntax errors** - Used object-style parameters instead of separate `set` statements
6. **Array length access** - Tried to pipe `length` as a filter instead of accessing as property

### **Root Cause:**
The main issue was treating VentoJS like other template engines (Nunjucks, Mustache) when it has its own specific syntax patterns. Claude was mixing JavaScript template literal syntax with VentoJS syntax, causing compilation failures.

## 📚 Comprehensive VentoJS Implementation Guide for Claude Code

### **1. Core VentoJS Syntax Rules**

#### **Comments**
```html
{{# This is a VentoJS comment #}}
{{#- Trimmed comment -#}}
```
❌ **Never use:** `{{/* JavaScript-style comments */}}`

#### **Variable Output**
```html
{{ variableName }}
{{ object.property }}
{{ (complex.expression || "fallback") }}
```

#### **Filters/Pipes**
```html
{{ variable |> filterName }}
{{ array |> JSON.stringify }}
{{ text |> toUpperCase }}
```
✅ **Always use:** `|>` for pipes
❌ **Never use:** `|` (single pipe)

### **2. Layout and Template Structure**

#### **Correct Layout Usage**
```html
{{ layout "layouts/base.vto" }}

{{# Set layout variables with separate statements #}}
{{ set pageTitle = "My Page Title" }}
{{ set pageClass = "my-page" }}
{{ set showHeader = false }}
{{ set additionalCSS = "my-styles" }}

{{# Template content here #}}
Content goes here
```

❌ **Wrong - Object-style parameters:**
```html
{{ layout "layouts/base.vto" {
  pageTitle: "My Page",
  pageClass: "my-page"
} }}
```

### **3. Variable Assignment Patterns**

#### **Simple Variables**
```html
{{ set variableName = "simple value" }}
{{ set pageClass = "lobby-page" }}
{{ set isActive = true }}
```

#### **Complex Variables (Use JavaScript blocks)**
```html
{{# For complex expressions, use JavaScript blocks #}}
{{> 
  const complexTitle = workshop.title + " - " + group.title + " - Vorraum";
  const jsonData = JSON.stringify(participants || []);
}}
```

#### **Array Length Access**
```html
{{# Correct - Direct property access #}}
{{ participants.length }}
{{ (participants || []).length }}

{{# Wrong - Cannot pipe length as filter #}}
{{ participants |> length }}
```

### **4. Control Flow Structures**

#### **Conditionals**
```html
{{ if condition }}
  True content
{{ else if anotherCondition }}
  Alternative content
{{ else }}
  Fallback content
{{ /if }}
```

#### **Loops**
```html
{{ for item of items }}
  {{ item.name }}
{{ /for }}

{{ for key, value of object }}
  {{ key }}
  {{ value }}
{{ /for }}
```

#### **Safe Data Handling**
```html
{{ for participant of (participants || []) }}
  {{ participant.display_name }}
{{ /for }}
```

### **5. Component and Partial Patterns**

#### **No ES6 Imports**
❌ **Wrong:**
```html
{{ import { button } from "../components/ui/button.vto" }}
```

✅ **Correct - Inline components or includes:**
```html
{{# Include partial templates #}}
{{ include "components/button.vto" { label: "Click me", variant: "primary" } }}

{{# Or define inline components #}}

  {{ label }}

```

### **6. Alpine.js Integration Patterns**

#### **Template Data Passing**
```html
{{# Safe way to pass data to Alpine.js #}}
{{> 
  const alpineConfig = {
    groupId: group?.id || '',
    participants: participants || [],
    isActive: is_active || false
  };
}}


  
    function myComponent() {
      return {
        config: {{> JSON.stringify(alpineConfig) }},
        // Alpine.js methods...
      };
    }
  

```

### **7. Error Prevention Strategies**

#### **Safe Property Access**
```html
{{# Always provide fallbacks for potentially undefined data #}}
{{ workshop.title || "Unknown Workshop" }}
{{ group?.description || "" }}
{{ (participants || []).length }}
```

#### **Conditional Rendering**
```html
{{ if workshop && group }}
  {{ workshop.title }} - {{ group.title }}
{{ else }}
  Loading...
{{ /if }}
```

### **8. Template Organization Best Practices**

#### **File Structure**
```
src/views/
├── layouts/
│   └── base.vto
├── pages/
│   ├── welcome.vto
│   ├── lobby.vto
│   └── group-room.vto
└── partials/
    ├── header.vto
    └── footer.vto
```

#### **Layout Template Pattern**
```html
{{# layouts/base.vto #}}



  
  {{ pageTitle || "Schreibmaschine" }}
  {{ if additionalCSS }}
  
  {{ /if }}


  {{ if showHeader }}
    {{ include "partials/header.vto" }}
  {{ /if }}
  
  
    {{ content }}
  
  
  {{ if additionalJS }}
  
  {{ /if }}


```

### **9. Debugging Approach**

#### **Template Data Validation**
```html
{{# Debug data structure in development #}}
{{ if isDevelopment }}
  {{> console.log('Template data:', JSON.stringify(it, null, 2)) }}
{{ /if }}
```

#### **Progressive Implementation**
1. **Start simple** - Basic HTML with minimal VentoJS syntax
2. **Add data gradually** - Test each variable addition
3. **Validate syntax** - Use proper VentoJS patterns from the start
4. **Test frequently** - Don't build complex templates without testing

### **10. Common Pitfall Avoidance**

#### **❌ What NOT to do:**
- Don't use JavaScript template literals in `{{ set }}` tags
- Don't mix ES6 import syntax
- Don't use `|` for pipes (use `|>`)
- Don't use `{{/* */}}` for comments (use `{{# #}}`)
- Don't assume Nunjucks/Mustache syntax will work

#### **✅ What TO do:**
- Use `{{> }}` for complex JavaScript expressions
- Use `{{ set }}` for simple variable assignments
- Always provide fallbacks for potentially undefined data
- Use proper VentoJS comment and pipe syntax
- Test templates incrementally

## 🎯 Template Implementation Checklist

Before implementing a VentoJS template, ensure:

- [ ] Layout uses separate `{{ set }}` statements for variables
- [ ] Comments use `{{# #}}` syntax
- [ ] Pipes use `|>` operator
- [ ] Complex expressions are in `{{> }}` JavaScript blocks
- [ ] Array/object properties accessed directly, not piped
- [ ] Fallbacks provided for potentially undefined data
- [ ] No ES6 import statements used
- [ ] Alpine.js integration uses safe data passing patterns

This guide should help Claude Code implement VentoJS templates correctly and avoid the syntax pitfalls we encountered during our debugging session[1][2][3][4][5][6].
