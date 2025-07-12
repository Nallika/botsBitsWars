# Config Package

Shared configuration files for TypeScript and other development tools.

## Purpose

- Provide consistent configuration across all packages
- Centralize development tool settings
- Ensure code quality and consistency
- Standardize build and development processes

## Structure

```
src/
├── typescript/     # TypeScript configurations
├── prettier/       # Prettier configurations
└── jest/           # Jest configurations
```

## Configurations

### TypeScript

- `base.json` - Base TypeScript configuration
- `nextjs.json` - Next.js specific configuration
- `react-library.json` - React library configuration
- `node.json` - Node.js backend configuration

### Prettier

- `prettier.config.js` - Code formatting rules
- `.prettierignore` - Files to ignore

### Jest

- `jest-preset.js` - Jest configuration preset
- `setup.js` - Test setup files

## Usage

Each package extends the base configurations:

```json
{
  "extends": ["@repo/config/typescript/base.json"],
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

## Development

- Keep configurations minimal and focused
- Document any custom rules or settings
- Test configurations across different environments
- Maintain backward compatibility
