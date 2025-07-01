# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm start` - Start development server (runs on port 3000)
- `npm run build` - Build for production (`tsc && vite build`)
- `npm run serve` - Preview production build

### Testing
- `npm test` - Run unit tests with Vite
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:lib` - Run library tests with Vitest

### Internationalization
- `npm run translations` - Extract and compile translations with LinguiJS

### Development Tools
- `npm run analyze` - Analyze bundle size
- `npm run forknet` - Start local Ethereum fork with Anvil
- `npm run parse-collaterals` - Parse collateral data

## Architecture Overview

This is a React application for the Reserve Protocol ecosystem, built with Vite, TypeScript, and modern Web3 technologies. The app enables users to create, manage, and interact with DTFs (Decentralized Trading Funds) and RTokens.

### Key Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn/ui components
- **State Management**: Jotai (atomic state management)
- **Web3**: Wagmi, Viem, RainbowKit
- **Charts**: Recharts
- **Internationalization**: LinguiJS
- **Testing**: Vitest, Playwright

### State Management Philosophy
The application uses **Jotai** for atomic, bottom-up state management:
- State is broken into small, independent atoms
- Derived state is preferred over useEffect
- Action atoms encapsulate business logic
- Files organized by feature domain in `src/state/`

### Component Architecture
Follows "Composition over Configuration" using shadcn/ui:
- Base components in `src/components/ui/` (unstyled, using cva for variants)
- Feature-specific components in `src/views/{feature}/components/`
- All styling via TailwindCSS utilities
- Use `cn()` utility for conditional classes

### Directory Structure
- `src/components/ui/` - Base shadcn/ui components
- `src/views/` - Page components organized by feature
- `src/hooks/` - Custom React hooks (especially blockchain interactions)
- `src/state/` - Jotai atoms organized by feature
- `src/utils/` - Pure helper functions
- `src/abis/` - Contract ABIs
- `src/locales/` - Internationalization files

### Key Features
- **Index DTF Management**: Create, deploy, and manage decentralized trading funds
- **Yield DTF Operations**: Staking, governance, auctions
- **Bridge**: Cross-chain asset transfers (Arbitrum, Base)
- **Portfolio**: User portfolio tracking and management
- **Governance**: Proposal creation, voting, delegation

### File Naming Convention
**All files and directories must use kebab-case**:
- ✅ `use-token-balance.ts`, `dtf-details/`
- ❌ `useTokenBalance.ts`, `DtfDetails/`

### Web3 Integration
- Multi-chain support (Ethereum, Arbitrum, Base)
- Contract interactions via Wagmi/Viem
- Real-time data from subgraphs
- Wallet connection via RainbowKit

### Environment Setup
Create `.env` file with:
```
VITE_MAINNET_URL=<your_mainnet_rpc>
VITE_SUBGRAPH_URL=<subgraph_endpoint>
```

### Development Notes
- The app uses atomic CSS with TailwindCSS - no custom CSS files
- State should be atomic and derived when possible
- Components compose from base shadcn/ui elements
- All blockchain interactions should use provided hooks
- Tests are configured for both unit (Vitest) and e2e (Playwright)