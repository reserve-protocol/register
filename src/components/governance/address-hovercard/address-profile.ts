import type {
  GovernanceAccount,
  GovernanceOutcomeCounts,
} from './use-governance-account'

export type DtfType = 'index' | 'yield'

export type AddressRole =
  | 'admin'
  | 'guardian'
  | 'optimistic-proposer'
  | 'auction-launcher'
  | 'brand-manager'
  | 'fee-recipient'
  | 'pauser'
  | 'freezer'
  | 'long-freezer'

type IndexRoleSource = {
  roles?: { admin?: { all?: readonly string[] } }
  ownerGovernance?: {
    id?: string
    timelock?: { id?: string; guardians?: readonly string[] }
    optimistic?: { proposers?: readonly string[] } | null
  } | null
  tradingGovernance?: {
    id?: string
    timelock?: { id?: string; guardians?: readonly string[] }
  } | null
  auctionLaunchers?: readonly string[]
  brandManagers?: readonly string[]
  feeRecipients?: readonly { address: string }[]
}

type YieldRoleSource = {
  owners: readonly string[]
  pausers: readonly string[]
  freezers: readonly string[]
  longFreezers: readonly string[]
  guardians?: readonly string[]
  governor?: string
  timelock?: string
}

export type VoterSource = {
  ownPower: number
  votingPower: number
  votingWeight: number
  isSelfDelegated: boolean
}

export type AddressProfile = {
  roles: AddressRole[]
  votingWeight: number | null
  delegatedPower: number | null
  delegators: number | null
  votingPowerSince: number | null
  thisDtf: GovernanceOutcomeCounts
  allReserve: GovernanceOutcomeCounts
  firstActionAt: number | null
  lastActionAt: number | null
}

const same = (a?: string, b?: string) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase()

const includes = (list: readonly string[] | undefined, address: string) =>
  !!list?.some((item) => same(item, address))

const EMPTY_COUNTS: GovernanceOutcomeCounts = {
  proposals: 0,
  executed: 0,
  defeated: 0,
  vetoed: 0,
  canceled: 0,
  votes: 0,
}

// The API keeps a profile for up to 3 minutes, so one read before a newer event can miss it.
const FRESH_WINDOW_SECONDS = 10 * 60

export const needsFreshRead = (eventAt: number | undefined, now: number) =>
  eventAt !== undefined && now - eventAt < FRESH_WINDOW_SECONDS

// Roles are read from the DTF's own contracts (via the SDK), never assigned by Reserve.
export const getIndexAddressRoles = (
  dtf: IndexRoleSource | undefined,
  address: string
): AddressRole[] => {
  if (!dtf) return []
  const governanceContracts = [
    dtf.ownerGovernance?.id,
    dtf.ownerGovernance?.timelock?.id,
    dtf.tradingGovernance?.id,
    dtf.tradingGovernance?.timelock?.id,
  ]
  const roles: AddressRole[] = []
  const isGovernanceContract = governanceContracts.some((contract) =>
    same(contract, address)
  )
  if (!isGovernanceContract && includes(dtf.roles?.admin?.all, address)) {
    roles.push('admin')
  }
  const guardians = [
    ...(dtf.ownerGovernance?.timelock?.guardians ?? []),
    ...(dtf.tradingGovernance?.timelock?.guardians ?? []),
  ]
  if (!isGovernanceContract && includes(guardians, address)) {
    roles.push('guardian')
  }
  if (includes(dtf.ownerGovernance?.optimistic?.proposers, address)) {
    roles.push('optimistic-proposer')
  }
  if (includes(dtf.auctionLaunchers, address)) roles.push('auction-launcher')
  if (includes(dtf.brandManagers, address)) roles.push('brand-manager')
  if (dtf.feeRecipients?.some((recipient) => same(recipient.address, address))) {
    roles.push('fee-recipient')
  }
  return roles
}

// RToken Main roles; the governance contracts own the RToken, so they are not shown as admins.
export const getYieldAddressRoles = (
  source: YieldRoleSource,
  address: string
): AddressRole[] => {
  const isGovernanceContract =
    same(source.governor, address) || same(source.timelock, address)
  if (isGovernanceContract) return []
  const roles: AddressRole[] = []
  if (includes(source.owners, address)) roles.push('admin')
  if (includes(source.guardians, address)) roles.push('guardian')
  if (includes(source.pausers, address)) roles.push('pauser')
  if (includes(source.freezers, address)) roles.push('freezer')
  if (includes(source.longFreezers, address)) roles.push('long-freezer')
  return roles
}

export const buildAddressProfile = ({
  roles,
  dtfType,
  chainId,
  dtfAddress,
  account,
  voter,
}: {
  roles: AddressRole[]
  dtfType: DtfType
  chainId: number
  dtfAddress: string
  account: GovernanceAccount | undefined
  voter: VoterSource | undefined
}): AddressProfile => {
  const entry = account?.dtfs.find(
    (item) =>
      item.type === dtfType &&
      item.chainId === chainId &&
      same(item.address, dtfAddress)
  )
  const countsSelf = voter?.isSelfDelegated && voter.ownPower > 0 ? 1 : 0
  const delegators =
    entry?.delegators != null ? Math.max(entry.delegators - countsSelf, 0) : null
  const ownCounted = voter?.isSelfDelegated ? voter.ownPower : 0
  const delegatedPower = voter
    ? Math.max(voter.votingPower - ownCounted, 0)
    : null

  return {
    roles,
    votingWeight: voter ? voter.votingWeight : null,
    delegatedPower,
    delegators,
    votingPowerSince: entry?.votingPowerSince ?? null,
    thisDtf: entry
      ? {
          proposals: entry.proposals,
          executed: entry.executed,
          defeated: entry.defeated,
          vetoed: entry.vetoed,
          canceled: entry.canceled,
          votes: entry.votes,
        }
      : EMPTY_COUNTS,
    allReserve: account?.totals ?? EMPTY_COUNTS,
    firstActionAt: account?.firstActionAt ?? null,
    lastActionAt: account?.lastActionAt ?? null,
  }
}
