# UI Components

UI components organized using atomic design principles within the Next.js application.

## Structure

```
components/
├── atoms/           # Basic building blocks (Button, Input, Typography, Icon)
├── molecules/       # Simple combinations (ChatInput, BotSelector, MessageBubble)
├── organisms/       # Complex UI components (ChatWindow, BotSelectionPanel, SessionHeader)
└── templates/       # Page-level layouts (ChatLayout, AuthLayout, HomeLayout)
```

## Atomic Design Principles

### Atoms
- Smallest functional units
- Reusable across the application
- Examples: Button, Input, Typography, Icon

### Molecules
- Simple combinations of atoms
- Have a specific function
- Examples: ChatInput, BotSelector, MessageBubble, VoteButton

### Organisms
- Complex UI components
- Composed of molecules and atoms
- Examples: ChatWindow, BotSelectionPanel, SessionHeader, ResultsModal

### Templates
- Page-level layouts
- Define the structure and arrangement
- Examples: ChatLayout, AuthLayout, HomeLayout

## Usage

```tsx
import { Button } from '@/components/atoms/Button';
import { ChatInput } from '@/components/molecules/ChatInput';
import { ChatWindow } from '@/components/organisms/ChatWindow';
import { ChatLayout } from '@/components/templates/ChatLayout';
``` 