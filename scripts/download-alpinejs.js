#!/usr/bin/env bun

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

// Configuration
const config = {
  assetsDir: './public/js/alpinejs/',
  versionsFile: './scripts/versions-alpinejs.json',
  verbose: true,
};

// All packages to check and download
const packageNames = [
  // Alpine.js core
  'alpinejs',
  // Official Alpine.js plugins
  '@alpinejs/persist',
  '@alpinejs/focus',
  '@alpinejs/collapse',
  '@alpinejs/intersect',
  '@alpinejs/mask',
  '@alpinejs/morph',
  '@alpinejs/anchor',
  '@alpinejs/sort',
  '@alpinejs/ui',
  // Third-party Alpine.js plugins
  '@imacrayon/alpine-ajax',
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
 * Load existing versions from JSON file
 * @returns {Promise<Object>} Existing versions object
 */
async function loadVersions() {
  try {
    const content = await readFile(config.versionsFile, 'utf8');
    return JSON.parse(content);
  } catch (_error) {
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
 * Download a single Alpine.js file
 * @param {string} packageName - NPM package name
 * @param {string} version - Package version
 * @returns {Promise<boolean>} Success status
 */
async function downloadFile(packageName, version) {
  const baseUrl = 'https://cdn.jsdelivr.net/npm';

  // Generate filename and CDN path based on package type
  let filename, cdnPath;

  if (packageName === 'alpinejs') {
    filename = 'alpinejs.js';
    cdnPath = `${packageName}@${version}/dist/cdn.min.js`;
  } else if (packageName === '@imacrayon/alpine-ajax') {
    filename = 'alpine_ajax.js';
    cdnPath = `${packageName}@${version}/dist/cdn.min.js`;
  } else {
    // Official Alpine.js plugins
    filename = `alpinejs_${packageName.replace('@alpinejs/', '').replace('-', '_')}.js`;
    cdnPath = `${packageName}@${version}/dist/cdn.min.js`;
  }

  const url = `${baseUrl}/${cdnPath}`;
  const filepath = join(config.assetsDir, filename);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const content = await response.text();
    await writeFile(filepath, content);

    if (config.verbose) {
      console.log(`✓ Downloaded ${filename} (v${version})`);
    }

    return true;
  } catch (error) {
    console.error(`✗ Failed to download ${filename}:`, error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Alpine.js packages version check & download...');

  // Create assets directory
  await mkdir(config.assetsDir, { recursive: true });

  // Load existing versions
  const currentVersions = await loadVersions();
  const newVersions = {};
  const toDownload = [];

  console.log('📋 Checking package versions...');

  // Check each package for updates
  for (const packageName of packageNames) {
    if (config.verbose) {
      console.log(`🔍 Checking ${packageName}...`);
    }

    const latestVersion = await getLatestVersion(packageName);

    if (!latestVersion) {
      console.warn(`⚠️  Skipping ${packageName} - couldn't get version info`);
      continue;
    }

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
  }

  // Download updated packages
  if (toDownload.length > 0) {
    console.log(`\n⬇️  Downloading ${toDownload.length} updated packages...`);

    let successCount = 0;
    const downloadPromises = toDownload.map(async ({ packageName, version }) => {
      const success = await downloadFile(packageName, version);
      if (success) successCount++;
      return success;
    });

    await Promise.all(downloadPromises);

    console.log(`\n📊 Download results: ${successCount}/${toDownload.length} successful`);

    // Update versions file
    await saveVersions(newVersions);
    console.log(`📝 Updated ${config.versionsFile}`);
  } else {
    console.log('✨ All packages are up to date!');
  }

  console.log('\n🎉 Alpine.js packages version check complete!');
}

// Enhanced argument parsing
const parseArgs = () => {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔧 Alpine.js Packages Version Manager & Downloader

Usage: bun scripts/download-alpine.js [options]

Packages included:
  - alpinejs (core framework)
  - @alpinejs/* (official plugins)
  - @imacrayon/alpine-ajax (AJAX functionality)

Options:
  --assets-dir <path>      Assets directory (default: src/assets/js)
  --versions-file <path>   Versions file (default: versions.json)
  --quiet                  Suppress verbose output
  --force                  Force download all packages
  --help, -h               Show this help

Examples:
  bun scripts/download-alpine.js
  bun scripts/download-alpine.js --assets-dir ./public/js
  bun scripts/download-alpine.js --quiet
  bun scripts/download-alpine.js --force
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

  config.verbose = !args.includes('--quiet');

  // Force download all packages (ignore version cache)
  if (args.includes('--force')) {
    config.force = true;
  }
};

// Parse arguments and run
parseArgs();

// Run the script
main().catch((error) => {
  console.error('💥 Script failed:', error.message);
  if (config.verbose) {
    console.error(error.stack);
  }
  process.exit(1);
});
