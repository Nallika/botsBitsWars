# Web Application

Next.js frontend application with authorization.

## Purpose

- Provide user interface for bot comparison
- Manage user authentication and sessions
- Provide responsive mobile-first design

## Structure

```
src/
├── app/            # Next.js App Router pages
├── components/     # Page-specific components
├── hooks/          # Custom React hooks
├── services/       # API and other services
├── styles/         # Global styles and SCSS
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── context/        # React context providers
```

## Key Features

- **Authentication**: Login/register with email and Google OAuth
- **Responsive Design**: Mobile-first approach

## Pages

- `/` - Homepage with authentication
- `/auth` - Login/register forms

## Services

- `AuthService` - Authentication and user management

## Styling

The project uses SCSS modules for component styling with the following approach:

### Style Architecture

- **CSS Variables**: Global design tokens in `src/styles/global.scss`
  - Color palette with automatic dark/light theme support
  - Spacing system (`--spacing-xs` to `--spacing-xl`)
  - Consistent typography and layout values

- **Module Approach**: Each component/page has its own `styles.module.scss` file
  - Scoped styles prevent conflicts between components
  - Allows reuse of class names across different components
  - Better maintainability and debugging
  - Consistent naming convention across the project

- **Common Patterns**: Shared layout patterns in `src/styles/common.module.scss`
  - `.authContainer` - Standard auth page layout
  - `.primaryLink` - Consistent link styling
  - `.errorText` - Error message styling
  - Utility classes for spacing and layout

### Usage Examples

```tsx
// Import styles
import styles from './styles.module.scss';

// Use in JSX
<div className={styles.container}>
  <button className={styles.primaryButton}>Click me</button>
</div>;
```

### Color System

```scss
// Use CSS variables from global.scss
.myComponent {
  background: var(--color-background);
  color: var(--color-on-background);
  margin: var(--spacing-md);
}
```

### Best Practices

- Use CSS variables for colors and spacing
- Create component-specific modules for unique styles
- Extend common patterns when possible
- Keep styles close to components (co-location)
- Use semantic class names that describe purpose, not appearance

## Development

- TypeScript for type safety
- React Hooks + Context API
- Comprehensive error handling
