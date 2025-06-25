# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Register is a React/TypeScript DeFi interface for the Reserve Yield Protocol and Reserve Index Protocol, enabling users to create and manage DTFs (Decentralized Token Funds).

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run all tests
npm test

# Run E2E tests (Playwright)
npm run test:e2e

# Run unit tests (Vitest)
npm run test:lib

# Extract and compile translations
npm run translations

# Run local Ethereum fork for testing
npm run forknet

# Analyze bundle size
npm run analyze
```

## Architecture

### Technology Stack
- **Frontend**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.8
- **State Management**: Jotai atoms (located in `src/state/`)
- **Routing**: React Router DOM 7.0.1
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Radix UI primitives with custom wrappers in `src/components/`
- **Web3 Integration**: wagmi 2.14.11 + viem 2.23.0 + RainbowKit
- **Internationalization**: Lingui (en, es locales)

### Code Organization
- `src/abis/` - Smart contract ABIs for DTF interactions
- `src/components/` - Reusable React components using Radix UI
- `src/hooks/` - Custom React hooks for business logic
- `src/state/` - Jotai atoms for global state management
- `src/views/` - Page-level components (routing endpoints)
- `src/utils/` - Helper functions and utilities
- `src/services/` - API and blockchain service layers
- `src/lib/` - Core library functions

### Code Standards
- TypeScript strict mode enabled
- Prettier formatting: 2 spaces, no semicolons, single quotes
- Path alias: `@/` maps to `src/`
- ESM modules (type: "module" in package.json)

### Key Patterns
- Use existing Jotai atoms in `src/state/` for state management
- Follow existing component patterns with Radix UI primitives
- Use wagmi hooks for blockchain interactions
- Implement forms with react-hook-form + Zod validation
- Use SWR or TanStack Query for data fetching

### Testing
- Unit tests: Write `.test.ts` files using Vitest
- E2E tests: Write Playwright tests in the test directory
- Limited test coverage currently exists - focus on critical paths

### Environment Configuration
Required environment variables:
- `VITE_WALLETCONNECT_ID` - WalletConnect project ID

Optional for full features:
- `VITE_MAINNET_URL` - Ethereum mainnet RPC URL for forking
- `VITE_SUBGRAPH_URL` - GraphQL endpoint for protocol data