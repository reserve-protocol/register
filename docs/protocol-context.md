# Protocol Context for Register

**Last Updated:** 2026-03-04

Quick protocol reference for frontend work. Detailed source: [`dtf-tools/docs/KNOWLEDGE.md`](https://github.com/reserve-protocol/dtf-tools/blob/main/docs/KNOWLEDGE.md).

## What is a DTF?

A **Decentralized Token Folio** is an ERC20 token backed 1:1 by a basket of underlying ERC20 tokens. Anyone can mint by depositing basket tokens proportionally, redeem for underlying tokens.

### Two Product Lines

| | Index DTFs | Yield DTFs (RTokens) |
|---|-----------|---------------------|
| Purpose | On-chain index funds | Yield-bearing stablecoins |
| TVL | ~$200M+ (growing) | ~$210M+ (mature) |
| Launch | Feb 2025 | 2020 |
| Rebalancing | Dutch auctions via governance | Automated |
| Staking | DTF shares → stToken (voting) | RSR → stRSR (first-loss) |
| Fee model | TVL fee + minting fee | Revenue from collateral yield |
| Code priority | Active development | Legacy maintenance |

### DTF Types (Index DTFs)

| Type | weightControl | Behavior |
|------|--------------|----------|
| Native | `true` | Maintain percentage allocations, adjusting units as prices change |
| Tracking | `false` | Maintain fixed token units regardless of price changes |

Most live DTFs are Native.

## Rebalance Lifecycle

```
PROPOSE → VOTE → QUEUE → EXECUTE → LAUNCHER WINDOW → COMMUNITY WINDOW → AUCTION → BID → REPEAT → EXPIRE
```

### Key Concepts

- **Launcher window**: Designated auction launchers have exclusive access (configurable, typically 24h)
- **Community window**: After launcher window, anyone can `openAuction()`
- **Progressive rebalancing**: Percent slider (0-100%) controls how much of the gap to close
- **Auction rounds**: EJECT (remove tokens) → PROGRESS (rebalance) → FINAL (fine-tune)

### Price Volatility

Two mappings — wide for proposals (prices move during governance), tight for auctions:

| Volatility | Auction (tight) | Proposal (wide) |
|-----------|----------------|----------------|
| low | 2% | 25% |
| medium | 5% | 50% |
| high | 10% | 75% |
| degen | 50% | 90% |

### D27 Price Format

On-chain prices are `D27{nanoUSD/tok}` — bigint with 27 decimals. Converting to USD:

```
price_usd = sqrt(low * high) / 10^(36 - tokenDecimals)
```

## Governance

DTFs can have 0-3 governance systems:

| System | Speed | Controls |
|--------|-------|----------|
| Owner Governance | Slow (long voting) | Upgrades, fee changes, emergency |
| Trading Governance | Fast (short voting) | Rebalancing, auction params |
| Community (stToken) | Varies | Depends on config |

All use **OZ Governor v5** with `CLOCK_MODE = "mode=timestamp"`. Timepoints are **unix timestamps, NOT block numbers**.

## Roles

| Role | Hash | Purpose |
|------|------|---------|
| Default Admin | `zeroHash` (0x000...0) | Full admin access |
| Guardian | `0xfd643c...` | Can veto proposals before execution |
| Brand Manager | `0x2d8e65...` | Manage social links, UI appearance |
| Auction Launcher | `0x13ff1b...` | Launch governance-approved auctions |

## Chains

| Chain | ID | Status |
|-------|-----|--------|
| Ethereum | 1 | Most TVL |
| Base | 8453 | Cheapest, most DTFs |
| BSC | 56 | Supported |
| Arbitrum | 42161 | **Deprecated for Index DTFs** |

## Live Ecosystem

~$200M+ TVL across 12+ Index DTFs:

| DTF | Chain | Description |
|-----|-------|-------------|
| Bloomberg Galaxy Crypto Index | Mainnet | Large-cap crypto |
| CoinDesk DeFi Select | Base | DeFi blue chips |
| Hashnote US Dollar Yield | Mainnet | USD yield |
| CF Large Cap Index | Mainnet | Top crypto assets |
| CMC20 | BSC | CoinMarketCap top 20 |

## SDK Reference

The `@reserve-protocol/dtf-sdk` provides typed reads and transaction builders for all protocol interactions. Register can use it directly or reference its patterns.

Key SDK capabilities:
- **Reads**: Basket, rebalance, governance, proposals, voting power, fees, roles, prices, revenue
- **Builders**: Mint, redeem, rebalance, bids, governance actions, deployment
- **Decoder**: `decodeProposalActions()` for human-readable calldata

See [`dtf-tools/docs/KNOWLEDGE.md`](https://github.com/reserve-protocol/dtf-tools/blob/main/docs/KNOWLEDGE.md) for the full reference.
