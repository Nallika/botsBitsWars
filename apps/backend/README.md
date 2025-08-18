# Backend Application

Express.js API server with authorization.

## Purpose

- Provide REST API endpoints for authentication and session management
- Provide database operations and data persistence

## Structure

```
src/
├── config/         # Configuration files
├── controllers/    # API route controllers
├── middleware/     # Express middleware
├── models/         # Mongoose models
├── routes/         # API route definitions
├── services/       # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main server file
```

## Key Services

- `AuthService` - User authentication and JWT management

## API Endpoints

- Authentication: `/api/auth/*`

## Database

- MongoDB with Mongoose ODM
- Collections: users

## Development

- TypeScript for type safety
- Comprehensive error handling
- Rate limiting and security middleware
- Environment-based configuration
