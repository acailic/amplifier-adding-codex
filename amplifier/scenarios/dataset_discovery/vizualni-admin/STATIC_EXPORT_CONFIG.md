# Static Export Configuration

## Changes Made for Static Export

### 1. Next.js Configuration
- Added `output: 'export'` to enable static export
- Added `trailingSlash: true` for proper static routing
- Added `distDir: 'out'` to specify output directory
- Added `images.unoptimized: true` (required for static export)
- Disabled i18n configuration (not supported with static export)

### 2. Scripts Added
- `build:static`: Build and export static site
- `serve:static`: Serve static site locally for testing

### 3. API Routes
- Removed `/pages/api/health.js` (API routes not supported in static export)
- Added `/public/health.json` as static health check endpoint

### 4. Internationalization
Since Next.js i18n is not supported with static export, we need to:
- Use client-side i18n libraries (like react-i18next)
- Or create separate static pages for each language
- Or handle language detection and routing on the client side

### 5. Build and Deploy
```bash
# Build static site
npm run build:static

# Test locally
npm run serve:static

# Deploy the `out` folder to any static hosting service
```

### 6. Notes
- The static export will be in the `out` directory
- All pages must be statically pre-rendered
- No server-side functionality is supported
- Dynamic routes need `generateStaticParams()` for static generation