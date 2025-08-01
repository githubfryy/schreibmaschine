#!/usr/bin/env node

/**
 * Offline Template Testing Script
 * 
 * Tests the template system without running the full development server
 * Run with: node test-templates.js
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple template processor (mimics our TemplateService)
class TestTemplateProcessor {
  static renderTemplate(templatePath, data = {}) {
    const fullPath = join(__dirname, 'src/views', `${templatePath}.html`);
    
    if (!existsSync(fullPath)) {
      throw new Error(`Template not found: ${templatePath}.html`);
    }
    
    const template = readFileSync(fullPath, 'utf-8');
    return this.processTemplate(template, data);
  }
  
  static processTemplate(template, data) {
    let result = template;
    
    // Process conditionals: {{#if condition}}...{{/if}}
    result = result.replace(
      /\{\{\s*#if\s+([^}]+)\s*\}\}([\s\S]*?)\{\{\s*\/if\s*\}\}/g, 
      (match, condition, content) => {
        const value = this.getValue(data, condition.trim());
        return this.isTruthy(value) ? this.processTemplate(content, data) : '';
      }
    );
    
    // Process each loops: {{#each array}}...{{/each}}
    result = result.replace(
      /\{\{\s*#each\s+([^}]+)\s*\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g,
      (match, arrayName, content) => {
        const array = this.getValue(data, arrayName.trim());
        if (!Array.isArray(array)) return '';
        
        return array.map((item, index) => {
          const itemData = {
            ...data,
            ...item,
            '@index': index,
            '@first': index === 0,
            '@last': index === array.length - 1
          };
          return this.processTemplate(content, itemData);
        }).join('');
      }
    );
    
    // Process raw variables: {{{variable}}} (no HTML escaping)
    result = result.replace(/\{\{\{\s*([^}]+)\s*\}\}\}/g, (match, varName) => {
      const value = this.getValue(data, varName.trim());
      return String(value || '');
    });
    
    // Process escaped variables: {{variable}} (HTML escaped)
    result = result.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, varName) => {
      const value = this.getValue(data, varName.trim());
      return this.escapeHtml(String(value || ''));
    });
    
    return result;
  }
  
  static getValue(data, path) {
    // Handle helper functions
    if (path.startsWith('eq ')) {
      const [, left, right] = path.split(' ');
      return this.getValue(data, left || '') === this.getValue(data, right || '');
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
  
  static isTruthy(value) {
    if (value == null) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return Boolean(value);
  }
  
  static escapeHtml(text) {
    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    
    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
  }
}

// Test data for different templates
const testData = {
  welcome: {
    bun_version: '1.2.19',
    environment: 'test',
    port: 3000
  },
  
  lobby: {
    workshop: {
      name: 'Test Workshop 2025',
      slug: 'test_workshop_2025'
    },
    writing_group: {
      name: 'Test Schreibgruppe',
      slug: 'test_gruppe',
      description: 'Eine Testgruppe für die Template-Entwicklung'
    },
    participants: [
      { id: '1', display_name: 'Lisa', role: 'teamer' },
      { id: '2', display_name: 'Max', role: 'participant' },
      { id: '3', display_name: 'Anna', role: 'participant' }
    ],
    urls: {
      full_semantic_url: '/test_workshop_2025/test_gruppe',
      short_url: '/gruppe-abc',
      lobby_url: '/test_workshop_2025/test_gruppe/vorraum'
    },
    is_active: true
  },
  
  groupRoom: {
    workshop: {
      name: 'Test Workshop 2025',
      slug: 'test_workshop_2025'
    },
    writing_group: {
      name: 'Test Schreibgruppe',
      slug: 'test_gruppe'
    },
    workshop_group: {
      id: 'wg-123'
    },
    current_participant_id: '1',
    participants: [
      { display_name: 'Du (Lisa)', role: 'teamer', online: true, is_current_user: true },
      { display_name: 'Max', role: 'participant', online: true, is_current_user: false },
      { display_name: 'Anna', role: 'participant', online: false, is_current_user: false }
    ],
    activities: [],
    online_count: 2
  },
  
  error: {
    error_icon: '🔍',
    error_title: 'Test Fehler',
    error_message: 'Dies ist nur ein Test-Fehler.'
  }
};

// Test function
function runTemplateTests() {
  console.log('🧪 Starting Template Tests...\n');
  
  const tests = [
    { name: 'Welcome Page', template: 'pages/welcome', data: testData.welcome },
    { name: 'Lobby Page', template: 'pages/lobby', data: testData.lobby },
    { name: 'Group Room', template: 'pages/group-room', data: testData.groupRoom },
    { name: 'Error Page', template: 'pages/error', data: testData.error }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = TestTemplateProcessor.renderTemplate(test.template, test.data);
      
      // Basic validation
      if (result.includes('{{') && result.includes('}}')) {
        console.log(`❌ ${test.name}: Unprocessed template variables found`);
        failed++;
      } else if (result.length < 100) {
        console.log(`❌ ${test.name}: Output too short (${result.length} chars)`);
        failed++;
      } else {
        console.log(`✅ ${test.name}: OK (${result.length} chars)`);
        passed++;
      }
      
      // Optional: save output for inspection
      // writeFileSync(`test-output-${test.template.replace('/', '-')}.html`, result);
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All template tests passed!');
    return true;
  } else {
    console.log('💥 Some tests failed. Check template syntax and data structure.');
    return false;
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTemplateTests();
}

export { TestTemplateProcessor, runTemplateTests };