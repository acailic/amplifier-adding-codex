#!/bin/bash

# Security audit and check script for CI/CD
# This script performs comprehensive security checks

set -e

echo "🔒 Running security checks..."

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

# Track if any checks fail
FAILED_CHECKS=0

# 1. Run yarn audit
print_status "1. Running dependency vulnerability audit..."
if yarn audit --level=moderate > /dev/null 2>&1; then
    print_status "✅ No moderate or higher vulnerabilities found"
else
    print_error "❌ Vulnerabilities found!"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# 2. Check for hardcoded secrets
print_status "2. Scanning for hardcoded secrets..."
if grep -r -E "password\s*=\s*['\"][^'\"]+['\"]|api[_-]?key\s*=\s*['\"][^'\"]+['\"]|secret[_-]?key\s*=\s*['\"][^'\"]+['\"]" --include="*.js" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules . > /dev/null 2>&1; then
    print_error "❌ Potential hardcoded secrets found!"
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
else
    print_status "✅ No hardcoded secrets detected"
fi

# 3. Generate final report
echo ""
if [ $FAILED_CHECKS -eq 0 ]; then
    print_status "✅ All critical security checks passed!"
    exit 0
else
    print_error "❌ $FAILED_CHECKS security check(s) failed!"
    echo ""
    echo "Please review the output above and fix security issues before deploying."
    exit 1
fi
