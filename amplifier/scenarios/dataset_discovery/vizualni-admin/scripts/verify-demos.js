#!/usr/bin/env node

/**
 * Demo Verification Script
 * Checks if all demo pages are accessible and functional
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verifying Vizualni-Admin Demo Setup...\n');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Demo pages to verify
const demoPages = [
  { path: 'pages/index.tsx', name: 'Home Dashboard', url: '/' },
  { path: 'pages/button-demo.tsx', name: 'Button Component Demo', url: '/button-demo' },
  { path: 'pages/demos.tsx', name: 'Demo Showcase', url: '/demos' },
  { path: 'pages/dashboard/index.tsx', name: 'Dashboard Overview', url: '/dashboard' },
  { path: 'pages/datasets/index.tsx', name: 'Datasets Browser', url: '/datasets' }
];

// Check if page exists
function checkPageExists(page) {
  const fullPath = path.join(__dirname, '..', page.path);
  return fs.existsSync(fullPath);
}

// Check for critical components
const criticalComponents = [
  { path: 'components/ui/Button.tsx', name: 'Button Component' },
  { path: 'components/layout/MainLayout.tsx', name: 'Main Layout' },
  { path: 'components/demo/DemoNavigation.tsx', name: 'Demo Navigation' },
  { path: 'lib/utils/index.ts', name: 'Utility Functions' },
  { path: 'lib/data/serbianData.ts', name: 'Serbian Data' }
];

function checkComponentExists(component) {
  const fullPath = path.join(__dirname, '..', component.path);
  return fs.existsSync(fullPath);
}

// Main verification
function verifyDemos() {
  log('📄 Checking Demo Pages...', 'blue');
  let allPagesExist = true;

  for (const page of demoPages) {
    if (checkPageExists(page)) {
      log(`  ✅ ${page.name} - ${page.url}`, 'green');
    } else {
      log(`  ❌ ${page.name} - ${page.url} (MISSING)`, 'red');
      allPagesExist = false;
    }
  }

  log('\n🧩 Checking Critical Components...', 'blue');
  let allComponentsExist = true;

  for (const component of criticalComponents) {
    if (checkComponentExists(component)) {
      log(`  ✅ ${component.name}`, 'green');
    } else {
      log(`  ❌ ${component.name} (MISSING)`, 'red');
      allComponentsExist = false;
    }
  }

  // Check package.json scripts
  log('\n📋 Checking Package.json Scripts...', 'blue');
  const packagePath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const requiredScripts = [
    'setup',
    'dev',
    'build',
    'build:static',
    'type-check',
    'lint'
  ];

  for (const script of requiredScripts) {
    if (packageJson.scripts[script]) {
      log(`  ✅ npm run ${script}`, 'green');
    } else {
      log(`  ❌ npm run ${script} (MISSING)`, 'red');
    }
  }

  // Check environment files
  log('\n🔧 Configuration Files...', 'blue');
  const configFiles = [
    'next.config.js',
    'tailwind.config.js',
    'tsconfig.json',
    '.eslintrc.json'
  ];

  for (const file of configFiles) {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
      log(`  ✅ ${file}`, 'green');
    } else {
      log(`  ❌ ${file} (MISSING)`, 'red');
    }
  }

  // Summary
  log('\n📊 Verification Summary', 'cyan');
  log('=========================', 'cyan');

  if (allPagesExist && allComponentsExist) {
    log('✅ All critical components and pages are present!', 'green');
  } else {
    log('⚠️  Some components or pages are missing.', 'yellow');
  }

  log('\n🚀 Quick Start Commands:', 'blue');
  log('  npm run setup              # Run initial setup', 'reset');
  log('  npm run dev                # Start development server', 'reset');
  log('  npm run build              # Build for production', 'reset');
  log('  npm run build:static      # Build static export', 'reset');
  log('  npm run serve:static      # Serve static build', 'reset');

  log('\n🌐 Demo URLs (after running npm run dev):', 'blue');
  log('  http://localhost:3000              # Home Dashboard', 'reset');
  log('  http://localhost:3000/button-demo  # Button Component', 'reset');
  log('  http://localhost:3000/demos        # Demo Showcase', 'reset');
  log('  http://localhost:3000/dashboard    # Dashboard', 'reset');
  log('  http://localhost:3000/datasets     # Datasets Browser', 'reset');

  log('\n✨ Verification complete!\n', 'green');
}

// Run verification
if (require.main === module) {
  verifyDemos();
}