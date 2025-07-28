# BotsBitsWars - Project Overview

## Project Description

BotsBitsWars is an online chat application that allows users to compare responses from multiple LLM (Large Language Model) bots simultaneously. Users can send prompts and receive real-time responses from different AI providers, enabling direct comparison of their capabilities and response quality.

### Core Concept

The application serves as a platform for:

- **Comparative Analysis**: See how different LLMs handle the same prompt
- **Performance Evaluation**: Compare response quality, speed, and accuracy
- **Interactive Testing**: Engage with multiple AI models in a single interface

### Target Use Cases

1. **AI Researchers**: Compare model performance and capabilities
2. **Developers**: Test different LLM providers for their applications
3. **Content Creators**: Generate multiple perspectives on topics
4. **General Users**: Explore and understand different AI capabilities

## Technology Stack

### Frontend

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: SCSS Modules
- **State Management**: React Hooks + Context API
- **Real-time Communication**: Socket.IO Client

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT + Google OAuth
- **Database**: MongoDB with Mongoose

### Infrastructure

- **Monorepo**: Turborepo
- **Containerization**: Docker
- **Deployment**: Heroku/Fly.io
- **Package Management**: pnpm

### LLM Providers (MVP)

- **OpenAI**: GPT-3.5-turbo
- **Google**: Gemini Pro
- **Anthropic**: Claude Instant

## Project Structure

```
botsBitsWars/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── backend/             # Node.js API server
├── packages/
│   ├── shared-types/        # Shared TypeScript interfaces
│   ├── chat-core/           # Chat business logic (reusable)
│   └── config/              # Shared configurations
├── docs/                    # Project documentation (not for git)
├── docker/                  # Docker configurations
└── turbo.json              # Turborepo configuration
```

## Key Features (MVP)

| Feature                | Status       |
|------------------------|--------------|
| Email/Password Auth    | Implemented  |
| Google OAuth           | Planned      |
| JWT Refresh            | Planned      |
| Session Creation       | Implemented  |
| Session Retrieval      | Implemented  |
| Voting                 | Planned      |
| Session Results        | Planned      |
| Bot Management         | Planned      |
| Real-time Chat (basic) | Implemented  |
| Advanced Streaming     | Planned      |

### 1. User Authentication

- Email/password registration and login (**Implemented**)
- Google OAuth integration (**Planned**)
- JWT-based session management (**Planned**)

### 2. Bot Selection

- Choose from available LLM providers (**Planned**)
- Maximum 5 bots per session (**Planned**)
- Flexible combination selection (**Planned**)

### 3. Quiz Mode

- User asks questions (3-5 rounds, configurable) (**Planned**)
- Real-time streaming responses from all selected bots (**Planned**)
- Vote for best response after each question (**Planned**)
- Session statistics and results (**Planned**)

### 4. Real-time Chat

- WebSocket-based communication (**Basic echo implemented**)
- Independent bot response streaming (**Planned**)
- Mobile-first responsive design (**Planned**)
- Error handling for failed bot responses (**Planned**)

### 5. Session Management

- Save and continue previous sessions (**Planned**)
- Session history and statistics (**Planned**)
- User voting data persistence (**Planned**)

## API Endpoints Status

| Endpoint                        | Method | Status       | Description                       |
|---------------------------------|--------|--------------|-----------------------------------|
| /api/auth/register              | POST   | Implemented  | Register with email/password      |
| /api/auth/login                 | POST   | Implemented  | Login with email/password         |
| /api/auth/google                | POST   | Planned      | Google OAuth login                |
| /api/auth/refresh               | POST   | Planned      | JWT refresh                       |
| /api/auth/me                    | GET    | Planned      | Get current user info             |
| /api/chat/session               | POST   | Implemented  | Create chat session               |
| /api/chat/session/:id           | GET    | Implemented  | Get chat session by ID            |
| /api/chat/session/:id/vote      | POST   | Planned      | Vote for best bot response        |
| /api/chat/session/:id/results   | GET    | Planned      | Get session results               |
| /api/bots                       | GET    | Planned      | List available bots               |
| /api/bots/:id/status            | GET    | Planned      | Get bot status                    |

## Future Enhancements

### Phase 2

- Bot vs Bot competition mode
- Custom bot personalities
- Advanced metrics and analytics
- User-provided API keys for premium models

### Phase 3

- Mobile application (React Native) - will reuse chat-core package
- Advanced comparison tools
- Community features
- API for third-party integrations

## Development Principles

### Code Quality

- Comprehensive unit testing with Jest
- TypeScript for type safety
- Prettier for code formatting
- Well-documented code with JSDoc

### Architecture

- Separation of concerns
- Service-oriented architecture
- Adapter pattern for bot providers
- Component-based UI design
- Reusable business logic in chat-core package

### User Experience

- Mobile-first responsive design
- Real-time feedback and animations
- Intuitive navigation and interactions
- Accessibility compliance

## Success Metrics

### Technical Metrics

- Response time < 2 seconds for bot initialization
- 99% uptime for core functionality
- Zero critical security vulnerabilities

### User Experience Metrics

- Session completion rate > 80%
- User engagement time > 5 minutes per session
- Positive user feedback on comparison accuracy

### Business Metrics

- User registration growth
- Session frequency and retention
- Bot provider usage distribution
