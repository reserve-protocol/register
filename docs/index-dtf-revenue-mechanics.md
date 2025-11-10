# Index DTF Revenue Mechanics Documentation

## Overview
This document provides a comprehensive understanding of how revenue is generated, collected, and distributed in the Index DTF protocol, including the RSR burn mechanism.

## Revenue Sources

### 1. Minting Fee
- **Maximum**: 5% (capped by protocol)
- **When Collected**: On each token issuance (mint)
- **Calculation**: `(shares * mintFee + D18 - 1) / D18`
- **Type**: One-time fee per mint transaction

### 2. TVL Management Fee
- **Maximum**: 10% APY (Annual Percentage Yield)
- **When Collected**: Continuously, calculated block-by-block
- **Calculation**: Uses exponential decay curve: `fee = 1 / (1 - fee_per_second) ^ seconds_passed - 1`
- **Type**: Ongoing annual fee on Total Value Locked

## Platform Fee Structure (Progressive Share)

The platform takes a percentage of all fees based on TVL tiers:

| TVL Range | Platform Keep % | DTF Keeps % |
|-----------|----------------|-------------|
| < $100M | 50% | 50% |
| $100M - $1B | 40% | 60% |
| $1B - $10B | 30% | 70% |
| $10B - $100B | 20% | 80% |
| $100B - $1T | 10% | 90% |
| > $1T | 5% | 95% |

**Minimum Platform Fee**: 15 basis points (0.15%) floor

## Revenue Distribution

### Fee Recipients
1. **DAO/Platform** (Reserve Protocol):
   - Receives platform share based on TVL tier
   - Minimum 15 basis points guaranteed
   - Currently uses revenue to buy and burn RSR

2. **DTF Governance/Deployer**:
   - Receives remaining share after platform fee
   - Can be split among multiple recipients
   - Configured at DTF deployment

### Distribution Mechanics
- Fees collected in DTF share tokens
- Distributed pro-rata to configured recipients
- Recipients must be unique addresses
- Portions must sum to 100% (1e18 in contract)

## RSR Burn Mechanism

### Current Implementation
- **Burn Rate**: Approximately 5% of total protocol revenue (5 cents per dollar)
- **Frequency**: Monthly burn transactions
- **Process**:
  1. Platform collects fees in DTF tokens
  2. DTF tokens are sold for stablecoins/ETH
  3. Proceeds used to buy RSR from market
  4. RSR is burned (sent to 0x0 address)

### Revenue to Burn Calculation
```
Monthly Revenue = Minting Fees + TVL Fees
Platform Revenue = Monthly Revenue × Platform Keep %
RSR Burn Amount (USD) = Platform Revenue × 0.05 (5%)
RSR Burn Amount (tokens) = RSR Burn Amount (USD) / RSR Price
```

## Example Calculation

### Assumptions:
- DTF TVL: $10,000,000
- Monthly Minting Volume: $1,000,000
- Minting Fee: 0.3%
- TVL Fee: 2% APY
- Platform Keep: 50% (for < $100M TVL)
- RSR Price: $0.005

### Calculation:
1. **Monthly Minting Fee Revenue**: $1,000,000 × 0.003 = $3,000
2. **Monthly TVL Fee Revenue**: $10,000,000 × (0.02/12) = $16,667
3. **Total Monthly Revenue**: $3,000 + $16,667 = $19,667
4. **Platform Revenue**: $19,667 × 0.50 = $9,833
5. **RSR Burn (USD)**: $9,833 × 0.05 = $492
6. **RSR Burn (tokens)**: $492 / $0.005 = 98,333 RSR

## Important Notes

### Fee Accrual
- TVL fees accrue continuously (exponential model)
- No discrete collection intervals
- Users experience gradual value decrease relative to underlying assets

### Governance Control
- Fee rates set by DTF governance (within protocol limits)
- Fee recipients can be updated via governance
- Platform fee tiers are protocol-level, not DTF-specific

### Current vs Future
- RSR burning is current practice but not hardcoded
- Platform may adjust burn percentage or mechanism
- Individual DTFs cannot control platform revenue usage

## Subgraph Data Available

### Revenue Tracking
- `totalRevenue`: Cumulative revenue collected
- `protocolRevenue`: Platform/DAO share
- `governanceRevenue`: DTF governance share
- `externalRevenue`: Other recipients' share

### RSRBurn Entity
```graphql
type RSRBurn {
  id: ID!
  amount: BigInt!  # Amount of RSR burned (18 decimals)
  burner: Bytes!   # Address that executed burn
  timestamp: BigInt!
  transactionHash: String!
}
```

### Missing Data (Potential Improvements)
- Daily/Monthly revenue snapshots
- Revenue by fee type (minting vs TVL)
- Historical fee rates
- Conversion rates (DTF → USD → RSR)

## Corrections Needed in Current Implementation

1. **RSR Burn Calculation**: Should be 5% of platform revenue, not total revenue
2. **Monthly Projections**: Need to account for platform keep percentage
3. **Growth Assumptions**: Should be based on historical data when available
4. **Fee Averages**: Should weight by actual TVL and volume, not simple average