const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const crypto = require('crypto');

// GitHub Pages configuration
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGithubPages ? '/improvements-ampl' : '';
const assetPrefix = isGithubPages ? '/improvements-ampl/' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // GitHub Pages configuration
  basePath: basePath,
  assetPrefix: assetPrefix,
  output: 'export', // Enable static export for GitHub Pages
  trailingSlash: true, // Required for GitHub Pages

  // Disable service worker for static deployment
  // Service workers require proper HTTPS and scope configuration
  // which is complex with GitHub Pages subdirectory deployments

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable compression
  compress: true,

  // Optimize images for static export
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
    unoptimized: true, // Required for static export
  },

  // Performance budgets
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react'],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: 'shared',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
          charts: {
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            name: 'charts',
            priority: 25,
            chunks: 'async',
          },
          ui: {
            test: /[\\/]node_modules[\\/](lucide-react|@headlessui)[\\/]/,
            name: 'ui',
            priority: 24,
            chunks: 'async',
          },
        },
      };

      // Production optimizations
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },

  // Performance headers
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);