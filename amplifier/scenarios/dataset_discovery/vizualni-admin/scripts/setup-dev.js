#!/usr/bin/env node

/**
 * Professional Development Environment Setup Script
 * for Vizualni-Admin Demo
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 Setting up Vizualni-Admin Professional Development Environment\n');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Step 1: Check Node.js version
function checkNodeVersion() {
  log('📋 Checking Node.js version...', 'blue');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    log(`❌ Node.js ${nodeVersion} detected. Please upgrade to Node.js 18 or higher.`, 'red');
    process.exit(1);
  }

  log(`✅ Node.js ${nodeVersion} detected`, 'green');
}

// Step 2: Install dependencies
function installDependencies() {
  log('\n📦 Installing dependencies...', 'blue');
  try {
    execSync('npm ci', { stdio: 'inherit' });
    log('✅ Dependencies installed successfully', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    process.exit(1);
  }
}

// Step 3: Check TypeScript configuration
function checkTypeScriptConfig() {
  log('\n🔧 Checking TypeScript configuration...', 'blue');

  const tsconfigPath = path.join(__dirname, '../tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    log('⚠️  TypeScript configuration not found, creating default...', 'yellow');
    const defaultTsConfig = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./*'] }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    };

    fs.writeFileSync(tsconfigPath, JSON.stringify(defaultTsConfig, null, 2));
    log('✅ TypeScript configuration created', 'green');
  } else {
    log('✅ TypeScript configuration exists', 'green');
  }
}

// Step 4: Verify critical components
function verifyComponents() {
  log('\n🧩 Verifying critical components...', 'blue');

  const criticalComponents = [
    'components/ui/Button.tsx',
    'components/layout/MainLayout.tsx',
    'components/layout/Header.tsx',
    'lib/utils/index.ts',
    'lib/data/serbianData.ts'
  ];

  let allExists = true;
  for (const component of criticalComponents) {
    const componentPath = path.join(__dirname, '..', component);
    if (fs.existsSync(componentPath)) {
      log(`✅ ${component}`, 'green');
    } else {
      log(`❌ Missing: ${component}`, 'red');
      allExists = false;
    }
  }

  if (!allExists) {
    log('\n⚠️  Some critical components are missing. The demo may not work properly.', 'yellow');
  }
}

// Step 5: Create development utilities
function createDevUtilities() {
  log('\n🛠️  Creating development utilities...', 'blue');

  // Create .env.local if it doesn't exist
  const envPath = path.join(__dirname, '../.env.local');
  if (!fs.existsSync(envPath)) {
    const envContent = `# Development Environment Variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Vizualni-Admin Demo
NEXT_PUBLIC_APP_DESCRIPTION=Serbian Data Visualization Admin Dashboard

# Feature Flags
NEXT_PUBLIC_ENABLE_STORYBOOK=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# API Configuration (for dynamic features)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
`;
    fs.writeFileSync(envPath, envContent);
    log('✅ Created .env.local', 'green');
  } else {
    log('✅ .env.local already exists', 'green');
  }
}

// Step 6: Build and verify
function buildAndVerify() {
  log('\n🏗️  Building project to verify setup...', 'blue');
  try {
    execSync('npm run type-check', { stdio: 'pipe' });
    log('✅ TypeScript compilation successful', 'green');
  } catch (error) {
    log('⚠️  TypeScript compilation failed. Check errors above.', 'yellow');
  }

  try {
    execSync('npm run build', { stdio: 'pipe' });
    log('✅ Build successful', 'green');
  } catch (error) {
    log('❌ Build failed. Check errors above.', 'red');
    log('\n💡 Try running "npm run dev" to see detailed errors', 'yellow');
  }
}

// Step 7: Show available commands
function showCommands() {
  log('\n📋 Available Development Commands:', 'blue');
  log('  npm run dev          - Start development server', 'reset');
  log('  npm run build        - Build for production', 'reset');
  log('  npm run start        - Start production server', 'reset');
  log('  npm run build:static - Build static export', 'reset');
  log('  npm run serve:static - Serve static export locally', 'reset');
  log('  npm run lint         - Run ESLint', 'reset');
  log('  npm run type-check   - Run TypeScript type checking', 'reset');
  log('  npm run test         - Run unit tests', 'reset');
  log('  npm run test:e2e     - Run end-to-end tests', 'reset');
  log('  npm run storybook    - Start Storybook', 'reset');
}

// Main execution
function main() {
  checkNodeVersion();
  installDependencies();
  checkTypeScriptConfig();
  verifyComponents();
  createDevUtilities();
  buildAndVerify();
  showCommands();

  log('\n✨ Development environment setup complete!\n', 'green');
  log('🎯 Quick start:', 'blue');
  log('  npm run dev', 'reset');
  log('  Then visit http://localhost:3000', 'reset');
  log('\n📊 For button demo:', 'blue');
  log('  Visit http://localhost:3000/button-demo', 'reset');
  log('\n🏢 For dashboard demo:', 'blue');
  log('  Visit http://localhost:3000/dashboard', 'reset');
  log('\n📁 For datasets demo:', 'blue');
  log('  Visit http://localhost:3000/datasets', 'reset');
  log('\n');
}

if (require.main === module) {
  main();
}