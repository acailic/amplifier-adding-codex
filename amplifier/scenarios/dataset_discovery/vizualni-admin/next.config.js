/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  images: {
    domains: ['localhost'],
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