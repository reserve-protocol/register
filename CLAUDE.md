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
export const amountAtom = atom<string>('')
export const tokenAtom = atom<Token | null>(null)

// ✅ DO: Derived atoms for computed values
export const isValidAmountAtom = atom((get) => {
  const amount = get(amountAtom)
  return !isNaN(Number(amount)) && Number(amount) > 0
})

// ✅ DO: Action atoms for complex operations
export const resetFormAtom = atom(null, (get, set) => {
  set(amountAtom, '')
  set(tokenAtom, null)
  set(errorAtom, null)
})

// ✅ DO: Atom families for dynamic instances
export const tokenBalanceAtomFamily = atomFamily((tokenId: string) =>
  atom<bigint>(0n)
)

// ❌ DON'T: Large monolithic state atoms
// ❌ DON'T: Use useEffect to sync between atoms
```

### Data Fetching Patterns

#### Pattern 1: Updater Components

```typescript
// Used for syncing blockchain state with atoms
const Updater = () => {
  const chainId = useAtomValue(chainIdAtom)
  const setData = useSetAtom(dataAtom)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await readContract({
          address: CONTRACT_ADDRESS,
          abi: contractAbi,
          functionName: 'getData',
          chainId,
        })
        setData(result)
      } catch (error) {
        console.error('Failed to fetch', error)
      }
    }

    fetchData()
  }, [chainId])

  return null
}
```

#### Pattern 2: Custom Hooks

```typescript
// Encapsulates data fetching logic
export const useTokenBalance = (tokenAddress: Address) => {
  const wallet = useAtomValue(walletAtom)

  const { data, isLoading, error } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [wallet],
    enabled: !!wallet,
  })

  return {
    balance: data || 0n,
    isLoading,
    error,
  }
}
```

### Component Patterns

#### Feature Entry Pattern

```typescript
// index.tsx - Main feature component
const FeatureName = () => {
  useTrackPage('feature', 'view')  // Analytics

  return (
    <div className="container py-6">
      <Header />
      <MainContent />
      <Updater />  // Optional state sync
    </div>
  )
}

export default withNavigationGuard(FeatureName)
```

#### Form Pattern (react-hook-form + zod)

```typescript
// Form schema
const FormSchema = z.object({
  name: z.string().min(1, 'Required'),
  amount: z.string().refine(val => !isNaN(Number(val)), 'Invalid amount')
})

