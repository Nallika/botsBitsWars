# Backend Code Style Guide

## 1. JSDoc
- Methods/functions that do not obvious things(getters/setters/constructors) should have JSDoc comment.

## 2. Route Aggregation
- For Backednd (nodeJS) all route modules should be imported and aggregated in `src/routes/index.ts`.
- Only import this single routes file in `server.ts`.

## 3. Environment Variables
- Do not hardcode default values for environment variables (e.g., MongoDB URI) in code. All such values must be set in `.env` or `env.example`.

## 4. Prettier Formatting
- Always use empty lines after if blocks and before return statements in functions.
- Always use curly braces for if statements, even for single-line blocks.
- Each object field should be on a new line.

## 5. Magic Numbers
- Do not use magic numbers in code. Store all constants in `src/constants/` and import them as needed.

## 6. Error Handling
- Do not send backend error details to the client. Use generic error messages in API responses.

## 7. Test Endpoints
- Do not add test-only endpoints to the codebase. Use real endpoints for all tests. 