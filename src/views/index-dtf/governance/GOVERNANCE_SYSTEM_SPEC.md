# Index-DTF Governance System Specification

## Overview

The Index-DTF Governance System enables decentralized management of DTF (Decentralized Trading Fund) parameters through on-chain proposals. This system handles three distinct governance contexts, each with its own set of configurable parameters and voting mechanisms.

## System Architecture

### Core Technologies
- **State Management**: Jotai (atomic state management)
- **Form Management**: React Hook Form + Zod validation
- **Smart Contract Integration**: wagmi/viem
- **UI Components**: Custom component library based on shadcn/ui

### Governance Contexts

1. **DTF Settings** (`ownerGovernance`) - Main DTF configuration
2. **DAO Settings** (`stToken.governance`) - Lock vault governance  
3. **Basket Settings** (`tradingGovernance`) - Trading/basket governance

## Directory Structure

```
/governance/
├── views/
│   └── propose/
│       └── views/
│           ├── propose-dtf-settings/      # Main DTF configuration
│           ├── propose-dao-settings/      # DAO/Lock vault settings
│           └── propose-basket-settings/   # Trading governance settings
```

## Common Patterns

### 1. Component Structure
Each proposal type follows this pattern:
```
propose-{type}-settings/
├── index.tsx                    # Main entry with FormProvider
├── atoms.ts                     # Jotai state atoms
├── form-fields.ts              # Zod schema & types
├── updater.tsx                 # Form state synchronization
└── components/
    ├── {type}-settings-proposal-section(s).tsx    # Form UI
    ├── {type}-settings-proposal-overview.tsx      # Side panel
    ├── {type}-settings-proposal-changes.tsx       # Changes summary
    ├── confirm-{type}-settings-proposal.tsx       # Confirmation stage
    └── submit-proposal-button.tsx                 # Transaction submission
```

### 2. State Management Pattern

#### Core Atoms (shared across all types):
```typescript
isProposalConfirmedAtom    // Boolean - switches between form/confirm views
proposalDescriptionAtom    // String - proposal description
isFormValidAtom           // Boolean - form validation state
```

#### Change Tracking Pattern:
```typescript
{type}GovernanceChangesAtom  // Object - tracks only changed values
has{Type}GovernanceChangesAtom  // Boolean - computed from changes
isProposalValidAtom  // Boolean - has changes AND form valid
```

### 3. Form Field Naming Convention
```typescript
// Pattern: {prefix}{FieldName}
basketVotingDelay    // For basket settings
daoVotingDelay       // For DAO settings  
governanceVotingDelay // For DTF settings
```

### 4. Time Conversion Pattern
All time values are:
- **Stored**: In seconds (blockchain standard)
- **Displayed**: In days (user-friendly)
- **Conversion**: `seconds / 86400 = days`

### 5. Percentage Storage Patterns
- **proposalThreshold**: Stored as `percentage * 1e18` (e.g., 1% = 1e18)
- **quorumNumerator**: Stored as direct percentage (e.g., 10% = 10)
- **Fee percentages**: Vary by contract, check specific implementation

## Proposal Types Details

### 1. DTF Settings Proposal
**Target**: `indexDTF.ownerGovernance`

**Sections**:
- Metadata (mandate)
- Revenue (fees: folio, mint)
- Distribution (governance, deployer, platform shares)
- Governance (voting parameters)
- Auctions (auction length)
- Roles (guardians, brand managers, auction launchers)
- Dust Tokens (remove small balance tokens)

**Special Features**:
- Accordion UI with single-select behavior
- Guardian role changes target timelock contract
- Fixed platform fee (20%) in revenue distribution

### 2. DAO Settings Proposal  
**Target**: `indexDTF.stToken.governance`

**Sections**:
- Revenue Tokens (add/remove reward tokens)
- Governance (voting parameters)

**Key Functions**:
- `addRewardToken(address)`
- `removeRewardToken(address)`
- Standard governance parameter updates

### 3. Basket Settings Proposal
**Target**: `indexDTF.tradingGovernance`

