# Project Structure & Tools

## Overview
The Register project is a React/TypeScript frontend application for the Reserve Protocol. It provides a web interface for interacting with Reserve Protocol's smart contracts, managing RTokens, and participating in governance.

## Directory Structure

### Overview
```
/
├── src/                    # Main application source code
│   ├── components/         # Reusable UI components
│   ├── utils/             # Utility functions and helpers
│   ├── types/             # TypeScript type definitions
│   ├── views/             # Feature-specific views
│   ├── locales/           # Internationalization files
│   └── App.tsx            # Main application component
├── e2e/                   # End-to-end tests using Playwright
├── scripts/               # Build and utility scripts
└── docs/                  # Project documentation
```

### Source Directory Structure

#### Components (`/src/components/`)
The components directory contains reusable UI elements organized by feature and functionality:
- `rtoken-setup/`: Components for RToken creation and configuration
  - `governance/`: Governance setup components
  - `token/`: Token configuration forms
  - `basket/`: Basket management components
- `layout/`: Core layout components including header and navigation
- `transaction-modal/`: Transaction handling UI components
- `dark-mode-toggle/`: Theme switching functionality
- `tables/`: Reusable table components
- `tooltip/`: Tooltip components
- `alert/`: Alert and notification components

#### Views (`/src/views/`)
Feature-specific views and pages:
- `governance/`: Governance-related views
  - `views/proposal/`: Proposal creation and management
  - `views/proposal-detail/`: Individual proposal viewing
- Each view typically includes:
  - Component files (*.tsx)
  - Custom hooks (hooks/*.ts)
  - Utility functions (utils/*.ts)
  - State management (atoms.ts)

#### Utils (`/src/utils/`)
Utility functions and helpers:
- `constants.ts`: Application-wide constants
- `addresses.ts`: Contract addresses and configurations
- `plugins/`: Plugin-related utilities
- `atoms/`: Jotai atom utilities
- `chains.ts`: Blockchain network configurations
- `getExplorerLink.ts`: Block explorer URL generation

#### Types (`/src/types/`)
TypeScript type definitions:
- `index.ts`: Core type definitions
- Includes interfaces for:
  - Smart contract interactions
  - Component props
  - API responses
  - State management

#### Locales (`/src/locales/`)
Internationalization resources:
- Language-specific translation files
- Configured for English and Spanish
- Managed by Lingui

#### Core Files
- `App.tsx`: Main application component
- `theme.ts`: Theme configuration
- `index.tsx`: Application entry point

## Tools & Technologies

### Core Technologies

#### React (v18.2.0)
- Frontend framework for building user interfaces
- Component-based architecture
- Hooks for state management and side effects
- Integration with Web3 libraries for blockchain interaction

#### TypeScript
- Statically typed superset of JavaScript
- Configured with strict type checking
- Custom type definitions in `/src/types`
- Enhanced IDE support and code reliability

#### Vite
- Modern build tool and development server
- Fast hot module replacement (HMR)
- Optimized production builds
- Configuration in `vite.config.ts` includes:
  - React plugin with macro support
  - Path aliases for clean imports
  - SVG handling
  - Static file copying
  - Security headers configuration

### Testing & Quality

#### Playwright
- End-to-end testing framework
- Tests located in `/e2e` directory
- Configured for Chromium by default
- Supports parallel test execution
- Automatic test retries in CI environment

#### Prettier
- Automated code formatting
- Configuration in `.prettierrc.json`
- Ensures consistent code style across the project
- Integrated with the development workflow

### Internationalization

#### Lingui
- Handles multilingual support
- Configuration in `lingui.config.ts`
- Supports message extraction and compilation
- Integration with Vite build process
- Available scripts:
  - Extract messages: `lingui extract`
  - Compile translations: `lingui compile`

### Web3 Integration

#### wagmi
- React hooks for Ethereum
- Simplified blockchain interactions
- State management for Web3 data
- Wallet connection handling

#### viem
- Low-level TypeScript Ethereum library
- Type-safe contract interactions
- Efficient RPC communication
- Used alongside wagmi for blockchain operations

#### RainbowKit
- Wallet connection UI components
- Customizable wallet modal
- Support for multiple wallet providers
- Seamless integration with wagmi

## Development Setup

### Prerequisites
- Node.js >= 18.0.0 (required by package.json)
- npm or compatible package manager
- Git for version control
- Modern web browser (Chrome recommended for development)

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure required environment variables:
   - Blockchain provider URLs
   - API keys if needed
   - Network configurations

### Getting Started
1. Clone the repository
   ```bash
   git clone https://github.com/reserve-protocol/register.git
   cd register
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start development server
   ```bash
   npm run start
   ```

4. Access the app at `http://localhost:3000`

## Available Scripts

### Development
```bash
# Start development server with hot reload
npm run start

# Build for production
npm run build

# Preview production build
npm run serve

# Analyze bundle size
npm run analyze
```

### Testing
```bash
# Run unit tests
npm run test

# Run Playwright E2E tests
npm run test:e2e

# Start local blockchain fork for testing
npm run forknet
```

### Internationalization
```bash
# Extract and compile translations
npm run translations
```

### Other Utilities
```bash
# Parse collateral configurations
npm run parse-collaterals
```

## Testing
- End-to-end tests use Playwright
- Test files located in `/e2e` directory
- Tests run in Chromium by default
- CI configuration includes:
  - Automatic retries
  - Parallel test execution
  - HTML test reports

## Deployment
- Production builds via `npm run build`
- Output directory: `/build`
- Cloudflare Pages deployment
- Security headers configured for production
- Static assets optimization
