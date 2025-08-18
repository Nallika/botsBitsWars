# Skeleton

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB (local or cloud)

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Setup environment variables (see docs/04-development-setup.md)
```

### Development

```bash
# Option 1: Separate development servers (Recommended)
pnpm dev:web    # Terminal 1 - Frontend (http://localhost:3000)
pnpm dev:backend    # Terminal 2 - Backend (http://localhost:3001)

# Option 2: Concurrent development (Convenient)
pnpm dev:all    # Start both services

# Option 3: Proxy development server (Production-like)
pnpm dev:proxy  # Single entry point (http://localhost:3002)
```

## 📁 Project Structure

```
skeleton/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── backend/             # Node.js API server
├── packages/
│   └── shared-types/        # Shared TypeScript interfaces
└── turbo.json              # Turborepo configuration
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: SCSS Modules
- **State Management**: React Hooks + Context API

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: JWT
- **Database**: MongoDB with Mongoose

### Infrastructure

- **Monorepo**: Turborepo
- **Containerization**: Docker
- **Package Management**: pnpm

## 🐳 Docker

### Production Build

```bash
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
pnpm docker:down
```

### Useful Docker Commands

```bash
# View running containers
docker ps

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f backend

# Restart specific service in development
docker-compose -f docker-compose.dev.yml restart backend

# Complete cleanup (removes volumes and images)
pnpm docker:clean
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## 🔧 Available Commands

```bash
# Development
pnpm dev              # Run all apps in development mode
pnpm dev:all          # Start both web and API servers
pnpm dev:web          # Start only Next.js frontend
pnpm dev:backend      # Start only Express backend

# Building
pnpm build            # Build all packages and apps
pnpm clean            # Clean all build outputs

# Code Quality
pnpm format           # Format all code with Prettier
pnpm format:check     # Check code formatting
pnpm type-check       # Run TypeScript type checking
pnpm test             # Run all tests
pnpm test:coverage    # Run tests with coverage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
