# GitHub Pages - Quick Start Guide

## TL;DR - Fix Applied

The service worker 404 error has been fixed by:
1. Disabling service worker for static GitHub Pages deployment
2. Configuring Next.js for `/improvements-ampl/` subdirectory deployment
3. Setting up proper basePath and assetPrefix

## Build and Deploy (3 Steps)

### 1. Build for GitHub Pages
```bash
npm run build:github
```

### 2. Test Locally (Optional)
```bash
npx serve out -p 3000
# Visit: http://localhost:3000/improvements-ampl/
```

### 3. Deploy
Push to GitHub and configure Pages in repository settings.

## What Changed

### Configuration
- **next.config.static.js**: Added GitHub Pages config
  - `basePath: '/improvements-ampl'`
  - `assetPrefix: '/improvements-ampl/'`
  - `output: 'export'`
  - `trailingSlash: true`

### Service Worker
- **Status**: DISABLED for GitHub Pages
- **Reason**: Complex scope configuration for subdirectory deployment
- **Location**: Disabled in `pages/_app.tsx`

### New Files
- `pages/_app.tsx` - App component without service worker
- `.nojekyll` - Prevents Jekyll processing
- `scripts/deploy-github-pages.sh` - Automated deployment script
- `GITHUB_PAGES_DEPLOYMENT.md` - Full documentation
- `GITHUB_PAGES_FIX_SUMMARY.md` - Detailed summary

## Deployment URL

Your site will be available at:
```
https://acailic.github.io/improvements-ampl/
```

All assets are automatically prefixed with `/improvements-ampl/`

## Quick Commands

```bash
# Build for GitHub Pages
npm run build:github

# Build and analyze bundle
GITHUB_PAGES=true npm run build:analyze

# Run deployment script
./scripts/deploy-github-pages.sh

# Test the build locally
npx serve out -p 3000
```

## GitHub Pages Settings

1. Go to: Repository Settings → Pages
2. Set Source: GitHub Actions (or Deploy from a branch)
3. Branch: `main`
4. Folder: `/out` (or `/root` if using Actions)

## Verify Deployment

After deployment, check:
- ✅ Site loads at `https://acailic.github.io/improvements-ampl/`
- ✅ No 404 errors in console
- ✅ No service worker errors
- ✅ All pages accessible
- ✅ Images and assets load

## Need More Details?

- **Full Guide**: `GITHUB_PAGES_DEPLOYMENT.md`
- **Summary**: `GITHUB_PAGES_FIX_SUMMARY.md`
- **Issues**: Check the troubleshooting section in deployment guide

## Re-enabling Service Worker

If deploying to custom domain (no subdirectory):
1. Remove service worker registration from `pages/_app.tsx`
2. Import and call `register()` from `utils/service-worker-registration.ts`
3. Update service worker scope to match deployment path

For subdirectory deployment, service worker scope configuration is complex and not recommended.
