const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PROXY_PORT || 3002;

// Proxy configuration
const API_URL = process.env.API_URL || 'http://localhost:3001';
const WEB_URL = process.env.WEB_URL || 'http://localhost:3000';

console.log('🚀 Starting development proxy server...');
console.log(`📡 API: ${API_URL}`);
console.log(`🌐 Web: ${WEB_URL}`);
console.log(`🔗 Proxy: http://localhost:${PORT}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      api: API_URL,
      web: WEB_URL
    }
  });
});

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  logLevel: 'silent',
  onError: (err, req, res) => {
    console.error('❌ API Proxy Error:', err.message);
    res.status(500).json({ 
      error: 'API service unavailable',
      message: 'Backend service is not running. Please start it with: pnpm dev:api'
    });
  }
}));

// Proxy Socket.IO requests to backend
app.use('/socket.io', createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  logLevel: 'silent',
  onError: (err, req, res) => {
    console.error('❌ Socket.IO Proxy Error:', err.message);
  }
}));

// Proxy all other requests to Next.js
app.use('/', createProxyMiddleware({
  target: WEB_URL,
  changeOrigin: true,
  logLevel: 'silent',
  onError: (err, req, res) => {
    console.error('❌ Web Proxy Error:', err.message);
    res.status(500).send(`
      <html>
        <head><title>Service Unavailable</title></head>
        <body>
          <h1>Service Unavailable</h1>
          <p>Frontend service is not running. Please start it with: pnpm dev:web</p>
          <p>Or start both services with: pnpm dev:all</p>
        </body>
      </html>
    `);
  }
}));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Available commands:');
  console.log('  pnpm dev:all     - Start both web and API servers');
  console.log('  pnpm dev:web     - Start only Next.js frontend');
  console.log('  pnpm dev:api     - Start only Express backend');
  console.log('  pnpm dev:proxy   - Start all services with proxy');
  console.log('');
  console.log('🔗 Access your app at: http://localhost:3002');
  console.log('🔗 API endpoints at: http://localhost:3002/api');
  console.log('🔗 Health check at: http://localhost:3002/health');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down proxy server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down proxy server...');
  process.exit(0);
}); 