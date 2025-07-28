# Jest Presets Package

Shared Jest configurations for testing across the monorepo.

## Purpose

- Provide consistent testing setup
- Configure testing environments
- Set up test utilities and mocks
- Ensure test coverage standards

## Presets

- `next/jest-preset.js` - Next.js testing setup with JS-DOM environment.
- `node.js` - Node.js backend testing

## Features

- TypeScript support
- React Testing Library setup
- Mock configurations
- Coverage reporting
- Test utilities

## Usage

Extend presets in package.json:

```json
{
  "jest": {
    "preset": "@repo/jest-presets/node"
  }
}
```

## Development

- Maintain consistent testing patterns
- Document test utilities and helpers
- Ensure coverage thresholds
- Support different testing scenarios
