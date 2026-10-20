import { RSR_ADDRESS } from '@/utils/addresses'
import { ChainId } from '@/utils/chains'
import { Address, getAddress, zeroAddress } from 'viem'

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

// OPEN and ABX keep their own staking vaults: they stay out of the vlRSR singleton flows (vault retirement, vote-lock migration).
const EXCLUDED_DTFS: Record<number, string[]> = {
  [ChainId.Mainnet]: ['0x323c03c48660fe31186fa82c289b0766d331ce21'],
  [ChainId.Base]: ['0xebcda5b80f62dd4dd2a96357b42bb6facbf30267'],
}

export type GovernanceUpgradeTarget = {
  spell: Address
  stakingVault: Address
  stakingVaultUnderlying: Address
  // Zero hands the old vault's fee share straight to stakingVault; anything else must be a token jar paying into it.
  feeRecipient: Address
}

// Excluded DTFs that still upgrade, each through a one-off spell into its own successor vault.
const DTF_UPGRADE_TARGETS: Record<number, Record<string, GovernanceUpgradeTarget>> = {
  [ChainId.Mainnet]: {
    // OPEN: GovernanceSpell_10_19_2026 (5d vote, 3d timelock, 5% threshold, 15% quorum) into vlSQUILL, which also takes the old vault's fee share.
    '0x323c03c48660fe31186fa82c289b0766d331ce21': {
      spell: getAddress('0x5CE95c60A1aaF3f500301735a92d608E1eE3515E'),
      stakingVault: getAddress('0x8a8188D2bC61c43124CDED32F40faB456F68C15C'),
      stakingVaultUnderlying: getAddress('0x7ebAB7190d3d574ce82D29F2FA1422f18E29969C'),
      feeRecipient: zeroAddress,
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
  if (EXCLUDED_DTFS[chainId]?.includes(dtf)) return undefined

  const spell = governanceSpellAddress[chainId]
  const stakingVault = optimisticStakingVaultAddress[chainId]
  const stakingVaultUnderlying = RSR_ADDRESS[chainId]
  const feeRecipient = newFeeRecipientAddress[chainId]
  if (!spell || !stakingVault || !stakingVaultUnderlying || !feeRecipient)
    return undefined
  return { spell, stakingVault, stakingVaultUnderlying, feeRecipient }
}

const SPELL_FOLIO_VERSIONS = ['4.0.0', '5.0.0']
const REQUIRED_STAKING_VAULT_VERSION = '1.1.0'

type Eligibility = {
  chainId: number
  dtfAddress: string
  status: 'active' | 'deprecated' | 'unsupported'
  folioVersion?: string
  ownerGovernor?: string
  tradingGovernor?: string
  stakingVaultVersion?: string
  ownerTimelock?: string
  tradingTimelock?: string
  oldVoteLock?: string
  oldVoteLockUnderlying?: string
  admins: readonly string[]
  auctionApprovers: readonly string[]
  auctionLaunchers: readonly string[]
  brandManagers: readonly string[]
  feeRecipients: readonly string[]
}

const same = (a?: string, b?: string) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase()
const includes = (list: readonly string[], value?: string) =>
  list.some((item) => same(item, value))

export const isOptimisticGovernanceUpgradeEligible = ({
  chainId,
  dtfAddress,
  status,
  folioVersion,
  ownerGovernor,
  tradingGovernor,
  stakingVaultVersion,
  ownerTimelock,
  tradingTimelock,
  oldVoteLock,
  oldVoteLockUnderlying,
  admins,
  auctionApprovers,
  auctionLaunchers,
  brandManagers,
  feeRecipients,
}: Eligibility): boolean => {
  if (status !== 'active') return false
  const target = getGovernanceUpgradeTarget(chainId, dtfAddress)
  if (!target) return false
  if (!folioVersion || !SPELL_FOLIO_VERSIONS.includes(folioVersion)) return false
  if (!ownerGovernor || !tradingGovernor) return false
  if (same(ownerGovernor, tradingGovernor)) return false
  if (stakingVaultVersion !== REQUIRED_STAKING_VAULT_VERSION) return false
  if (!same(oldVoteLockUnderlying, target.stakingVaultUnderlying)) return false

  return upgradeFolioWouldPass({
    ownerTimelock,
    tradingTimelock,
    oldVoteLock,
    governors: [ownerGovernor, tradingGovernor],
    newFeeRecipient:
      target.feeRecipient === zeroAddress ? target.stakingVault : target.feeRecipient,
    admins,
    auctionApprovers,
    auctionLaunchers,
    brandManagers,
    feeRecipients,
  })
}

// Mirrors the role and fee-recipient requires in GovernanceSpell_09_18_2026.upgradeFolio.
const upgradeFolioWouldPass = ({
  ownerTimelock,
  tradingTimelock,
  oldVoteLock,
  governors,
  newFeeRecipient,
  admins,
  auctionApprovers,
  auctionLaunchers,
  brandManagers,
  feeRecipients,
}: Pick<
  Eligibility,
  | 'ownerTimelock'
  | 'tradingTimelock'
  | 'oldVoteLock'
  | 'admins'
  | 'auctionApprovers'
  | 'auctionLaunchers'
  | 'brandManagers'
  | 'feeRecipients'
> & { governors: string[]; newFeeRecipient?: string }) => {
  if (!ownerTimelock || !tradingTimelock || !oldVoteLock) return false
  if (admins.length !== 1 || !same(admins[0], ownerTimelock)) return false
  if (auctionApprovers.length !== 1 || !same(auctionApprovers[0], tradingTimelock))
    return false
  const timelocks = [ownerTimelock, tradingTimelock]
  if (timelocks.some((t) => includes(brandManagers, t) || includes(auctionLaunchers, t)))
    return false
  if (feeRecipients.filter((r) => same(r, oldVoteLock)).length !== 1) return false
  if (includes(feeRecipients, newFeeRecipient)) return false
  return ![...governors, ...timelocks].some((g) => includes(feeRecipients, g))
}

export type OldVoteLock = { address: Address; governance?: Address }

type VoteLockSource = {
  id: string
  stToken?: { id: string; governance?: { id: string } }
  roles: {
    admin: {
      legacyGovernances: readonly {
        voteLock: string
        voteLockGovernance?: string
      }[]
    }
  }
}

// Pre-migration the old vault is still the DTF's stToken; afterwards the subgraph only keeps it behind the replaced admin governor.
export const getOldVoteLocks = (
  dtf: VoteLockSource,
  chainId: number
): OldVoteLock[] => {
  const singleton = optimisticStakingVaultAddress[chainId]
  if (!governanceSpellAddress[chainId] || !singleton) return []
  if (EXCLUDED_DTFS[chainId]?.includes(dtf.id.toLowerCase())) return []

  const candidates = [
    ...(dtf.stToken
      ? [{ address: dtf.stToken.id, governance: dtf.stToken.governance?.id }]
      : []),
    ...dtf.roles.admin.legacyGovernances.map(
      ({ voteLock, voteLockGovernance }) => ({
        address: voteLock,
        governance: voteLockGovernance,
      })
    ),
  ]

  return candidates.reduce<OldVoteLock[]>((acc, { address, governance }) => {
    const voteLock = getAddress(address)
    if (voteLock === singleton) return acc
    if (acc.some((existing) => existing.address === voteLock)) return acc
    return [
      ...acc,
      {
        address: voteLock,
        ...(governance ? { governance: getAddress(governance) } : {}),
      },
    ]
  }, [])
}