**Sections**:
- Governance (voting parameters only)

**Simplest implementation** - single section, no accordion

## Smart Contract Integration

### Proposal Submission Pattern
```typescript
// All proposals use same ABI function:
propose(
  targets: Address[],     // Contract addresses to call
  values: uint256[],      // ETH values (always 0)
  calldatas: bytes[],     // Encoded function calls
  description: string     // Proposal description
)
```

### Calldata Encoding
```typescript
encodeFunctionData({
  abi: governanceAbi,
  functionName: 'setVotingDelay',
  args: [BigInt(seconds)]
})
```

### Target Contract Mapping
- Most functions → governance contract
- Guardian role changes → timelock contract
- Revenue token changes → staking vault contract

## Type Definitions

### Core Types
```typescript
interface GovernanceChanges {
  votingDelay?: number      // seconds
  votingPeriod?: number     // seconds
  proposalThreshold?: number // percentage (0-100)
  quorumPercent?: number    // percentage (0-100)
  executionDelay?: number   // seconds
}

interface ProposalData {
  calldatas: Hex[]
  targets: Address[]
}
```

## Common Gotchas

### 1. State Management
- **Issue**: Governance changes being lost on navigation
- **Solution**: Use callback pattern in setters:
  ```typescript
  setChanges((prev) => ({ ...prev, newChange }))
  ```

### 2. Governance Address Confusion
- DTF Settings → `ownerGovernance`
- DAO Settings → `stToken.governance`  
- Basket Settings → `tradingGovernance`
- **Never** mix these up!

### 3. Time Display
- Always show human-readable format
- Handle edge cases (< 1 day = show hours)

### 4. Form Validation
- Optional fields in Zod schemas for governance parameters
- Required fields for addresses and percentages
- Max values for percentages (100%)

### 5. Contract ABI Matching
- DTF uses `dtf-index-governance` ABI (uint48/uint32 for time values)
- Standard Governance.ts expects uint256
- Wrong ABI = values won't decode properly

## UI/UX Patterns

### 1. Two-Stage Process
1. **Configuration Stage**: User fills form, sees live preview of changes
2. **Confirmation Stage**: User adds description, submits transaction

### 2. Change Preview Pattern
- Show "Current → New" with arrow
- Include revert buttons per change
- Group by change type

### 3. Timeline Component
- Shows current step
- Indicates what's completed/active
- Guides user through process

### 4. Sticky Overview
- Proposal overview stays visible while scrolling
- Only in configuration stage, not confirmation

## Security Considerations

1. **Input Validation**: All percentages capped at 100%
2. **Address Validation**: Ethereum address format enforced
3. **Role Management**: Guardian changes require extra encoding
4. **Change Detection**: Prevent submitting empty proposals

## Development Guidelines

### Adding New Proposal Type
1. Create new folder following naming pattern
2. Copy basic structure from basket-settings (simplest)
3. Define form schema in `form-fields.ts`
4. Implement atoms following patterns
5. Create updater for form sync
6. Build UI components
7. Add route in `app-routes.tsx`

### Adding New Parameter
1. Add to form schema with validation
2. Add to changes atom interface
3. Update updater effect for change detection
4. Add encoding in proposal data atom
5. Create change preview component
6. Update the relevant section component

### Testing Checklist
- [ ] Form validation works correctly
- [ ] Changes are detected properly
- [ ] Revert functionality works
- [ ] Navigation doesn't lose state
- [ ] Proposal submits successfully
- [ ] All values encode/decode correctly

## Performance Optimizations

1. **Memoization**: Use for expensive calculations
2. **Atom Composition**: Derive state vs storing computed values
3. **Effect Dependencies**: Minimize to prevent loops
4. **Form Watching**: Only watch fields you need

## Future Improvements

1. **Shared Components**: Extract common submit button logic
2. **Type Safety**: Create shared governance types
3. **Error Handling**: Unified error management
4. **Testing**: Add comprehensive test coverage
5. **Documentation**: Inline JSDoc comments