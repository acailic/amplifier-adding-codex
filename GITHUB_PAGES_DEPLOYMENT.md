# GitHub Pages Deployment Guide

This document explains the GitHub Pages configuration for the vizualni-admin Next.js application.

## Configuration Overview

### Repository Settings
- **Repository**: acailic/improvements-ampl
- **Base Path**: `/improvements-ampl/` (required for subdirectory deployment)
- **Deployment Branch**: Configure in GitHub Settings > Pages

### Next.js Configuration

The application uses `next.config.static.js` with the following GitHub Pages-specific settings:

```javascript
basePath: '/improvements-ampl'
assetPrefix: '/improvements-ampl/'
output: 'export'
trailingSlash: true
images: { unoptimized: true }
```

### Service Worker Status

**Service Worker is DISABLED for GitHub Pages deployment.**

Reasons:
1. Service workers require proper HTTPS scope configuration
2. GitHub Pages subdirectory deployments complicate service worker scope
3. The service worker path would need to be `/improvements-ampl/sw.js`
4. Service worker registration requires careful scope management

If you need service worker functionality, consider:
- Deploying to a custom domain (no subdirectory)
- Using Vercel, Netlify, or similar platforms
- Configuring service worker scope to match the basePath

## Building for GitHub Pages

### Local Build

```bash
# Set environment variable for GitHub Pages
export GITHUB_PAGES=true

# Build the application
npm run build

# Output will be in the 'out' directory
```

### Build Script

Create a `scripts/build-github-pages.sh`:

```bash
#!/bin/bash
set -e

echo "Building for GitHub Pages deployment..."

# Set GitHub Pages environment
export GITHUB_PAGES=true

# Clean previous build
rm -rf out

# Build the static site
npm run build

# Create .nojekyll file to prevent Jekyll processing
touch out/.nojekyll

# Optional: Add custom 404 page handling
cp out/404.html out/404/index.html 2>/dev/null || true

echo "Build complete! Output in ./out directory"
echo "Deploy the 'out' directory to GitHub Pages"
```

### Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build:github": "GITHUB_PAGES=true next build",
    "export": "next export",
    "deploy:github": "npm run build:github && npm run export"
  }
}
```

## GitHub Actions Workflow

Create `.github/workflows/deploy-github-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with Next.js
        env:
          GITHUB_PAGES: true
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## GitHub Pages Settings

1. Go to your repository settings
2. Navigate to **Pages** section
3. Configure:
   - **Source**: GitHub Actions (recommended) OR Deploy from a branch
   - **Branch**: main (if using branch deployment)
   - **Folder**: /out or /root

## Asset Path Handling

All assets are automatically prefixed with `/improvements-ampl/`:

- Images: `/improvements-ampl/images/logo.png`
- Scripts: `/improvements-ampl/_next/static/...`
- Styles: `/improvements-ampl/_next/static/css/...`

### Using Links in Code

```jsx
// Next.js Link component (automatically handles basePath)
import Link from 'next/link';
<Link href="/about">About</Link>

// Next.js Image component (automatically handles basePath)
import Image from 'next/image';
<Image src="/logo.png" alt="Logo" width={100} height={100} />

// Manual links (use basePath)
const basePath = process.env.NODE_ENV === 'production' ? '/improvements-ampl' : '';
<a href={`${basePath}/static/file.pdf`}>Download</a>
```

## Troubleshooting

### 404 Errors on Page Refresh

**Issue**: Direct navigation to routes shows 404
**Solution**: Enable `trailingSlash: true` in next.config.js (already configured)

### Missing Assets (404 for CSS/JS)

**Issue**: Assets return 404
**Solution**: Ensure `assetPrefix` and `basePath` are set correctly

### Service Worker 404 Error

**Issue**: `Failed to register ServiceWorker`
**Solution**: Service worker is disabled in pages/_app.tsx for static deployment

### Images Not Loading

**Issue**: Images show broken
**Solution**: Ensure `images: { unoptimized: true }` is set (required for static export)

## Local Testing

To test the GitHub Pages build locally:

```bash
# Build for GitHub Pages
GITHUB_PAGES=true npm run build

# Serve the out directory
npx serve out -p 3000

# Visit http://localhost:3000/improvements-ampl/
```

Or use the `basePath` in development:

```bash
# Start dev server with basePath
GITHUB_PAGES=true npm run dev

# Visit http://localhost:3000/improvements-ampl/
```

## Files Changed for GitHub Pages

1. **next.config.static.js**: Added basePath, assetPrefix, output, trailingSlash
2. **pages/_app.tsx**: Created to disable service worker registration
3. **.nojekyll**: Prevents Jekyll processing
4. **public/.nojekyll**: Additional Jekyll bypass

## Deployment Checklist

- [ ] Set `GITHUB_PAGES=true` environment variable
- [ ] Run `npm run build` successfully
- [ ] Verify `out` directory contains all files
- [ ] Check that `out/.nojekyll` exists
- [ ] Deploy `out` directory to GitHub Pages
- [ ] Test deployment URL: https://acailic.github.io/improvements-ampl/
- [ ] Verify all assets load correctly
- [ ] Test navigation between pages
- [ ] Confirm no service worker errors in console

## Alternative Deployment Options

If GitHub Pages subdirectory deployment is problematic, consider:

1. **Custom Domain**: Deploy to root of custom domain
2. **Vercel**: `vercel --prod` (automatic Next.js optimization)
3. **Netlify**: Drag and drop `out` folder
4. **GitHub Pages with Custom Domain**: No basePath needed
5. **Cloudflare Pages**: Direct GitHub integration

## Resources

- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Next.js basePath Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/basePath)
