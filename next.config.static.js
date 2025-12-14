/**
 * Minimal Next.js Configuration for Build
 * Focus: Reduce memory usage and complete build successfully
 */

const { defaultLocale, locales } = require("./app/locales/locales.json");
const { securityHeaders } = require('./security-headers');
const pkg = require("./package.json");

// Populate build-time variables
process.env.NEXT_PUBLIC_VERSION = `v${pkg.version}`;
if (pkg.repository && pkg.repository.url) {
  process.env.NEXT_PUBLIC_GITHUB_REPO = pkg.repository.url.replace(
    /(\/|\.git)$/,
    ""
  );
}

// GitHub Pages configuration
const isGithubPages = process.env.GITHUB_PAGES === 'true' || process.env.NEXT_PUBLIC_BASE_PATH !== undefined;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (isGithubPages ? '/improvements-ampl' : '');
const assetPrefix = isGithubPages ? basePath + '/' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use export mode in production for GitHub Pages
  output: isGithubPages ? "export" : undefined,
  
  // GitHub Pages configuration
  basePath: basePath,
  assetPrefix: assetPrefix,
  trailingSlash: true, // Required for GitHub Pages

  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,

  pageExtensions: ["js", "ts", "tsx", "mdx"],

  // Optimize images for static export
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true, // Required for static export
  },

  i18n: isGithubPages ? undefined : { locales, defaultLocale },

  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Minimal webpack config
  webpack(config, { dev, isServer }) {
    // Basic React aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      "mapbox-gl": "maplibre-gl",
    };

    // Fix for all MUI packages with directory import issues
    // This resolves ES module directory imports by appending /index.js
    const originalResolve = config.resolve;
    config.resolve = {
      ...originalResolve,
      alias: {
        ...originalResolve.alias,
        // Map common MUI directory imports to their index files
        '@mui/utils/composeClasses': '@mui/utils/composeClasses/index.js',
        '@mui/material/Alert': '@mui/material/Alert/index.js',
        '@mui/material': '@mui/material/index.js',
        '@mui/utils': '@mui/utils/index.js',
        '@mui/icons-material': '@mui/icons-material/index.js',
        '@mui/lab': '@mui/lab/index.js',
      },
    };

    // Add a rule to handle all MUI package imports
    config.module.rules.push({
      test: /\.(js|ts|tsx)$/,
      include: [
        /node_modules\/@mui\/.*/,
      ],
      resolve: {
        fullySpecified: false,
      },
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ['@babel/plugin-transform-runtime'],
          cacheDirectory: false,
        },
      },
    });

    // Basic fallbacks for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }

    // GraphQL files
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: "graphql-tag/loader",
    });

    // Disable source maps in production
    if (!dev) {
      config.devtool = false;
    }

    return config;
  },

  // Disable eslint during builds
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ["app"],
  },

  // Experimental features - minimal set
  experimental: {
    esmExternals: "loose",
    optimizeCss: true,
  },

  // Logging
  logging: {
    level: "error",
    fetches: {
      fullUrl: true,
    },
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;
