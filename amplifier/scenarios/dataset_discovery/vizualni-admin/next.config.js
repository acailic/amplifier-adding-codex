/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Note: i18n is not supported with static exports
  // i18n,
  images: {
    domains: ['localhost'],
    unoptimized: true, // Required for static export
  },
  output: 'export', // Enable static export
  trailingSlash: true, // Add trailing slash for proper static routing
  distDir: 'out', // Output directory for static files
  typescript: {
    // Ignore TypeScript errors in stories during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add webpack alias for @/graphql
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/graphql': require('path').resolve(__dirname, 'graphql'),
    };

    return config;
  },
}

module.exports = nextConfig