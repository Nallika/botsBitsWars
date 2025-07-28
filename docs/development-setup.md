# Development Setup & Running the Project

## Quick Start

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

# Setup environment variables (see Environment Configuration below)
```

## Development Options

### Option 1: Separate Development Servers (Recommended)

Run frontend and backend on separate ports with full hot reload capabilities.

```bash
# Terminal 1 - Frontend (Next.js)
pnpm dev:web

# Terminal 2 - Backend (Express)
pnpm dev:backend
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Socket.IO: ws://localhost:3001

**Benefits:**
- ✅ Full Next.js hot reload
- ✅ Independent service restart
- ✅ Clear separation of concerns
- ✅ Easy debugging

### Option 2: Concurrent Development (Convenient)

Run both services with a single command.

```bash
# Start both services simultaneously
pnpm dev:all
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Option 3: Proxy Development Server (Production-like)

Run all services through a single proxy server.

```bash
# Start all services with proxy
pnpm dev:proxy
```

**Access:**
- App: http://localhost:3002
- API: http://localhost:3002/api
- Health Check: http://localhost:3002/health

**Benefits:**
- ✅ Single entry point
- ✅ No CORS issues
- ✅ Production-like setup
- ✅ Health monitoring

## Environment Configuration

### Required Environment Variables

Create `.env.local` files in each app directory:

#### `apps/web/.env.local`
```bash
# API Configuration
NEXT_PUBLIC_API_HOST=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Settings
NODE_ENV=development
```

#### `apps/backend/.env.local`
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/botsBitsWars_dev

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d

# Bot API Keys (add your actual keys)
OPENAI_API_KEY=your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Development Settings
LOG_LEVEL=debug
```

### Optional Proxy Configuration

#### Root `.env.local`
```bash
# Proxy Configuration
PROXY_PORT=3002
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000
```

## Available Commands

### Root Level Commands

```bash
# Development
pnpm dev              # Run all apps in development mode
pnpm dev:all          # Start both web and API servers
pnpm dev:web          # Start only Next.js frontend
pnpm dev:backend          # Start only Express backend
pnpm dev:proxy        # Start all services with proxy

# Building
pnpm build            # Build all packages and apps
pnpm clean            # Clean all build outputs

# Code Quality
pnpm format           # Format all code with Prettier
pnpm format:check     # Check code formatting
pnpm type-check       # Run TypeScript type checking

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
```

### App-Specific Commands

```bash
# Web App
cd apps/web
pnpm dev              # Start Next.js development server
pnpm build            # Build for production
pnpm start            # Start production server

# Backend App
cd apps/backend
pnpm dev              # Start development server with nodemon
pnpm build            # Build TypeScript
pnpm start            # Start production server
pnpm test             # Run tests
```

## Development Workflow

### 1. Initial Setup

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/backend/.env.example apps/backend/.env.local

# Start development
pnpm dev:all
```

### 2. Daily Development

```bash
# Start development servers
pnpm dev:all

# Or use separate terminals for better debugging
pnpm dev:web    # Terminal 1
pnpm dev:backend    # Terminal 2
```

### 3. Working with Packages

```bash
# Build shared packages
pnpm build --filter=@repo/chat-core
pnpm build --filter=@repo/shared-types

# Watch for changes
pnpm dev --filter=@repo/chat-core
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

#### CORS Issues
- Ensure backend is running on port 3001
- Check that `NEXT_PUBLIC_API_HOST` is set correctly
- Use the proxy server option for production-like testing

#### TypeScript Errors
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

#### Hot Reload Not Working
- Ensure you're using the development commands (`pnpm dev:*`)
- Check that file watchers are working
- Restart the development server

### Debug Mode

#### Backend Debugging
```bash
# Start with debug logging
DEBUG=* pnpm dev:backend

# Or use Node.js debugger
node --inspect -r esbuild-register ./src/index.ts
```

#### Frontend Debugging
```bash
# Start with verbose logging
NODE_ENV=development DEBUG=* pnpm dev:web
```

## Production vs Development

### Development Mode
- Hot reload enabled
- Detailed error messages
- Source maps enabled
- CORS enabled for local development
- Debug logging

### Production Mode
- Optimized builds
- Minified code
- Error boundaries
- Performance monitoring
- Security headers

## Docker Development

### Using Docker Compose

```bash
# Start all services with Docker
docker-compose up

# Start specific services
docker-compose up web
docker-compose up backend

# Rebuild and start
docker-compose up --build
```

### Development with Docker

```bash
# Build development images
docker-compose -f docker-compose.dev.yml up

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

## Performance Tips

### Development Performance

1. **Use separate terminals** for better debugging
2. **Enable file watching** for faster rebuilds
3. **Use TypeScript incremental builds**
4. **Monitor memory usage** during development

### Build Performance

1. **Use Turborepo caching** effectively
2. **Parallel builds** for packages
3. **Incremental TypeScript compilation**
4. **Optimize dependencies** in package.json

## Next Steps

After setting up development:

1. **Configure your bot API keys** in environment variables
2. **Set up MongoDB** (local or cloud)
3. **Test the authentication flow**
4. **Verify Socket.IO connections**
5. **Run the test suite**

For more information, see:
- [Project Overview](./01-project-overview.md)
- [Technical Architecture](./02-technical-architecture.md)
- [Development Plan](./03-development-plan.md) 