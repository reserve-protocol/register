import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
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
  proposals: readonly IndexDtfProposalSummary[]
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
    voteTokenSupply: overview.voteSupply, // TODO: Not sure what is going on here?
  }
})

export const governanceProposalsAtom = atom<
  readonly IndexDtfProposalSummary[] | undefined
>(undefined)

export const refetchTokenAtom = atom(0)
