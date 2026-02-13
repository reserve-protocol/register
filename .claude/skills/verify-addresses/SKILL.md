---
name: verify-addresses
description: Verify that new blockchain addresses in the codebase are valid and match their expected type (contract, EOA, specific contract type like Folio, Governor, etc.). Use when reviewing PRs, commits, or uncommitted changes that add new addresses.
allowed-tools: Bash, Grep, Read, WebFetch
---

# Address Verification Skill

Verify that new blockchain addresses added to the codebase are valid and match their intended purpose.

## Usage

- `/verify-addresses` - Check uncommitted changes
- `/verify-addresses <commit-hash>` - Check a specific commit
- `/verify-addresses <commit1>..<commit2>` - Check a range of commits
- `/verify-addresses branch` - Compare current branch against main/master
- `/verify-addresses branch:<branch-name>` - Compare specific branch against main/master

## Process

### Step 1: Find New Addresses

Run git diff to find new addresses based on the argument:

```bash
# For uncommitted changes (no argument):
git diff HEAD -- '*.ts' '*.tsx' '*.json' | grep -E '^\+.*0x[a-fA-F0-9]{40}'

# For a specific commit:
git show <commit> -- '*.ts' '*.tsx' '*.json' | grep -E '^\+.*0x[a-fA-F0-9]{40}'

# For a range:
git diff <commit1>..<commit2> -- '*.ts' '*.tsx' '*.json' | grep -E '^\+.*0x[a-fA-F0-9]{40}'

# For current branch (argument is just "branch"):
# First get current branch name:
git branch --show-current
# Then compare against main or master:
git diff main..$(git branch --show-current) -- '*.ts' '*.tsx' '*.json' | grep -E '^\+.*0x[a-fA-F0-9]{40}'
# If main doesn't exist, try master:
git diff master..$(git branch --show-current) -- '*.ts' '*.tsx' '*.json' | grep -E '^\+.*0x[a-fA-F0-9]{40}'

# For a specific branch (argument is "branch:<branch-name>"):
git diff main..<branch-name> -- '*.ts' '*.tsx' '*.json' | grep -E '^\+.*0x[a-fA-F0-9]{40}'
# If main doesn't exist, try master:
git diff master..<branch-name> -- '*.ts' '*.tsx' '*.json' | grep -E '^\+.*0x[a-fA-F0-9]{40}'
```

### Step 2: Extract Context for Each Address

For each address found, read the surrounding code to understand what it should be:

- Variable/constant name (e.g., `FOLIO_DEPLOYER`, `GOVERNOR_ADDRESS`, `WHITELISTED_EOA`)
- Comments nearby
- File location (e.g., addresses in `constants.ts` vs `test-fixtures.ts`)
- Usage pattern in the code

### Step 3: Determine Expected Type

Based on context, determine what the address should be:

| Context Clues | Expected Type |
|--------------|---------------|
| "deployer", "Deployer" | Contract (FolioDeployer) |
| "governor", "Governor", "governance" | Contract (Governor/Timelock) |
| "folio", "dtf", "rtoken" | Contract (ERC20/Folio) |
| "eoa", "wallet", "signer", "owner" | EOA (Externally Owned Account) |
| "token", "erc20" | Contract (ERC20) |
| "auctionLauncher", "launcher" | Could be EOA or Contract |
| "oracle", "feed" | Contract (Chainlink/Oracle) |

### Step 4: Verify On-Chain (using Foundry cast)

For each address, verify on the appropriate chain using Foundry's `cast` command.

#### RPC URLs by Chain

```bash
# Ethereum Mainnet (chainId: 1)
RPC_MAINNET="https://eth.llamarpc.com"

# Base (chainId: 8453)
RPC_BASE="https://mainnet.base.org"

# BSC (chainId: 56)
RPC_BSC="https://bsc-dataseed.binance.org"

# Arbitrum (chainId: 42161)
RPC_ARBITRUM="https://arb1.arbitrum.io/rpc"
```

#### Check if Contract or EOA

Use `cast code` to check if address has bytecode:

```bash
# Returns bytecode if contract, "0x" if EOA
cast code <ADDRESS> --rpc-url <RPC_URL>
```

Example:
```bash
cast code 0x4D201a6e5BF975E2CEE9e5cbDfc803C0Ff122073 --rpc-url https://eth.llamarpc.com
```

- If result is "0x" → EOA
- If result has bytecode → Contract

#### For Contracts, Verify Type by Calling Functions

Use `cast call` to verify contract interfaces:

```bash
# General syntax
cast call <ADDRESS> "functionName()(returnType)" --rpc-url <RPC_URL>
```

