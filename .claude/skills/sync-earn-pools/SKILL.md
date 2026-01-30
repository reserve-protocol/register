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
| 🔧 Convex wrong URLs | Contract address instead of pool ID | ✅ Yes (queries on-chain) |
| ❌ Broken URLs | URLs that return HTTP errors | ❌ Manual |
| ⚠️ Generic URLs | Landing pages, not specific pool links | ❌ Manual |
| 🔧 Other incorrect URLs | Uniswap/Aerodrome wrong patterns | ❌ Manual |

### Automatic Convex URL Generation

When running with `--fix`, the script queries the Convex Booster contract on-chain to:
1. Build a mapping of all LP token addresses → pool IDs (cached for the session)
2. Automatically fix any Convex URLs that use contract addresses instead of pool numbers
3. Generate correct URLs for new Convex pools

## Manual URL Fixes

After running `--fix`, there may be pools needing manual URL attention:

1. **New pools without auto-generated URLs** - Find the URL manually
2. **Generic URLs** - Replace with specific pool links
3. **Broken URLs** - Find the correct/updated URL

### URL Patterns by Protocol

#### ✅ Verified Correct Patterns

**Curve** - Use contract address in path
```
https://curve.finance/#/{chain}/pools/{contract-address}/deposit
```
Example: `https://curve.finance/#/ethereum/pools/0xE99810Cd5AdCD7b13455aE1Be678B382d61f2d1E/deposit`

**StakeDAO** - Use LP token address as search param
```
https://stakedao.org/yield?search={lp-token-address}
```
Example: `https://stakedao.org/yield?search=0x7b303cF6124A74a867C99889d39278Bc63e1054B`

**Morpho** - Markets use market ID, vaults use vault address
```
# Markets
https://app.morpho.org/market?id={market-id}&network={network}
# Vaults
https://app.morpho.org/{network}/vault/{vault-address}
```
Example market: `https://app.morpho.org/market?id=0xdb8938f97571aeab0deb0c34cf7e6278cff969538f49eebe6f4fc75a9a111293&network=ethereum`
Example vault: `https://app.morpho.org/base/vault/0xbb819D845b573B5D7C538F5b85057160cfb5f313`

**Yearn** - Use chainId and vault address
```
https://yearn.fi/vaults/{chainId}/{vault-address}
```
Example: `https://yearn.fi/vaults/1/0xBfBC4acAE2ceC91A5bC80eCA1C9290F92959f7c3`
- chainId: 1 = Mainnet, 8453 = Base, 42161 = Arbitrum

**Merkl** - Use chain name and vault type + address
```
https://app.merkl.xyz/opportunities/{chain}/{type}/{address}
```
Example: `https://app.merkl.xyz/opportunities/base/MORPHOVAULT/0xbb819D845b573B5D7C538F5b85057160cfb5f313`

#### ⚠️ Requires Manual Lookup

**Aerodrome / Aerodrome Slipstream** (Base)
```
https://aerodrome.finance/deposit?token0={addr}&token1={addr}&type={type}&chain0=8453&chain1=8453&factory={factory}
```
- Types: `0` = stable, `-1` = volatile (vAMM), `200` or similar = concentrated (Slipstream)
- Factory addresses vary by pool type:
  - vAMM: `0x420DD381b31aEf6683db6B902084cB0FFECe40Da`
  - Slipstream: `0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A`
- **Must find exact URL by navigating to pool on aerodrome.finance**

Example vAMM: `https://aerodrome.finance/deposit?token0=0x4200000000000000000000000000000000000006&token1=0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8&type=-1&chain0=8453&chain1=8453&factory=0x420DD381b31aEf6683db6B902084cB0FFECe40Da`

Example Slipstream: `https://aerodrome.finance/deposit?token0=0x4da9a0f397db1397902070f93a4d6ddbc0e0e6e8&token1=0x9b8df6e244526ab5f6e6400d331db28c8fdddb55&type=200&chain0=8453&chain1=8453&factory=0x5e7BB104d84c7CB9B682AaC2F3d509f5F406809A`

**Beefy** - Must lookup vault ID on beefy.finance
```
https://app.beefy.finance/vault/{vault-id}
```
Example: `https://app.beefy.finance/vault/aerodrome-weth-lcap`
- Search at: https://app.beefy.finance/ and filter by token

**Convex** - Use pool NUMBER (not contract address!)
```
https://curve.convexfinance.com/stake/ethereum/{pool-number}
```
Example: `https://curve.convexfinance.com/stake/ethereum/412`
- **WRONG**: `https://curve.convexfinance.com/stake/ethereum/0xE99810Cd5AdCD7b13455aE1Be678B382d61f2d1E`
- Find pool numbers at: https://www.convexfinance.com/stake

**Uniswap** - Include chain in path
```
https://app.uniswap.org/explore/pools/{chain}/{pool-address}
```
Example: `https://app.uniswap.org/explore/pools/ethereum/0x32d9259e6792b2150fd50395d971864647fa27b2`
- **WRONG**: `https://info.uniswap.org/#/pools/{address}` or `https://app.uniswap.org/explore#/pools/{address}`

#### ❌ No Specific URL Available

**Concentrator** - Only has landing page, no pool-specific URLs
- Use: `https://concentrator.aladdin.club/`
- This is acceptable and should NOT be reported as a generic URL

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
