# Yield DTF Analytics CSV Export — Field Reference

Each row represents one Yield DTF (RToken) for one calendar month. Data is aggregated from daily on-chain snapshots stored in the Yield DTF subgraph (`reserve-mainnet`, `reserve-base`, `reserve-arbitrum`). All supply and RSR amounts are parsed from D18 BigInt values; prices and exchange rates come from the subgraph directly as decimals.

Export trigger: `/internal/yield-dtf` → "Export Analytics CSV" button.

## Identification

| Field | Description |
|---|---|
| Symbol | RToken ticker |
| Name | Full name of the Yield DTF |
| Chain | Network: Ethereum, Base, or Arbitrum |
| Month | Calendar month name |
| Year | Calendar year |

## Supply

| Field | Source | Description |
|---|---|---|
| Total Supply | Subgraph `dailyTotalSupply` | Month-end total supply (last snapshot of the month) |
| Price (USD) | Subgraph `priceUSD` | Month-end RToken price |
| Market Cap (USD) | Derived | `Total Supply * Price` at month-end |
| Monthly Minted | Subgraph `dailyMintAmount` | Sum of all daily mint amounts over the month |
| Monthly Burned | Subgraph `dailyBurnAmount` | Sum of all daily burn amounts over the month |
| Holder Count | Subgraph `cumulativeUniqueUsers` | Month-end cumulative unique users |

## Revenue

Yield DTF revenue is **derived from exchange-rate changes**, not directly indexed. Two independent streams:

| Field | Source | Calculation |
|---|---|---|
| Holder Revenue (USD) | Derived from `basketRate` | When basket rate increases day-over-day, `dailyRevenue = supply * ((currRate - prevRate) / prevRate) * price`. Summed over the month. |
| Staker Revenue (USD) | Derived from `rsrExchangeRate` | When RSR exchange rate increases day-over-day, `dailyRevenue = rsrStaked * ((currRate - prevRate) / prevRate) * rsrPrice`. Summed over the month. |
| Total Revenue (USD) | Derived | `Holder Revenue + Staker Revenue` |

### Key Property

Rate decreases are **ignored** (counted as zero), not negative. This mirrors the real protocol behavior — a dip in basket rate (e.g. collateral default) is not "negative revenue," it's a loss of capital absorbed by stakers.

### Relationship

```
Total Revenue (USD) = Holder Revenue (USD) + Staker Revenue (USD)   (always exact)
```

## RSR Staking

| Field | Source | Description |
|---|---|---|
| RSR Staked | Subgraph `rsrStaked` | Month-end RSR locked as first-loss capital |
| RSR Staked (USD) | Derived | `RSR Staked * RSR Price` at month-end |
| RSR Exchange Rate | Subgraph `rsrExchangeRate` | Month-end stRSR:RSR exchange rate. Increases over time as staker revenue accrues. |
| RSR Price (USD) | Subgraph `rsrPrice` | Month-end RSR price (from the same `rtokenDailySnapshots` entity as exchange rate) |

Note: RSR values come from a separate subgraph entity (`rtokenDailySnapshots`) than supply/price values (`tokenDailySnapshots`). If an RToken has no RSR staking activity on a given day, the fields retain the previous month-end value.

## Cumulative Values

Running totals from the RToken's first month to the current month, per symbol.

| Cumulative Field | Monthly Source |
|---|---|
| Cumulative Minted | Monthly Minted |
| Cumulative Burned | Monthly Burned |
| Cumulative Holder Revenue (USD) | Holder Revenue (USD) |
| Cumulative Staker Revenue (USD) | Staker Revenue (USD) |
| Cumulative Total Revenue (USD) | Total Revenue (USD) |

## Key Invariants

These should always hold for every row:

1. `Market Cap (USD) = Total Supply * Price (USD)`
2. `Total Revenue (USD) = Holder Revenue (USD) + Staker Revenue (USD)`
3. `RSR Staked (USD) = RSR Staked * RSR Price (USD)`
4. `Cumulative Total Revenue = Cumulative Holder Revenue + Cumulative Staker Revenue`
5. All cumulative values are monotonically non-decreasing per RToken (revenue values ≥ 0 by construction)
6. `Holder Revenue` and `Staker Revenue` are always ≥ 0 (rate decreases ignored)

## Comparison to Index DTF Export

Important conceptual differences vs. the Index DTF export (`docs/csv-export-fields.md`):

| Aspect | Yield DTF | Index DTF |
|---|---|---|
| Revenue source | Derived from `basketRate` / `rsrExchangeRate` deltas | Derived from `dailyTotalSupply * annualizedTvlFee / 365` + `dailyMintAmount * mintingFee` |
| Revenue recipients | Holders (basket appreciation) + Stakers (RSR exchange rate) | Vote lockers + External + Protocol (split of distributed revenue) |
| RSR role | First-loss capital earning staker revenue | Estimate of burn amount from protocol revenue only |
| Fees | No explicit TVL/minting fee — revenue is whatever the collateral yields | Explicit TVL fee and minting fee configured per DTF |
| Internal wallet tracking | Not available | Supported via textarea + optional Supabase override |

## Data Pipeline

```
DTF list (listedYieldDTFsAtom from rtokens metadata)
    ↓
For each DTF (Ethereum, Base, Arbitrum):
    ├→ fetchTokenDailySnapshots() → timestamp, supply, mint, burn, price, basketRate, holderCount
    └→ fetchRTokenDailySnapshots() → timestamp, rsrStaked, rsrExchangeRate, rsrPrice
    ↓
aggregateYieldDailyToMonthly()
    ├→ Group by month (monthKey YYYY-MM)
    ├→ Sum monthly flows (mints, burns, derived revenues)
    ├→ Track month-end snapshots (supply, price, RSR state)
    └→ Compute cumulative running totals
    ↓
Sort by symbol, then by monthKey
    ↓
generateCSV() → downloadCSV()
```

## Known Gaps

- **No RSR staking snapshot for a day**: Staker revenue for that day is 0 (can't compute delta without adjacent snapshots)
- **Empty token snapshots for a DTF**: Entire DTF returns no rows
- **Chain without subgraph URL**: Returns empty result, DTF is skipped silently
- **Rate decrease days**: Counted as 0 revenue, not negative. Real collateral losses are invisible in this export.
