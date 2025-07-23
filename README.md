# BotsBitsWars

An online chat application that allows users to compare responses from multiple LLM (Large Language Model) bots simultaneously. Users can send prompts and receive real-time responses from different AI providers, enabling direct comparison of their capabilities and response quality.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- MongoDB (local or cloud)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd botsBitsWars

# Install dependencies
pnpm install

# Setup environment variables (see docs/04-development-setup.md)
```

### Development

```bash
# Option 1: Separate development servers (Recommended)
pnpm dev:web    # Terminal 1 - Frontend (http://localhost:3000)
pnpm dev:api    # Terminal 2 - Backend (http://localhost:3001)

# Option 2: Concurrent development (Convenient)
pnpm dev:all    # Start both services

# Option 3: Proxy development server (Production-like)
pnpm dev:proxy  # Single entry point (http://localhost:3002)
```

## 📁 Project Structure

```
botsBitsWars/
├── apps/
│   ├── web/                 # Next.js frontend application
│   └── backend/             # Node.js API server
├── packages/
│   ├── shared-types/        # Shared TypeScript interfaces
│   ├── chat-core/           # Chat business logic (reusable)
│   └── config/              # Shared configurations
├── docs/                    # Project documentation
├── docker/                  # Docker configurations
└── turbo.json              # Turborepo configuration
```

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: SCSS Modules
- **State Management**: React Hooks + Context API
- **Real-time Communication**: Socket.IO Client

### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT + Google OAuth
- **Database**: MongoDB with Mongoose

### Infrastructure

- **Monorepo**: Turborepo
- **Containerization**: Docker
- **Package Management**: pnpm

## 🎯 Key Features

- **Multi-Bot Chat**: Compare responses from multiple LLM providers
- **Real-time Streaming**: Live response streaming from all bots
- **Quiz Mode**: Interactive voting system for response comparison
- **Session Management**: Save and continue previous sessions
- **Mobile-First Design**: Responsive design for all devices

## 📚 Documentation

- [Project Overview](./docs/01-project-overview.md)
- [Technical Architecture](./docs/02-technical-architecture.md)
- [Development Plan](./docs/03-development-plan.md)
- [Development Setup](./docs/04-development-setup.md)

## 🐳 Docker

### Development with Docker

```bash
# Create network for container communication
docker network create app_network

# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Production Build

```bash
# Build production images
COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose build

# Start production services
docker-compose up -d
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
pnpm dev:api          # Start only Express backend
pnpm dev:proxy        # Start all services with proxy

# Building
pnpm build            # Build all packages and apps
pnpm clean            # Clean all build outputs

# Code Quality
pnpm format           # Format all code with Prettier
pnpm format:check     # Check code formatting
pnpm type-check       # Run TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
