/**
 * Application-wide constants.
 */
export const SALT_ROUNDS = 10;

export const MIN_PASSWORD_LENGTH = 6;

/**
 * CORS configuration for different environments
 */
export const CORS_OPTIONS = {
  development: {
    origin: [
      'http://localhost:3000', // Next.js development server
      'http://localhost:3001', // Backend server (if needed)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
    ],
  },
  production: {
    origin: [
      // Add your production domains here
      // 'https://yourdomain.com',
      // 'https://www.yourdomain.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  },
  test: {
    origin: true, // Allow all origins in test environment
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  },
};

/**
 * Get CORS options based on current environment
 */
export const getCorsOptions = () => {
  const env = process.env.NODE_ENV || 'development';
  return (
    CORS_OPTIONS[env as keyof typeof CORS_OPTIONS] || CORS_OPTIONS.development
  );
};