**1. Folio/DTF**: Check ERC20 interface + Folio-specific functions
```bash
# Check symbol and name (ERC20)
cast call <ADDRESS> "symbol()(string)" --rpc-url <RPC_URL>
cast call <ADDRESS> "name()(string)" --rpc-url <RPC_URL>

# Check Folio-specific (optional)
cast call <ADDRESS> "totalSupply()(uint256)" --rpc-url <RPC_URL>
```

**2. Deployer Contracts**: Check version function
```bash
cast call <ADDRESS> "version()(string)" --rpc-url <RPC_URL>
```

**3. Governor**: Check governance functions
```bash
cast call <ADDRESS> "votingDelay()(uint256)" --rpc-url <RPC_URL>
cast call <ADDRESS> "votingPeriod()(uint256)" --rpc-url <RPC_URL>
```

**4. ERC20 Tokens**: Standard interface
```bash
cast call <ADDRESS> "decimals()(uint8)" --rpc-url <RPC_URL>
cast call <ADDRESS> "totalSupply()(uint256)" --rpc-url <RPC_URL>
```

#### Checksum Validation (using Node.js/viem)

```bash
cat << 'EOF' | node -
const { getAddress } = require('viem');

const addresses = [
  { addr: '0x...', name: 'Description', chain: 1 },
  // Add more addresses here
];

for (const { addr, name } of addresses) {
  try {
    const checksummed = getAddress(addr);
    const isAllLower = addr === addr.toLowerCase();
    const matchesChecksum = addr === checksummed;

    if (isAllLower) {
      console.log(`⚠️  ${name}: ${addr} - all lowercase (recommend: ${checksummed})`);
    } else if (!matchesChecksum) {
      console.log(`❌ ${name}: ${addr} - INVALID CHECKSUM! Should be: ${checksummed}`);
    } else {
      console.log(`✅ ${name}: ${addr} - valid checksum`);
    }
  } catch (e) {
    console.log(`❌ ${name}: ${addr} - INVALID ADDRESS`);
  }
}
EOF
```

### Step 5: Report Results

For each address, report:

```
## Address Verification Report

### ✅ Valid Addresses

| Address | Expected Type | Verified | Location |
|---------|--------------|----------|----------|
| 0x1234... | Folio Contract | ✅ Is Folio | src/constants.ts:45 |

### ❌ Invalid/Suspicious Addresses

| Address | Expected Type | Actual | Issue | Location |
|---------|--------------|--------|-------|----------|
| 0xABCD... | EOA | Contract | Expected EOA but found contract code | src/config.ts:12 |
| 0x5678... | Folio | Unknown Contract | Missing Folio interface methods | src/tokens.ts:78 |

### ⚠️ Warnings

- Address 0x9999... is not checksummed (all lowercase) - consider using checksummed version
- Address 0xAAAA... is on wrong chain (found on Ethereum, expected Base)
```

## Chain Detection

Determine which chain to verify on based on:
- File path containing "base" or "ethereum"
- Nearby chainId references
- Import statements
- Default to Base (8453) for this project

## Checksum Validation

Check address checksum format:
- Mixed case addresses should have valid EIP-55 checksum
- All lowercase is valid but show a **warning** (not an error)
- Invalid mixed-case checksums are suspicious and should be flagged

## Common Issues to Catch

1. **Typos**: Character substitution (0 vs O, l vs 1)
2. **Wrong chain**: Mainnet address used for Base or vice versa
3. **Wrong type**: EOA where contract expected
4. **Truncated**: Address is not exactly 42 characters
5. **Test addresses**: Hardhat/Anvil default addresses in production code
6. **Zero address**: 0x0000...0000 used unintentionally

## Quick Verification Examples

```bash
# Verify a DTF/Folio on Base
cast call 0x92d7e020ab1cc45eaf744a5fe5954734fcd07119 "symbol()(string)" --rpc-url https://mainnet.base.org
# Expected: Returns token symbol like "LCAP"

# Verify a deployer contract on Mainnet
cast call 0x4D201a6e5BF975E2CEE9e5cbDfc803C0Ff122073 "version()(string)" --rpc-url https://eth.llamarpc.com
# Expected: Returns version like "5.0.0"

# Check if address is contract or EOA
cast code 0x4D201a6e5BF975E2CEE9e5cbDfc803C0Ff122073 --rpc-url https://eth.llamarpc.com | head -c 10
# Contract: Returns bytecode starting with "0x60..."
# EOA: Returns "0x"
```

## Prerequisites

- **Foundry**: Must have `cast` command available. Install via: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- **Node.js + viem**: For checksum validation. The project already has viem as a dependency.
