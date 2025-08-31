# CarsCanada

A comprehensive car sales classified platform for the Canadian market.

## Project Structure

This is a monorepo containing:
- `apps/api` - Express.js REST API
- `apps/web` - Next.js web application
- `apps/mobile` - React Native mobile app
- `packages/shared-types` - Shared TypeScript types
- `packages/validators` - Shared validation schemas
- `packages/utils` - Shared utility functions

## Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL
- Redis

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start all applications in development mode:
- API: http://localhost:3001
- Web: http://localhost:3000
- Mobile: Expo development server

### Build

```bash
npm run build
```

### Testing

```bash
npm run test
```

## Environment Variables

Copy the `.env.example` files in each app directory and configure your environment variables.

## Deployment

The application is designed to be deployed on Railway. See the deployment guide in `docs/deployment.md`.

## License

Private - All rights reserved