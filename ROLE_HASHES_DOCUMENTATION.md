# DTF Role Hashes Documentation

## Found Role Hashes

Based on the codebase analysis, here are the exact role hash values used in the DTF (Decentralized Trading Fund) system:

### 1. GUARDIAN_ROLE
- **Hash**: `0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6f`
- **Description**: A trusted actor that can veto any proposal prior to execution
- **Found in**: `/Users/luis/projects/register/src/views/index-dtf/governance/components/proposal-preview/dtf-settings-preview.tsx`

### 2. BRAND_MANAGER_ROLE
- **Hash**: `0x2ce3265b96c4537dd7b86b7554c85e8071574b43342b4b4cbfe186cf4b2bc883`
- **Description**: A trusted actor that can manage social links and appearances of the DTF in the Register UI
- **Found in**: `/Users/luis/projects/register/src/views/index-dtf/governance/components/proposal-preview/dtf-settings-preview.tsx`

### 3. AUCTION_LAUNCHER_ROLE
- **Hash**: `0xecec33ab7f1be86026025e66df4d1b28cd50e7eb59269b6b6c5e8096d4a4aed4`
- **Description**: A trusted actor responsible for launching auctions that are approved by governance
- **Found in**: `/Users/luis/projects/register/src/views/index-dtf/governance/components/proposal-preview/dtf-settings-preview.tsx`

## How Role Hashes are Calculated

The codebase shows that role hashes are calculated using the `keccak256` hash function with the role name as a string. For example:

```typescript
// From proposal-cancel-button.tsx
keccak256(toBytes('CANCELLER_ROLE'))
```

## Important Note

The role hashes found in the codebase (`0x45e7...`, `0x2ce3...`, `0xecec...`) do NOT match the standard calculation of:
- `keccak256(toBytes('GUARDIAN_ROLE'))`
- `keccak256(toBytes('BRAND_MANAGER_ROLE'))`
- `keccak256(toBytes('AUCTION_LAUNCHER_ROLE'))`

This suggests that either:
1. The actual role names in the smart contracts are different from what might be expected
2. These are custom role hashes specific to the DTF implementation
3. The role names might not include the "_ROLE" suffix or might have a different format

## Usage in Code

These role hashes are used in the governance proposal preview components to display human-readable role names when viewing grant/revoke role operations:

```typescript
const roleNames: Record<string, string> = {
  '0x45e7131d776dddc137e30bdd490b431c7144677e97bf9369f629ed8d3fb7dd6f': 'Guardian',
  '0x2ce3265b96c4537dd7b86b7554c85e8071574b43342b4b4cbfe186cf4b2bc883': 'Brand Manager',
  '0xecec33ab7f1be86026025e66df4d1b28cd50e7eb59269b6b6c5e8096d4a4aed4': 'Auction Launcher',
}
```

## Contract Constants

The DTF contract ABI shows that these roles are exposed as view functions:
- `AUCTION_APPROVER()`
- `AUCTION_LAUNCHER()`
- `BRAND_MANAGER()`

These functions return the bytes32 role hashes when called.