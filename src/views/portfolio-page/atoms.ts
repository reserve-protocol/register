import { atom } from 'jotai'
import { Address, formatEther } from 'viem'
import {
  portfolioStTokenAtom,
  stakingSidebarOpenAtom,
  type VoteLockTab,
} from '@/components/vote-lock/atoms'
import {
  getProposalState as getIndexProposalState,
  getYieldDtfProposalState,
  type Amount,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import {
  PortfolioPeriod,
  PortfolioProposal,
  PortfolioResponse,
  PortfolioReward,
} from './types'
import { VotingState } from '@/lib/governance'
import { isHiddenDtfSymbol, PROPOSAL_STATES } from '@/utils/constants'
import { getAvailableTimeRanges } from '@/views/index-dtf/overview/components/charts/use-available-time-ranges'

export const portfolioFirstHistoryTimestampAtom = atom<
  number | null | undefined
>(undefined)

export const portfolioAvailableTimeRangesAtom = atom((get) =>
  getAvailableTimeRanges({
    dtfTimestamp: 1,
    firstHistoryTimestamp: get(portfolioFirstHistoryTimestampAtom),
    isYieldMode: false,
  })
)

export const portfolioDefaultTimeRangeAtom = atom<PortfolioPeriod>((get) => {
  const available = get(portfolioAvailableTimeRangesAtom)
  if (!available) return '1y'
  const nonAll = available.filter((r) => r.value !== 'all')
  return (nonAll[nonAll.length - 1]?.value ?? 'all') as PortfolioPeriod
})

const portfolioPageTimeRangeBaseAtom = atom<PortfolioPeriod>('1y')

// Reads clamp to the available ranges, so a selection that outlives the
// account's history falls back to the default instead of an empty chart.
export const portfolioPageTimeRangeAtom = atom(
  (get) => {
    const selected = get(portfolioPageTimeRangeBaseAtom)
    const available = get(portfolioAvailableTimeRangesAtom)
    if (!available || available.some((r) => r.value === selected)) {
      return selected
    }
    return get(portfolioDefaultTimeRangeAtom)
  },
  (_get, set, period: PortfolioPeriod) =>
    set(portfolioPageTimeRangeBaseAtom, period)
)

export const portfolioDataAtom = atom<PortfolioResponse | null>(null)

export const portfolioAddressAtom = atom<Address | undefined>(undefined)

export const portfolioNowAtom = atom(Math.floor(Date.now() / 1000))

export const portfolioIndexDTFsAtom = atom(
  (get) => get(portfolioDataAtom)?.indexDTFs ?? []
)
export const portfolioIndexDTFPositionsAtom = atom((get) =>
  get(portfolioIndexDTFsAtom).filter((d) => Number(d.amount) > 0)
)
export const portfolioYieldDTFsAtom = atom(
  (get) => get(portfolioDataAtom)?.yieldDTFs ?? []
)
export const portfolioStakedRSRAtom = atom(
  (get) => get(portfolioDataAtom)?.stakedRSR ?? []
)
export const portfolioVoteLocksAtom = atom((get) =>
  (get(portfolioDataAtom)?.voteLocks ?? []).map((voteLock) => ({
    ...voteLock,
    dtfs: voteLock.dtfs.filter((dtf) => !isHiddenDtfSymbol(dtf.symbol)),
  }))
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

// Outcome/lifecycle is the SDK's audited derivation, selected by the row's isIndexDTF flag — no local governor math.
// Exported for unit testing (pure) — see tests/atoms.test.ts.
const rawAmount = (value: string): Amount => {
  const raw = BigInt(value)
  return { raw, formatted: formatEther(raw) }
}

const MAX_UINT256 = (1n << 256n) - 1n

// MAX_UINT256 (challenged/transitioned) and 0 (unset threshold) both mean "no usable veto votes".
const parseVetoThresholdVotes = (value?: string | null): bigint | undefined => {
  if (value === null || value === undefined) return undefined
  const raw = BigInt(value)
  return raw === MAX_UINT256 ? undefined : raw
}

const parseVetoThreshold = (value?: string | null): bigint | undefined => {
  const threshold = parseVetoThresholdVotes(value)
  return threshold === 0n ? undefined : threshold
}

// Build the optimistic context only when every veto input is valid — a partial context makes the oracle report CANCELED.
const buildIndexOptimisticContext = (p: PortfolioProposal) => {
  if (p.isOptimistic !== true) return undefined
  const vetoThreshold = parseVetoThreshold(p.vetoThreshold)
  const vetoThresholdVotes = parseVetoThresholdVotes(p.vetoThresholdVotes)
  if (
    p.optimisticSnapshot == null ||
    p.optimisticSnapshotSupply == null ||
    vetoThreshold === undefined ||
    vetoThresholdVotes === undefined
  ) {
    return undefined
  }
  return {
    proposalId: p.id,
    voteToken: p.dtfAddress,
    snapshot: BigInt(p.optimisticSnapshot),
    snapshotSupply: rawAmount(p.optimisticSnapshotSupply),
    vetoThreshold,
    vetoThresholdVotes: rawAmount(vetoThresholdVotes.toString()),
  }
}

export const getPortfolioProposalVotingState = (
  p: PortfolioProposal & { isIndexDTF?: boolean },
  timestamp: number
): VotingState => {
  const voteStart = Number(p.voteStart)
  const voteEnd = Number(p.voteEnd)
  const forWeightedVotes = rawAmount(p.forWeightedVotes)
  const againstWeightedVotes = rawAmount(p.againstWeightedVotes)
  const abstainWeightedVotes = rawAmount(p.abstainWeightedVotes)
  const quorumVotes = rawAmount(p.quorumVotes)

  if (p.isIndexDTF) {
    const optimistic = buildIndexOptimisticContext(p)
    // vetoThreshold stays raw and context-independent — the MAX_UINT256 sentinel is how the oracle resolves a transitioned proposal.
    const vetoThreshold =
      optimistic?.vetoThreshold ??
      (p.vetoThreshold != null ? BigInt(p.vetoThreshold) : undefined)
    return getIndexProposalState(
      {
        state: p.state,
        isOptimistic: p.isOptimistic === true,
        voteStart,
        voteEnd,
        forWeightedVotes,
        againstWeightedVotes,
        abstainWeightedVotes,
        quorumVotes,
        executionETA: p.executionETA ? Number(p.executionETA) : undefined,
        ...(optimistic ? { optimistic } : {}),
        ...(vetoThreshold !== undefined ? { vetoThreshold } : {}),
      } as Parameters<typeof getIndexProposalState>[0],
      timestamp
    )
  }

  // The SDK yield oracle owns the state; deadline + display percentages are UI-local.
  const derivedState = getYieldDtfProposalState(
    {
      state: p.state,
      voteStart,
      voteEnd,
      forWeightedVotes,
      againstWeightedVotes,
      abstainWeightedVotes,
      quorumVotes,
    } as Parameters<typeof getYieldDtfProposalState>[0],
    timestamp
  )

  const totalVotes =
    forWeightedVotes.raw + againstWeightedVotes.raw + abstainWeightedVotes.raw
  const reachedQuorum =
    forWeightedVotes.raw > 0n && forWeightedVotes.raw >= quorumVotes.raw
  const state: VotingState = {
    state: derivedState,
    deadline: null,
    quorum: reachedQuorum,
    forVotesReachedQuorum: reachedQuorum,
    participationQuorumReached:
      forWeightedVotes.raw + abstainWeightedVotes.raw >= quorumVotes.raw,
    vetoReached: false,
    for: 0,
    against: 0,
    abstain: 0,
  }

  if (p.state === PROPOSAL_STATES.QUEUED && p.executionETA) {
    state.deadline = Number(p.executionETA) - timestamp
  } else if (derivedState === PROPOSAL_STATES.PENDING) {
    state.deadline = voteStart - timestamp
  } else if (derivedState === PROPOSAL_STATES.ACTIVE) {
    state.deadline = voteEnd - timestamp
  }

  if (totalVotes > 0n) {
    const total = Number(totalVotes)
    state.for = (Number(forWeightedVotes.raw) / total) * 100
    state.against = (Number(againstWeightedVotes.raw) / total) * 100
    state.abstain = (Number(abstainWeightedVotes.raw) / total) * 100
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
    .flatMap((v) => {
      if (!v.dtfs?.length) return []
      return (v.activeProposals || []).map((p) => ({
        ...p,
        dtfName: v.dtfs[0].name,
        dtfSymbol: v.dtfs[0].symbol,
        dtfAddress: v.dtfs[0].address,
        chainId: v.chainId,
        isIndexDTF: true,
      }))
    })
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
      dtfAddress?: Address
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
          dtfAddress: position.dtfs[0]?.address,
          tokenSymbol: position.symbol,
          underlyingSymbol: position.underlying.symbol,
          underlyingAddress: position.underlying.address,
        })
      }
    }

    return rows.sort((a, b) => (b.value || 0) - (a.value || 0))
  }
)

