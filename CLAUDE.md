# Register Application Knowledge Base

## Overview

Register is the official web interface for the Reserve Protocol, enabling users to interact with Index DTFs (Decentralized Token Folios) and Yield DTFs. This document serves as a comprehensive knowledge base for Claude to effectively assist with development.

## Project Context

### Business Context
- **Company**: Small startup with 3 frontend developers
- **Product Focus**: Index DTFs (newer product line) with legacy support for Yield DTFs
- **Users**: DeFi users, governance participants, and RSR stakers
- **Vision**: Decentralized, user-friendly interface for next-generation on-chain financial products

### Technical Stack
- **Framework**: React 18 with Vite
- **Language**: TypeScript (strict mode)
- **State Management**: Jotai (atomic state management)
- **Blockchain**: wagmi + viem + RainbowKit
- **Styling**: TailwindCSS + shadcn/ui components
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Networks**: Ethereum & Base (Arbitrum deprecated for Index DTFs)

## Reserve Protocol Fundamentals

### Core Concepts

#### Index DTFs
- On-chain token portfolios (similar to ETFs)
- Support up to 100+ tokens on Base, 10+ on Ethereum
- Two types:
  - **Native DTFs** (`weightControl = true`): Maintain percentage allocations
  - **Tracking DTFs** (`weightControl = false`): Maintain fixed token units
- Governance via vote-locking mechanism
- Permissionless minting/redemption

#### Yield DTFs (formerly RTokens)
- Asset-backed, yield-bearing stablecoins
- Secured by RSR stakers (first-loss capital)
- Generate yield from underlying collateral
- Legacy product with older UI (theme-ui)

#### Rebalancing (v4)
- Single governance proposal executes entire rebalance
- Dual-window system: Auction Launcher → Community
- Dutch auction mechanism via CoWSwap
- Price volatility controls (LOW: 5%, MEDIUM: 10%, HIGH: 50%)
- Progressive rebalancing with percent slider

### Key Terminology
- **Folio**: Smart contract term for Index DTF token
- **RSR**: Reserve Rights token (governance & staking)
- **D27 Format**: Price representation with 27 decimals
- **Geometric Mean**: Method for calculating fair prices
- **Absolute vs Relative Progression**: Actual vs user-visible rebalance progress

## Architecture Patterns

### State Management (Jotai)
```typescript
// ✅ DO: Small, focused atoms
export const sourceChainAtom = atom<ChainId>(ChainId.ETHEREUM)
export const amountAtom = atom<string>('')

// ✅ DO: Derived atoms instead of useEffect
export const isBridgeActiveAtom = atom((get) => {
  const source = get(sourceChainAtom)
  const dest = get(destinationChainAtom)
  return source !== dest
})

// ✅ DO: Action atoms for complex logic
export const swapChainsAtom = atom(null, (get, set) => {
  const source = get(sourceChainAtom)
  const dest = get(destinationChainAtom)
  set(sourceChainAtom, dest)
  set(destinationChainAtom, source)
})

// ❌ DON'T: Large monolithic atoms or useEffect for syncing
```

### Blockchain Interaction Pattern
```typescript
// Components → Custom Hooks → wagmi/viem → Blockchain

// ✅ DO: Encapsulate in custom hooks
const useDTFDetails = (tokenId: string) => {
  const { data, isLoading, error } = useReadContract({
    address: dtfAddress,
    abi: dtfAbi,
    functionName: 'getDetails',
    args: [tokenId]
  })
  
  return {
    data: formatDTFData(data),
    isLoading,
    error
  }
}

// ❌ DON'T: Use wagmi directly in components
```

### Component Architecture
```typescript
// ✅ DO: Compose with shadcn/ui + TailwindCSS
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MyComponent = ({ isActive }: Props) => (
  <Card className={cn("p-4", isActive && "border-primary")}>
    <CardHeader>
      <h2 className="text-lg font-semibold">Title</h2>
    </CardHeader>
    <CardContent>
      <Button variant="outline" size="sm">
        Action
      </Button>
    </CardContent>
  </Card>
)

// ❌ DON'T: Custom CSS files or style prop
```

## Project Structure

```
src/
├── assets/           # Static assets
├── components/
│   ├── ui/          # shadcn/ui base components
│   └── (shared)/    # Global composite components
├── hooks/           # Custom React hooks (blockchain priority)
├── state/           # Jotai atoms by feature
├── types/           # TypeScript definitions
├── utils/           # Pure utility functions
└── views/           # Route-based page components
    ├── index-dtf/   # Index DTF features (NEW)
    │   ├── governance/
    │   ├── auctions/
    │   │   └── views/
    │   │       └── rebalance/  # v4 rebalance UI
    │   └── issuance/
    └── staking/     # Yield DTF features (LEGACY)
```

### Naming Conventions
- **Files & Directories**: `kebab-case` (MANDATORY)
- **Components**: PascalCase exports from kebab-case files
- **Functions**: `const` arrow functions preferred
- **Git Branches**: `feature/description`
- **Commits**: `feat:`, `chore:`, `bug:` (optional)

## Key Features & Implementation

### 1. Index DTF Rebalancing (v4)
**Location**: `/views/index-dtf/auctions/views/rebalance/`

