import { RSR_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import { Address, getAddress, isAddressEqual, zeroAddress } from 'viem'

export const governanceSpellAddress: Record<number, Address> = {
  [ChainId.Mainnet]: getAddress('0x11B1bF67F0c6495E1F2d34cDe0296A02C2540926'),
  [ChainId.Base]: getAddress('0x5771d976696AA180Fed276FB6571fE2f41D0b849'),
  [ChainId.BSC]: getAddress('0x60C384e226b120d93f3e0F4C502957b2B9C32B15'),
}

export const optimisticStakingVaultAddress: Record<number, Address> = {
  [ChainId.Mainnet]: getAddress('0xABbDD9AC016e43c7CA85e2258E669948f029BC0c'),
  [ChainId.Base]: getAddress('0x2F0D6538807a77d4AdDCd4b4DAf214Ea2E818E3D'),
  [ChainId.BSC]: getAddress('0xE744C8157c346B2931807F42552c8CBc0BB6D34f'),
}

export const newFeeRecipientAddress: Record<number, Address> = {
  [ChainId.Mainnet]: getAddress('0x2688c199049376eFc3aa54F395048B5430c16DE8'),
  [ChainId.Base]: getAddress('0xEAfA84184BEb90891cb5c4942ebD59C18dda0bfE'),
  [ChainId.BSC]: getAddress('0x0c2C5064C32800b26d3E0e8A031F366a892Ae793'),
}

export type GovernanceUpgradeTarget = {
  spell: Address
  stakingVault: Address
  stakingVaultUnderlying: Address
  // Zero hands the old vault's fee share straight to stakingVault; anything else must be a token jar paying into it.
  feeRecipient: Address
}

type DtfUpgradeTarget = GovernanceUpgradeTarget & { legacyVoteLock: Address }

// DTFs that keep their own token: each moves into its own successor vault, which also takes the old vault's fee share.
const DTF_UPGRADE_TARGETS: Record<number, Record<string, DtfUpgradeTarget>> = {
  [ChainId.Mainnet]: {
    // OPEN: GovernanceSpell_10_21_2026 (5d vote, 3d timelock, 4% threshold, 15% quorum) into vlSQUILL.
    '0x323c03c48660fe31186fa82c289b0766d331ce21': {
      spell: getAddress('0xaf029ad44Cc44fB2AefFF84029dd0c29D5Ea8D87'),
      stakingVault: getAddress('0x60e71dd36Fa5Bf92bcd9320e85cF0040ffe437Bc'),
      stakingVaultUnderlying: getAddress('0x7ebAB7190d3d574ce82D29F2FA1422f18E29969C'),
      feeRecipient: zeroAddress,
      legacyVoteLock: getAddress('0x2aea77c4757d897aae2710b8a60280777f504e8c'),
    },
  },
  [ChainId.Base]: {
    // ABX: the shared spell into vlALTT.
    '0xebcda5b80f62dd4dd2a96357b42bb6facbf30267': {
      spell: getAddress('0x5771d976696AA180Fed276FB6571fE2f41D0b849'),
      stakingVault: getAddress('0x77cd9520931ae628f870783d855f74bb14cdaf39'),
      stakingVaultUnderlying: getAddress('0x1B5cE2a593a840E3ad3549a34D7b3dEc697c114D'),
      feeRecipient: zeroAddress,
      legacyVoteLock: getAddress('0x6f1fe54c2275dc64ce1ce9cbf2007ef7bd53c117'),
    },
  },
}

export const getGovernanceUpgradeTarget = (
  chainId: number,
  dtfAddress: string
): GovernanceUpgradeTarget | undefined => {
  const dtf = dtfAddress.toLowerCase()
  const override = DTF_UPGRADE_TARGETS[chainId]?.[dtf]
  if (override) return override

  const spell = governanceSpellAddress[chainId]
  const stakingVault = optimisticStakingVaultAddress[chainId]
  const stakingVaultUnderlying = RSR_ADDRESS[chainId]
  const feeRecipient = newFeeRecipientAddress[chainId]
  if (!spell || !stakingVault || !stakingVaultUnderlying || !feeRecipient)
    return undefined
  return { spell, stakingVault, stakingVaultUnderlying, feeRecipient }
}

export type MigrationVault = { address: Address; shared: boolean }

// Where a retired vote-lock's holders move: a DTF's own successor vault, otherwise the chain's shared vlRSR.
export const getMigrationVault = (
  chainId: number,
  oldVoteLock: Address
): MigrationVault | undefined => {
  const own = Object.values(DTF_UPGRADE_TARGETS[chainId] ?? {}).find((target) =>
    isAddressEqual(target.legacyVoteLock, oldVoteLock)
  )
  if (own) return { address: own.stakingVault, shared: false }
  const shared = optimisticStakingVaultAddress[chainId]
  return shared ? { address: shared, shared: true } : undefined
}
