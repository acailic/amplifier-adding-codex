/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config');

const isProduction = process.env.NODE_ENV === 'production';
const isStaticExport = process.env.EXPORT_MODE === 'static';

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Enable compression in production
  compress: true,

  // Static export configuration
  output: isStaticExport ? 'export' : undefined,
  trailingSlash: isStaticExport ? true : false,
  distDir: 'out',
  images: {
    domains: ['localhost'],
    unoptimized: isStaticExport ? true : false,
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // TypeScript and ESLint configuration
  typescript: {
    ignoreBuildErrors: false, // Keep this false in production
  },
  eslint: {
    ignoreDuringBuilds: isProduction, // Ignore in production builds
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@headlessui/react',
    ],
  },

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: function(config, { isServer }) {
      if (!isServer) {
        config.optimization.splitChunks.cacheGroups = {
          ...config.optimization.splitChunks.cacheGroups,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
        };
      }
      return config;
    },
  }),

  // Webpack aliases and custom config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add webpack alias for @/graphql
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/graphql': require('path').resolve(__dirname, 'graphql'),
    };

    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          ...(!isStaticExport ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            },
          ] : []),
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
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
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },

  // Redirects for static export
  ...(isStaticExport && {
    async redirects() {
      return [
        {
          source: '/button-demo',
          destination: '/button-demo.html',
          permanent: true,
        },
        {
          source: '/demos',
          destination: '/demos.html',
          permanent: true,
        },
      ];
    },
  }),
};

module.exports = nextConfig;