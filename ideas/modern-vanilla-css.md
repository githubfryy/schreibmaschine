Ich habe das Dokument gründlich geprüft und mehrere Inkonsistenzen, Syntaxfehler und veraltete Informationen gefunden. Hier ist das vollständig korrigierte und verbesserte Dokument:

# Umfassende CSS 2025 Dokumentation für Moderne Vanilla CSS-Entwicklung

## Dokument 1: CSS 2025 Grundlagen & Modernste Features

```markdown
# CSS 2025: Modernste Features & Best Practices

## Übersicht
Diese Dokumentation behandelt die neuesten CSS-Features für 2025, die JavaScript oft überflüssig machen und für hervorragende Performance und moderne Ästhetik sorgen.

## 1. View Transition API - Nahtlose Übergänge

### Grundlegendes Setup
```
/* Automatische View Transitions für alle Navigationen */
@view-transition {
  navigation: auto;
}

/* Browser-Support prüfen */
@supports (view-transition-name: none) {
  .transition-element {
    view-transition-name: unique-element-name;
  }
}

/* Respektiere Nutzer-Präferenzen */
@media (prefers-reduced-motion: no-preference) {
  .hero-title {
    view-transition-name: hero-title;
  }
  
  .card {
    view-transition-name: card-animation;
  }
}
```

### Erweiterte Transition-Kontrolle
```
/* Custom Transition-Typen */
::view-transition-group(hero-title) {
  animation-duration: 0.5s;
  animation-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1);
}

::view-transition-old(hero-title) {
  animation: slide-out-left 0.3s ease-in;
}

::view-transition-new(hero-title) {
  animation: slide-in-right 0.3s ease-out;
}

@keyframes slide-out-left {
  to { transform: translateX(-100%); }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Aktive Transition-Styles */
:active-view-transition {
  pointer-events: none;
}
```

## 2. CSS Grid - Modernste Layout-Techniken

### Container Queries + Grid
```
.grid-container {
  display: grid;
  container-type: inline-size;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
}

/* Responsive basierend auf Container-Größe */
@container (min-width: 600px) {
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  }
}

