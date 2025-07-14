#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n📦 ${description}`, 'cyan');
  log(`Command: ${command}`, 'yellow');
  
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed successfully`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    process.exit(1);
  }
}

function checkPrerequisites() {
  log('\n🔍 Checking prerequisites...', 'blue');
  
  // Check if assets directory exists
  if (!fs.existsSync('assets')) {
    log('❌ Assets directory not found. Creating...', 'yellow');
    fs.mkdirSync('assets', { recursive: true });
  }
  
  // Check for required icon files
  const requiredIcons = ['icon.ico', 'icon.png'];
  const missingIcons = requiredIcons.filter(icon => !fs.existsSync(path.join('assets', icon)));
  
  if (missingIcons.length > 0) {
    log(`⚠️  Missing icon files: ${missingIcons.join(', ')}`, 'yellow');
    log('Please generate the required icons from assets/icon.svg', 'yellow');
    log('See assets/README-icons.md for instructions', 'yellow');
  }
  
  // Check if release directory exists
  if (fs.existsSync('release')) {
    log('🗑️  Cleaning previous release directory...', 'yellow');
    execSync('rm -rf release');
  }
  
  log('✅ Prerequisites check completed', 'green');
}

function buildApplication() {
  log('\n🏗️  Building Mavit Application', 'bright');
  
  checkPrerequisites();
  
  // Install dependencies
  execCommand('npm install', 'Installing dependencies');
  
  // Build React application
  execCommand('npm run build:react', 'Building React application');
  
  // Build Electron application
  execCommand('npm run build:electron', 'Building Electron application');
  
  // Create release builds
  const platform = process.platform;
  const arch = process.argv.includes('--arch') ? 
    process.argv[process.argv.indexOf('--arch') + 1] : undefined;
  
  if (process.argv.includes('--all') || process.argv.includes('--windows')) {
    execCommand('npm run dist:win', 'Creating Windows installer');
  }
  
  if (process.argv.includes('--all') || process.argv.includes('--linux')) {
    execCommand('npm run dist:linux', 'Creating Linux packages');
  }
  
  if (process.argv.includes('--all') || (!process.argv.includes('--windows') && !process.argv.includes('--linux'))) {
    // Default: build for current platform
    execCommand('npm run dist', `Creating ${platform} package`);
  }
  
  // List created files
  if (fs.existsSync('release')) {
    log('\n📦 Created release files:', 'green');
    const files = fs.readdirSync('release');
    files.forEach(file => {
      const stats = fs.statSync(path.join('release', file));
      const size = (stats.size / 1024 / 1024).toFixed(2);
      log(`  📄 ${file} (${size} MB)`, 'cyan');
    });
  }
  
  log('\n🎉 Build completed successfully!', 'green');
  log('📁 Release files are available in the ./release directory', 'cyan');
}

// Help message
function showHelp() {
  log('\nMavit Build Script', 'bright');
  log('Usage: node scripts/build-release.js [options]', 'cyan');
  log('\nOptions:', 'yellow');
  log('  --all       Build for all platforms', 'reset');
  log('  --windows   Build Windows installer only', 'reset');
  log('  --linux     Build Linux packages only', 'reset');
  log('  --arch      Specify architecture (x64, ia32, arm64)', 'reset');
  log('  --help      Show this help message', 'reset');
  log('\nExamples:', 'yellow');
  log('  node scripts/build-release.js --all', 'reset');
  log('  node scripts/build-release.js --windows', 'reset');
  log('  node scripts/build-release.js --linux --arch x64', 'reset');
}

// Main execution
if (process.argv.includes('--help')) {
  showHelp();
} else {
  buildApplication();
}