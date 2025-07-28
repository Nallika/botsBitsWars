# Technical Architecture

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.IO     │    │   MongoDB       │    │   LLM APIs      │
│   Client        │    │   Database      │    │   (OpenAI,      │
└─────────────────┘    └─────────────────┘    │   Gemini,       │
                                              │   Claude)       │
                                              └─────────────────┘
```

## Backend Architecture

### Core Services

#### 1. Authentication Service

// IMPLEMENTED:
- register(email, password): Promise<User>
- login(email, password): Promise<AuthToken>

// PLANNED:
- googleAuth(token): Promise<AuthToken>
- validateToken(token): Promise<User>
- refreshToken(token): Promise<AuthToken>

#### 2. Bot Management Service

// PLANNED: No implementation yet

#### 3. Chat Service

// IMPLEMENTED:
- createSession(userId): Promise<ChatSession>
- getSession(sessionId): Promise<ChatSession>

// PLANNED:
- sendMessage(sessionId, message): Promise<void>
- saveVote(sessionId, questionId, winningBotId): Promise<void>

#### 4. Socket Manager

// IMPLEMENTED:
- Basic chat message echo

// PLANNED:
- Session-based rooms, bot streaming, advanced events

### Database Schema

#### User Collection

```typescript
interface User {
  _id: ObjectId;
  email: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}
```

#### Chat Session Collection

```typescript
interface ChatSession {
  _id: ObjectId;
  userId: ObjectId;
  botIds: string[];
  status: 'active' | 'completed' | 'paused';
  currentRound: number;
  maxRounds: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

#### Vote Collection

```typescript
interface Vote {
  _id: ObjectId;
  sessionId: ObjectId;
  questionId: string;
  winningBotId: string;
  timestamp: Date;
}
```

### API Endpoints

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

## Frontend Architecture

### Service Layer Pattern

#### Service Structure

```typescript
// Import from chat-core package
import { ChatService, BotService } from '@repo/chat-core';
import { useChat, useBotSelection } from '@repo/chat-core/hooks';

// services/ChatService.ts (if needed for app-specific logic)
export class AppChatService extends ChatService {
  // App-specific chat logic
}
```

#### Hook Pattern

```typescript
// hooks/useChat.ts
import { useChat as useChatCore } from '@repo/chat-core/hooks';

export const useChat = () => {
  const chatCore = useChatCore();

  // Add app-specific logic here

  return {
    ...chatCore,
    // Additional app-specific methods
  };
};
```

### Component Architecture

#### Atomic Design Structure (within Next.js app)

```
apps/web/src/components/
├── atoms/
│   ├── Button/
│   ├── Input/
│   ├── Typography/
│   └── Icon/
├── molecules/
│   ├── ChatInput/
│   ├── BotSelector/
│   ├── MessageBubble/
│   └── VoteButton/
├── organisms/
│   ├── ChatWindow/
│   ├── BotSelectionPanel/
│   ├── SessionHeader/
│   └── ResultsModal/
└── templates/
    ├── ChatLayout/
    ├── AuthLayout/
    └── HomeLayout/
```

#### Component Example

```typescript
// apps/web/src/components/molecules/ChatInput/ChatInput.tsx
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = "Ask a question..."
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.chatInput}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled || !message.trim()}>
        Send
      </Button>
    </form>
  );
};
```

## Package Architecture

### Chat Core Package (`packages/chat-core/`)

```
src/
├── types/           # Chat-related TypeScript types
│   ├── ChatSession.ts
│   ├── Message.ts
│   ├── BotResponse.ts
│   └── index.ts
├── services/        # Business logic services
│   ├── ChatService.ts
│   ├── BotService.ts
│   ├── SocketService.ts
│   └── index.ts
├── hooks/           # React hooks for chat functionality
│   ├── useChat.ts
│   ├── useBotSelection.ts
│   └── index.ts
├── utils/           # Utility functions
│   ├── messageUtils.ts
│   ├── sessionUtils.ts
│   └── index.ts
└── index.ts         # Main exports
```

### Shared Types Package (`packages/shared-types/`)

```
src/
├── auth/                  # Authentication types
│   ├── User.ts           # User interface
│   ├── AuthToken.ts      # Token types
│   └── index.ts          # Auth exports
├── bot/                   # Bot provider types
│   ├── BotProvider.ts    # Bot provider interface
│   ├── ModelInfo.ts      # Model information
│   └── index.ts          # Bot exports
├── user/                  # User related types
│   ├── UserProfile.ts    # User profile
│   ├── UserSettings.ts   # User settings
│   └── index.ts          # User exports
└── index.ts              # Main exports
```

## Real-time Communication

### Socket.IO Events

#### Client to Server

```typescript
// Client emits
socket.emit('join-session', { sessionId });
socket.emit('send-message', { sessionId, message });
socket.emit('vote', { sessionId, questionId, winningBotId });
socket.emit('leave-session', { sessionId });
```

#### Server to Client

```typescript
// Server emits
socket.emit('bot:start', { botId, questionId });
socket.emit('bot:chunk', { botId, chunk, questionId });
socket.emit('bot:complete', { botId, questionId });
socket.emit('bot:error', { botId, error, questionId });
socket.emit('session:update', { session });
```

### Streaming Implementation

#### Bot Response Streaming

```typescript
class BotStreamManager {
  private streams: Map<string, BotStream> = new Map();

  async startBotStream(botId: string, prompt: string, sessionId: string) {
    const bot = this.getBot(botId);
    const stream = bot.streamResponse(prompt);

    this.streams.set(botId, {
      status: 'streaming',
      startTime: Date.now(),
    });

    try {
      for await (const chunk of stream) {
        this.emitChunk(botId, chunk, sessionId);
      }

      this.completeStream(botId, sessionId);
    } catch (error) {
      this.handleStreamError(botId, error, sessionId);
    }
  }

  private emitChunk(botId: string, chunk: string, sessionId: string) {
    io.to(sessionId).emit('bot:chunk', {
      botId,
      chunk,
      timestamp: Date.now(),
    });
  }
}
```

## Error Handling

### Error Types

```typescript
enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  BOT_UNAVAILABLE = 'BOT_UNAVAILABLE',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  INTERNAL = 'INTERNAL',
}

interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
}
```

### Error Handling Strategy

1. **Client-side**: Graceful degradation, user-friendly error messages
2. **Server-side**: Comprehensive logging, error monitoring
3. **Network**: Retry mechanisms, connection recovery
4. **Bot failures**: Continue with available bots, notify user

## Security Considerations

### Authentication & Authorization

- JWT token validation on all protected routes
- Rate limiting for API endpoints
- Input validation and sanitization
- CORS configuration

### Data Protection

- Password hashing with bcrypt
- Environment variable management
- API key encryption
- HTTPS enforcement

### Bot API Security

- API key rotation
- Request signing
- Rate limiting per user
- Error message sanitization

## Performance Optimization

### Frontend

- Code splitting with Next.js
- Image optimization
- Bundle size monitoring
- Lazy loading for components

### Backend

- Database indexing
- Caching strategies
- Connection pooling
- Memory management

### Real-time

- WebSocket connection pooling
- Message queuing
- Efficient broadcasting
- Connection state management
