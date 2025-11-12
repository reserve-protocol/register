# RSR Burn & Index DTF Revenue Dashboard Implementation Guide

## Overview
This document details the implementation of the RSR burn tracking and Index DTF revenue dashboard for the Reserve Protocol. The dashboard provides comprehensive metrics, projections, and analytics for RSR token burns and Index DTF revenue streams.

## Core Business Logic

### RSR Burn Formula
**CRITICAL**: RSR burns are calculated as **5 cents per dollar of TVL annually**, not revenue-based.
- Formula: `Annual RSR Burn (USD) = TVL * $0.05`
- Monthly: `Monthly RSR Burn (USD) = (TVL * $0.05) / 12`
- In RSR tokens: `RSR Burn Amount = USD Amount / RSR Price`

### Platform Fee Structure (Progressive, Tax-Bracket Style)
The platform takes a progressive share of fees based on TVL tranches:

| TVL Tranche | Platform Keeps | Recipient Share |
|-------------|----------------|-----------------|
| < $100M | 50% | 50% |
| $100M - $1B | 40% | 60% |
| $1B - $10B | 30% | 70% |
| $10B - $100B | 20% | 80% |
| $100B - $1T | 10% | 90% |
| > $1T | 5% | 95% |

**Floor Override**: Minimum 15 basis points (0.15%) if calculated fee is lower.

**Example**: At $1B TVL, effective platform rate is ~36% (calculated progressively across tranches).

## Key Files and Components

### 1. Data Hook: `use-index-revenue-enhanced.ts`
**Path**: `/src/views/rsr/hooks/use-index-revenue-enhanced.ts`

**Key Features**:
- Fetches revenue data from multiple chains (Mainnet, Base, BSC)
- Aggregates RSR burn data across all chains
- Calculates expected vs actual burns
- Tracks RSR locked in governance
- Provides growth projections

**Important Functions**:
```typescript
// Multi-chain aggregation
const chains = [ChainId.Mainnet, ChainId.Base, ChainId.BSC]
// Note: Arbitrum is DEPRECATED for Index DTFs

// RSR burn calculation (TVL-based)
const calculateExpectedRsrBurn = () => {
  const BURN_RATE_PER_TVL = 0.05 // $0.05 per $1 of TVL per year
  const annualBurnUSD = totalTVL * BURN_RATE_PER_TVL
  const monthlyBurnUSD = annualBurnUSD / 12
  return monthlyBurnUSD
}

// Progressive platform share calculation
const calculateProgressivePlatformShare = (tvl: number) => {
  // Applies tax-bracket style calculation
  // Returns effective platform percentage
}
```

**Data Structure**:
- Returns `IndexRevenueMetrics` with comprehensive metrics
- Includes historical burns (filtered for table, unfiltered for charts)
- Tracks growth rates for projections

### 2. Main Dashboard: `index-revenue-dashboard.tsx`
**Path**: `/src/views/rsr/components/index-revenue-dashboard.tsx`

**Key Metrics Cards**:
1. Total Revenue (Index DTFs)
2. Total TVL with DTF count
3. RSR Burned (Actual from blockchain)
4. RSR Locked (In governance) - replaced "Burn Accuracy"

**Removed Components**:
- Chain Distribution card (per user request)

### 3. RSR Burn Estimation Component: `rsr-burn-estimation.tsx`
**Path**: `/src/views/rsr/components/rsr-burn-estimation.tsx`

**Major Sections**:

#### A. RSR Burn Overview
- Monthly burn in USD and RSR
- Annual projections
- Based on 5¢ per $1 TVL formula

#### B. RSR Ecosystem Metrics
- RSR Locked in Governance (vote-locked tokens)
- Total RSR Burned (all-time)
- Monthly burn analysis (expected vs actual)

#### C. Historical Burns
- Chart showing monthly burns (all burns ≥ 0 RSR)
- Table showing significant burns (≥ 1000 RSR)
- Linked to blockchain explorers

#### D. RSR Burn Calculator
- Interactive sliders for TVL ($10M - $500M range)
- Minting volume slider ($1M - $50M range)
- Uses current TVL as default
- Shows revenue breakdown and burn calculations

#### E. Path to $1B TVL Projections
**Advanced 12-month projections including**:
- Progressive growth to reach $1B target
- Tax-bracket platform fee calculations
- Minting revenue from growth (20% of TVL growth estimated as mints)
- Monthly breakdown with:
  - TVL at each month
  - RSR burn amounts
  - Total revenue
  - Effective platform rate
- Visual indicators for target achievement

### 4. Calculator Hook: `useRSRBurnCalculator`
**Location**: Within `use-index-revenue-enhanced.ts`

**Important Update**: Fixed to use TVL-based calculation:
```typescript
// CORRECT: TVL-based burn calculation
const BURN_RATE_PER_TVL = 0.05 // $0.05 per $1 of TVL per year
const annualBurnUSD = tvl * BURN_RATE_PER_TVL
const rsrBurnUSD = annualBurnUSD / 12 // Monthly burn

// NOT revenue-based (this was the error initially)
```