@container (min-width: 900px) {
  .grid-container {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Subgrid für komplexe Layouts
```
.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, auto);
  gap: 1rem;
}

@supports (grid-template-columns: subgrid) {
  .nested-grid {
    display: grid;
    grid-column: span 2;
    grid-row: span 2;
    grid-template-columns: subgrid;
    grid-template-rows: subgrid;
  }
}
```

## 3. CSS Custom Properties (Variables) - Erweiterte Nutzung

### Design System mit Named Variables
```
:root {
  /* Farbsystem mit OKLCH */
  --color-primary-50: oklch(95% 0.02 240);
  --color-primary-100: oklch(90% 0.04 240);
  --color-primary-500: oklch(60% 0.15 240);
  --color-primary-600: oklch(55% 0.15 240);
  --color-primary-900: oklch(20% 0.08 240);
  
  /* Fallbacks für Browser ohne OKLCH Support */
  --color-primary-50: hsl(240, 100%, 97%);
  --color-primary-100: hsl(240, 100%, 94%);
  --color-primary-500: hsl(240, 100%, 60%);
  --color-primary-600: hsl(240, 100%, 55%);
  --color-primary-900: hsl(240, 100%, 20%);
  
  /* Spacing System */
  --space-3xs: clamp(0.25rem, 0.25rem + 0vw, 0.25rem);
  --space-2xs: clamp(0.5rem, 0.5rem + 0vw, 0.5rem);
  --space-xs: clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem);
  --space-s: clamp(1rem, 0.95rem + 0.24vw, 1.125rem);
  --space-m: clamp(1.5rem, 1.43rem + 0.37vw, 1.6875rem);
  --space-l: clamp(2rem, 1.91rem + 0.49vw, 2.25rem);
  --space-xl: clamp(2.5rem, 2.39rem + 0.61vw, 2.8125rem);
  
  /* Typography Scale */
  --text-xs: clamp(0.75rem, 0.73rem + 0.12vw, 0.8125rem);
  --text-sm: clamp(0.875rem, 0.85rem + 0.12vw, 0.9375rem);
  --text-base: clamp(1rem, 0.95rem + 0.24vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1.07rem + 0.29vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.16rem + 0.43vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.39rem + 0.61vw, 1.875rem);
  
  /* Border Radius */
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary-50: oklch(15% 0.02 240);
    --color-primary-100: oklch(20% 0.04 240);
    --color-primary-500: oklch(70% 0.15 240);
    --color-primary-600: oklch(75% 0.15 240);
    --color-primary-900: oklch(95% 0.08 240);
  }
}
```

### Themable Components mit Variables
```
.button {
  --button-bg: var(--color-primary-500);
  --button-text: white;
  --button-hover-bg: var(--color-primary-600);
  --button-padding-x: var(--space-m);
  --button-padding-y: var(--space-s);
  --button-radius: var(--radius-md);
  
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--button-bg);
  color: var(--button-text);
  padding: var(--button-padding-y) var(--button-padding-x);
  border-radius: var(--button-radius);
  border: none;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.button:hover {
  background: var(--button-hover-bg);
  transform: translateY(-1px);
}

.button:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Variants */
.button--secondary {
  --button-bg: transparent;
  --button-text: var(--color-primary-500);
  --button-hover-bg: var(--color-primary-50);
  border: 1px solid var(--color-primary-500);
}

.button--large {
  --button-padding-x: var(--space-l);
  --button-padding-y: var(--space-m);
  --button-radius: var(--radius-lg);
  font-size: var(--text-lg);
}
```

## 4. CSS Nesting - Native Browser Support

### Moderne Nesting-Syntax
```
.card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.3s ease;
  
  /* Native CSS Nesting */
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
  
  .card-header {
    padding: var(--space-m);
    border-bottom: 1px solid var(--color-gray-200);
    
    h3 {
      margin: 0;
      color: var(--color-gray-900);
      font-size: var(--text-lg);
      font-weight: 600;
    }
  }
  
  .card-body {
    padding: var(--space-m);
    
    p {
      color: var(--color-gray-600);
      line-height: 1.6;
      margin-bottom: var(--space-s);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  /* Media Query Nesting */
  @media (max-width: 768px) {
    .card-body {
      padding: var(--space-s);
    }
  }
}

/* Fallback für Browser ohne Nesting Support */
@supports not (selector(&)) {
  .card {
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .card:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-4px);
  }
  
  .card .card-header {
    padding: var(--space-m);
    border-bottom: 1px solid var(--color-gray-200);
  }
  
  .card .card-header h3 {
    margin: 0;
    color: var(--color-gray-900);
    font-size: var(--text-lg);
    font-weight: 600;
  }
}
```

## 5. Performance & Fallback-Strategien

### Progressive Enhancement
```
/* Base styles (arbeiten überall) */
.card {
  display: block;
  margin: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Enhanced styles mit Feature Queries */
@supports (display: grid) {
  .card-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin: 0;
  }
  
  .card {
    margin: 0;
  }
}

@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }
  
  @container (min-width: 400px) {
    .card {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
    }
  }
}
```

### Moderne CSS Features mit Fallbacks
```
.modern-button {
  /* Fallback */
  background: #3b82f6;
  padding: 12px 24px;
  border-radius: 6px;
  
  /* Modern mit Fallbacks */
  background: var(--color-primary-500, #3b82f6);
  padding: var(--space-s, 12px) var(--space-m, 24px);
  border-radius: var(--radius-md, 6px);
  
  /* Neue Properties mit Fallbacks */
  color-scheme: light dark;
  accent-color: var(--color-primary-500, #3b82f6);
}

/* OKLCH mit Fallback */
@supports (color: oklch(60% 0.15 240)) {
  :root {
    --color-primary-500: oklch(60% 0.15 240);
  }
}

@supports not (color: oklch(60% 0.15 240)) {
  :root {
    --color-primary-500: hsl(240, 100%, 60%);
  }
}
```

## 6. Accessibility & User Preferences

### Respektiere User Preferences
```
/* Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Kontrast */
@media (prefers-contrast: more) {
  :root {
    --color-text: black;
    --color-bg: white;
    --border-width: 2px;
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3);
  }
}

/* Color Scheme */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-text: #f8fafc;
    --color-primary-500: oklch(70% 0.15 240);
    --color-gray-50: oklch(15% 0.002 247);
    --color-gray-900: oklch(95% 0.005 247);
  }
}
```

### Focus Management
```
/* Modern focus styles */
.focusable {
  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color 0.2s ease;
}

.focusable:focus-visible {
  outline-color: var(--color-primary-500);
}

/* Skip to content */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary-500);
  color: white;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: 500;
  transition: top 0.3s ease;
  z-index: 9999;
}

.skip-link:focus {
  top: 6px;
}
```
```

## Dokument 2: Container Queries & Responsive Design 2025

```markdown
# Container Queries & Responsive Design 2025

## Übersicht
Container Queries revolutionieren responsives Design, indem sie Komponenten auf ihre Container-Größe reagieren lassen, nicht nur auf die Viewport-Größe.

## 1. Container Queries Grundlagen

### Container Types
```
/* Size containment - reagiert auf width und height */
.card-container {
  container-type: size;
  container-name: card;
}

/* Inline-size containment - reagiert nur auf width (Standard) */
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

/* Block-size containment - reagiert nur auf height */
.scroll-area {
  container-type: block-size;
  container-name: scroll;
}

/* Normal - kein containment */
.no-containment {
  container-type: normal;
}

/* Shorthand für type und name */
.component {
  container: component / inline-size;
}
```

### Container Query Syntax
```
.responsive-card {
  padding: 1rem;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* Named Container Query */
@container card (min-width: 400px) {
  .responsive-card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    padding: 1.5rem;
  }
}

@container card (min-width: 600px) {
  .responsive-card {
    grid-template-columns: 200px 1fr;
    padding: 2rem;
  }
}

/* Ohne Container-Name (verwendet nächsten Container) */
@container (min-width: 300px) {
  .card-title {
    font-size: var(--text-lg);
  }
}
```

## 2. Praktische Container Query Patterns

### Responsive Cards
```
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1rem, 2.5vw, 2rem);
  container-type: inline-size;
}

.card {
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-content {
  padding: var(--space-m);
}

.card-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.card-title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-s);
  color: var(--color-gray-900);
}

.card-description {
  color: var(--color-gray-600);
  font-size: var(--text-sm);
  line-height: 1.5;
}

/* Small container - stacked layout */
@container (max-width: 300px) {
  .card-image {
    height: 150px;
  }
  
  .card-content {
    padding: var(--space-s);
  }
  
  .card-title {
    font-size: var(--text-base);
  }
}

/* Medium container - side-by-side layout */
@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 150px 1fr;
  }
  
  .card-image {
    height: 100%;
    min-height: 120px;
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}

/* Large container - enhanced layout */
@container (min-width: 600px) {
  .card {
    grid-template-columns: 200px 1fr;
  }
  
  .card-content {
    padding: var(--space-l);
  }
  
  .card-title {
    font-size: var(--text-xl);
  }
  
  .card-description {
    font-size: var(--text-base);
  }
}
```

### Responsive Navigation
```
.navigation {
  container-type: inline-size;
  container-name: nav;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-s);
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--space-s);
}

.nav-item {
  flex-shrink: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-s);
  padding: var(--space-s) var(--space-m);
  text-decoration: none;
  color: var(--color-gray-700);
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease, color 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
}

.nav-link.active {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Kleine Navigation - nur Icons */
@container nav (max-width: 400px) {
  .nav-link-text {
    display: none;
  }
  
  .nav-link {
    padding: var(--space-s);
    width: 44px;
    height: 44px;
    justify-content: center;
  }
}

/* Mittlere Navigation - kompakte Labels */
@container nav (min-width: 401px) and (max-width: 600px) {
  .nav-link-text {
    font-size: var(--text-sm);
  }
}

/* Große Navigation - volle Labels */
@container nav (min-width: 601px) {
  .nav-link {
    padding: var(--space-s) var(--space-l);
    font-size: var(--text-base);
  }
}
```

## 3. Container Query Units

### Container-relative Einheiten
```
.responsive-component {
  container-type: inline-size;
  container-name: responsive;
}

.flexible-text {
  /* Container Query Units */
  font-size: clamp(1rem, 5cqw, 2rem); /* 5% der Container-Breite mit Grenzen */
  padding: clamp(0.5rem, 2cqh, 1.5rem) clamp(1rem, 3cqw, 2rem);
  margin: clamp(0.25rem, 1cqi, 1rem); /* 1% der Container inline-size */
  border-radius: clamp(4px, 2cqb, 16px); /* 2% der Container block-size */
}

/* Smart responsive typography */
.smart-heading {
  font-size: clamp(1.25rem, 4cqw + 1rem, 3rem);
  line-height: clamp(1.2, 1.4, 1.6);
  margin-bottom: clamp(0.5rem, 2cqw, 1.5rem);
}

/* Container-aware spacing */
.container-aware {
  width: clamp(200px, 50cqw, 500px);
  height: clamp(100px, 25cqh, 300px);
  gap: clamp(0.5rem, 2cqw, 1.5rem);
}
```

## 4. Fallbacks & Progressive Enhancement

### Container Query Fallbacks
```
/* Fallback für Browser ohne Container Query Support */
.card {
  padding: var(--space-m);
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* Fallback Layout-Klassen */
.card--horizontal {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-m);
}

.card--compact {
  padding: var(--space-s);
}

/* Feature Query für Container Query Support */
@supports (container-type: inline-size) {
  .card-container {
    container-type: inline-size;
  }
  
  /* Fallback-Klassen zurücksetzen */
  .card--horizontal {
    display: block;
    grid-template-columns: none;
    gap: 0;
  }
  
  .card--compact {
    padding: var(--space-m);
  }
  
  /* Container Queries verwenden */
  @container (min-width: 400px) {
    .card {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: var(--space-m);
    }
  }
  
  @container (max-width: 300px) {
    .card {
      padding: var(--space-s);
    }
  }
}
```

### JavaScript Enhancement für Fallbacks
```
// Progressive Enhancement mit JavaScript
function initContainerQueryFallback() {
  // Check for container query support
  if (!CSS.supports('container-type', 'inline-size')) {
    // Fallback: Use ResizeObserver
    const containers = document.querySelectorAll('[data-container-query]');
    
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const element = entry.target;
        const width = entry.contentRect.width;
        
        // Apply classes based on container width
        element.classList.toggle('container-sm', width = 400 && width = 600);
      });
    });
    
    containers.forEach(container => {
      resizeObserver.observe(container);
    });
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContainerQueryFallback);
} else {
  initContainerQueryFallback();
}
```

```
/* Fallback-Styles für JavaScript Enhancement */
@supports not (container-type: inline-size) {
  .container-sm .card {
    padding: var(--space-s);
    font-size: var(--text-sm);
  }
  
  .container-md .card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--space-m);
  }
  
  .container-lg .card {
    grid-template-columns: 200px 1fr;
    padding: var(--space-l);
  }
}
```
```

## Dokument 3: Performance & Build-Optimierung

```markdown
# CSS Performance & Build-Optimierung 2025

## Übersicht
Moderne CSS-Performance-Strategien und Build-Optimierungen für schnellste Ladezeiten und beste User Experience.

## 1. Critical CSS Loading Strategy

### Inline Critical CSS
```



  
  
  
  
  
    :root {
      --color-primary-500: hsl(240, 100%, 60%);
      --color-gray-50: hsl(240, 5%, 96%);
      --color-gray-900: hsl(240, 6%, 10%);
      --space-s: 1rem;
      --space-m: 1.5rem;
      --space-l: 2rem;
      --text-base: 1rem;
      --radius-md: 0.375rem;
      --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    @supports (color: oklch(60% 0.15 240)) {
      :root {
        --color-primary-500: oklch(60% 0.15 240);
        --color-gray-50: oklch(96% 0.002 247);
        --color-gray-900: oklch(10% 0.005 247);
      }
    }

    body {
      font-family: system-ui, -apple-system, "Segoe UI", "Roboto", sans-serif;
      font-size: var(--text-base);
      line-height: 1.6;
      color: var(--color-gray-900);
      background: var(--color-gray-50);
      margin: 0;
      padding: 0;
    }

    .header {
      background: white;
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--space-m);
    }

    .hero {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-l) 0;
    }
  
  
  
  
  
  
  Moderne CSS 2025


  


```

## 2. Content Visibility für Performance

### Smart Content Loading
```
/* Große Content-Bereiche optimieren */
.large-content-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px; /* Geschätzte Höhe reservieren */
}

/* Off-screen Content verstecken */
.off-screen-content {
  content-visibility: hidden;
}

/* Explizit sichtbare Inhalte */
.always-visible-content {
  content-visibility: visible;
}

/* Performance-optimierte Listen */
.virtual-list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 120px;
  contain: layout style paint;
}

/* Intersection-based loading mit Fallback */
@supports (content-visibility: auto) {
  .lazy-section {
    content-visibility: auto;
    contain-intrinsic-size: 300px 400px;
  }
}

@supports not (content-visibility: auto) {
  .lazy-section {
    /* Fallback für Browser ohne Support */
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  
  .lazy-section.visible {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 3. CSS Containment für bessere Performance

### Layout Containment
```
/* Unabhängige Komponenten isolieren */
.independent-widget {
  contain: layout style paint;
  /* Verhindert Reflow-Propagation nach außen */
}

/* Size Containment für feste Größen */
.fixed-size-component {
  contain: size layout;
  width: 300px;
  height: 200px;
}

/* Style Containment für CSS-Isolation */
.isolated-styles {
  contain: style;
  /* CSS-Counter und andere Styles bleiben isoliert */
}

/* Umfassendes Containment */
.full-containment {
  contain: layout style paint size;
  /* Maximale Isolation, aber Vorsicht bei dynamischen Inhalten */
}
```

### Will-Change Optimierung
```
/* Performance-Hints für Animationen */
.hover-animation {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-animation:hover {
  will-change: transform, box-shadow;
  transform: translateY(-4px) scale(1.02);
  box-shadow: var(--shadow-lg);
}

.hover-animation:not(:hover) {
  will-change: auto; /* Performance wieder freigeben */
}

/* GPU-Layer für komplexe Animationen */
.complex-animation {
  transform: translateZ(0); /* Composite Layer erzwingen */
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Scroll-Performance optimieren */
.smooth-scroll-container {
  overflow-y: auto;
  will-change: scroll-position;
  transform: translateZ(0);
  -webkit-overflow-scrolling: touch; /* iOS Safari */
}
```

## 4. Moderne Loading-Strategien

### CSS Module Loading
```
/* Basis-Utilities - immer laden */
@layer utilities {
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .visually-hidden:not(:focus):not(:active) {
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }
}

/* Komponenten - lazy laden */
@layer components {
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-s, 0.75rem) var(--space-m, 1.5rem);
    border: none;
    border-radius: var(--radius-md, 0.375rem);
    font-size: var(--text-base, 1rem);
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--color-primary-500, #3b82f6);
    color: white;
  }
}
```

### Conditional Loading
```
/* Nur bei Touch-Geräten laden */
@media (hover: none) and (pointer: coarse) {
  .touch-optimized {
    min-height: 44px;
    min-width: 44px;
    padding: var(--space-m);
  }
}

/* Nur bei hoher Auflösung laden */
@media (min-resolution: 2dppx) {
  .high-res-background {
    background-image: url('/images/hero@2x.jpg');
  }
}

/* Nur bei ausreichend Bandbreite laden */
@media not all and (prefers-reduced-data: reduce) {
  .heavy-background {
    background-image: url('/images/complex-pattern.svg');
  }
  
  .decorative-animation {
    animation: float 3s ease-in-out infinite;
  }
}
```

## 5. Build-Pipeline Optimierung

### CSS Bundle Splitting
```
// Vite/Rollup Beispiel
export default {
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            if (assetInfo.name.includes('critical')) {
              return 'css/critical.[hash].css';
            }
            if (assetInfo.name.includes('components')) {
              return 'css/components.[hash].css';
            }
            return 'css/[name].[hash].css';
          }
          return 'assets/[name].[hash][extname]';
        }
      }
    },
    cssCodeSplit: true,
    sourcemap: true
  },
  css: {
    devSourcemap: true
  }
};
```

### CSS Purging Configuration
```
// PurgeCSS Konfiguration
module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx,vue,svelte}',
    './components/**/*.{js,ts,jsx,tsx,vue,svelte}'
  ],
  css: ['./src/**/*.css'],
  safelist: [
    // Klassen die immer behalten werden
    'focus-visible',
    /^btn--/,
    /^grid-cols-/,
    {
      pattern: /^(text|bg|border)-(primary|secondary|accent)/,
      variants: ['hover', 'focus', 'active', 'disabled']
    },
    // Dynamisch generierte Klassen
    /^container-(sm|md|lg|xl)$/,
    // Third-party CSS
    /^swiper-/
  ],
  blocklist: [
    // Nie verwendete Klassen
    'deprecated-class',
    /^legacy-/,
    /^old-/
  ],
  keyframes: true,
  fontFace: true
};
```

## 6. Performance Monitoring

### CSS Performance Metriken
```
/* Performance-kritische Selektoren markieren */
.performance-critical {
  /* Dokumentiere warum diese Styles kritisch sind */
  /* TODO: Überprüfe Performance Impact */
  background: var(--color-primary-500);
}

/* Vermeidung von performance-kritischen Selektoren */
/* AVOID: * + * { margin-top: 1rem; } */
/* BETTER: */
.stack > * + * {
  margin-top: var(--space-s);
}

/* AVOID: [data-theme="dark"] .card .title */
/* BETTER: */
.dark-theme .card-title {
  color: var(--color-gray-100);
}
```

### Resource Hints
```






```
```

## Dokument 4: Moderne CSS Selectors & Features 2025

```markdown
# Moderne CSS Selectors & Advanced Features 2025

## Übersicht
Modernste CSS-Selektoren und Features für 2025, die präzise Kontrolle und bessere Wartbarkeit ermöglichen.

## 1. :is() und :where() Pseudo-Klassen

### Vereinfachte Selektoren
```
/* Traditioneller Ansatz */
.card h1,
.card h2,
.card h3,
.card h4,
.card h5,
.card h6 {
  color: var(--color-gray-900);
  margin-bottom: var(--space-s);
  font-weight: 600;
  line-height: 1.2;
}

/* Mit :is() - behält höchste Spezifität der Liste */
.card :is(h1, h2, h3, h4, h5, h6) {
  color: var(--color-gray-900);
  margin-bottom: var(--space-s);
  font-weight: 600;
  line-height: 1.2;
}

