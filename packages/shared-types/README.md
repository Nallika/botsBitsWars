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
└── index.ts        # Main export file
```

## Usage

Import types in both frontend and backend:

```typescript
import { AuthData, ApiResponse, User } from '@repo/shared-types';
```

## Development

- All types should be exported from `src/index.ts`
- Use strict TypeScript configuration
- Document complex interfaces with JSDoc
- Keep types simple and focused
