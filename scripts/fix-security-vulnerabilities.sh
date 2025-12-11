#!/bin/bash

# Security vulnerability fix script for vizualni-admin
# This script updates known vulnerable packages to secure versions

set -e

echo "🔒 Starting security vulnerability fixes..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting package updates..."

# Update packages with known vulnerabilities
print_status "1. Updating critical packages..."

# Update semver (critical DoS vulnerability)
yarn add --dev -W semver@7.6.3

# Update glob (command injection vulnerability)
print_status "2. Updating glob package..."
yarn add --dev -W glob@10.5.0

# Update follow-redirects (cookies leakage)
print_status "3. Updating follow-redirects..."
yarn add -W follow-redirects@1.15.9

# Update webpack-dev-server (multiple vulnerabilities)
print_status "4. Updating webpack-dev-server..."
yarn add --dev -W webpack-dev-server@4.15.2

# Update cross-spawn (regular expression DoS)
print_status "5. Updating cross-spawn..."
yarn add --dev -W cross-spawn@7.0.6

# Update node-fetch (multiple issues)
print_status "7. Updating node-fetch..."
yarn add --dev -W node-fetch@2.7.0

# Update json5 (prototype pollution)
print_status "8. Updating json5..."
yarn add --dev -W json5@2.2.3

# Update js-yaml (code execution)
print_status "9. Updating js-yaml..."
yarn add --dev -W js-yaml@4.1.0

# Update terser (copy-props pollution)
print_status "10. Updating terser..."
yarn add --dev -W terser@5.34.1

# Update postcss (regular expression DoS)
print_status "11. Updating postcss..."
yarn add -W postcss@8.4.49

# Update browserslist (regular expression DoS) 
print_status "12. Updating browserslist..."
yarn add --dev -W browserslist@4.24.4

# Update loader-utils (regular expression DoS)
print_status "13. Updating loader-utils..."
yarn add --dev -W loader-utils@3.2.1

# Update xml2js (regular expression DoS)
print_status "15. Updating xml2js..."
yarn add --dev -W xml2js@0.6.2

# Update marked (regular expression DoS)
print_status "16. Updating marked..."
yarn add --dev -W marked@12.0.2

# Update async (regular expression DoS)
print_status "17. Updating async..."
yarn add --dev -W async@3.2.6

# Update minimist (prototype pollution)
print_status "19. Updating minimist..."
yarn add --dev -W minimist@1.2.8

print_status "✅ Package updates completed!"

# Add security resolutions to package.json if not present
print_status "20. Adding security resolutions..."

# Backup package.json
cp package.json package.json.backup

# Use Node.js to update resolutions in package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add or update resolutions with secure versions
const securityResolutions = {
  'debug': '^4.3.4',
  'deepmerge': '^4.3.1',
  'fork-ts-checker-webpack-plugin': '^9.0.2',
  'html-webpack-plugin': '^5.6.3',
  'immutable': '^4.3.7',
  'kizu': '^5.8.9',
  'nice-try': '^3.0.1', 
  'node-forge': '^1.3.1',
  'postcss': '^8.4.49',
  'selfsigned': '^2.4.1',
  'strip-ansi': '^7.1.0',
  'trim-newlines': '^5.0.1',
  'webpack': '^5.97.1',
  'webpack-bundle-analyzer': '^4.10.2',
  'webpack-dev-middleware': '^7.4.2',
  'webpack-dev-server': '^4.15.2',
  'webpack-hot-middleware': '^2.26.1',
  'webpack-plugin-serve': '^1.6.0'
};

// Merge with existing resolutions
pkg.resolutions = {
  ...pkg.resolutions,
  ...securityResolutions
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

print_status "✅ Security resolutions added!"

echo ""
echo "🔒 Security update process completed!"
echo ""
echo "⚠️  Important notes:"
echo "1. Some vulnerabilities may require manual code changes"
echo "2. The html-minifier package has no patch available - consider alternatives"
echo "3. The 'request' package is deprecated - migrate to fetch/axios when possible"
echo "4. Review the audit output above for any remaining issues"
echo ""
echo "📋 Next steps:"
echo "1. Run tests: yarn test"
echo "2. Check for breaking changes: yarn build"
echo "3. Review any remaining vulnerabilities manually"
echo "4. Consider adding CSP headers and other security configurations"
