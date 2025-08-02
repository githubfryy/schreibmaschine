/**
 * VentoJS Template Service
 *
 * Modern TypeScript-native template engine with async support
 * Replaces custom mustache-style implementation for better maintainability
 */

import vento from 'ventojs';
import type { Environment, TemplateResult } from 'ventojs/src/environment.js';
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
  private static vento: Environment;
  private static readonly VIEWS_PATH = join(process.cwd(), 'src', 'views');

  /**
   * Initialize VentoJS engine with configuration
   */
  private static initializeVento() {
    if (!TemplateService.vento) {
      TemplateService.vento = vento({
        includes: TemplateService.VIEWS_PATH,
        autoescape: true,
        dataVarname: 'it',
      });

      // Add custom filters for Schreibmaschine
      TemplateService.setupCustomFilters();
    }
    return TemplateService.vento;
  }

  /**
   * Setup custom filters for workshop app
   */
  private static setupCustomFilters() {
    const env = TemplateService.vento;

    // German date formatting
    env.filters['formatDate'] = (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    // German time formatting
    env.filters['formatTime'] = (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // German datetime formatting
    env.filters['formatDateTime'] = (date: Date | string) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    // Text truncation
    env.filters['truncate'] = (text: string, length: number = 100) => {
      if (!text || text.length <= length) return text;
      return text.substring(0, length) + '...';
    };

    // Capitalize first letter (German-aware)
    env.filters['capitalize'] = (text: string) => {
      if (!text) return text;
      return text.charAt(0).toUpperCase() + text.slice(1);
    };

    // JSON stringify for debugging
    env.filters['json'] = (obj: any, indent: number = 2) => {
      return JSON.stringify(obj, null, indent);
    };

    // Activity status translation
    env.filters['activityStatus'] = (status: string) => {
      const statusMap: Record<string, string> = {
        setup: 'Vorbereitung',
        active: 'Aktiv',
        paused: 'Pausiert',
        completed: 'Abgeschlossen',
      };
      return statusMap[status] || status;
    };

    // Participant count formatting
    env.filters['participantCount'] = (count: number) => {
      if (count === 1) return '1 Teilnehmer';
      return `${count} Teilnehmer`;
    };
  }

  /**
   * Render a page with optional layout
   */
  static async render(
    pageName: string,
    data: TemplateData = {},
    options: TemplateOptions = {}
  ): Promise<string> {
    const env = TemplateService.initializeVento();

    // Prepare template data with global variables
    const templateData = {
      ...data,
      ...options,
      // Global template variables
      appVersion: process.env['APP_VERSION'] || '1.0.0',
      isDevelopment: process.env.NODE_ENV === 'development',
      currentYear: new Date().getFullYear(),
    };

    try {
      // Determine template file
      const templateFile = `pages/${pageName}.vto`;

      // Render the page
      const result: TemplateResult = await env.run(templateFile, templateData);
      return result.content;
    } catch (error) {
      console.error('VentoJS Template Error:', error);
      // Fallback error template
      return TemplateService.renderErrorFallback(pageName, error as Error);
    }
  }

  /**
   * Render a component template
   */
  static async renderComponent(componentName: string, data: TemplateData = {}): Promise<string> {
    const env = TemplateService.initializeVento();

    try {
      const templateFile = `components/${componentName}.vto`;
      const result: TemplateResult = await env.run(templateFile, data);
      return result.content;
    } catch (error) {
      console.error(`VentoJS Component Error (${componentName}):`, error);
      return `<!-- Component error: ${componentName} -->`;
    }
  }

  /**
   * Render from string (useful for dynamic templates)
   */
  static async renderString(templateString: string, data: TemplateData = {}): Promise<string> {
    const env = TemplateService.initializeVento();

    try {
      const result: TemplateResult = await env.runString(templateString, data);
      return result.content;
    } catch (error) {
      console.error('VentoJS String Template Error:', error);
      return `<!-- Template error: ${(error as Error).message} -->`;
    }
  }

  /**
   * Error fallback when template fails
   */
  private static renderErrorFallback(templateName: string, error: Error): string {
    const isDev = process.env.NODE_ENV === 'development';
    
    return `
      <!DOCTYPE html>
      <html lang="de">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Template Error - Schreibmaschine</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 2rem; }
          .error { background: #fee; border: 1px solid #fcc; padding: 1rem; border-radius: 4px; }
          .error h1 { color: #c00; margin-top: 0; }
          pre { background: #f5f5f5; padding: 1rem; overflow: auto; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>🛠️ Template-Fehler</h1>
          <p>Die Vorlage <strong>${templateName}</strong> konnte nicht geladen werden.</p>
          ${isDev ? `<pre>${error.stack}</pre>` : ''}
          <p><a href="/">← Zurück zur Startseite</a></p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Clear template cache (useful for development)
   */
  static clearCache(): void {
    if (TemplateService.vento) {
      TemplateService.vento.cache.clear();
    }
  }

  /**
   * Get cache statistics (for debugging)
   */
  static getCacheStats(): { size: number; keys: string[] } {
    if (!TemplateService.vento) {
      return { size: 0, keys: [] };
    }

    const cache = TemplateService.vento.cache;
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
  }
}