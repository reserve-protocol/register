# Subgraph Data Requirements for Accurate RSR Burn Calculation

## Current Problem
The RSR burn calculation needs to accurately track both minting fees and TVL fees from Index DTFs to properly calculate the 5¢ per $1 revenue burn rate. Currently, we only have cumulative revenue data and need time-series snapshots to calculate monthly burns and validate against actual burn transactions.

**Key Constraints:**
- Only onchain data available (no USD calculations in subgraph)
- Track volumes in DTF token terms (shares/supply)
- Use snapshot patterns similar to existing TokenDailySnapshot
- Frontend calculates USD values using current prices

## Required New Entities

### 1. Protocol Revenue Snapshots

Following the existing snapshot pattern, create accumulator and time-series entities:

```graphql
# Accumulator entity (always updated)
type ProtocolRevenue @entity {
  id: ID! # "singleton"

  # Cumulative totals (in wei/BigInt)
  totalRevenue: BigInt!
  totalProtocolRevenue: BigInt!
  totalGovernanceRevenue: BigInt!
  totalExternalRevenue: BigInt!

  # Cumulative mint metrics
  totalMintCount: BigInt!
  totalMintShares: BigInt! # Total DTF shares minted
  totalMintFeeCollected: BigInt! # Total fees collected from mints

  # Last update
  lastUpdateBlock: BigInt!
  lastUpdateTimestamp: BigInt!
}

# Daily snapshot
type ProtocolRevenueDailySnapshot @entity {
  " { # of days since Unix epoch } "
  id: ID!

  # Daily revenue (calculated as difference from previous day)
  dailyRevenue: BigInt!
  dailyProtocolRevenue: BigInt!
  dailyGovernanceRevenue: BigInt!
  dailyExternalRevenue: BigInt!

  # Daily mint activity
  dailyMintCount: Int!
  dailyMintShares: BigInt!
  dailyMintFeeCollected: BigInt!

  # Cumulative at end of day
  cumulativeRevenue: BigInt!
  cumulativeProtocolRevenue: BigInt!

  # Snapshot metadata
  blockNumber: BigInt!
  timestamp: BigInt!
}

# Monthly snapshot
type ProtocolRevenueMonthlySnapshot @entity {
  " { # of months since Unix epoch } "
  id: ID!

  # Monthly revenue
  monthlyRevenue: BigInt!
  monthlyProtocolRevenue: BigInt!
  monthlyGovernanceRevenue: BigInt!
  monthlyExternalRevenue: BigInt!

  # Monthly mint activity
  monthlyMintCount: Int!
  monthlyMintShares: BigInt!
  monthlyMintFeeCollected: BigInt!

  # Cumulative at end of month
  cumulativeRevenue: BigInt!
  cumulativeProtocolRevenue: BigInt!

  # Snapshot metadata
  blockNumber: BigInt!
  timestamp: BigInt!
}
```

### 2. Enhanced DTF Entity

Add minting and supply tracking to existing DTF:

```graphql
type DTF @entity {
  # ... existing fields ...

  # Add mint tracking
  totalMintCount: BigInt!
  totalMintShares: BigInt! # Total shares minted for this DTF
  totalBurnShares: BigInt! # Total shares burned/redeemed
  netSupply: BigInt! # Current circulating supply

  # Link to mint events
  mints: [MintEvent!] @derivedFrom(field: "dtf")

  # Link to snapshots
  dailySnapshots: [DTFDailySnapshot!] @derivedFrom(field: "dtf")
  monthlySnapshots: [DTFMonthlySnapshot!] @derivedFrom(field: "dtf")
}
```

### 3. DTF Snapshots

Track DTF-specific metrics over time:

```graphql
type DTFDailySnapshot @entity {
  " { DTF Address }-{ # of days since Unix epoch } "
  id: ID!

  dtf: DTF!

  # Supply metrics at end of day
  totalSupply: BigInt!
  dailyMintShares: BigInt!
  dailyBurnShares: BigInt!
  dailyNetSharesChange: BigInt!

  # Revenue for this DTF
  dailyRevenue: BigInt!
  dailyProtocolRevenue: BigInt!

  # Mint activity
  dailyMintCount: Int!
  dailyMintFeeCollected: BigInt!

  # TVL fee accrued (calculated from annualizedTvlFee)
  dailyTvlFeeAccrued: BigInt!

  # Snapshot metadata
  blockNumber: BigInt!
  timestamp: BigInt!
}

type DTFMonthlySnapshot @entity {
  " { DTF Address }-{ # of months since Unix epoch } "
  id: ID!

  dtf: DTF!

  # Monthly aggregates
  monthlySupplyChange: BigInt!
  monthlyMintShares: BigInt!
  monthlyBurnShares: BigInt!

  # Monthly revenue
  monthlyRevenue: BigInt!
  monthlyProtocolRevenue: BigInt!

  # Monthly mint activity
  monthlyMintCount: Int!
  monthlyMintFeeCollected: BigInt!

  # Monthly TVL fee
  monthlyTvlFeeAccrued: BigInt!

  # End of month values
  endSupply: BigInt!

  # Snapshot metadata
  blockNumber: BigInt!
  timestamp: BigInt!
}
```

### 4. Mint Event Tracking

Track individual mint transactions:

```graphql
type MintEvent @entity(immutable: true) {
  " { Transaction hash }-{ Log index } "
  id: ID!

  dtf: DTF!
  recipient: Account!
  shares: BigInt! # Amount of DTF shares minted
  assets: [BigInt!]! # Array of asset amounts deposited

  # Fee information
  feeRate: BigInt! # Fee rate at time of mint (D18 format)
  feeShares: BigInt! # Fee collected in shares
  protocolFeeShares: BigInt! # Protocol's portion
  governanceFeeShares: BigInt! # Governance portion

  # Transaction metadata
  blockNumber: BigInt!
  timestamp: BigInt!
  transactionHash: String!
  logIndex: Int!
}
```

### 5. Enhanced RSRBurn Entity

Update existing RSRBurn to track relationship with revenue:

```graphql
type RSRBurn @entity {
  # ... existing fields ...

  # Add tracking fields
  " Link to the monthly snapshot this burn relates to "
  revenueMonth: ProtocolRevenueMonthlySnapshot

  " Expected burn amount based on 5% of total revenue "
  expectedAmount: BigInt

  " Notes about the burn (e.g., 'monthly_protocol_burn', 'manual', etc.) "
  burnType: String
}
```

## Implementation Notes

### 1. Snapshot Creation Logic

```typescript
// In mapping handlers, update snapshots like:
function updateDailySnapshot(dtf: DTF, event: ethereum.Event): void {
  let dayID = event.block.timestamp.toI32() / 86400
  let snapshotID = dtf.id.concat('-').concat(dayID.toString())

  let snapshot = DTFDailySnapshot.load(snapshotID)
  if (snapshot == null) {
    snapshot = new DTFDailySnapshot(snapshotID)
    snapshot.dtf = dtf.id
    snapshot.timestamp = event.block.timestamp
    snapshot.blockNumber = event.block.number
    // Initialize daily counters
    snapshot.dailyMintCount = 0
    snapshot.dailyMintShares = ZERO_BI
    // ... etc
  }

  // Update snapshot with event data
  // ...

  snapshot.save()
}
```

### 2. TVL Fee Accrual Calculation

Since TVL fees accrue continuously, calculate daily accrual:

```typescript
function calculateDailyTvlFee(dtf: DTF, totalSupply: BigInt): BigInt {
  // annualizedTvlFee is in D27 format
  // Daily fee = (annualFee / 365) * totalSupply
  let dailyRate = dtf.annualizedTvlFee.div(BigInt.fromI32(365))
  return totalSupply.times(dailyRate).div(D27)
}
```

### 3. Platform Keep Percentage

