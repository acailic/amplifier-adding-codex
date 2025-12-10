#!/bin/bash
set -e

echo "=================================================="
echo "Building for GitHub Pages Deployment"
echo "=================================================="

# Set GitHub Pages environment
export GITHUB_PAGES=true

# Clean previous build
echo "Cleaning previous build..."
rm -rf out

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm ci
fi

# Build the static site
echo "Building static site..."
npm run build:github

# Create .nojekyll file to prevent Jekyll processing
echo "Creating .nojekyll file..."
touch out/.nojekyll

# Create 404 fallback
echo "Setting up 404 fallback..."
if [ -f "out/404.html" ]; then
  mkdir -p out/404
  cp out/404.html out/404/index.html
fi

echo "=================================================="
echo "Build Complete!"
echo "=================================================="
echo "Output directory: ./out"
echo "Base path: /improvements-ampl/"
echo ""
echo "To test locally:"
echo "  npx serve out -p 3000"
echo "  Visit: http://localhost:3000/improvements-ampl/"
echo ""
echo "To deploy:"
echo "  1. Commit the out/ directory (or configure GitHub Actions)"
echo "  2. Push to GitHub"
echo "  3. Configure GitHub Pages in repository settings"
echo "=================================================="
