#!/bin/bash

# Test script for version determination strategy
# This simulates the version determination logic locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TAG_PREFIX="${TAG_PREFIX:-quarkus-base-v}"
BUILD_NUMBER="${BUILD_NUMBER:-999}"

echo "════════════════════════════════════════════════════════════"
echo "  Version Strategy Test Script"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Tag Prefix: ${TAG_PREFIX}"
echo "Build Number: ${BUILD_NUMBER}"
echo ""

# Function to print test header
print_test() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}TEST: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Test 1: Check if exact tag exists on current commit
print_test "1. Checking for exact tag on current commit"
EXACT_TAG=$(git tag --points-at HEAD | grep "^${TAG_PREFIX}" | sort -V | tail -1 || true)

if [ -n "$EXACT_TAG" ]; then
    VERSION=$(echo "$EXACT_TAG" | sed "s/^${TAG_PREFIX}//")

    # Validate semantic version format
    if echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        print_success "Found exact tag: ${EXACT_TAG}"
        print_success "Extracted version: ${VERSION}"
        print_success "This is a RELEASE build"
        echo ""
        echo "Docker tags: ${VERSION}, latest"
        echo "════════════════════════════════════════════════════════════"
        exit 0
    else
        print_error "Tag found but invalid format: ${EXACT_TAG}"
        print_info "Expected format: ${TAG_PREFIX}X.Y.Z"
    fi
else
    print_info "No exact tag found on current commit"
fi

# Test 2: Get latest tag and increment
print_test "2. Finding latest tag for development version"

# Fetch tags
git fetch --tags 2>/dev/null || true

LATEST_TAG=$(git tag -l "${TAG_PREFIX}*" | \
    grep -E "^${TAG_PREFIX}[0-9]+\.[0-9]+\.[0-9]+$" | \
    sort -V | \
    tail -1 || true)

if [ -n "$LATEST_TAG" ]; then
    LATEST_VERSION=$(echo "$LATEST_TAG" | sed "s/^${TAG_PREFIX}//")
    print_success "Found latest tag: ${LATEST_TAG}"
    print_info "Latest version: ${LATEST_VERSION}"

    # Increment patch version
    MAJOR=$(echo "$LATEST_VERSION" | cut -d. -f1)
    MINOR=$(echo "$LATEST_VERSION" | cut -d. -f2)
    PATCH=$(echo "$LATEST_VERSION" | cut -d. -f3)
    NEXT_PATCH=$((PATCH + 1))
    NEXT_VERSION="${MAJOR}.${MINOR}.${NEXT_PATCH}"

    # Get commit hash
    COMMIT_SHORT=$(git rev-parse --short=8 HEAD)

    # Get branch name
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

    VERSION="${NEXT_VERSION}-dev.${BUILD_NUMBER}.${COMMIT_SHORT}"

    print_success "Next version: ${NEXT_VERSION}"
    print_success "Generated development version: ${VERSION}"
    print_info "This is a DEVELOPMENT build"
    echo ""
    echo "Docker tags: ${VERSION}, ${BRANCH}-latest"
    echo "════════════════════════════════════════════════════════════"
    exit 0
else
    print_info "No tags found matching pattern: ${TAG_PREFIX}*"
fi

# Test 3: Initial version (no tags exist)
print_test "3. Generating initial version"

INITIAL_VERSION="0.1.0"
COMMIT_SHORT=$(git rev-parse --short=8 HEAD 2>/dev/null || echo "unknown")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

VERSION="${INITIAL_VERSION}-dev.${BUILD_NUMBER}.${COMMIT_SHORT}"

print_success "Using initial version: ${INITIAL_VERSION}"
print_success "Generated version: ${VERSION}"
print_info "This is a DEVELOPMENT build (no tags exist)"
echo ""
echo "Docker tags: ${VERSION}, ${BRANCH}-latest"
echo "════════════════════════════════════════════════════════════"

# Additional diagnostics
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Diagnostic Information"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "All tags matching pattern:"
git tag -l "${TAG_PREFIX}*" | sort -V || echo "  (none)"
echo ""
echo "Current branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
echo "Current commit: $(git rev-parse HEAD 2>/dev/null || echo 'unknown')"
echo "Commit (short): $(git rev-parse --short=8 HEAD 2>/dev/null || echo 'unknown')"
echo ""
echo "Tags on current commit:"
git tag --points-at HEAD || echo "  (none)"
echo ""
echo "═══════════════════════════════════════════════════════════"
