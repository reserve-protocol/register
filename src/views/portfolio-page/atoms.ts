import { atom } from 'jotai'
import { Address } from 'viem'
import {
  portfolioStTokenAtom,
  stakingSidebarOpenAtom,
} from '@/views/index-dtf/overview/components/staking/atoms'
import { PortfolioPeriod, PortfolioProposal, PortfolioResponse } from './types'
import { VotingState } from '@/lib/governance'
import { PROPOSAL_STATES } from '@/utils/constants'

export const portfolioPageTimeRangeAtom = atom<PortfolioPeriod>('3m')

export const portfolioDataAtom = atom<PortfolioResponse | null>(null)

export const portfolioAddressAtom = atom<Address | undefined>(undefined)

export const portfolioNowAtom = atom(Math.floor(Date.now() / 1000))

export const portfolioIndexDTFsAtom = atom(
  (get) => get(portfolioDataAtom)?.indexDTFs ?? []
)
export const portfolioYieldDTFsAtom = atom(
  (get) => get(portfolioDataAtom)?.yieldDTFs ?? []
)
export const portfolioStakedRSRAtom = atom(
  (get) => get(portfolioDataAtom)?.stakedRSR ?? []
)
export const portfolioVoteLocksAtom = atom(
  (get) => get(portfolioDataAtom)?.voteLocks ?? []
)
export const portfolioRSRBalancesAtom = atom(
  (get) => get(portfolioDataAtom)?.rsrBalances ?? []
)

export const portfolioBreakdownAtom = atom((get) => {
  const data = get(portfolioDataAtom)
  if (!data) return null
  return {
    indexValue: data.indexDTFs.reduce((sum, d) => sum + (d.value || 0), 0),
    yieldValue: data.yieldDTFs.reduce((sum, d) => sum + (d.value || 0), 0),
    rsrValue: data.rsrBalances.reduce((sum, d) => sum + (d.value || 0), 0),
    stakedValue: data.stakedRSR.reduce((sum, d) => sum + (d.value || 0), 0),
    voteLockValue: data.voteLocks.reduce((sum, d) => sum + (d.value || 0), 0),
  }
})

const ACTIVE_STATES = new Set([
  PROPOSAL_STATES.PENDING,
  PROPOSAL_STATES.ACTIVE,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED,
])

// WHY: Portfolio proposals are aggregate API rows, not SDK proposal DTOs.
// Do not rebuild fake SDK Amounts from formatted strings for display filtering.
const getPortfolioProposalVotingState = (
  p: PortfolioProposal,
  timestamp: number
): VotingState => {
  const voteStart = Number(p.voteStart)
  const voteEnd = Number(p.voteEnd)
  const forVotes = Number(p.forWeightedVotes)
  const abstainVotes = Number(p.abstainWeightedVotes)
  const againstVotes = Number(p.againstWeightedVotes)
  const quorumVotes = Number(p.quorumVotes)
  const totalVotes = forVotes + againstVotes + abstainVotes
  const isOptimistic = p.isOptimistic === true
  const state: VotingState = {
    state: p.state,
    deadline: null,
    quorum: isOptimistic ? false : forVotes > 0 && forVotes >= quorumVotes,
    forVotesReachedQuorum: isOptimistic
      ? false
      : forVotes > 0 && forVotes >= quorumVotes,
    participationQuorumReached: isOptimistic
      ? false
      : forVotes + abstainVotes >= quorumVotes,
    vetoReached: false,
    for: 0,
    against: 0,
    abstain: 0,
  }

  if (p.state === PROPOSAL_STATES.QUEUED && p.executionETA) {
    state.deadline = Number(p.executionETA) - timestamp
  } else if (p.state === PROPOSAL_STATES.PENDING) {
    if (timestamp >= voteStart && timestamp < voteEnd) {
      state.state = PROPOSAL_STATES.ACTIVE
      state.deadline = voteEnd - timestamp
    } else if (timestamp < voteStart) {
      state.deadline = voteStart - timestamp
    } else if (isOptimistic) {
      // Index vote-lock proposals are optimistic: after the veto window, the
      // default result is pass unless the veto threshold was reached.
      state.state = PROPOSAL_STATES.SUCCEEDED
    } else {
      state.state = PROPOSAL_STATES.EXPIRED
    }
  } else if (p.state === PROPOSAL_STATES.ACTIVE) {
    if (timestamp >= voteEnd) {
      if (isOptimistic) {
        state.state = PROPOSAL_STATES.SUCCEEDED
      } else if (againstVotes > forVotes || forVotes === 0) {
        state.state = PROPOSAL_STATES.DEFEATED
      } else if (forVotes + abstainVotes < quorumVotes) {
        state.state = PROPOSAL_STATES.QUORUM_NOT_REACHED
      } else {
        state.state = PROPOSAL_STATES.SUCCEEDED
      }
    } else {
      state.deadline = voteEnd - timestamp
    }
  }

  if (totalVotes > 0) {
    state.for = (forVotes / totalVotes) * 100
    state.against = (againstVotes / totalVotes) * 100
    state.abstain = (abstainVotes / totalVotes) * 100
  }

  return state
}