export type PortfolioRewardRow = PortfolioReward & {
  source: 'staking' | 'revenue'
  stTokenAddress?: Address
  dtfAddress?: Address
}

export const portfolioRewardsAtom = atom<PortfolioRewardRow[]>((get) => {
  const voteLocks = get(portfolioVoteLocksAtom)
  const indexDTFs = get(portfolioIndexDTFsAtom)

  const stakingRewards = voteLocks.flatMap((lock) =>
    (lock.rewards || []).map((r) => ({
      ...r,
      source: 'staking' as const,
      stTokenAddress: lock.stTokenAddress,
    }))
  )

  const revenueRewards = indexDTFs.flatMap((dtf) =>
    (dtf.rewards || []).map((r) => ({
      ...r,
      source: 'revenue' as const,
      dtfAddress: dtf.address,
    }))
  )

  return [...stakingRewards, ...revenueRewards].sort(
    (a, b) => (b.value || 0) - (a.value || 0)
  )
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
      dtfAddress?: Address
      isOptimistic?: boolean | null
      tab?: VoteLockTab
    }
  ) => {
    set(portfolioStTokenAtom, {
      id: params.id,
      token: {
        address: params.id,
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
      chainId: params.chainId as SupportedChainId,
      dtfAddress: params.dtfAddress,
      governance: params.isOptimistic
        ? { isOptimistic: params.isOptimistic }
        : undefined,
    })
    set(stakingSidebarOpenAtom, { open: true, tab: params.tab ?? 'lock' })
  }
)
