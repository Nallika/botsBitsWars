# Shared Types Package

This package contains TypeScript interfaces and types that are shared between the frontend and backend applications.

## Purpose

- Define common interfaces for data structures
- Ensure type consistency across the monorepo
- Provide shared types for API communication
- Define bot provider interfaces

## Structure

```
src/
├── auth/           # Authentication related types
├── bot/            # Bot provider interfaces
├── chat/           # Chat and session types
├── user/           # User related types
└── index.ts        # Main export file
```

## Key Types

- `BotProvider` - Interface for LLM bot providers
- `ChatSession` - Chat session data structure
- `User` - User account information
- `Message` - Chat message structure
- `Vote` - User voting data

## Usage

Import types in both frontend and backend:

```typescript
import { BotProvider, ChatSession } from '@repo/shared-types';
```

## Development

- All types should be exported from `src/index.ts`
- Use strict TypeScript configuration
- Document complex interfaces with JSDoc
- Keep types simple and focused
