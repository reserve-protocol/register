---
name: sync-earn-pools
description: Synchronize earn pool URLs with DefiLlama data. Validates URLs, removes stale pools, adds new pools. Use when asked to check, update, or fix earn pool links.
---

# Sync Earn Pools

Maintain the `src/lib/meta/earn-pools.json` file which maps DefiLlama pool IDs to
their corresponding protocol UI URLs.

## Quick Start

Run the sync script with `--fix` to automatically clean up and add pools:

```bash
python3 .claude/skills/sync-earn-pools/scripts/analyze_pools.py --fix
```

This will:
1. Remove pools that no longer exist in DefiLlama
2. Add new pools (with auto-generated URLs where possible)
3. Report pools that need manual URL fixes

## Script Options

```bash
# Just analyze (no changes)
python3 .claude/skills/sync-earn-pools/scripts/analyze_pools.py

# Analyze + validate that URLs actually work (slower)
python3 .claude/skills/sync-earn-pools/scripts/analyze_pools.py --validate-urls

# Apply fixes (remove stale, add new)
python3 .claude/skills/sync-earn-pools/scripts/analyze_pools.py --fix

# Dry run (show what would change without modifying)
python3 .claude/skills/sync-earn-pools/scripts/analyze_pools.py --fix --dry-run
```

## What the Script Detects

| Category | Description | Auto-fixed? |
|----------|-------------|-------------|
| 🗑️ Stale pools | In JSON but removed from DefiLlama | ✅ Yes (with --fix) |
| 🆕 New pools | In DefiLlama but not in JSON | ✅ Yes (with --fix) |
| ❌ Broken URLs | URLs that return HTTP errors | ❌ Manual |
| ⚠️ Generic URLs | Landing pages, not specific pool links | ❌ Manual |

## Manual URL Fixes

After running `--fix`, there may be pools needing manual URL attention:

1. **New pools without auto-generated URLs** - Find the URL manually
2. **Generic URLs** - Replace with specific pool links
3. **Broken URLs** - Find the correct/updated URL

### Finding URLs by Protocol

**Aerodrome** (Base) - Auto-generated ✅
- Pattern: `https://aerodrome.finance/deposit?token0={addr}&token1={addr}&type={type}`
- Types: `0` = stable, `-1` = volatile, `1` = concentrated

**Curve** - Partial auto-generation
- Pattern: `https://curve.finance/#/{chain}/pools/{pool-slug}/deposit`
- Find pool slug at: https://curve.finance/#/ethereum/pools

**Beefy** - Manual
- Pattern: `https://app.beefy.finance/vault/{vault-id}`
- Search: https://app.beefy.finance/ and filter by token

**Convex** - Manual
- Pattern: `https://curve.convexfinance.com/stake/ethereum/{pool-number}`
- Find at: https://www.convexfinance.com/stake

**Yearn** - Manual
- Pattern: `https://yearn.fi/vaults/{chainId}/{vault-address}`
- chainId: 1 = Mainnet, 8453 = Base, 42161 = Arbitrum

**Morpho** - Manual
- Markets: `https://app.morpho.org/market?id={market-id}&network={network}`
- Vaults: `https://app.morpho.org/vault?vault={address}&network={network}`

**Uniswap** - Manual
- Pattern: `https://app.uniswap.org/explore/pools/{chain}/{pool-address}`

**StakeDAO** - Manual
- Pattern: `https://stakedao.org/yield?search={lp-token-address}`

**Merkl** - Manual
- Pattern: `https://merkl.angle.money/{chain}/pool/{pool-address}`

## Tracked Tokens

The script tracks pools containing these Reserve Protocol tokens:
- RSR, eUSD, hyUSD, ETH+, USDC+, USD3, rgUSD, bsdETH, dgnETH, KNOX

## Workflow for Claude

When the user invokes this skill:

1. **Run the script with --fix** to auto-clean stale and add new pools
2. **Review the output** for pools needing manual URLs
3. **For each pool without URL**:
   - Use WebFetch to find the correct URL on the protocol's site
   - Or generate from known patterns
4. **Update earn-pools.json** with the correct URLs
5. **Run again without --fix** to verify all issues resolved
