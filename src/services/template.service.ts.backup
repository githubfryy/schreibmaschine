/**
 * Template Service
 *
 * Handles HTML template rendering with simple mustache-style templating
 * Provides a lightweight alternative to full template engines
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface TemplateData {
  [key: string]: any;
}

export interface TemplateOptions {
  layout?: string | false;
  additionalCSS?: string;
  additionalJS?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  title?: string;
  subtitle?: string;
  navigation?: Array<{
    url: string;
    label: string;
    active?: boolean;
  }>;
}

export class TemplateService {
  private static templateCache = new Map<string, string>();
  private static readonly VIEWS_PATH = join(process.cwd(), 'src', 'views');

  /**
   * Render a page with optional layout
   */
  static render(pageName: string, data: TemplateData = {}, options: TemplateOptions = {}): string {
    const pageContent = TemplateService.renderTemplate(`pages/${pageName}`, data);

    if (options.layout !== false && options.layout !== 'none' && options.layout !== undefined) {
      const layoutName = options.layout || 'base';
      const layoutData = {
        ...data,
        ...options,
        content: pageContent,
      };
      return TemplateService.renderTemplate(`layouts/${layoutName}`, layoutData);
    }

    return pageContent;
  }

  /**
   * Render a component template
   */
  static renderComponent(componentName: string, data: TemplateData = {}): string {
    return TemplateService.renderTemplate(`components/${componentName}`, data);
  }

  /**
   * Load and render a template file
   */
  private static renderTemplate(templatePath: string, data: TemplateData): string {
    const fullPath = join(TemplateService.VIEWS_PATH, `${templatePath}.html`);

    // Load template (with caching in production)
    let template: string;
    if (process.env.NODE_ENV === 'production' && TemplateService.templateCache.has(fullPath)) {
      template = TemplateService.templateCache.get(fullPath)!;
    } else {
      try {
        template = readFileSync(fullPath, 'utf-8');
        if (process.env.NODE_ENV === 'production') {
          TemplateService.templateCache.set(fullPath, template);
        }
      } catch (_error) {
        throw new Error(`Template not found: ${templatePath}.html`);
      }
    }

    // Simple template rendering
    return TemplateService.processTemplate(template, data);
  }

  /**
   * Process template with mustache-style syntax
   * Supports: {{variable}}, {{{raw}}}, {{#if condition}}, {{#each array}}, {{> partial}}
   */
  private static processTemplate(template: string, data: TemplateData): string {
    let result = template;

    // Process partials first: {{> component-name}}
    result = result.replace(/\{\{\s*>\s*([^}]+)\s*\}\}/g, (_match, componentName) => {
      try {
        return TemplateService.renderComponent(componentName.trim(), data);
      } catch (_error) {
        console.warn(`Partial not found: ${componentName}`);
        return `<!-- Partial not found: ${componentName} -->`;
      }
    });

    // Process conditionals: {{#if condition}}...{{/if}}
    result = result.replace(
      /\{\{\s*#if\s+([^}]+)\s*\}\}([\s\S]*?)\{\{\s*\/if\s*\}\}/g,
      (_match, condition, content) => {
        const value = TemplateService.getValue(data, condition.trim());
        return TemplateService.isTruthy(value)
          ? TemplateService.processTemplate(content, data)
          : '';
      }
    );

    // Process each loops: {{#each array}}...{{/each}}
    result = result.replace(
      /\{\{\s*#each\s+([^}]+)\s*\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g,
      (_match, arrayName, content) => {
        const array = TemplateService.getValue(data, arrayName.trim());
        if (!Array.isArray(array)) return '';

        return array
          .map((item, index) => {
            const itemData = {
              ...data,
              ...item,
              '@index': index,
              '@first': index === 0,
              '@last': index === array.length - 1,
            };
            return TemplateService.processTemplate(content, itemData);
          })
          .join('');
      }
    );

    // Process raw variables: {{{variable}}} (no HTML escaping)
    result = result.replace(/\{\{\{\s*([^}]+)\s*\}\}\}/g, (_match, varName) => {
      const value = TemplateService.getValue(data, varName.trim());
      return String(value || '');
    });

    // Process escaped variables: {{variable}} (HTML escaped)
    result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_match, varName) => {
      const value = TemplateService.getValue(data, varName.trim());
      return TemplateService.escapeHtml(String(value || ''));
    });

    return result;
  }

  /**
   * Get nested property value from data object
   */
  private static getValue(data: TemplateData, path: string): any {
    // Handle helper functions
    if (path.startsWith('eq ')) {
      const [, left, right] = path.split(' ');
      return (
        TemplateService.getValue(data, left || '') === TemplateService.getValue(data, right || '')
      );
    }

    // Handle direct property access
    const keys = path.split('.');
    let value = data;

    for (const key of keys) {
      if (value == null) return undefined;
      value = value[key];
    }

    return value;
  }

  /**
   * Check if value is truthy for template conditions
   */
  private static isTruthy(value: any): boolean {
    if (value == null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return Boolean(value);
  }

  /**
   * Escape HTML characters
   */
  private static escapeHtml(text: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
  }

  /**
   * Clear template cache (useful for development)
   */
  static clearCache(): void {
    TemplateService.templateCache.clear();
  }
}
