import { getGovernanceUpgradeTarget } from '@/components/vote-lock/migration/migration-targets'
import { Address, getAddress, zeroAddress } from 'viem'

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

// Mirrors the role and fee-recipient requires of the spells' upgradeFolio.
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
  const target = getGovernanceUpgradeTarget(chainId, dtf.id)
  if (!target) return []

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
    if (voteLock === target.stakingVault) return acc
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