## Data Sources

### GraphQL Endpoints (Index DTF Subgraph)
```typescript
const INDEX_DTF_SUBGRAPH_URL = {
  [ChainId.Mainnet]: 'https://subgraph.satsuma-prod.com/.../dtf-index-mainnet/api',
  [ChainId.Base]: 'https://subgraph.satsuma-prod.com/.../dtf-index-base/api',
  [ChainId.BSC]: 'https://subgraph.satsuma-prod.com/.../dtf-index-bsc/api',
}
```

### Key Queries
1. **indexDTFRevenueQuery**: DTF revenue, fees, and stToken data
2. **rsrBurnQuery**: Individual burn transactions and global stats
3. **rsrBurnSnapshotsQuery**: Daily and monthly burn aggregates
4. **tokenSnapshotsQuery**: Revenue growth tracking

### RSR Token Addresses
```typescript
const RSR_ADDRESSES = [
  '0x320623b8e4ff03373931769a31fc52a4e78b5d70', // Mainnet
  '0xab36452dbac151be02b16ca17d8919826072f64a', // Base
  '0x4076cc26efee47825917d0fec3a79d0bb9a6bb5c', // BSC
]
```

## Important Implementation Details

### 1. Multi-Chain Aggregation
- Fetches burns from all three chains where Index DTFs exist
- Aggregates totals for global metrics
- Maintains chain-specific data where needed

### 2. Burn Data Filtering
- **Chart**: Uses all burns (unfiltered) - `allHistoricalBurns`
- **Table**: Shows only burns ≥ 1000 RSR - `historicalBurns`
- This prevents small burns from cluttering the table while showing complete data in charts

### 3. Growth Projections
- Targets $1B TVL over 12 months
- Calculates required monthly growth rate
- Caps at 25% monthly growth for realism
- Accounts for progressive fee structure changes

### 4. Revenue Calculation
- **TVL Fees**: Annual percentage of TVL (typically 2%)
- **Minting Fees**: One-time on new mints (typically 0.3%)
- Platform share calculated progressively based on TVL

### 5. RSR Locked Tracking
- Identifies DTFs using RSR as staking token
- Sums stToken total supply for RSR-based DTFs
- Displays in top metrics card

## Common Issues and Solutions

### Issue 1: Burn Calculation Confusion
**Problem**: Initial implementation used revenue-based calculation
**Solution**: Changed to TVL-based (5 cents per dollar of TVL annually)

### Issue 2: Missing Burns in Table
**Problem**: 1000 RSR threshold filtered out smaller burns
**Solution**: Separate filtered/unfiltered data for table vs chart

### Issue 3: Calculator Low Estimates
**Problem**: Default values were too low, formula was wrong
**Solution**:
- Use actual current TVL as default
- Fix formula to TVL-based calculation
- Increase slider ranges

### Issue 4: Multi-Chain Data
**Problem**: Initially only fetched from Mainnet
**Solution**: Aggregate burns from all chains (Mainnet, Base, BSC)

## Testing and Validation

### Key Validation Points
1. RSR burn = 5¢ per $1 TVL annually (not revenue)
2. Burns aggregated from all chains
3. Progressive fee structure calculated correctly
4. Growth projections reach $1B target realistically

### Console Logging
Comprehensive logging included for debugging:
- RSR burn calculation details
- Revenue breakdowns
- Chain distribution
- Top DTFs by TVL
- Growth rate calculations

Look for: "🔥🔥🔥 RSR BURN COMPREHENSIVE DATA ANALYSIS 🔥🔥🔥"

## Future Improvements

### Potential Enhancements
1. Add pagination for burn transactions table
2. Implement real-time burn tracking
3. Add export functionality for projections
4. Include more detailed fee breakdown visualizations
5. Add comparison with Yield DTF burns

### Data Quality
1. Ensure subgraph indexes all burn events
2. Validate RSR price feeds
3. Cross-reference with on-chain data
4. Monitor for missing transactions

## Key Takeaways for Future Development

1. **Always use TVL-based burn calculation** (5¢ per $1 TVL/year)
2. **Aggregate data from all chains** (Mainnet, Base, BSC - NOT Arbitrum)
3. **Apply progressive fee structure** using tax-bracket method
4. **Separate filtered/unfiltered data** for different UI needs
5. **Use actual current values** as defaults in calculators
6. **Account for minting revenue** when projecting growth
7. **RSR Locked != RSR Burned** - these are different metrics

## Related Documentation
- `/docs/specs/rebalance-v4-specification.md`
- `/docs/specs/index-dtf-governance-and-proposal.md`
- `/docs/subgraph/dtf-index-subgraph.md`
- `/CLAUDE.md` - General project guidelines

## Contact and Support
For questions about this implementation, refer to:
- GitHub Issues: https://github.com/reserve-protocol/register
- Reserve Protocol Docs: https://reserve.org/protocol/

---
*Last Updated: November 2024*
*Implementation by: Claude (with user guidance)*
*Key Formula: RSR Burn = $0.05 per $1 TVL annually*