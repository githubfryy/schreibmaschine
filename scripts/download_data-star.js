#!/usr/bin/env bun

import { mkdir, writeFile, readFile, stat } from 'fs/promises';
import { join, resolve } from 'path';

// Configuration
const config = {
  assetsDir: 'src/assets/js',
  versionsFile: 'versions.json',
  verbose: true
};

// Data-Star packages to check and download
const packageNames = [
  '@starfederation/datastar'  // Main Data-Star package
];

/**
 * Fetch the latest version of a package from NPM registry
 * @param {string} packageName - The NPM package name
 * @returns {Promise<string>} Latest version
 */
async function getLatestVersion(packageName) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch package info: ${response.status}`);
    }
    
    const data = await response.json();
    return data.version;
  } catch (error) {
    console.error(`❌ Failed to get latest version for ${packageName}:`, error.message);
    return null;
  }
}

/**
 * Fallback to GitHub releases if NPM fails
 * @returns {Promise<string>} Latest version from GitHub
 */
async function getGitHubVersion() {
  try {
    const response = await fetch('https://api.github.com/repos/starfederation/datastar/releases/latest');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub releases: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present
  } catch (error) {
    console.error(`❌ Failed to get GitHub version:`, error.message);
    return null;
  }
}

/**
 * Load existing versions from JSON file
 * @returns {Promise<Object>} Existing versions object
 */
async function loadVersions() {
  try {
    const content = await readFile(config.versionsFile, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (config.verbose) {
      console.log('📄 No existing versions.json found, creating new one');
    }
    return {};
  }
}

/**
 * Save versions to JSON file
 * @param {Object} versions - Versions object to save
 */
async function saveVersions(versions) {
  await writeFile(config.versionsFile, JSON.stringify(versions, null, 2));
}

/**
 * Check if a package needs updating
 * @param {string} packageName - Package name
 * @param {string} latestVersion - Latest available version
 * @param {Object} currentVersions - Currently installed versions
 * @returns {boolean} True if update is needed
 */
function needsUpdate(packageName, latestVersion, currentVersions) {
  return !currentVersions[packageName] || currentVersions[packageName] !== latestVersion;
}

/**
 * Download Data-Star from multiple possible sources
 * @param {string} version - Package version
 * @returns {Promise<boolean>} Success status
 */
async function downloadDataStar(version) {
  const filename = 'datastar.js';
  const filepath = join(config.assetsDir, filename);
  
  // Try multiple CDN sources
  const sources = [
    // NPM-based CDN (if available)
    `https://cdn.jsdelivr.net/npm/@starfederation/datastar@${version}/dist/datastar.js`,
    // GitHub CDN (current official method)
    `https://cdn.jsdelivr.net/gh/starfederation/datastar@v${version}/bundles/datastar.js`,
    // GitHub main branch (fallback)
    `https://cdn.jsdelivr.net/gh/starfederation/datastar@main/bundles/datastar.js`,
    // Unpkg fallback
    `https://unpkg.com/@starfederation/datastar@${version}/dist/datastar.js`
  ];
  
  for (const [index, url] of sources.entries()) {
    try {
      if (config.verbose) {
        console.log(`🔄 Trying source ${index + 1}/${sources.length}: ${url}`);
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (config.verbose) {
          console.log(`⚠️  Source ${index + 1} failed: HTTP ${response.status}`);
        }
        continue;
      }
      
      const content = await response.text();
      
      // Basic validation - check if it looks like a valid JS file
      if (!content.includes('datastar') && !content.includes('data-')) {
        if (config.verbose) {
          console.log(`⚠️  Source ${index + 1} returned invalid content`);
        }
        continue;
      }
      
      await writeFile(filepath, content);
      
      if (config.verbose) {
        console.log(`✓ Downloaded ${filename} (v${version}) from source ${index + 1}`);
      }
      
      return true;
    } catch (error) {
      if (config.verbose) {
        console.log(`⚠️  Source ${index + 1} error: ${error.message}`);
      }
      continue;
    }
  }
  
  console.error(`✗ Failed to download ${filename} from all sources`);
  return false;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Data-Star version check & download...');
  console.log('🌟 Data-Star: Hypermedia-first reactive framework');
  
  // Create assets directory
  await mkdir(config.assetsDir, { recursive: true });
  
  // Load existing versions
  const currentVersions = await loadVersions();
  const newVersions = { ...currentVersions }; // Preserve other packages
  const toDownload = [];
  
  console.log('📋 Checking Data-Star version...');
  
  // Try to get version from NPM first, then GitHub
  let latestVersion = await getLatestVersion('@starfederation/datastar');
  
  if (!latestVersion) {
    console.log('📡 NPM check failed, trying GitHub releases...');
    latestVersion = await getGitHubVersion();
  }
  
  if (!latestVersion) {
    console.error('❌ Could not determine latest Data-Star version');
    console.log('💡 You can manually specify a version with --version flag');
    return;
  }
  
  const packageName = 'datastar';
  newVersions[packageName] = latestVersion;
  
  if (needsUpdate(packageName, latestVersion, currentVersions)) {
    const oldVersion = currentVersions[packageName] || 'none';
    console.log(`📦 ${packageName}: ${oldVersion} → ${latestVersion}`);
    toDownload.push({ packageName, version: latestVersion });
  } else {
    if (config.verbose) {
      console.log(`✅ ${packageName} is up to date (v${latestVersion})`);
    }
  }
  
  // Download if needed
  if (toDownload.length > 0) {
    console.log(`\n⬇️  Downloading Data-Star v${latestVersion}...`);
    
    const success = await downloadDataStar(latestVersion);
    
    if (success) {
      console.log(`\n📊 Download results: 1/1 successful`);
      
      // Update versions file
      await saveVersions(newVersions);
      console.log(`📝 Updated ${config.versionsFile}`);
      
      // Show usage info
      console.log(`\n💡 Usage in HTML:`);
      console.log(`   <script type="module" src="/assets/js/datastar.js"></script>`);
      
    } else {
      console.log(`\n📊 Download results: 0/1 successful`);
      console.error('❌ Failed to download Data-Star');
    }
    
  } else {
    console.log('✨ Data-Star is up to date!');
  }
  
  console.log('\n🎉 Data-Star version check complete!');
}

