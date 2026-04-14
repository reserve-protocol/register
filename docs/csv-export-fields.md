# Index DTF Analytics CSV Export — Field Reference

Each row represents one DTF for one calendar month. Data is aggregated from daily on-chain snapshots (subgraph), price APIs (Reserve API), and optionally Supabase (internal TVL override for March 2026+).

## Identification

| Field | Description |
|---|---|
| DTF Symbol | Token ticker (e.g. CMC20, LCAP) |
| DTF Name | Full name of the DTF |
| Chain | Network: Ethereum, Base, or BSC |
| Month | Calendar month name |
| Year | Calendar year |

## Supply and TVL

| Field | Source | Description |
|---|---|---|
| Total Supply (Token) | Subgraph `dailyTotalSupply` | Month-end total token supply |
| Market Cap (USD) | Derived | `Total Supply * DTF Price` at month-end |
| Tokens Locked (Amount) | Subgraph stToken snapshots | Month-end governance-locked tokens (underlying, e.g. RSR) |
| Tokens Locked (USD) | Derived | `Tokens Locked * Vote Lock Token Price` at month-end |
| TVL (USD) | Derived | `Market Cap (USD) + Tokens Locked (USD)` |

## Revenue — Total

All revenue fields have Token and USD variants. USD = Token amount * DTF Price on the day accrued.

| Field | Source | Calculation |
|---|---|---|
| Total Revenue | Derived | `TVL Fee Revenue + Minting Fee Revenue` |
| TVL Fee Revenue | Derived daily | `dailyTotalSupply * annualizedTvlFee / 365`, summed over month |
| Minting Fee Revenue | Derived daily | `dailyMintAmount * mintingFee`, summed over month |
| Distributed Revenue | Subgraph `dailyRevenue` | On-chain revenue distributed by the protocol. Independent of TVL/Minting fee derivation — may differ from Total Revenue |

### Relationship

```
Total Revenue = TVL Fee Revenue + Minting Fee Revenue   (always exact)
Distributed Revenue ≠ Total Revenue                      (different sources)
```

- **Total Revenue** is what the DTF *should* earn based on fee rates and activity.
- **Distributed Revenue** is what the protocol *actually* distributed on-chain.

## Revenue — Distribution

How distributed revenue is split among recipients. Sourced from subgraph daily fields.

| Field | Source |
|---|---|
| Revenue to Vote Lockers | Subgraph `dailyGovernanceRevenue` |
| Revenue to External | Subgraph `dailyExternalRevenue` |
| Revenue to Protocol | Subgraph `dailyProtocolRevenue` |

## Minting

| Field | Source |
|---|---|
| Total Minted (Token) | Subgraph `dailyMintAmount`, summed over month |
| Total Minted (USD) | `dailyMintAmount * DTF Price`, summed daily |

## RSR Burn Estimate

| Field | Calculation |
|---|---|
| Est RSR Burn Amount | `(dailyProtocolRevenue * DTF Price) / RSR Price`, summed daily. Estimates how much RSR the protocol revenue could buy/burn. |

## Internal Wallet Metrics

Tracks activity from a user-provided list of internal wallet addresses. Used to separate internal (Reserve's own) activity from external.

### Data Sources

- **Internal mints**: Subgraph `TransferEvent` with `type: "MINT"` where `to` is an internal wallet
- **Internal balances**: Subgraph `AccountBalanceDailySnapshot` for internal wallets, with carry-forward for days without snapshots
- **Supabase override** (March 2026+): For DTFs in the Supabase `assets` table, `tvl_snapshots.internal_tvl_usd / price_usd` replaces the subgraph balance data. This is more comprehensive as it includes DEX positions.

| Field | Calculation |
|---|---|
| Internal TVL (Token) | Average daily internal wallet balance over the month (not month-end snapshot) |
| Internal TVL (USD) | Average daily `balance * DTF Price` over the month |
| Internal Minting Fee Revenue | `internalDailyMintAmount * mintingFee`, summed over month |
| Internal TVL Fee Revenue | `dailyInternalBalance * annualizedTvlFee / 365`, summed over month |
| Internal Revenue | `Internal Minting Fee Revenue + Internal TVL Fee Revenue` (always exact) |

### Relationship to Total Revenue

```
External Revenue        = Total Revenue - Internal Revenue
External TVL Fee Rev    = TVL Fee Revenue - Internal TVL Fee Revenue
External Minting Fee Rev = Minting Fee Revenue - Internal Minting Fee Revenue
```

These external fields are not in the CSV but can be derived by subtraction.

### Why Internal TVL is an Average

Internal TVL uses the average daily balance (not month-end) to stay consistent with Internal TVL Fee Revenue, which accrues daily. If wallets hold tokens mid-month but withdraw before month-end, the average reflects the actual holding period.

## Prices

| Field | Source | Description |
|---|---|---|
| DTF Price (USD) | Reserve API (`historical/dtf`) | Month-end DTF token price |
| RSR Price (USD) | Reserve API (`historical/prices`, Ethereum mainnet) | Month-end RSR price. Always from mainnet for reliability. |
| Vote Lock Token Price (USD) | Reserve API or RSR prices | Price of the underlying governance token. Uses RSR prices if the underlying is RSR. |

## Stats

| Field | Source |
|---|---|
| Holder Count | Subgraph `currentHolderCount`, month-end value |

## Cumulative Values

Running totals from the DTF's first month to the current month. Each cumulative field is the sum of all prior monthly values for the same DTF.

| Cumulative Field | Monthly Source |
|---|---|
| Cumulative Tokens Locked | Tokens Locked (Amount) |
| Cumulative Revenue | Total Revenue |
| Cumulative Minted | Total Minted |
| Cumulative Revenue to Vote Lockers | Revenue to Vote Lockers |
| Cumulative Revenue to External | Revenue to External |
| Cumulative Revenue to Protocol | Revenue to Protocol |
| Cumulative Distributed Revenue | Distributed Revenue |
| Cumulative Est RSR Burn Amount | Est RSR Burn Amount |
| Cumulative Internal Revenue | Internal Revenue |
| Cumulative Internal Minting Fee Revenue | Internal Minting Fee Revenue |
| Cumulative Internal TVL Fee Revenue | Internal TVL Fee Revenue |

All cumulative fields have both Token and USD variants.

## Key Invariants

These should always hold for every row:

1. `Total Revenue = TVL Fee Revenue + Minting Fee Revenue`
2. `Internal Revenue = Internal Minting Fee Revenue + Internal TVL Fee Revenue`
3. `TVL (USD) = Market Cap (USD) + Tokens Locked (USD)`
4. `Internal TVL (Token) <= Total Supply (Token)`
5. `Internal TVL Fee Revenue <= TVL Fee Revenue`
6. `Internal Minting Fee Revenue <= Minting Fee Revenue`
7. All cumulative values are monotonically non-decreasing per DTF
8. When `Internal TVL = 0`, `Internal TVL Fee Revenue = 0`

## UI Inputs (not in CSV)

The export page (`/internal/dtf-listed`) has runtime input fields:

- **Internal Wallets**: Textarea, one address per line. Defines which wallets are "internal."
- **Supabase URL / Key**: Credentials for the TVL override database. When provided, internal TVL for DTFs in the Supabase `assets` table is replaced with `tvl_snapshots` data from March 2026 onwards.
