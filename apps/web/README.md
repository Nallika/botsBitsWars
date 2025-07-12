# Web Application

Next.js frontend application with real-time chat interface and bot comparison features.

## Purpose

- Provide user interface for bot comparison
- Handle real-time chat communication
- Manage user authentication and sessions
- Implement quiz mode with voting system
- Provide responsive mobile-first design

## Structure

```
src/
├── app/            # Next.js App Router pages
├── components/     # Page-specific components
├── hooks/          # Custom React hooks
├── services/       # API and socket services
├── styles/         # Global styles and SCSS
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── context/        # React context providers
```

## Key Features

- **Authentication**: Login/register with email and Google OAuth
- **Bot Selection**: Choose and configure bot combinations
- **Real-time Chat**: Live streaming responses from multiple bots
- **Quiz Mode**: Interactive question-answer with voting
- **Session Management**: Save and resume chat sessions
- **Responsive Design**: Mobile-first approach

## Pages

- `/` - Homepage with authentication
- `/auth` - Login/register forms
- `/select-bots` - Bot selection interface
- `/chat/:sessionId` - Main chat interface
- `/results/:sessionId` - Session results and statistics

## Services

- `AuthService` - Authentication and user management
- `ChatService` - Chat session and message handling
- `SocketService` - Real-time communication
- `BotService` - Bot selection and configuration

## Styling

- SCSS modules for component styling
- Mobile-first responsive design
- Dark/light theme support
- Accessibility compliance (WCAG 2.1 AA)

## Development

- TypeScript for type safety
- React hooks for state management
- Context API for global state
- Comprehensive error handling
