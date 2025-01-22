import { PartialProposal } from '@/lib/governance'
import { atom } from 'jotai'
import { Address } from 'viem'

export type GovernanceStats = {
  proposalCount: number
  totalDelegates: number
  voteTokenSupply: number
}
type Delegate = {
  address: Address
  delegatedVotes: number
  numberVotes: number
}
export type IndexGovernanceOverview = {
  proposals: PartialProposal[]
  delegates: Delegate[]
  voteSupply: number
  delegatesCount: number
  proposalCount: number
}

export const indexGovernanceOverviewAtom = atom<
  IndexGovernanceOverview | undefined
>(undefined)

export const governanceStatsAtom = atom<GovernanceStats | undefined>((get) => {
  const overview = get(indexGovernanceOverviewAtom)

  if (!overview) return undefined

  return {
    proposalCount: overview.proposalCount,
    totalDelegates: overview.delegatesCount,
    voteTokenSupply: overview.voteSupply,
  }
})

export const topDelegatesAtom = atom<
  Array<Delegate & { weightedVotes: number }> | undefined
>((get) => {
  const overview = get(indexGovernanceOverviewAtom)

  if (!overview) return undefined

  return overview.delegates.map((delegate) => ({
    ...delegate,
    weightedVotes: delegate.delegatedVotes / overview.voteSupply,
  }))
})

export const governanceProposalsAtom = atom<PartialProposal[] | undefined>(
  (get) => {
    const overview = get(indexGovernanceOverviewAtom)
    return overview?.proposals
  }
)
