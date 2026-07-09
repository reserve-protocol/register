import { Token } from '@/types'
import type { IndexDtfProposalSummary } from '@reserve-protocol/react-sdk'
import { atom } from 'jotai'
import { governanceProposalsAtom } from '../governance/atoms'
import { RebalanceMetrics } from './views/rebalance-list/hooks/use-rebalance-metrics'
import { indexDTFVersionAtom } from '@/state/dtf/atoms'

export type Rebalance = {
  id: string
  nonce: string
  tokens: Token[]
  priceControl: string
  weightLowLimit: string[]
  weightSpotLimit: string[]
  weightHighLimit: string[]
  rebalanceLowLimit: string
  rebalanceSpotLimit: string
  rebalanceHighLimit: string
  priceLowLimit: string[]
  priceHighLimit: string[]
  restrictedUntil: string
  availableUntil: string
  transactionHash: string
  blockNumber: string
  timestamp: string
}

export type RebalanceByProposal = {
  rebalance: Rebalance
  proposal: IndexDtfProposalSummary
}

export const isV4Atom = atom((get) => {
  const dtf = get(indexDTFVersionAtom)
  return dtf === '4.0.0'
})

export const isV5Atom = atom((get) => {
  const dtf = get(indexDTFVersionAtom)
  return dtf === '5.0.0'
})

export const rebalancesAtom = atom<Rebalance[] | undefined>(undefined)
export const currentProposalIdAtom = atom('')
export const currentRebalanceAtom = atom<RebalanceByProposal | undefined>(
  (get) => {
    const rebalancesByProposal = get(rebalancesByProposalAtom)
    const currentProposalId = get(currentProposalIdAtom)

    return rebalancesByProposal?.[currentProposalId]
  }
)

// Creates a map of rebalances by proposal
export const rebalancesByProposalAtom = atom<
  Record<string, RebalanceByProposal> | undefined
>((get) => {
  const rebalances = get(rebalancesAtom)
  const proposals = get(governanceProposalsAtom)

  if (!rebalances || !proposals) return undefined

  // Create a map of execution block to proposal for O(1) lookup
  const proposalsByExecutionBlock = new Map<string, IndexDtfProposalSummary>()
  for (const proposal of proposals) {
    if (proposal.executionBlock !== undefined) {
      proposalsByExecutionBlock.set(
        proposal.executionBlock.toString(),
        proposal
      )
    }
  }

  // Build the result map directly by iterating through rebalances
  const rebalancesByProposal: Record<string, RebalanceByProposal> = {}

  for (const rebalance of rebalances) {
    const matchingProposal = proposalsByExecutionBlock.get(
      rebalance.blockNumber
    )

    if (matchingProposal) {
      rebalancesByProposal[matchingProposal.id] = {
        proposal: matchingProposal,
        rebalance,
      }
    }
  }

  return rebalancesByProposal
})

// Returns a list of all rebalances with it's proposal, order by execution block
export const rebalancesByProposalListAtom = atom<
  RebalanceByProposal[] | undefined
>((get) => {
  const rebalancesByProposal = get(rebalancesByProposalAtom)

  if (!rebalancesByProposal) return undefined

  return Object.values(rebalancesByProposal).sort(
    (a, b) =>
      (b.proposal.executionBlock ?? 0) - (a.proposal.executionBlock ?? 0)
  )
})

export const apiRebalanceMetricsAtom = atom<RebalanceMetrics | undefined>(
  undefined
)

export const isCompletedAtom = atom<boolean>((get) => {
  const rebalance = get(currentRebalanceAtom)

  if (!rebalance) return false

  return (
    Number(rebalance.rebalance.availableUntil) < Math.floor(Date.now() / 1000)
  )
})
