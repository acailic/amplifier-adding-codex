/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'my-value',
  },
  async rewrites() {
    return [
      {
        source: '/api/charts/:path*',
        destination: '/api/routes/charts',
      },
      {
        source: '/api/subscriptions/:path*',
        destination: '/api/routes/subscriptions',
      },
      {
        source: '/api/teams/:path*',
        destination: '/api/routes/teams',
      },
      {
        source: '/api/referrals/:path*',
        destination: '/api/routes/referrals',
      },
    ];
  },
  async headers() {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'http://localhost:3000', // Development
      'http://localhost:3001', // Alternative development port
    ];

    // Add production domains if configured
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()));
    }

    // Staging and production domains
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(
        'https://devbirthchart.com',
        'https://www.devbirthchart.com',
        'https://app.devbirthchart.com'
      );
    }

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { 
            key: 'Access-Control-Allow-Origin', 
            value: allowedOrigins.join(',') 
          },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Origin, X-Requested-With, Accept' 
          },
          { key: 'Access-Control-Max-Age', value: '86400' }, // 24 hours
          { key: 'Vary', value: 'Origin' },
        ],
      },
      // Security headers for all routes
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
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: process.env.NODE_ENV === 'production' ? 'max-age=31536000; includeSubDomains; preload' : 'max-age=0',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
        ],
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Add custom webpack config here if needed
    return config;
  },
};

module.exports = nextConfig;