// Form component
const MyForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', amount: '0' },
    mode: 'onChange'
  })

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </FormProvider>
  )
}
```

#### Transaction Button Pattern

```typescript
const TransactionButton = () => {
  const [isValid] = useAtomValue(isValidAtom)
  const { writeContract, isPending, data } = useWriteContract()
  const { isSuccess, error } = useWaitForTransactionReceipt({ hash: data })

  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction successful')
      // Reset form or update state
    }
  }, [isSuccess])

  const label = isPending ? 'Please sign...' : data ? 'Confirming...' : 'Submit'

  return (
    <Button
      disabled={!isValid || isPending || !!data}
      onClick={() => writeContract({...})}
    >
      {(isPending || data) && <Spinner />}
      {label}
    </Button>
  )
}
```

### UI Component Patterns

#### Dialog/Modal Pattern

```typescript
// Using shadcn/ui dialog with controlled state
const MyModal = () => {
  const [open, setOpen] = useAtom(modalOpenAtom)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Modal</Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
        {/* Content */}
      </DialogContent>
    </Dialog>
  )
}
```

#### List/Table Pattern

```typescript
// Consistent list rendering with loading and empty states
const ItemList = () => {
  const items = useAtomValue(itemsAtom)
  const isLoading = useAtomValue(loadingAtom)

  if (isLoading) {
    return <Skeleton className="h-96" />
  }

  if (!items.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No items found</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-96">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} />
      ))}
    </ScrollArea>
  )
}
```

### Error Handling Patterns

#### Transaction Error Pattern

```typescript
// Consistent error display for blockchain transactions
const TransactionError = ({ error }: { error: Error }) => {
  const message = error.message.split('\n')[0] // Clean error message

  return (
    <Alert variant="destructive">
      <AlertTitle>Transaction Failed</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
```

#### Try-Catch Pattern

```typescript
// API calls with error handling
const fetchData = async () => {
  try {
    setLoading(true)
    const result = await apiCall()
    setData(result)
  } catch (error) {
    console.error('Failed to fetch data:', error)
    toast.error('Failed to load data')
  } finally {
    setLoading(false)
  }
}
```

### Navigation Patterns

#### Route-based Code Splitting

```typescript
// Lazy loading for better performance
const Governance = lazy(() => import('./views/governance'))
const Auctions = lazy(() => import('./views/auctions'))

// Route configuration
const routes = [
  {
    path: 'governance/*',
    element: <Governance />
  },
  {
    path: 'auctions/*',
    element: <Auctions />
  }
]
```

#### Navigation Guards

```typescript
// HOC pattern for route protection
const withNavigationGuard = (Component: React.FC) => {
  return (props: any) => {
    const wallet = useAtomValue(walletAtom)
    const navigate = useNavigate()

    useEffect(() => {
      if (!wallet) {
        navigate('/')
      }
    }, [wallet, navigate])

    return wallet ? <Component {...props} /> : null
  }
}
```

## Common Anti-Patterns & Analysis

### 1. Direct wagmi Usage in Components

**Status**: ❌ NOT an anti-pattern (per user preference)

- **Q**: Should wagmi hooks be wrapped in custom hooks?
- **A**: No, direct usage is acceptable and often clearer for simple cases

### 2. Mixed UI Libraries (theme-ui + Tailwind)

**Status**: ⚠️ Technical debt, not anti-pattern

- **Q**: Is this intentional?
- **A**: Yes, gradual migration from theme-ui to Tailwind/shadcn
- **Impact**: Increased bundle size, inconsistent styling
- **Solution**: Complete migration when time permits

### 3. Console Logging in Production

**Status**: ❌ Anti-pattern

- **Q**: Are these debug logs or intentional?
- **A**: Most are debug logs that should be removed
- **Impact**: Information leakage, performance
- **Solution**: Use proper logging service or remove

### 4. Large Component Files (150+ lines)

**Status**: ⚠️ Code smell, not hard rule

- **Q**: What's the threshold?
- **A**: Prefer under 150 lines, but readability > arbitrary limits
- **Solution**: Extract sub-components when it improves clarity

### 5. Inconsistent Async Patterns

**Status**: ❌ Anti-pattern

```typescript
// ❌ Mixing patterns
fetchData().then(setData) // Sometimes this
await fetchData() // Sometimes this

// ✅ Pick one pattern
const data = await fetchData()
setData(data)
```

### 6. Missing Loading States

**Status**: ❌ Anti-pattern

- **Q**: Should every async operation have loading state?
- **A**: Yes, for better UX
- **Solution**: Use consistent loading pattern

### 7. Hardcoded Values

**Status**: ⚠️ Context-dependent

```typescript
// ❌ Bad: Magic numbers without context
const MIN_AMOUNT = 0.0015

// ✅ Good: Named constants with context
const MIN_MINTING_FEE = parseEther('0.0015') // 0.15% minimum fee
```

### 8. useEffect for Derived State

**Status**: ❌ Anti-pattern with Jotai

```typescript
// ❌ Don't sync atoms with useEffect
useEffect(() => {
  setDerivedAtom(baseValue * 2)
}, [baseValue])

// ✅ Use derived atoms
const derivedAtom = atom((get) => get(baseAtom) * 2)
```

## Common Implementation Patterns

### Token Selection Pattern

```typescript
// Atom for selected token
export const selectedTokenAtom = atom<Token | null>(null)

// Component with token selector
const TokenSelector = () => {
  const [selectedToken, setSelectedToken] = useAtom(selectedTokenAtom)
  const tokens = useAtomValue(availableTokensAtom)

  return (
    <Select
      value={selectedToken?.address}
      onValueChange={(address) => {
        const token = tokens.find(t => t.address === address)
        setSelectedToken(token || null)
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select token" />
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem key={token.address} value={token.address}>
            <div className="flex items-center gap-2">
              <TokenIcon token={token} />
              <span>{token.symbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### Amount Input Pattern

```typescript
// Validation atom
export const isValidAmountAtom = atom((get) => {
  const amount = get(amountAtom)
  const balance = get(balanceAtom)
  return !isNaN(Number(amount)) && Number(amount) > 0 && parseEther(amount) <= balance
})

// Amount input component
const AmountInput = () => {
  const [amount, setAmount] = useAtom(amountAtom)
  const balance = useAtomValue(balanceAtom)
  const isValid = useAtomValue(isValidAmountAtom)

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <label>Amount</label>
        <button
          onClick={() => setAmount(formatUnits(balance, 18))}
          className="text-primary hover:underline"
        >
          Max: {formatCurrency(Number(formatUnits(balance, 18)))}
        </button>
      </div>
      <Input
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="0.0"
        className={cn(!isValid && amount && "border-destructive")}
      />
    </div>
  )
}
```

### Accordion/Collapsible Pattern

```typescript
// Using radix-ui accordion
const FeatureAccordion = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1" className="border-b">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Icon />
            <span>Section Title</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pt-4">
            {/* Content */}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
```

### Data Table Pattern

```typescript
// With sorting and filtering
const DataTable = () => {
  const data = useAtomValue(tableDataAtom)
  const [sortConfig, setSortConfig] = useState<SortConfig>()
  const [filter, setFilter] = useState('')

  const sortedData = useMemo(() => {
    if (!sortConfig) return data
    return [...data].sort((a, b) => {
      // Sorting logic
    })
  }, [data, sortConfig])

  const filteredData = useMemo(() => {
    return sortedData.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [sortedData, filter])

  return (
    <div>
      <Input
        placeholder="Filter..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Toast Notification Pattern

```typescript
// Success/Error notifications
const handleTransaction = async () => {
  try {
    const tx = await writeContract({...})
    toast.success('Transaction submitted', {
      description: `View on explorer`,
      action: {
        label: 'View',
        onClick: () => window.open(getExplorerUrl(tx.hash))
      }
    })
  } catch (error) {
    toast.error('Transaction failed', {
      description: getErrorMessage(error)
    })
  }
}
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

**IMPORTANT**: Never run npm scripts automatically without explicit user request.

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

- **State Management**
  - Create small, focused atoms (single responsibility)
  - Use derived atoms for computed values
  - Use atom families for dynamic instances
  - Prefer `useAtomValue` for read-only, `useSetAtom` for write-only
- **Component Architecture**
  - Keep components under 150 lines (soft limit)
  - Extract reusable logic into custom hooks
  - Use composition over inheritance
  - Implement loading and error states consistently
- **Styling**
  - Use TailwindCSS utilities exclusively
  - Use `cn()` helper for conditional classes
  - Follow shadcn/ui component patterns
  - Use semantic color variables (primary, destructive, etc.)
- **Forms**
  - Always use react-hook-form with zod validation
  - Use FormProvider for complex forms
  - Implement proper error messages
  - Show validation state in real-time (mode: 'onChange')
- **Blockchain Interactions**
  - Handle transaction states (pending, confirming, success, error)
  - Show clear error messages to users
  - Use wagmi hooks directly when simple (not an anti-pattern)
  - Implement proper loading states for all async operations
- **Code Organization**
  - Follow feature-based folder structure
  - Use kebab-case for all files and folders
  - Place shared utilities in `/utils`
  - Keep atoms close to their usage (feature-specific)

### Don'ts ❌

- **State Management**
  - Create large monolithic atoms
  - Use useEffect to sync between atoms
  - Store derived state in atoms
  - Mix state management patterns
- **Component Architecture**
  - Create "god components" that do everything
  - Mix presentation and business logic
  - Ignore loading/error states
  - Use index as key in dynamic lists
- **Styling**
  - Create custom CSS files
  - Use inline style prop
  - Mix theme-ui with new components
  - Hard-code colors instead of using theme
- **Performance**
  - Fetch data in render phase
  - Create functions inside render (use useCallback)
  - Skip React.memo for expensive components
  - Ignore bundle size impact
- **Code Quality**
  - Leave console.log statements
  - Ignore TypeScript errors
  - Copy-paste without understanding patterns
  - Create new patterns without team discussion

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

_Remember: When in doubt, follow existing patterns in the codebase. The Index DTF code (newer) represents current best practices, while Yield DTF code is legacy._