// Enhanced argument parsing
const parseArgs = () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🌟 Data-Star Version Manager & Downloader

Usage: bun scripts/download-datastar.js [options]

About Data-Star:
  Data-Star is a hypermedia-first framework that provides:
  - Backend-driven reactivity (like HTMX)
  - Frontend-driven reactivity (like Alpine.js)
  - Server-Sent Events (SSE) support
  - DOM morphing and patching
  - No npm dependencies required

Options:
  --assets-dir <path>      Assets directory (default: src/assets/js)
  --versions-file <path>   Versions file (default: versions.json)
  --version <version>      Force specific version download
  --quiet                  Suppress verbose output
  --help, -h               Show this help

Examples:
  bun scripts/download-datastar.js
  bun scripts/download-datastar.js --assets-dir ./public/js
  bun scripts/download-datastar.js --version 1.0.0-rc4
  bun scripts/download-datastar.js --quiet
    `);
    process.exit(0);
  }

  // Parse options
  const assetsIndex = args.indexOf('--assets-dir');
  if (assetsIndex !== -1 && args[assetsIndex + 1]) {
    config.assetsDir = resolve(args[assetsIndex + 1]);
  }

  const versionsIndex = args.indexOf('--versions-file');
  if (versionsIndex !== -1 && args[versionsIndex + 1]) {
    config.versionsFile = resolve(args[versionsIndex + 1]);
  }

  const versionIndex = args.indexOf('--version');
  if (versionIndex !== -1 && args[versionIndex + 1]) {
    config.forceVersion = args[versionIndex + 1];
  }

  config.verbose = !args.includes('--quiet');
};

// Parse arguments and run
parseArgs();

// Handle forced version
if (config.forceVersion) {
  console.log(`🎯 Force downloading Data-Star v${config.forceVersion}...`);
  
  (async () => {
    await mkdir(config.assetsDir, { recursive: true });
    const success = await downloadDataStar(config.forceVersion);
    
    if (success) {
      const versions = await loadVersions();
      versions.datastar = config.forceVersion;
      await saveVersions(versions);
      console.log(`✅ Successfully downloaded Data-Star v${config.forceVersion}`);
    } else {
      console.error(`❌ Failed to download Data-Star v${config.forceVersion}`);
      process.exit(1);
    }
  })();
} else {
  // Run the normal version check
  main().catch(error => {
    console.error('💥 Script failed:', error.message);
    if (config.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  });
}