**Flow**:
1. Governance proposal with `startRebalance` call
2. Proposal execution starts auction launcher window
3. Launcher/community calls `openAuction`
4. Trading bots/CoWSwap fill orders
5. Basket updates on-chain

**Key Components**:
- `rebalance-setup.tsx`: Percent slider (0-100%)
- `launch-auctions-button.tsx`: Triggers auctions
- `rebalance-metrics.tsx`: Progress visualization
- `use-rebalance-params.ts`: Fetches chain data
- `get-rebalance-open-auction.ts`: Core calculations

### 2. Governance System
**Location**: `/views/index-dtf/governance/`

**OpenZeppelin Governor Integration**:
- Proposal → Voting → Timelock → Execution
- Vote-locking for Index DTFs
- RSR staking for Yield DTFs
- Delegation support

### 3. Issuance & Redemption
**Location**: `/views/index-dtf/issuance/`

**Methods**:
1. Zapper (one-click with any token)
2. Manual (exact collateral)
3. Direct contract interaction

### 4. Data Management

**Blockchain Data**:
- Read: Custom hooks wrapping `useReadContract`
- Write: Custom hooks wrapping `useWriteContract`
- Events: Subgraph queries via GraphQL

**Price Data**:
- Yield DTFs: Chainlink oracles on-chain
- Index DTFs: api.reserve.org (Alchemy + DefiLlama)

**Subgraphs**:
- Yield DTFs: `reserve-subgraph`
- Index DTFs: `dtf-index-subgraph`

## External Integrations

### CoWSwap
- Decentralized solver network for rebalancing
- Batch auction settlement
- MEV protection

### RainbowKit
- Wallet connection UI
- Multi-wallet support
- ENS resolution
- Chain switching

### Price Oracles
- Chainlink (Yield DTFs)
- Alchemy + DefiLlama via api.reserve.org (Index DTFs)

## Development Workflow

### Git Flow
1. Create `feature/` branch
2. Push to trigger Cloudflare Pages deployment
3. Test on preview URL
4. PR with at least one reviewer
5. Merge to main

### Environment Setup
```env
# Required
VITE_WALLETCONNECT_ID=your_id

# Recommended (RPC providers)
VITE_ALCHEMY_KEY=your_key
VITE_INFURA_KEY=your_key
```

### Common Commands
```bash
npm install          # Install dependencies
npm run dev         # Start dev server
npm run build       # Build for production
npm run lint        # Run linter
npm run format      # Format code
```

### Testing
- **Current**: Manual testing on Base network
- **Planned**: Jest for unit tests, E2E with wallet integration
- **Note**: No current test coverage requirements

## Known Issues & Tech Debt

### High Priority
1. **Testing Infrastructure**: No automated tests
2. **Bundle Size**: Large SPA bundle
3. **Legacy UI**: Yield DTFs use old theme-ui components

### Complex Areas Needing Attention
- Governance implementation
- Mint/redeem flows
- Staking mechanisms
- Vote locking system
- DTF deployment process

### Performance Considerations
- React Query caches API calls
- Multiple RPC fallbacks for rate limiting
- 30-second refresh for active auctions

## Best Practices

### Do's ✅
- Use Jotai atoms for state (small, focused)
- Encapsulate blockchain logic in custom hooks
- Compose UI with shadcn/ui components
- Style with TailwindCSS utilities only
- Use `cn()` for conditional classes
- Follow kebab-case naming
- Create derived atoms instead of useEffect

### Don'ts ❌
- Import wagmi/viem directly in components
- Create large monolithic atoms
- Use custom CSS files
- Use inline style prop for styling
- Sync state with useEffect
- Create files without reading existing patterns

## Security Considerations

### Smart Contract Security
- All contracts audited
- Timelock protection on governance
- Role-based access control
- Single active rebalance constraint

### Frontend Security
- Static SPA (reduced attack surface)
- Security headers in Vite config
- Battle-tested libraries only
- No sensitive data in frontend

## Debugging Tips

### Common Issues
1. **"Module not found"**: Check kebab-case naming
2. **State not updating**: Verify atom dependencies
3. **Transaction failing**: Check wallet network
4. **Prices missing**: Verify oracle/API availability

### Useful Console Commands
```javascript
// Check current network
wagmi.getChainId()

// Get rebalance state
jotai.store.get(rebalanceMetricsAtom)

// Force refetch
queryClient.invalidateQueries(['queryKey'])
```

## Resources

### Documentation
- [Reserve Protocol Docs](https://reserve.org/protocol/)
- [wagmi Documentation](https://wagmi.sh)
- [RainbowKit Docs](https://rainbowkit.com/docs)
- [Jotai Documentation](https://jotai.org)
- [shadcn/ui Components](https://ui.shadcn.com)

### Internal Specs
- `/docs/specs/rebalance-v4-specification.md`
- `/docs/specs/index-dtf-governance-and-proposal.md`
- `/docs/architecture/*.md`

### Repositories
- Frontend: Current repository
- Yield DTF Subgraph: `reserve-protocol/reserve-subgraph`
- Index DTF Subgraph: `reserve-protocol/dtf-index-subgraph`

---

*Remember: When in doubt, follow existing patterns in the codebase. The Index DTF code (newer) represents current best practices, while Yield DTF code is legacy.*