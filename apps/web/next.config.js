/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async rewrites() {
    // In development, proxy API requests to the backend
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: process.env.NEXT_PUBLIC_API_HOST
            ? `${process.env.NEXT_PUBLIC_API_HOST}/api/:path*`
            : 'http://localhost:3001/api/:path*',
        },
        {
          source: '/socket.io/:path*',
          destination: process.env.NEXT_PUBLIC_API_HOST
            ? `${process.env.NEXT_PUBLIC_API_HOST}/socket.io/:path*`
            : 'http://localhost:3001/socket.io/:path*',
        },
      ];
    }
    return [];
  },
  // Enable CORS for development
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