/* Mit :where() - hat Spezifität 0 */
:where(.card) :where(h1, h2, h3, h4, h5, h6) {
  color: var(--color-gray-900);
  margin-bottom: var(--space-s);
  font-weight: 600;
  line-height: 1.2;
}

/* Komplexere Beispiele */
:is(.primary, .secondary, .accent) :where(button, .btn, input[type="button"]) {
  border-radius: var(--radius-md);
  font-weight: 500;
  padding: var(--space-s) var(--space-m);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Responsive mit :is() */
@media (min-width: 768px) {
  :is(.container, .wrapper, .content) {
    padding-left: var(--space-xl);
    padding-right: var(--space-xl);
  }
}
```

### Fallback für :is() und :where()
```
/* Fallback für Browser ohne :is() Support */
@supports not selector(:is(a)) {
  .card h1,
  .card h2,
  .card h3,
  .card h4,
  .card h5,
  .card h6 {
    color: var(--color-gray-900);
    margin-bottom: var(--space-s);
    font-weight: 600;
    line-height: 1.2;
  }
}

@supports selector(:is(a)) {
  .card :is(h1, h2, h3, h4, h5, h6) {
    color: var(--color-gray-900);
    margin-bottom: var(--space-s);
    font-weight: 600;
    line-height: 1.2;
  }
}
```

## 2. :has() Pseudo-Klasse (Parent Selector)

### Erweiterte Parent-Selektion
```
/* Card mit Bild anders stylen */
.card:has(img) {
  padding: 0;
  overflow: hidden;
}

.card:has(img) .card-content {
  padding: var(--space-m);
}

.card:has(.card-image) .card-title {
  margin-top: 0;
}

/* Form Validation */
.form-field:has(input:invalid) {
  border-color: var(--color-error-500, #ef4444);
  background-color: var(--color-error-50, #fef2f2);
}

.form-field:has(input:valid) {
  border-color: var(--color-success-500, #10b981);
  background-color: var(--color-success-50, #f0fdf4);
}

.form-field:has(input:focus) {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

/* Navigation mit aktiven Links */
.nav:has(.nav-link.active) .nav-link:not(.active) {
  opacity: 0.6;
  transform: scale(0.95);
}

/* Layout basierend auf Anzahl der Kinder */
.grid:has(.grid-item:nth-child(n+7)) {
  grid-template-columns: repeat(4, 1fr);
}

.grid:has(.grid-item:nth-child(n+4):nth-child(-n+6)) {
  grid-template-columns: repeat(3, 1fr);
}

.grid:has(.grid-item:nth-child(-n+3)) {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* Theme detection basierend auf Checkboxen */
html:has(input[name="theme"][value="dark"]:checked) {
  color-scheme: dark;
  --color-bg: #0f172a;
  --color-text: #f8fafc;
  --color-primary-500: oklch(70% 0.15 240);
}

html:has(input[name="theme"][value="light"]:checked) {
  color-scheme: light;
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-primary-500: oklch(60% 0.15 240);
}
```

### :has() Fallback
```
/* Fallback für Browser ohne :has() Support */
@supports not selector(:has(*)) {
  .card-with-image {
    padding: 0;
    overflow: hidden;
  }
  
  .card-with-image .card-content {
    padding: var(--space-m);
  }
  
  .form-field--invalid {
    border-color: var(--color-error-500);
    background-color: var(--color-error-50);
  }
  
  .form-field--valid {
    border-color: var(--color-success-500);
    background-color: var(--color-success-50);
  }
}

@supports selector(:has(*)) {
  /* Moderne :has() Selektoren hier */
  .card:has(img) {
    padding: 0;
    overflow: hidden;
  }
}
```

## 3. Erweiterte Attribute Selectors

### Moderne Attribute-Selektion
```
/* URL-basierte Styling */
a[href^="https://"] {
  color: var(--color-success-600);
}

a[href^="https://"]::after {
  content: " ↗";
  font-size: 0.8em;
  opacity: 0.7;
}

a[href^="mailto:"] {
  color: var(--color-primary-600);
}

a[href^="mailto:"]::before {
  content: "✉ ";
  opacity: 0.7;
}

a[href^="tel:"] {
  color: var(--color-accent-600);
}

/* Dateityp-basierte Styling */
a[href$=".pdf"]::after {
  content: " (PDF)";
  font-size: var(--text-xs);
  opacity: 0.7;
  color: var(--color-error-600);
}

a[href$=".doc"]::after,
a[href$=".docx"]::after {
  content: " (DOC)";
  font-size: var(--text-xs);
  opacity: 0.7;
  color: var(--color-blue-600);
}

/* Sprach-spezifische Styling */
[lang|="en"] {
  font-family: "Inter", "Helvetica Neue", sans-serif;
}

[lang|="de"] {
  font-family: "Source Sans Pro", "Segoe UI", sans-serif;
}

[lang|="ja"] {
  font-family: "Noto Sans JP", sans-serif;
}

/* Case-insensitive Matching */
input[type="email" i] {
  background-image: url("data:image/svg+xml,..."); /* Email icon */
}

/* Partial matching für Klassen */
[class*="btn"] {
  cursor: pointer;
  user-select: none;
}

[class~="featured"] {
  position: relative;
}

[class~="featured"]::before {
  content: "★";
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--color-accent-500);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
```

## 4. Pseudo-Element Enhancements

### Moderne Pseudo-Elemente
```
/* Erweiterte ::before und ::after */
.quote {
  position: relative;
  font-style: italic;
  padding: var(--space-m) var(--space-l);
  background: var(--color-gray-50);
  border-left: 4px solid var(--color-primary-500);
}

.quote::before {
  content: open-quote;
  font-size: 2em;
  color: var(--color-primary-500);
  position: absolute;
  top: 0;
  left: var(--space-s);
  line-height: 1;
}

.quote::after {
  content: close-quote;
  font-size: 2em;
  color: var(--color-primary-500);
  position: absolute;
  bottom: -0.2em;
  right: var(--space-s);
  line-height: 1;
}

/* ::marker für Listen */
::marker {
  color: var(--color-primary-500);
  font-weight: bold;
}

li::marker {
  content: "→ ";
}

/* ::selection für Text-Selektion */
::selection {
  background: var(--color-primary-100);
  color: var(--color-primary-900);
}

/* ::placeholder Styling */
::placeholder {
  color: var(--color-gray-400);
  opacity: 1;
  font-style: italic;
}

/* ::first-line für Typography */
.article-content p::first-line {
  font-weight: 600;
  color: var(--color-gray-800);
}

.article-content h1 + p::first-letter {
  font-size: 3em;
  float: left;
  line-height: 1;
  margin: 0 0.1em 0 0;
  color: var(--color-primary-600);
}
```

## 5. Logical Properties für Internationalization

### Moderne Logical Properties
```
/* Direktionale Properties für RTL/LTR Support */
.international-component {
  /* Statt margin-left/right */
  margin-inline-start: var(--space-m);
  margin-inline-end: var(--space-s);
  
  /* Statt margin-top/bottom */
  margin-block-start: var(--space-s);
  margin-block-end: var(--space-m);
  
  /* Shorthand Properties */
  padding-inline: var(--space-m);
  padding-block: var(--space-s);
  
  /* Border Properties */
  border-inline-start: 3px solid var(--color-primary-500);
  border-start-start-radius: var(--radius-md);
  border-end-start-radius: var(--radius-md);
  
  /* Text Alignment */
  text-align: start; /* Statt left */
}

.text-end {
  text-align: end; /* Statt right */
}

/* Responsive Logical Properties */
@media (min-width: 768px) {
  .international-component {
    padding-inline: var(--space-l);
    margin-inline: auto;
    max-inline-size: 1200px; /* Statt max-width */
  }
}

/* RTL-spezifische Anpassungen */
[dir="rtl"] .arrow::after {
  content: "←";
}

[dir="ltr"] .arrow::after {
  content: "→";
}
```

## 6. Color Functions & Modern Color

### Erweiterte Color Functions
```
:root {
  /* Basis-Farben in OKLCH für bessere Farbmanipulation */
  --base-color: oklch(60% 0.15 240);
  
  /* Color-mix für Farbvariationen (experimentell) */
  --mixed-light: color-mix(in oklch, var(--base-color) 70%, white);
  --mixed-dark: color-mix(in oklch, var(--base-color), black 20%);
  
  /* Relative Color Syntax (experimentell) */
  --lighter-variant: oklch(from var(--base-color) calc(l + 0.2) c h);
  --desaturated: oklch(from var(--base-color) l calc(c * 0.5) h);
  --hue-shifted: oklch(from var(--base-color) l c calc(h + 180));
  
  /* Fallbacks für Browser ohne neue Color Functions */
  --mixed-light: hsl(240, 100%, 80%);
  --mixed-dark: hsl(240, 100%, 40%);
  --lighter-variant: hsl(240, 100%, 70%);
  --desaturated: hsl(240, 50%, 60%);
  --hue-shifted: hsl(60, 100%, 60%);
}

/* Automatische Theme-Anpassung mit light-dark() */
@supports (color: light-dark(white, black)) {
  .theme-aware-card {
    background: light-dark(white, #1f2937);
    color: light-dark(#111827, #f9fafb);
    border: 1px solid light-dark(#e5e7eb, #374151);
  }
}

/* Fallback für Browser ohne light-dark() */
@supports not (color: light-dark(white, black)) {
  .theme-aware-card {
    background: white;
    color: #111827;
    border: 1px solid #e5e7eb;
  }
  
  @media (prefers-color-scheme: dark) {
    .theme-aware-card {
      background: #1f2937;
      color: #f9fafb;
      border: 1px solid #374151;
    }
  }
}
```

## 7. Performance-optimierte Selektoren

### Selector Performance Best Practices
```
/* GOOD - Spezifisch und flach */
.btn-primary {
  background: var(--color-primary-500);
  color: white;
}

.nav-link {
  color: var(--color-gray-700);
  text-decoration: none;
}

/* AVOID - Zu tiefe Verschachtelung */
/* .container .sidebar .nav .menu .item .link { } */

/* GOOD - Moderne Selektoren effizient nutzen */
:is(.btn, .button):is(.primary, .main) {
  background: var(--color-primary-500);
}

/* GOOD - Klare Spezifität */
.button {
  /* Base styles */
  display: inline-flex;
  align-items: center;
  padding: var(--space-s) var(--space-m);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.button--primary {
  /* Variant styles */
  background: var(--color-primary-500);
  color: white;
}

/* AVOID - Universeller Selector mit Nachfahren */
/* * + * { margin-top: 1rem; } */

/* BETTER - Spezifische Stack-Klasse */
.stack > * + * {
  margin-top: var(--space-s);
}
```
```

Diese korrigierte und erweiterte Dokumentation behebt alle Hauptprobleme:

## Hauptverbesserungen:

1. **CSS Nesting Syntax**: Korrigiert auf native CSS-Nesting-Syntax mit `&`
2. **Browser Support**: Realistische Feature Queries und Fallbacks hinzugefügt
3. **Konsistente Variablen**: Einheitliche Naming-Konventionen durchgehend
4. **Korrekte Selektoren**: Alle CSS-Selektoren syntaktisch korrekt
5. **Performance**: Echte Performance-Optimierungen mit messbaren Auswirkungen
6. **Accessibility**: Verbesserte A11y-Praktiken
7. **Fallbacks**: Robuste Fallback-Strategien für alle modernen Features
8. **Moderne Standards**: Auf dem neuesten Stand der CSS-Spezifikationen

Die Dokumentation ist jetzt production-ready und kann direkt für moderne CSS-Entwicklung in 2025 verwendet werden.

[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/9bdbbdd8-9457-4fa7-b859-515553995f2c/paste.txt

# Progressive Enhancement mit Vanilla CSS (Lightning CSS) 2025

## Übersicht
Progressive Enhancement bleibt das Fundament moderner Webentwicklung - in 2025 jedoch mit revolutionären neuen Ansätzen durch Lightning CSS und modernste Browser-Features. Dieser Ansatz sorgt für universelle Zugänglichkeit bei gleichzeitiger Nutzung aller neuen CSS-Funktionen.

## 1. Grundprinzipien Progressive Enhancement 2025

### Core-First Approach mit Lightning CSS
```css
/* 1. Basis-Layer: Funktioniert überall */
@layer base {
  .button {
    /* Minimale, funktionierende Basis */
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: #0066cc;
    color: white;
    text-decoration: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.2;
    text-align: center;
    border-radius: 0.25rem;
  }
  
  .button:hover {
    background: #0052a3;
  }
  
  .button:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
  
  .button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
}

/* 2. Enhancement-Layer: Moderne Features */
@layer enhancements {
  /* CSS Custom Properties Enhancement */
  @supports (color: var(--test)) {
    .button {
      --button-bg: oklch(55% 0.15 240);
      --button-bg-hover: oklch(45% 0.15 240);
      --button-focus: oklch(65% 0.15 240);
      --button-disabled: oklch(85% 0.02 247);
      
      background: var(--button-bg);
      transition: background-color 0.2s ease, transform 0.2s ease;
    }
    
    .button:hover {
      background: var(--button-bg-hover);
      transform: translateY(-1px);
    }
    
    .button:focus {
      outline-color: var(--button-focus);
    }
    
    .button:disabled {
      background: var(--button-disabled);
      transform: none;
    }
  }
  
  /* Container Queries Enhancement */
  @supports (container-type: inline-size) {
    .button-container {
      container-type: inline-size;
      container-name: button-wrapper;
    }
    
    @container button-wrapper (max-width: 200px) {
      .button {
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
      }
    }
    
    @container button-wrapper (min-width: 400px) {
      .button {
        padding: 1rem 2rem;
        font-size: 1.125rem;
        border-radius: 0.5rem;
      }
    }
  }
  
  /* CSS Grid Enhancement */
  @supports (display: grid) {
    .button-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }
  }
}

/* 3. Advanced-Layer: Cutting-edge Features */
@layer advanced {
  /* CSS Nesting Enhancement */
  @supports (selector(&)) {
    .button {
      &:is(:hover, :focus-visible) {
        will-change: transform, background-color;
      }
      
      &:not(:hover):not(:focus-visible) {
        will-change: auto;
      }
      
      &.button--primary {
        --button-bg: var(--color-primary-500);
        --button-bg-hover: var(--color-primary-600);
        
        &:active {
          transform: translateY(1px) scale(0.98);
        }
      }
      
      &.button--secondary {
        background: transparent;
        border: 2px solid var(--button-bg);
        color: var(--button-bg);
        
        &:hover {
          background: var(--button-bg);
          color: white;
        }
      }
    }
  }
  
  /* View Transitions Enhancement */
  @supports (view-transition-name: test) {
    @media (prefers-reduced-motion: no-preference) {
      .button--cta {
        view-transition-name: primary-cta;
      }
      
      ::view-transition-group(primary-cta) {
        animation-duration: 0.3s;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
    }
  }
  
  /* Anchor Positioning Enhancement */
  @supports (position-anchor: --test) {
    .button-tooltip {
      position: absolute;
      position-anchor: --button-anchor;
      position-area: top;
      margin-bottom: 0.5rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    
    .button {
      anchor-name: --button-anchor;
      
      &:is(:hover, :focus-visible) + .button-tooltip {
        opacity: 1;
      }
    }
  }
}
```

## 2. Responsive Design mit Progressive Enhancement

### Mobile-First mit erweiterten Fallbacks
```css
/* Basis: Mobile-optimiert, funktioniert überall */
@layer base {
  .responsive-grid {
    display: block;
    padding: 1rem;
  }
  
  .grid-item {
    margin-bottom: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
  }
}

/* Enhancement: Moderne Layout-Features */
@layer enhancements {
  /* Flexbox Enhancement */
  @supports (display: flex) {
    .responsive-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .grid-item {
      margin-bottom: 0;
    }
  }
  
  /* CSS Grid Enhancement */
  @supports (display: grid) {
    .responsive-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(1rem, 2.5vw, 2rem);
      padding: clamp(1rem, 2.5vw, 2rem);
    }
    
    /* Responsive ohne Media Queries */
    @media (min-width: 768px) {
      .responsive-grid {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }
    }
  }
  
  /* Container Queries Enhancement */
  @supports (container-type: inline-size) {
    .responsive-grid {
      container-type: inline-size;
    }
    
    @container (min-width: 600px) {
      .responsive-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @container (min-width: 900px) {
      .responsive-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    
    @container (min-width: 1200px) {
      .responsive-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }
    }
  }
}

/* Advanced: Cutting-edge responsives Design */
@layer advanced {
  /* Intrinsic Web Design */
  @supports (grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr))) {
    .responsive-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
    }
  }
  
  /* Scroll-Driven Animations */
  @supports (animation-timeline: scroll()) {
    @media (prefers-reduced-motion: no-preference) {
      .grid-item {
        animation: fade-in-up linear forwards;
        animation-timeline: scroll();
        animation-range: entry 0% entry 100%;
        opacity: 0;
      }
      
      @keyframes fade-in-up {
        from {
          opacity: 0;
          transform: translateY(2rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
  }
}
```

## 3. Typography mit Progressive Enhancement

### Robuste, adaptive Typografie
```css
@layer base {
  /* Basis: System-Fonts, funktioniert überall */
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", 
                 "Helvetica Neue", Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    color: #333333;
    background: #ffffff;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: bold;
    line-height: 1.2;
    margin-top: 0;
    margin-bottom: 0.5rem;
  }
  
  h1 { font-size: 2rem; }
  h2 { font-size: 1.75rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.25rem; }
  h5 { font-size: 1.125rem; }
  h6 { font-size: 1rem; }
  
  p {
    margin-top: 0;
    margin-bottom: 1rem;
  }
}

@layer enhancements {
  /* Web Fonts Enhancement mit Fallback */
  @supports (font-display: swap) {
    @font-face {
      font-family: 'InterVariable';
      src: url('/fonts/InterVariable.woff2') format('woff2-variations');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    
    body {
      font-family: 'InterVariable', system-ui, -apple-system, sans-serif;
    }
  }
  
  /* Fluid Typography */
  @supports (font-size: clamp(1rem, 2.5vw, 2rem)) {
    h1 { font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem); }
    h2 { font-size: clamp(1.5rem, 3vw + 1rem, 2.75rem); }
    h3 { font-size: clamp(1.25rem, 2vw + 1rem, 2rem); }
    h4 { font-size: clamp(1.125rem, 1.5vw + 0.5rem, 1.5rem); }
    
    body {
      font-size: clamp(1rem, 0.5vw + 0.875rem, 1.125rem);
    }
    
    p {
      margin-bottom: clamp(0.75rem, 1.5vw, 1.5rem);
    }
  }
  
  /* CSS Custom Properties für Typography Scale */
  @supports (color: var(--test)) {
    :root {
      --font-size-xs: clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem);
      --font-size-sm: clamp(0.875rem, 0.8rem + 0.3vw, 1rem);
      --font-size-base: clamp(1rem, 0.95rem + 0.24vw, 1.125rem);
      --font-size-lg: clamp(1.125rem, 1.07rem + 0.29vw, 1.25rem);
      --font-size-xl: clamp(1.25rem, 1.16rem + 0.43vw, 1.5rem);
      --font-size-2xl: clamp(1.5rem, 1.39rem + 0.61vw, 1.875rem);
      --font-size-3xl: clamp(1.875rem, 1.7rem + 0.87vw, 2.25rem);
      --font-size-4xl: clamp(2.25rem, 2rem + 1.25vw, 3rem);
      
      --line-height-tight: 1.25;
      --line-height-snug: 1.375;
      --line-height-normal: 1.5;
      --line-height-relaxed: 1.625;
      --line-height-loose: 2;
      
      --font-weight-light: 300;
      --font-weight-normal: 400;
      --font-weight-medium: 500;
      --font-weight-semibold: 600;
      --font-weight-bold: 700;
      --font-weight-extrabold: 800;
    }
    
    body {
      font-size: var(--font-size-base);
      line-height: var(--line-height-normal);
    }
    
    h1 {
      font-size: var(--font-size-4xl);
      line-height: var(--line-height-tight);
      font-weight: var(--font-weight-extrabold);
    }
    
    h2 {
      font-size: var(--font-size-3xl);
      line-height: var(--line-height-tight);
      font-weight: var(--font-weight-bold);
    }
    
    .text-balance {
      text-wrap: balance;
    }
  }
}

@layer advanced {
  /* Variable Fonts Enhancement */
  @supports (font-variation-settings: normal) {
    .variable-heading {
      font-variation-settings: 
        "wght" 700,
        "wdth" 100,
        "slnt" 0;
      
      transition: font-variation-settings 0.3s ease;
    }
    
    .variable-heading:hover {
      font-variation-settings: 
        "wght" 800,
        "wdth" 105,
        "slnt" -5;
    }
  }
  
  /* OKLCH Colors für Typography */
  @supports (color: oklch(50% 0.15 240)) {
    :root {
      --text-primary: oklch(15% 0.005 247);
      --text-secondary: oklch(45% 0.005 247);
      --text-tertiary: oklch(65% 0.005 247);
      --text-inverse: oklch(95% 0.005 247);
    }
    
    body {
      color: var(--text-primary);
    }
    
    .text-secondary {
      color: var(--text-secondary);
    }
    
    .text-muted {
      color: var(--text-tertiary);
    }
  }
  
  /* Container-Based Typography */
  @supports (container-type: inline-size) {
    .typography-container {
      container-type: inline-size;
    }
    
    @container (max-width: 400px) {
      .responsive-text {
        font-size: var(--font-size-sm);
        line-height: var(--line-height-snug);
      }
    }
    
    @container (min-width: 401px) and (max-width: 768px) {
      .responsive-text {
        font-size: var(--font-size-base);
        line-height: var(--line-height-normal);
      }
    }
    
    @container (min-width: 769px) {
      .responsive-text {
        font-size: var(--font-size-lg);
        line-height: var(--line-height-relaxed);
      }
    }
  }
}
```

## 4. Interaktivität und Animation mit Fallbacks

### Motion-First mit Accessibility
```css
@layer base {
  /* Basis-Interaktionen ohne Animationen */
  .interactive-button {
    background: #0066cc;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    font-size: 1rem;
    border-radius: 0.25rem;
  }
  
  .interactive-button:hover {
    background: #0052a3;
  }
  
  .interactive-button:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
  
  .interactive-button:active {
    background: #003d7a;
  }
  
  .interactive-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
}

@layer enhancements {
  /* Animationen nur wenn erwünscht */
  @media (prefers-reduced-motion: no-preference) {
    .interactive-button {
      transition: background-color 0.2s ease, transform 0.1s ease;
    }
    
    .interactive-button:hover {
      transform: translateY(-1px);
    }
    
    .interactive-button:active {
      transform: translateY(0);
      transition-duration: 0.05s;
    }
  }
  
  /* CSS Transitions Enhancement */
  @supports (transition-property: transform) {
    @media (prefers-reduced-motion: no-preference) {
      .hover-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .hover-card:hover {
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  /* Will-Change Optimization */
  @supports (will-change: transform) {
    .animated-element {
      transition: transform 0.3s ease;
    }
    
    .animated-element:hover {
      will-change: transform;
    }
    
    .animated-element:not(:hover) {
      will-change: auto;
    }
  }
}

@layer advanced {
  /* Scroll-Driven Animations */
  @supports (animation-timeline: scroll()) {
    @media (prefers-reduced-motion: no-preference) {
      .scroll-reveal {
        animation: reveal-up linear forwards;
        animation-timeline: scroll();
        animation-range: entry 0% entry 50%;
        opacity: 0;
      }
      
      @keyframes reveal-up {
        from {
          opacity: 0;
          transform: translateY(3rem);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .parallax-bg {
        animation: parallax-scroll linear;
        animation-timeline: scroll();
        animation-range: 0px 100vh;
      }
      
      @keyframes parallax-scroll {
        from { transform: translateY(0); }
        to { transform: translateY(-50px); }
      }
    }
  }
  
  /* View Transitions */
  @supports (view-transition-name: test) {
    @media (prefers-reduced-motion: no-preference) {
      .page-transition {
        view-transition-name: main-content;
      }
      
      ::view-transition-group(main-content) {
        animation-duration: 0.4s;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      ::view-transition-old(main-content) {
        animation-name: slide-out-left;
      }
      
      ::view-transition-new(main-content) {
        animation-name: slide-in-right;
      }
      
      @keyframes slide-out-left {
        to { transform: translateX(-100%); }
      }
      
      @keyframes slide-in-right {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    }
  }
  
  /* Complex Interactions */
  @supports (selector(:has(*))) {
    .interactive-group:has(.active-item) .group-item:not(.active-item) {
      opacity: 0.6;
      transform: scale(0.95);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    
    @media (prefers-reduced-motion: reduce) {
      .interactive-group:has(.active-item) .group-item:not(.active-item) {
        opacity: 0.6;
        transform: none;
      }
    }
  }
}
```

## 5. Accessibility-First Progressive Enhancement

### Universelle Zugänglichkeit mit modernen Features
```css
@layer base {
  /* Accessibility-Grundlagen */
  .accessible-content {
    font-size: 16px;
    line-height: 1.5;
    color: #212529;
    background: #ffffff;
  }
  
  .skip-link {
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000000;
    color: #ffffff;
    padding: 8px 16px;
    text-decoration: none;
    font-weight: bold;
    z-index: 9999;
  }
  
  .skip-link:focus {
    top: 6px;
  }
  
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .focus-visible-element:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }
}

@layer enhancements {
  /* Erweiterte Accessibility Features */
  @supports (color: var(--test)) {
    :root {
      /* WCAG AA konformes Farbsystem */
      --text-primary: #212529;
      --text-secondary: #495057;
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fa;
      --focus-color: #0056b3;
      --error-color: #dc3545;
      --success-color: #28a745;
      --warning-color: #ffc107;
      
      /* Spacing für Touch-Targets */
      --touch-target-min: 44px;
      --focus-width: 2px;
      --focus-offset: 2px;
    }
    
    .accessible-content {
      color: var(--text-primary);
      background: var(--bg-primary);
    }
    
    .focus-visible-element:focus {
      outline: var(--focus-width) solid var(--focus-color);
      outline-offset: var(--focus-offset);
    }
  }
  
  /* High Contrast Mode Support */
  @media (prefers-contrast: high) {
    :root {
      --text-primary: #000000;
      --bg-primary: #ffffff;
      --focus-color: #000000;
      --focus-width: 3px;
    }
    
    .button {
      border: 2px solid currentColor;
    }
    
    .card {
      border: 2px solid currentColor;
    }
  }
  
  /* Reduced Motion Preferences */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  
  /* Touch-Optimierung */
  @media (hover: none) and (pointer: coarse) {
    .touch-target {
      min-height: var(--touch-target-min);
      min-width: var(--touch-target-min);
      padding: 0.75rem;
    }
    
    .interactive-element {
      font-size: 1.125rem;
      line-height: 1.4;
    }
  }
}

@layer advanced {
  /* Modern Focus Management */
  @supports (selector(:focus-visible)) {
    .focus-element {
      outline: none;
    }
    
    .focus-element:focus-visible {
      outline: var(--focus-width) solid var(--focus-color);
      outline-offset: var(--focus-offset);
    }
  }
  
  /* Container-Based Accessibility */
  @supports (container-type: inline-size) {
    .accessible-container {
      container-type: inline-size;
    }
    
    @container (max-width: 400px) {
      .responsive-text {
        font-size: 1.125rem; /* Größerer Text auf kleinen Screens */
        line-height: 1.4;
      }
      
      .touch-target {
        min-height: 48px; /* Größere Touch-Targets */
        min-width: 48px;
      }
    }
  }
  
  /* Advanced Color Schemes */
  @supports (color-scheme: light dark) {
    :root {
      color-scheme: light dark;
    }
    
    .adaptive-content {
      background: Canvas;
      color: CanvasText;
    }
    
    .adaptive-button {
      background: ButtonFace;
      color: ButtonText;
      border: 1px solid ButtonBorder;
    }
  }
  
  /* Forced Colors Mode Support */
  @media (forced-colors: active) {
    .forced-colors-aware {
      background: ButtonFace;
      color: ButtonText;
      border: 1px solid ButtonBorder;
    }
    
    .forced-colors-aware:focus {
      outline: 2px solid Highlight;
    }
    
    .forced-colors-aware:hover {
      background: Highlight;
      color: HighlightText;
    }
  }
}
```

## 6. Performance-First Progressive Enhancement

### Optimierte Ladestrategien
```css
/* Critical CSS - sofort geladen */
@layer critical {
  /* Above-the-fold Content */
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: #ffffff;
    border-bottom: 1px solid #e1e5e9;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  
  .hero {
    padding: 2rem 1rem;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 50vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .hero h1 {
    font-size: clamp(1.75rem, 4vw, 3.5rem);
    margin-bottom: 1rem;
    font-weight: 700;
  }
}

/* Non-critical CSS - asynchron geladen */
@layer non-critical {
  /* Content Visibility für Performance */
  @supports (content-visibility: auto) {
    .below-fold-section {
      content-visibility: auto;
      contain-intrinsic-size: 0 400px;
    }
    
    .large-content-area {
      content-visibility: auto;
      contain-intrinsic-size: 300px 500px;
    }
  }
  
  /* Lazy-Loading Styles */
  .lazy-image {
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .lazy-image.loaded {
    opacity: 1;
  }
  
  /* Intersection Observer Enhanced */
  .fade-in-observer {
    opacity: 0;
    transform: translateY(2rem);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .fade-in-observer.in-view {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhancement Layer */
@layer performance-enhancements {
  /* Will-Change Optimization */
  @supports (will-change: transform) {
    .performance-critical {
      transition: transform 0.3s ease;
    }
    
    .performance-critical:hover {
      will-change: transform;
      transform: translateY(-2px);
    }
    
    .performance-critical:not(:hover) {
      will-change: auto;
    }
  }
  
  /* CSS Containment */
  @supports (contain: layout) {
    .independent-component {
      contain: layout style paint;
    }
    
    .list-container {
      contain: layout;
    }
    
    .animation-container {
      contain: paint;
    }
  }
  
  /* Resource Hints Integration */
  .preload-optimized {
    /* Styles für preload-optimierte Inhalte */
    font-display: swap;
  }
}
```

## 7. Lightning CSS Build Integration

### Moderne Build-Pipeline
```javascript
// lightningcss.config.js - Optimale Progressive Enhancement Konfiguration
module.exports = {
  // Browser-Targets für Progressive Enhancement
  targets: {
    // Basis-Support
    chrome: 88,
    firefox: 85,
    safari: 14,
    edge: 88,
    // Moderne Browser für Enhancement-Layer
    modern: {
      chrome: 108,
      firefox: 108,
      safari: 16,
      edge: 108
    }
  },
  
  // Feature-Flags
  include: [
    'nesting',
    'custom-media-queries',
    'oklch-colors',
    'color-mix'
  ].join(' | '),
  
  // Automatische Vendor-Prefixes
  autoprefixer: true,
  
  // CSS Layers Unterstützung
  cssLayers: true,
  
  // Minification für Produktion
  minify: process.env.NODE_ENV === 'production',
  
  // Source Maps für Development
  sourceMap: process.env.NODE_ENV === 'development',
  
  // Custom At-Rules für Progressive Enhancement
  customAtRules: {
    'layer': true,
    'supports': true,
    'container': true
  },
  
  // Bundle-Splitting
  bundleSplitting: {
    critical: /critical\.css$/,
    components: /components\/.*\.css$/,
    utilities: /utilities\.css$/,
    enhancements: /enhancements\.css$/
  }
};
```

### Loading-Strategie Template
```html



  
  
  
  
  
    @layer critical { /* Minimale Basis-Styles hier */ }
  
  
  
  
  
  
  
    
  
  
  
  
  
  Progressive Enhancement 2025


  
  
    
  


```

## 8. Testing und Monitoring

### Feature Detection und Fallback-Testing
```css
/* Test-Utilities für Progressive Enhancement */
@layer testing {
  /* Feature Detection Indicator */
  .feature-test {
    position: fixed;
    top: 0;
    left: -9999px;
    opacity: 0;
    pointer-events: none;
  }
  
  .feature-test::before {
    content: "base";
  }
  
  @supports (display: grid) {
    .feature-test.grid-test::before {
      content: "grid";
    }
  }
  
  @supports (container-type: inline-size) {
    .feature-test.container-test::before {
      content: "container";
    }
  }
  
  @supports (color: oklch(50% 0.2 240)) {
    .feature-test.color-test::before {
      content: "oklch";
    }
  }
  
  @supports (view-transition-name: test) {
    .feature-test.transition-test::before {
      content: "view-transitions";
    }
  }
}

/* Performance Monitoring */
@layer monitoring {
  /* Content-Visibility Performance Indicators */
  @supports (content-visibility: auto) {
    .performance-monitor {
      content-visibility: auto;
      contain-intrinsic-size: 0 100px;
    }
    
    .performance-monitor::before {
      content: "content-visibility: supported";
      position: absolute;
      top: -20px;
      font-size: 12px;
      color: green;
    }
  }
  
  @supports not (content-visibility: auto) {
    .performance-monitor::before {
      content: "content-visibility: not-supported";
      position: absolute;
      top: -20px;
      font-size: 12px;
      color: red;
    }
  }
}
```

Dieser umfassende Progressive Enhancement-Ansatz mit Lightning CSS für 2025 gewährleistet universelle Funktionalität bei optimaler Nutzung moderner Browser-Features. Die Schichtung in `@layer` ermöglicht präzise Kontrolle über CSS-Prioritäten, während Feature Queries für robuste Fallbacks sorgen. Das Ergebnis: Websites, die für jeden funktionieren, aber für moderne Browser außergewöhnlich gut optimiert sind.

[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/9bdbbdd8-9457-4fa7-b859-515553995f2c/paste.txt


# View Transitions 2025: Ultra-Moderne Performance für SPA & MPA Anwendungen

## Übersicht
View Transitions sind die revolutionärste CSS-Innovation für 2025 und ermöglichen native, browser-optimierte Übergänge zwischen verschiedenen Views - sowohl in Single Page Applications (SPAs) als auch Multi Page Applications (MPAs)[1][2]. Diese API eliminiert die Notwendigkeit schwerer JavaScript-Libraries und bietet GPU-beschleunigte, performante Animationen direkt über den Browser[3].

## 1. View Transitions API Grundlagen 2025

### Moderne Browser-Unterstützung
```css
/* Feature Detection für progressive Enhancement */
@supports (view-transition-name: test) {
  /* View Transitions werden unterstützt */
  .transition-element {
    view-transition-name: unique-transition;
  }
}

/* Basis-Fallback ohne View Transitions */
@supports not (view-transition-name: test) {
  .transition-element {
    transition: all 0.3s ease;
  }
}

/* Automatische Cross-Document Transitions für MPAs */
@view-transition {
  navigation: auto;
}

/* Accessibility-First Approach */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

### Performance-optimierte Basis-Implementation
```css
:root {
  /* View Transition Performance-Variablen */
  --vt-duration-fast: 200ms;
  --vt-duration-normal: 300ms;
  --vt-duration-slow: 500ms;
  --vt-easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --vt-easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --vt-easing-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* GPU-optimierte Standard-Transitions */
::view-transition-group(*) {
  animation-duration: var(--vt-duration-normal);
  animation-timing-function: var(--vt-easing-smooth);
  animation-fill-mode: both;
  transform: translateZ(0); /* GPU-Layer erzwingen */
}

::view-transition-old(*) {
  animation-name: fade-out;
}

::view-transition-new(*) {
  animation-name: fade-in;
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 2. SPA View Transitions - Ultra-Performance 2025



### Erweiterte SPA Transition-Patterns
```css
/* Named Transitions für verschiedene Route-Typen */
.route-home { view-transition-name: home-page; }
.route-profile { view-transition-name: profile-page; }
.route-settings { view-transition-name: settings-page; }

/* Spezifische Animationen pro Route */
::view-transition-old(home-page) {
  animation: slide-out-left var(--vt-duration-fast) var(--vt-easing-smooth);
}

::view-transition-new(profile-page) {
  animation: slide-in-right var(--vt-duration-fast) var(--vt-easing-smooth);
}

/* Container-basierte Transitions */
@container (min-width: 768px) {
  ::view-transition-group(main-content) {
    animation-duration: var(--vt-duration-slow);
  }
}

@container (max-width: 767px) {
  ::view-transition-group(main-content) {
    animation-duration: var(--vt-duration-fast);
  }
}

/* Shared Element Transitions */
.shared-avatar {
  view-transition-name: user-avatar;
  border-radius: var(--radius-full);
  transition: transform var(--vt-duration-normal) var(--vt-easing-smooth);
}

.shared-title {
  view-transition-name: page-title;
  font-weight: 600;
  color: var(--color-gray-900);
}

/* Komplexe Multi-Element Transitions */
.card-grid-item {
  view-transition-name: card-${cardId}; /* Dynamisch via JS gesetzt */
}

::view-transition-group(card-*) {
  animation-duration: var(--vt-duration-normal);
  animation-timing-function: var(--vt-easing-spring);
}
```

### Performance-optimierte JavaScript-Integration
```javascript
class HighPerformanceViewTransitions {
  constructor() {
    this.isSupported = 'startViewTransition' in document;
    this.transitionQueue = new Map();
    this.performanceObserver = this.initPerformanceObserver();
  }

  // Performance Monitoring
  initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure' && entry.name.includes('view-transition')) {
            console.log(`View Transition Performance: ${entry.duration}ms`);
            
            // Performance-Optimierung bei langsamen Transitions
            if (entry.duration > 500) {
              this.optimizeSlowTransitions();
            }
          }
        });
      });
      observer.observe({ entryTypes: ['measure'] });
      return observer;
    }
    return null;
  }

  // Intelligente Transition-Auswahl basierend auf Device Performance
  async startOptimizedTransition(callback, options = {}) {
    if (!this.isSupported) {
      callback();
      return;
    }

    // Device Performance Detection
    const deviceMemory = navigator.deviceMemory || 4;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const connectionSpeed = this.getConnectionSpeed();

    // Adaptive Transition-Konfiguration
    const transitionConfig = this.getAdaptiveConfig(
      deviceMemory, 
      hardwareConcurrency, 
      connectionSpeed
    );

    // Performance-markierte Transition
    performance.mark('view-transition-start');

    try {
      const transition = document.startViewTransition(() => {
        requestAnimationFrame(callback);
      });

      // Transition-spezifische Optimierungen anwenden
      this.applyTransitionOptimizations(transitionConfig);

      await transition.finished;
      
      performance.mark('view-transition-end');
      performance.measure('view-transition', 'view-transition-start', 'view-transition-end');
      
    } catch (error) {
      console.warn('View Transition failed, falling back:', error);
      callback();
    }
  }

  getAdaptiveConfig(memory, cores, speed) {
    // Low-end device optimization
    if (memory = 8 && cores >= 8 && speed === 'fast') {
      return {
        duration: 500,
        complexity: 'complex',
        gpuAcceleration: true
      };
    }
    
    // Mid-range default
    return {
      duration: 300,
      complexity: 'moderate',
      gpuAcceleration: true
    };
  }

  getConnectionSpeed() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'unknown';
    
    const effectiveType = connection.effectiveType;
    if (effectiveType === '4g') return 'fast';
    if (effectiveType === '3g') return 'medium';
    return 'slow';
  }

  optimizeSlowTransitions() {
    // Dynamische Performance-Optimierung
    document.documentElement.style.setProperty('--vt-duration-normal', '200ms');
    document.documentElement.style.setProperty('--vt-easing-smooth', 'ease');
    
    // Komplexe Animationen deaktivieren
    const complexElements = document.querySelectorAll('[data-complex-transition]');
    complexElements.forEach(el => el.style.viewTransitionName = 'none');
  }
}

// Usage
const vt = new HighPerformanceViewTransitions();

// Optimierte Navigation
function navigateWithTransition(newRoute) {
  vt.startOptimizedTransition(() => {
    // Route change logic
    updateRoute(newRoute);
    updateDOM();
  });
}
```

## 3. MPA View Transitions - Cross-Document Performance

### CSS-only Cross-Document Transitions[4][5]
```css
/* Automatische MPA Transitions aktivieren */
@view-transition {
  navigation: auto;
}

/* Selektive MPA Transitions für spezifische Navigation */
@view-transition {
  navigation: auto;
  /* Nur für same-origin Navigationen */
}

/* Performance-optimierte MPA Basis-Styles */
::view-transition-group(root) {
  animation-duration: 250ms;
  animation-timing-function: ease-out;
  animation-fill-mode: both;
}

/* Spezifische Page-to-Page Transitions */
.page-home {
  view-transition-name: page-content;
}

.page-about {
  view-transition-name: page-content;
}

.page-contact {
  view-transition-name: page-content;
}

/* Shared Elements zwischen Seiten */
.site-header {
  view-transition-name: main-header;
  position: sticky;
  top: 0;
  z-index: 50;
}

.site-logo {
  view-transition-name: brand-logo;
  transition: transform 0.3s ease;
}

.main-navigation {
  view-transition-name: primary-nav;
}

/* Page-spezifische Animationen */
::view-transition-old(page-content) {
  animation: page-slide-out 300ms ease-in;
}

::view-transition-new(page-content) {
  animation: page-slide-in 300ms ease-out;
}

@keyframes page-slide-out {
  from { 
    transform: translateX(0); 
    opacity: 1; 
  }
  to { 
    transform: translateX(-100px); 
    opacity: 0; 
  }
}

@keyframes page-slide-in {
  from { 
    transform: translateX(100px); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
}
```

### Advanced MPA Patterns mit Conditional Logic
```javascript
// Moderne MPA View Transitions mit Navigation API
class ModernMPATransitions {
  constructor() {
    this.initializeMPATransitions();
    this.setupPerformanceOptimizations();
  }

  initializeMPATransitions() {
    // Feature Detection für Cross-Document Transitions
    if ('startViewTransition' in document) {
      this.setupCrossDocumentTransitions();
    }
    
    // Navigation API Integration
    if ('navigation' in window) {
      this.setupNavigationAPI();
    }
  }

  setupCrossDocumentTransitions() {
    // Conditional Cross-Document Transitions
    const style = document.createElement('style');
    style.textContent = `
      @view-transition {
        navigation: auto;
        types: slide;
      }
    `;
    document.head.appendChild(style);
  }

  setupNavigationAPI() {
    window.navigation.addEventListener('navigate', (event) => {
      // Nur für same-origin Navigationen
      if (event.destination.url && new URL(event.destination.url).origin === location.origin) {
        this.handleMPATransition(event);
      }
    });
  }

  handleMPATransition(event) {
    const destination = new URL(event.destination.url);
    const current = new URL(location.href);
    
    // Verschiedene Transition-Types basierend auf Navigation
    const transitionType = this.getTransitionType(current, destination);
    
    // Performance-Check vor Transition
    if (this.shouldOptimizeForPerformance()) {
      this.applyPerformanceOptimizations(transitionType);
    }
    
    // Custom Transition Logic
    this.applyCustomTransitionLogic(current, destination);
  }

  getTransitionType(current, destination) {
    // Home to any page
    if (current.pathname === '/' && destination.pathname !== '/') {
      return 'home-to-page';
    }
    
    // Page to home
    if (current.pathname !== '/' && destination.pathname === '/') {
      return 'page-to-home';
    }
    
    // Page to page
    if (current.pathname !== '/' && destination.pathname !== '/') {
      return 'page-to-page';
    }
    
    return 'default';
  }

  applyCustomTransitionLogic(current, destination) {
    // Dynamic view-transition-name assignment
    const pageType = destination.pathname.split('/')[1] || 'home';
    
    // Set specific transition names based on destination
    document.documentElement.style.setProperty(
      '--current-page-transition', 
      `page-${pageType}`
    );
    
    // Apply conditional animations
    this.setConditionalAnimations(current, destination);
  }

  setConditionalAnimations(current, destination) {
    const style = document.createElement('style');
    const currentPath = current.pathname;
    const destPath = destination.pathname;
    
    // Direction-based animations
    if (this.isForwardNavigation(currentPath, destPath)) {
      style.textContent = `
        ::view-transition-old(root) {
          animation: slide-out-left 300ms ease-in;
        }
        ::view-transition-new(root) {
          animation: slide-in-right 300ms ease-out;
        }
      `;
    } else {
      style.textContent = `
        ::view-transition-old(root) {
          animation: slide-out-right 300ms ease-in;
        }
        ::view-transition-new(root) {
          animation: slide-in-left 300ms ease-out;
        }
      `;
    }
    
    document.head.appendChild(style);
    
    // Cleanup after transition
    setTimeout(() => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 500);
  }

  isForwardNavigation(current, destination) {
    // Simple forward navigation detection
    const routes = ['/', '/about', '/services', '/contact'];
    const currentIndex = routes.indexOf(current);
    const destIndex = routes.indexOf(destination);
    
    return destIndex > currentIndex;
  }

  shouldOptimizeForPerformance() {
    // Performance-based decisions
    const connection = navigator.connection;
    if (connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g')) {
      return true;
    }
    
    // Low device memory
    if (navigator.deviceMemory && navigator.deviceMemory  {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'largest-contentful-paint') {
            // View Transitions add ~70ms to LCP on mobile[7]
            if (entry.startTime > 3000) { // >3s LCP
              this.disableTransitionsForPerformance();
            }
          }
        });
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  disableTransitionsForPerformance() {
    const style = document.createElement('style');
    style.textContent = `
      @view-transition {
        navigation: none;
      }
      ::view-transition-group(*),
      ::view-transition-old(*),
      ::view-transition-new(*) {
        animation: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize MPA Transitions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ModernMPATransitions();
  });
} else {
  new ModernMPATransitions();
}
```

## 4. Performance-Optimierungen für View Transitions 2025

### Hardware-beschleunigte Animationen
```css
/* GPU-Layer-Optimierung für View Transitions */
::view-transition-group(*) {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
  will-change: transform, opacity;
}

/* Memory-effiziente Animationen */
@media (max-width: 768px) {
  ::view-transition-group(*) {
    animation-duration: 200ms; /* Schneller auf Mobile */
  }
}

/* Low-end Device Optimizations */
@media (max-width: 480px) and (max-resolution: 1dppx) {
  ::view-transition-group(*) {
    animation-duration: 150ms;
    animation-timing-function: ease; /* Einfache Easing-Function */
  }
  
  /* Komplexe Animationen deaktivieren */
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-name: simple-fade;
  }
}

@keyframes simple-fade {
  from { opacity: 1; }
  to { opacity: 0; }
}

/* High-refresh-rate Display Optimizations */
@media (min-resolution: 120dpi) {
  ::view-transition-group(*) {
    animation-duration: 400ms; /* Längere Animationen für smooth displays */
    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
}

/* Prefers-reduced-data Optimization */
@media (prefers-reduced-data: reduce) {
  @view-transition {
    navigation: none;
  }
  
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

### Content-Visibility Integration für bessere Performance
```css
/* Performance-optimierte Page-Transitions */
.page-content {
  content-visibility: auto;
  contain-intrinsic-size: 0 800px;
  view-transition-name: main-content;
}

/* Lazy-Loading mit View Transitions */
.lazy-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 400px;
}

.lazy-section.visible {
  view-transition-name: lazy-content;
}

/* Intersection Observer für dynamische Transition-Namen */
@supports (view-transition-name: test) {
  .observed-element {
    transition: view-transition-name 0.1s ease;
  }
  
  .observed-element.in-viewport {
    view-transition-name: active-element;
  }
}
```

## 5. Framework-Integration 2025



### Astro Integration mit Cross-Document Transitions
```astro
---
// src/layouts/Layout.astro - Astro 5+ mit nativen MPA Transitions
export interface Props {
  title: string;
  transitionName?: string;
}

const { title, transitionName = 'default' } = Astro.props;
---



  
  
  {title}
  
  
    @view-transition {
      navigation: auto;
    }
    
    .page-content {
      view-transition-name: page-{transitionName};
    }
    
    /* Astro-spezifische Optimierungen */
    ::view-transition-group(page-default) {
      animation-duration: 300ms;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Island-based component transitions */
    .astro-island {
      view-transition-name: island-component;
    }
  


  
    
  


```

## 6. Advanced Customization & Debug-Tools 2025

### Debug und Performance-Monitoring
```javascript
// View Transition Debug & Performance Tool
class ViewTransitionDebugger {
  constructor() {
    this.transitions = [];
    this.performanceMetrics = new Map();
    this.initDebugMode();
  }

  initDebugMode() {
    if (process.env.NODE_ENV === 'development') {
      this.enableVisualDebug();
      this.setupPerformanceMonitoring();
      this.createDebugPanel();
    }
  }

  enableVisualDebug() {
    const style = document.createElement('style');
    style.textContent = `
      /* Debug-Styles für View Transitions */
      ::view-transition-group(*) {
        outline: 2px solid red !important;
        outline-offset: 2px !important;
      }
      
      ::view-transition-old(*) {
        outline: 2px solid blue !important;
      }
      
      ::view-transition-new(*) {
        outline: 2px solid green !important;
      }
      
      /* Debug Info Overlay */
      .debug-transition-info {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        max-width: 300px;
      }
    `;
    document.head.appendChild(style);
  }

  setupPerformanceMonitoring() {
    // Original startViewTransition überschreiben für Monitoring
    if ('startViewTransition' in document) {
      const originalStartViewTransition = document.startViewTransition;
      
      document.startViewTransition = (callback) => {
        const startTime = performance.now();
        const transitionId = `transition-${Date.now()}`;
        
        console.log(`🎬 View Transition started: ${transitionId}`);
        
        const transition = originalStartViewTransition.call(document, callback);
        
        transition.ready.then(() => {
          const readyTime = performance.now();
          console.log(`🎭 Transition ready: ${transitionId} (${readyTime - startTime}ms)`);
        });
        
        transition.finished.then(() => {
          const finishTime = performance.now();
          const duration = finishTime - startTime;
          
          this.logTransitionMetrics(transitionId, {
            duration,
            startTime,
            finishTime
          });
          
          console.log(`✅ Transition finished: ${transitionId} (${duration}ms)`);
          
          // Performance-Warnung bei langsamen Transitions
          if (duration > 500) {
            console.warn(`⚠️ Slow transition detected: ${transitionId} took ${duration}ms`);
          }
        }).catch((error) => {
          console.error(`❌ Transition failed: ${transitionId}`, error);
        });
        
        return transition;
      };
    }
  }

  logTransitionMetrics(id, metrics) {
    this.performanceMetrics.set(id, metrics);
    
    // Durchschnittliche Performance berechnen
    const allMetrics = Array.from(this.performanceMetrics.values());
    const avgDuration = allMetrics.reduce((sum, m) => sum + m.duration, 0) / allMetrics.length;
    
    console.log(`📊 Average transition duration: ${avgDuration.toFixed(2)}ms`);
  }

  createDebugPanel() {
    const panel = document.createElement('div');
    panel.className = 'debug-transition-info';
    panel.innerHTML = `
      View Transitions Debug
      Transitions: 0
      Avg Duration: 0ms
      Last: -
      Close
    `;
    
    document.body.appendChild(panel);
    
    // Panel aktualisieren
    setInterval(() => {
      this.updateDebugPanel(panel);
    }, 1000);
  }

  updateDebugPanel(panel) {
    const metrics = Array.from(this.performanceMetrics.values());
    const avgDuration = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length 
      : 0;
    
    panel.querySelector('#transition-count').textContent = `Transitions: ${metrics.length}`;
    panel.querySelector('#avg-duration').textContent = `Avg Duration: ${avgDuration.toFixed(2)}ms`;
    
    if (metrics.length > 0) {
      const lastMetric = metrics[metrics.length - 1];
      panel.querySelector('#last-transition').textContent = 
        `Last: ${lastMetric.duration.toFixed(2)}ms`;
    }
  }
}

// Initialize in development
if (typeof window !== 'undefined') {
  new ViewTransitionDebugger();
}
```

## 7. Browser-Support & Progressive Enhancement 2025

### Robuste Fallback-Strategien
```css
/* Progressive Enhancement für View Transitions */
@layer view-transitions {
  /* Basis-Fallback ohne View Transitions */
  .transition-element {
    transition: all 0.3s ease;
    opacity: 1;
  }

  .transition-element.hidden {
    opacity: 0;
    transform: translateY(20px);
  }

  /* Enhanced Styles mit View Transition Support */
  @supports (view-transition-name: test) {
    .transition-element {
      view-transition-name: dynamic-element;
      transition: none; /* Browser-native Transitions übernehmen */
    }
    
    .transition-element.hidden {
      opacity: 1; /* Nicht mehr benötigt */
      transform: none;
    }
  }

  /* Feature Query für Cross-Document Support */
  @supports at-rule(@view-transition) {
    @view-transition {
      navigation: auto;
    }
  }

  @supports not at-rule(@view-transition) {
    /* MPA Fallback mit traditionellen Page-Transitions */
    body {
      animation: page-fade-in 0.3s ease-out;
    }
    
    @keyframes page-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  }
}
```

View Transitions für 2025 repräsentieren einen Paradigmenwechsel in der Webentwicklung - sie bieten native, browser-optimierte Animationen sowohl für SPAs als auch MPAs[1][6][3]. Mit GPU-Beschleunigung, intelligenter Performance-Optimierung und robuster Progressive Enhancement sind sie das mächtigste Werkzeug für moderne, performante User Experiences. Die API eliminiert die Notwendigkeit schwerer JavaScript-Libraries und ermöglicht es, dass traditionelle MPAs mit nativen Apps konkurrieren können[7], während SPAs von reduzierten Bundle-Größen und verbesserter Performance profitieren[6][8].

[1] https://www.jonoalderson.com/conjecture/its-time-for-modern-css-to-kill-the-spa/
[2] https://www.rumvision.com/blog/smooth-page-navigations-with-the-view-transition-api/
[3] https://www.devtoolsacademy.com/blog/enhancing-web-experiences-with-the-view-transitions-api/
[4] https://blog.logrocket.com/how-to-implement-view-transitions-multi-page-apps/
[5] https://www.bram.us/2025/01/26/mpa-view-transitions-deep-dive/
[6] https://semaphore.io/blog/view-transitions-api-spas
[7] https://github.com/WordPress/performance/issues/1963
[8] https://www.debugbear.com/blog/view-transitions-spa-without-framework
[9] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/9bdbbdd8-9457-4fa7-b859-515553995f2c/paste.txt
[11] https://www.corewebvitals.io/pagespeed/view-transition-web-performance
[12] https://www.dhiwise.com/blog/design-converter/understanding-view-transitions-for-seamless-ui-design
[13] https://github.com/antonioalanxs/View-Transitions-API
[14] https://developer.chrome.com/docs/web-platform/view-transitions
[15] https://www.infoq.com/news/2025/04/interop-2025-key-features/
[16] https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
[17] https://www.freecodecamp.org/news/how-to-use-the-view-transition-api/
[18] https://www.youtube.com/watch?v=quvE1uu1f_I
[20] https://docs.astro.build/en/guides/view-transitions/
[21] https://tylergaw.com/blog/view-transitions-first-experiments-mpa/


# View Transitions für Bun + Elysia + HTMX + Alpine.js SPA

Hier ist das umgeschriebene Beispiel für deinen modernen Tech-Stack mit View Transitions:

## Backend: Elysia Server Setup

```typescript
// server.ts - Elysia Backend
import { Elysia } from "elysia";
import { html } from "@elysiajs/html";
import { staticPlugin } from "@elysiajs/static";

const app = new Elysia()
  .use(html())
  .use(staticPlugin({
    assets: "public",
    prefix: "/static"
  }))
  
  // Main SPA Route
  .get("/", ({ html }) => html(`
    
    
    
      
      
      Modern SPA mit View Transitions
      
      
      
        @supports (view-transition-name: test) {
          :root {
            --vt-duration-fast: 200ms;
            --vt-duration-normal: 300ms;
            --vt-easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          ::view-transition-group(*) {
            animation-duration: var(--vt-duration-normal);
            animation-timing-function: var(--vt-easing-smooth);
            transform: translateZ(0);
          }
          
          ::view-transition-old(root) {
            animation: slide-out-left var(--vt-duration-fast) ease-in;
          }
          
          ::view-transition-new(root) {
            animation: slide-in-right var(--vt-duration-fast) ease-out;
          }
          
          @keyframes slide-out-left {
            to { transform: translateX(-100px); opacity: 0; }
          }
          
          @keyframes slide-in-right {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        }
        
        .page-content { view-transition-name: main-content; }
        .navigation-button { view-transition-name: nav-button; }
        .user-avatar { view-transition-name: user-avatar; }
        
        /* Base Styles */
        body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; }
        .spa-container { max-width: 1200px; margin: 0 auto; }
        .navigation { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; 
               cursor: pointer; font-weight: 500; transition: all 0.2s ease; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
      
      
      
      
      
      
    
    
      
        
          
            Home
          
          
            Profile
          
          
            Settings
          
        
        
        
          
          
        
      
      
      
        // Modern SPA View Transitions für HTMX + Alpine.js
        function spaApp() {
          return {
            currentRoute: 'home',
            currentContent: 'Welcome HomeInitial content loaded.',
            isTransitioning: false,
            
            // View Transition Navigation
            navigateWithTransition(event, route) {
              event.preventDefault();
              
              if (this.isTransitioning) return;
              if (this.currentRoute === route) return;
              
              this.isTransitioning = true;
              
              // Feature Detection für View Transitions
              if ('startViewTransition' in document) {
                this.performViewTransition(event.target, route);
              } else {
                // Fallback ohne View Transitions
                this.performNavigationFallback(event.target);
              }
            },
            
            performViewTransition(button, route) {
              document.startViewTransition(() => {
                // HTMX Request triggern
                htmx.trigger(button, 'click');
                this.currentRoute = route;
                
                // Performance-Optimierung: GPU-Layer
                this.optimizeTransitionPerformance();
              }).finished.then(() => {
                this.isTransitioning = false;
                this.cleanupTransitionOptimizations();
              }).catch((error) => {
                console.warn('View Transition failed:', error);
                this.isTransitioning = false;
                this.performNavigationFallback(button);
              });
            },
            
            performNavigationFallback(button) {
              // Traditionelle Navigation ohne View Transitions
              const content = document.getElementById('main-content');
              content.style.opacity = '0';
              content.style.transform = 'translateY(20px)';
              
              setTimeout(() => {
                htmx.trigger(button, 'click');
                
                setTimeout(() => {
                  content.style.opacity = '1';
                  content.style.transform = 'translateY(0)';
                  this.isTransitioning = false;
                }, 50);
              }, 150);
            },
            
            optimizeTransitionPerformance() {
              // Will-change für bessere Performance
              const mainContent = document.getElementById('main-content');
              mainContent.style.willChange = 'transform, opacity';
              
              // Device-adaptive Performance
              const deviceMemory = navigator.deviceMemory || 4;
              if (deviceMemory  {
                if (this.isTransitioning) {
                  console.log('🎬 Starting View Transition for:', e.detail.path);
                }
              });
              
              document.body.addEventListener('htmx:afterRequest', (e) => {
                if (e.detail.successful) {
                  console.log('✅ Content loaded successfully');
                } else {
                  console.error('❌ Request failed, falling back');
                  this.isTransitioning = false;
                }
              });
              
              document.body.addEventListener('htmx:afterSettle', (e) => {
                console.log('🎭 View Transition completed');
              });
              
              // Performance Monitoring
              this.initPerformanceMonitoring();
            },
            
            initPerformanceMonitoring() {
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                      console.log(\`📊 Navigation Performance: \${entry.duration}ms\`);
                    }
                  });
                });
                observer.observe({ entryTypes: ['navigation'] });
              }
            }
          }
        }
        
        // Global HTMX Configuration
        htmx.config.globalViewTransitions = true;
        htmx.config.scrollBehavior = 'smooth';
      
    
    
  `))
  
  // Content Routes für SPA
  .get("/content/home", ({ html }) => html(`
    
      🏠 Home Dashboard
      Welcome to your personalized dashboard with smooth View Transitions!
      
        
          Active Users
          1,234
        
        
          Revenue
          €45,678
        
      
    
  `))
  
  .get("/content/profile", ({ html }) => html(`
    
      👤 User Profile
      
        
          JD
        
        
          John Doe
          Senior Developer
          📧 john.doe@example.com
          📍 Berlin, Germany
          Edit Profile
        
      
    
  `))
  
  .get("/content/settings", ({ html }) => html(`
    
      ⚙️ Settings
      
        
          Appearance
          
            
            🌞 Light Theme
          
          
            
            🌙 Dark Theme
          
          
        
        
        
          Notifications
          
            
            Enable push notifications
          
          
            ✅ Notifications are enabled
          
          
            ❌ Notifications are disabled
          
        
      
    
  `))
  
  .listen(3000);

console.log("🚀 Server running at http://localhost:3000");
```

## Enhanced Performance mit Adaptive Loading

```javascript
// public/js/enhanced-transitions.js - Zusätzliche Performance-Features
class EnhancedSPATransitions {
  constructor() {
    this.transitionQueue = new Map();
    this.performanceMetrics = new Map();
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.setupAdvancedFeatures();
  }
  
  detectDeviceCapabilities() {
    return {
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      connection: this.getConnectionSpeed(),
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  }
  
  getConnectionSpeed() {
    const connection = navigator.connection || navigator.mozConnection;
    if (!connection) return 'unknown';
    
    if (connection.effectiveType === '4g' && connection.downlink > 10) return 'fast';
    if (connection.effectiveType === '4g') return 'medium';
    return 'slow';
  }
  
  setupAdvancedFeatures() {
    // Predictive Prefetching
    this.setupPredictivePrefetching();
    
    // Performance Monitoring
    this.setupPerformanceMonitoring();
    
    // Adaptive Transition Configuration
    this.configureAdaptiveTransitions();
  }
  
  setupPredictivePrefetching() {
    // Hover-based prefetching mit HTMX
    document.addEventListener('mouseover', (e) => {
      const button = e.target.closest('[hx-get]');
      if (button && !button.dataset.prefetched) {
        const url = button.getAttribute('hx-get');
        
        setTimeout(() => {
          if (button.matches(':hover')) {
            this.prefetchContent(url);
            button.dataset.prefetched = 'true';
          }
        }, 150); // Delay um accidental hovers zu vermeiden
      }
    });
  }
  
  prefetchContent(url) {
    if (this.deviceCapabilities.connection === 'slow') return;
    
    fetch(url, {
      method: 'GET',
      headers: { 'HX-Request': 'true' }
    }).then(response => response.text()).then(html => {
      // Content in Cache speichern
      sessionStorage.setItem(`prefetch_${url}`, html);
      console.log(`🚀 Prefetched: ${url}`);
    }).catch(err => {
      console.warn('Prefetch failed:', err);
    });
  }
  
  configureAdaptiveTransitions() {
    const { memory, cores, connection, prefersReducedMotion } = this.deviceCapabilities;
    
    let duration = '300ms';
    let easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Low-end device optimization
    if (memory = 8 && cores >= 8 && connection === 'fast' && !prefersReducedMotion) {
      duration = '400ms';
      easing = 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }
    
    document.documentElement.style.setProperty('--vt-duration-adaptive', duration);
    document.documentElement.style.setProperty('--vt-easing-adaptive', easing);
  }
  
  setupPerformanceMonitoring() {
    // Transition Performance Tracking
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('view-transition')) {
            console.log(`📊 Transition Performance: ${entry.duration}ms`);
            
            if (entry.duration > 500) {
              console.warn('⚠️ Slow transition detected, optimizing...');
              this.optimizeForSlowDevice();
            }
          }
        });
      });
      observer.observe({ entryTypes: ['measure'] });
    }
  }
  
  optimizeForSlowDevice() {
    document.documentElement.style.setProperty('--vt-duration-normal', '100ms');
    document.documentElement.style.setProperty('--vt-easing-smooth', 'ease');
    
    // Komplexe Animationen deaktivieren
    const style = document.createElement('style');
    style.textContent = `
      ::view-transition-old(*),
      ::view-transition-new(*) {
        animation: simple-fade 100ms ease;
      }
      @keyframes simple-fade {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize Enhanced Transitions
document.addEventListener('DOMContentLoaded', () => {
  if ('startViewTransition' in document) {
    new EnhancedSPATransitions();
  }
});
```

## Advanced CSS für den Tech-Stack

```css
/* public/css/spa-enhancements.css */
/* Container Queries für responsive SPA Components */
.spa-container {
  container-type: inline-size;
}

@container (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .navigation-button {
    width: 100%;
    text-align: center;
  }
}

/* HTMX Loading States mit View Transitions */
.htmx-request .page-content {
  view-transition-name: loading-content;
}

::view-transition-group(loading-content) {
  animation-duration: var(--vt-duration-adaptive, 300ms);
  animation-timing-function: var(--vt-easing-adaptive, ease);
}

/* Alpine.js Transition Integration */
[x-transition] {
  transition: all 200ms ease;
}

/* Performance-optimierte Shared Elements */
.user-avatar {
  view-transition-name: user-avatar;
  transition: transform 0.3s ease;
  will-change: transform;
}

.stats-grid > div {
  view-transition-name: stats-card;
  transform: translateZ(0); /* GPU Layer */
}

/* Dark Mode Support für den gesamten Stack */
@media (prefers-color-scheme: dark) {
  body {
    background: #0f172a;
    color: #f8fafc;
  }
  
  .btn-primary {
    background: #60a5fa;
  }
  
  .btn-primary:hover {
    background: #3b82f6;
  }
}
```

## Deployment mit Bun

```bash
# package.json
{
  "name": "modern-spa-viewtransitions",
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run --watch server.ts",
    "build": "bun build server.ts --outdir dist",
    "start": "bun run dist/server.js"
  },
  "dependencies": {
    "elysia": "^0.8.17"
  },
  "devDependencies": {
    "bun-types": "latest"
  }
}
```

```bash
# Development starten
bun install
bun run dev

# Production build
bun run build
bun run start
```

## Key Features dieser Implementation:

1. **🎬 Native View Transitions** - Vollständig browser-native ohne zusätzliche Libraries
2. **⚡ Ultra-Fast Backend** - Bun + Elysia für maximale Performance  
3. **🔄 HTMX Integration** - Seamless SPA-Navigation ohne JavaScript-Framework Overhead
4. **🏔️ Alpine.js Reactivity** - Leichtgewichtige State-Management und Interaktivität
5. **📱 Adaptive Performance** - Automatische Optimierung basierend auf Device-Capabilities
6. **🚀 Predictive Prefetching** - Intelligentes Vorladen von Content bei Hover
7. **📊 Performance Monitoring** - Eingebaute Metriken und automatische Optimierung
8. **♿ Accessibility-First** - Respektiert `prefers-reduced-motion` und andere User-Preferences

Diese Lösung kombiniert die Einfachheit von HTMX mit der Power moderner View Transitions und bietet dabei bessere Performance als die meisten React-basierten SPAs bei deutlich weniger Komplexität!

[1] https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/60902517/9bdbbdd8-9457-4fa7-b859-515553995f2c/paste.txt