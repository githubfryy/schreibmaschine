/**
 * Simple VentoJS Template Validation Test
 * Validates that all templates have proper syntax and structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, 'src/views');

function findTemplateFiles(dir) {
  const files = [];
  
  function scanDir(currentDir) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      
      if (item.isDirectory()) {
        scanDir(fullPath);
      } else if (item.name.endsWith('.vto')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(dir);
  return files;
}

function validateVentoTemplate(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const errors = [];
  const relativePath = path.relative(__dirname, filePath);
  
  // Check for basic VentoJS syntax patterns
  const layoutMatches = content.match(/\{\{\s*layout\s+/g);
  const layoutCloses = content.match(/\{\{\s*\/layout\s*\}\}/g);
  
  // If template uses layout, ensure it has closing tag
  if (layoutMatches && layoutMatches.length > 0) {
    if (!layoutCloses || layoutCloses.length !== layoutMatches.length) {
      errors.push('Missing or mismatched {{ /layout }} closing tags');
    }
  }
  
  // Check for proper VentoJS conditional syntax
  const ifMatches = content.match(/\{\{\s*if\s+/g);
  const ifCloses = content.match(/\{\{\s*\/if\s*\}\}/g);
  
  if (ifMatches && ifCloses) {
    if (ifMatches.length !== ifCloses.length) {
      errors.push('Mismatched {{ if }} and {{ /if }} tags');
    }
  }
  
  // Check for proper VentoJS loop syntax
  const forMatches = content.match(/\{\{\s*for\s+/g);
  const forCloses = content.match(/\{\{\s*\/for\s*\}\}/g);
  
  if (forMatches && forCloses) {
    if (forMatches.length !== forCloses.length) {
      errors.push('Mismatched {{ for }} and {{ /for }} tags');
    }
  }
  
  // Check for old mustache syntax that needs conversion
  const oldMustache = content.match(/\{\{[#/][^}]*\}\}/g);
  if (oldMustache) {
    errors.push(`Found old mustache syntax: ${oldMustache.join(', ')}`);
  }
  
  // Basic HTML validation - check for unclosed tags
  const openTags = content.match(/<([a-zA-Z][^>\s]*)[^>]*>/g) || [];
  const closeTags = content.match(/<\/([a-zA-Z][^>\s]*)[^>]*>/g) || [];
  
  const openTagNames = openTags
    .filter(tag => !tag.includes('/>') && !['br', 'hr', 'img', 'input', 'meta', 'link'].some(self => tag.includes(self)))
    .map(tag => tag.match(/<([a-zA-Z][^>\s]*)/)?.[1])
    .filter(Boolean);
    
  const closeTagNames = closeTags
    .map(tag => tag.match(/<\/([a-zA-Z][^>\s]*)/)?.[1])
    .filter(Boolean);
  
  // Simple check - this isn't perfect but catches major issues
  const tagBalance = {};
  openTagNames.forEach(tag => tagBalance[tag] = (tagBalance[tag] || 0) + 1);
  closeTagNames.forEach(tag => tagBalance[tag] = (tagBalance[tag] || 0) - 1);
  
  const unbalancedTags = Object.entries(tagBalance)
    .filter(([_, count]) => count !== 0)
    .map(([tag, count]) => `${tag} (${count > 0 ? '+' : ''}${count})`);
    
  if (unbalancedTags.length > 0) {
    errors.push(`Potentially unbalanced HTML tags: ${unbalancedTags.join(', ')}`);
  }
  
  return { path: relativePath, errors };
}

function main() {
  console.log('🧪 Validating VentoJS Templates...\n');
  
  if (!fs.existsSync(templatesDir)) {
    console.error(`❌ Templates directory not found: ${templatesDir}`);
    process.exit(1);
  }
  
  const templateFiles = findTemplateFiles(templatesDir);
  
  if (templateFiles.length === 0) {
    console.log('⚠️  No .vto template files found');
    return;
  }
  
  console.log(`Found ${templateFiles.length} template files:\n`);
  
  let totalErrors = 0;
  
  for (const templateFile of templateFiles) {
    const validation = validateVentoTemplate(templateFile);
    
    if (validation.errors.length === 0) {
      console.log(`✅ ${validation.path}`);
    } else {
      console.log(`❌ ${validation.path}`);
      validation.errors.forEach(error => {
        console.log(`   └─ ${error}`);
      });
      totalErrors += validation.errors.length;
    }
  }
  
  console.log(`\n📊 Validation Summary:`);
  console.log(`   Templates checked: ${templateFiles.length}`);
  console.log(`   Total errors: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log(`\n🎉 All templates passed validation!`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Found ${totalErrors} validation errors`);
    process.exit(1);
  }
}

main();