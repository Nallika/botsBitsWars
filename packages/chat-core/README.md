# Chat Core Package

Business logic package for chat functionality that can be shared between web and native applications.

## Purpose

- Provide reusable chat business logic
- Handle chat sessions, messaging, and bot interactions
- Manage real-time communication via Socket.IO
- Share types and interfaces across platforms

## Structure

```
src/
├── types/           # Chat-related TypeScript types
├── services/        # Business logic services
├── utils/           # Utility functions
└── index.ts         # Main exports
```

## Exports

- `@repo/chat-core` - Main package exports
- `@repo/chat-core/types` - TypeScript interfaces and types
- `@repo/chat-core/services` - Chat services and business logic

## Usage

```typescript
import { ChatService, useChat } from '@repo/chat-core';
import type { ChatSession, Message } from '@repo/chat-core/types';
```

## Dependencies

- `@repo/shared-types` - Shared TypeScript interfaces
- `socket.io-client` - Real-time communication
