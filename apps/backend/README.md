# Backend Application

Express.js API server with Socket.IO for real-time communication and bot management.

## Purpose

- Provide REST API endpoints for authentication and session management
- Handle real-time communication via Socket.IO
- Manage bot providers and LLM integrations
- Handle chat sessions and voting system
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
- `BotManager` - Bot provider management and integration
- `ChatService` - Chat session and message handling
- `SocketManager` - Real-time communication management
- `QuizService` - Quiz mode logic and voting system

## API Endpoints

- Authentication: `/api/auth/*`
- Sessions: `/api/sessions/*`
- Bots: `/api/bots/*`
- Users: `/api/users/*`

## Socket Events

- Client to Server: `join-session`, `send-message`, `vote`
- Server to Client: `bot:start`, `bot:chunk`, `bot:complete`

## Database

- MongoDB with Mongoose ODM
- Collections: users, sessions, votes
- Indexed for performance optimization

## Development

- TypeScript for type safety
- Comprehensive error handling
- Rate limiting and security middleware
- Environment-based configuration
