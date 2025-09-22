/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Enable source maps for development debugging
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = 'cheap-module-source-map';
    }

    return config;
  },

  // SCSS configuration for global mixins
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/styles')],
    prependData: `@import "mixins.scss";`,
  },

  // Proxy API requests to backend in development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: process.env.NEXT_PUBLIC_API_HOST
            ? `${process.env.NEXT_PUBLIC_API_HOST}/api/:path*`
            : 'http://localhost:3001/api/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