export type ActiveProposalRow = PortfolioProposal & { voting: VotingState }

export const portfolioActiveProposalsAtom = atom<ActiveProposalRow[]>((get) => {
  const timestamp = get(portfolioNowAtom)
  const stakedRSR = get(portfolioStakedRSRAtom)
  const voteLocks = get(portfolioVoteLocksAtom)
  const staked = stakedRSR
    .filter((s) => Number(s.amount) > 0)
    .flatMap((s) =>
      (s.activeProposals || []).map((p) => ({
        ...p,
        dtfName: s.name,
        dtfSymbol: s.symbol,
        dtfAddress: s.address,
        chainId: s.chainId,
        isIndexDTF: false,
      }))
    )
  const locked = voteLocks
    .filter((v) => Number(v.amount) > 0)
    .flatMap((v) =>
      (v.activeProposals || []).map((p) => ({
        ...p,
        dtfName: v.dtfs?.[0]?.name || v.symbol,
        dtfSymbol: v.dtfs?.[0]?.symbol || v.symbol,
        dtfAddress: v.dtfs?.[0]?.address || v.stTokenAddress,
        chainId: v.chainId,
        isIndexDTF: true,
      }))
    )
  return [...staked, ...locked]
    .map((p) => ({
      ...p,
      voting: getPortfolioProposalVotingState(p, timestamp),
    }))
    .filter((p) => ACTIVE_STATES.has(p.voting.state))
    .sort((a, b) => Number(b.creationTime) - Number(a.creationTime))
})

export type PendingWithdrawalRow =
  | {
      source: 'stakedRSR'
      endId: number
      amount: string
      availableAt: number
      delay: number
      value: number
      chainId: number
      stRSRAddress: Address
      dtfAddress: Address
      tokenSymbol: string
    }
  | {
      source: 'voteLock'
      lockId: string
      amount: string
      unlockTime: number
      delay: number
      value: number
      chainId: number
      stTokenAddress: Address
      tokenSymbol: string
      underlyingSymbol: string
      underlyingAddress: Address
    }

export const portfolioPendingWithdrawalsAtom = atom<PendingWithdrawalRow[]>(
  (get) => {
    const stakedRSR = get(portfolioStakedRSRAtom)
    const voteLocks = get(portfolioVoteLocksAtom)
    const rows: PendingWithdrawalRow[] = []

    for (const position of stakedRSR) {
      for (const w of position.pendingWithdrawals || []) {
        rows.push({
          source: 'stakedRSR',
          endId: w.endId,
          amount: w.amount,
          availableAt: w.availableAt,
          delay: w.delay,
          value: w.value,
          chainId: position.chainId,
          stRSRAddress: position.stRSRAddress,
          dtfAddress: position.address,
          tokenSymbol: `${position.symbol.toLowerCase()}RSR`,
        })
      }
    }

    for (const position of voteLocks) {
      for (const lock of position.locks || []) {
        rows.push({
          source: 'voteLock',
          lockId: lock.lockId,
          amount: lock.amount,
          unlockTime: lock.unlockTime,
          delay: lock.delay,
          value: lock.value,
          chainId: position.chainId,
          stTokenAddress: position.stTokenAddress,
          tokenSymbol: position.symbol,
          underlyingSymbol: position.underlying.symbol,
          underlyingAddress: position.underlying.address,
        })
      }
    }

    return rows.sort((a, b) => (b.value || 0) - (a.value || 0))
  }
)

export const portfolioRewardsAtom = atom((get) => {
  const voteLocks = get(portfolioVoteLocksAtom)
  return voteLocks
    .flatMap((lock) =>
      (lock.rewards || []).map((r) => ({
        ...r,
        stTokenAddress: lock.stTokenAddress,
      }))
    )
    .sort((a, b) => (b.value || 0) - (a.value || 0))
})

export const openStakingSidebarAtom = atom(
  null,
  (
    _get,
    set,
    params: {
      id: Address
      tokenSymbol: string
      underlyingSymbol: string
      underlyingAddress: Address
      chainId: number
    }
  ) => {
    set(portfolioStTokenAtom, {
      id: params.id,
      token: {
        name: params.tokenSymbol,
        symbol: params.tokenSymbol,
        decimals: 18,
        totalSupply: { raw: 0n, formatted: '0' },
      },
      underlying: {
        name: params.underlyingSymbol,
        symbol: params.underlyingSymbol,
        address: params.underlyingAddress,
        decimals: 18,
      },
      legacyGovernance: [],
      rewardTokens: [],
      totalDelegates: 0,
      currentDelegates: 0,
      totalOptimisticDelegates: 0,
      currentOptimisticDelegates: 0,
      chainId: params.chainId,
    })
    set(stakingSidebarOpenAtom, true)
  }
)