The platform keep percentage isn't stored onchain but can be inferred from revenue distribution:

```typescript
function inferPlatformKeep(protocolRevenue: BigInt, totalRevenue: BigInt): BigDecimal {
  if (totalRevenue.equals(ZERO_BI)) return ZERO_BD
  return protocolRevenue.toBigDecimal().div(totalRevenue.toBigDecimal())
}
```

## Required Queries

### 1. Get Monthly Revenue Data

```graphql
query GetMonthlyRevenue($months: Int!) {
  protocolRevenueMonthlySnapshots(
    first: $months
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    timestamp
    monthlyRevenue
    monthlyProtocolRevenue
    monthlyMintCount
    monthlyMintShares
  }
}
```

### 2. Get DTF Minting Activity

```graphql
query GetDTFMintActivity($dtfId: ID!, $days: Int!) {
  dtf(id: $dtfId) {
    totalMintCount
    totalMintShares
    netSupply

    dailySnapshots(
      first: $days
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      dailyMintShares
      dailyMintCount
      dailyMintFeeCollected
      dailyTvlFeeAccrued
    }
  }
}
```

### 3. Compare Burns to Revenue

```graphql
query CompareBurnsToRevenue($startTime: BigInt!) {
  protocolRevenueMonthlySnapshots(
    where: { timestamp_gte: $startTime }
    orderBy: timestamp
    orderDirection: asc
  ) {
    timestamp
    monthlyRevenue
    monthlyProtocolRevenue
  }

  rsrBurns(
    where: { timestamp_gte: $startTime }
    orderBy: timestamp
    orderDirection: asc
  ) {
    amount
    timestamp
    transactionHash
  }
}
```

## Frontend Calculations

Since the subgraph only tracks onchain data (shares, not USD), the frontend needs to:

1. **Calculate USD values**:
   ```typescript
   // Get current DTF price from price oracle
   const dtfPriceUSD = await getPriceFromOracle(dtf.token)

   // Calculate USD volume
   const mintVolumeUSD = mintShares * dtfPriceUSD

   // Calculate fee revenue in USD
   const feeRevenueUSD = feeShares * dtfPriceUSD
   ```

2. **Calculate expected RSR burns**:
   ```typescript
   // Total revenue in USD (sum across all DTFs)
   const totalRevenueUSD = dtfs.reduce((sum, dtf) => {
     return sum + (dtf.revenue * dtf.priceUSD)
   }, 0)

   // Expected RSR burn (5¢ per $1)
   const expectedRSRBurnUSD = totalRevenueUSD * 0.05
   const expectedRSRBurnAmount = expectedRSRBurnUSD / rsrPrice
   ```

3. **Display with disclaimer**:
   ```tsx
   <Alert>
     <Info className="h-4 w-4" />
     <AlertDescription>
       Revenue and burn calculations are based on current market prices.
       Historical values may differ due to price fluctuations.
     </AlertDescription>
   </Alert>
   ```

## Priority Implementation Order

### Phase 1 (Critical)
1. `ProtocolRevenue` accumulator entity
2. `ProtocolRevenueDailySnapshot` for daily tracking
3. `MintEvent` entity to track minting volume
4. Update `DTF` entity with mint counters

### Phase 2 (Important)
1. `ProtocolRevenueMonthlySnapshot` for monthly aggregates
2. `DTFDailySnapshot` for per-DTF tracking
3. Enhanced `RSRBurn` with revenue linkage

### Phase 3 (Nice to Have)
1. `DTFMonthlySnapshot` for DTF-specific monthly data
2. Additional analytics fields

## Data Gaps This Solves

✅ Time-series revenue data (daily/monthly snapshots)
✅ Minting transaction history with fees
✅ Supply changes over time (mints vs burns)
✅ Revenue attribution to specific periods
✅ TVL fee accrual tracking

❌ Still need frontend to:
- Calculate USD values using current prices
- Get RSR price for burn calculations
- Handle price volatility disclaimers