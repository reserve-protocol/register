import { atom } from 'jotai'
import { Address } from 'viem'
import {
  portfolioStTokenAtom,
  stakingSidebarOpenAtom,
} from '@/views/index-dtf/overview/components/staking/atoms'
import {
  PortfolioPeriod,
  PortfolioProposal,
  PortfolioResponse,
} from './types'
import { getProposalState, VotingState } from '@/lib/governance'
import { PROPOSAL_STATES } from '@/utils/constants'

export const portfolioPageTimeRangeAtom = atom<PortfolioPeriod>('3m')

export const portfolioDataAtom = atom<PortfolioResponse | null>(null)

export const portfolioAddressAtom = atom<Address | undefined>(undefined)

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

export const portfolioChartBreakdownAtom = atom((get) => {
  const portfolio = get(portfolioDataAtom)
  if (!portfolio) return []
  const categories = [
    {
      label: 'Index DTFs',
      value: portfolio.indexDTFs.reduce((s, d) => s + (d.value || 0), 0),
    },
    {
      label: 'Yield DTFs',
      value: portfolio.yieldDTFs.reduce((s, d) => s + (d.value || 0), 0),
    },
    {
      label: 'Staked RSR',
      value: portfolio.stakedRSR.reduce((s, d) => s + (d.value || 0), 0),
    },
    {
      label: 'Vote-locked',
      value: portfolio.voteLocks.reduce((s, d) => s + (d.value || 0), 0),
    },
    {
      label: 'RSR',
      value: portfolio.rsrBalances.reduce((s, d) => s + (d.value || 0), 0),
    },
  ].filter((c) => c.value > 0)

  const total = categories.reduce((s, c) => s + c.value, 0)
  if (total === 0) return []
  return categories.map((c) => ({
    label: c.label,
    proportion: c.value / total,
  }))
})

const ACTIVE_STATES = new Set([
  PROPOSAL_STATES.PENDING,
  PROPOSAL_STATES.ACTIVE,
  PROPOSAL_STATES.SUCCEEDED,
  PROPOSAL_STATES.QUEUED,
])

const resolveState = (p: PortfolioProposal) =>
  getProposalState({
    id: p.id,
    timelockId: '',
    description: p.description,
    creationTime: Number(p.creationTime),
    creationBlock: 0,
    state: p.state,
    forWeightedVotes: Number(p.forWeightedVotes),
    abstainWeightedVotes: Number(p.abstainWeightedVotes),
    againstWeightedVotes: Number(p.againstWeightedVotes),
    quorumVotes: Number(p.quorumVotes),
    voteStart: Number(p.voteStart),
    voteEnd: Number(p.voteEnd),
    executionETA: p.executionETA ? Number(p.executionETA) : undefined,
    proposer: { address: p.proposer as `0x${string}` },
  })

export type ActiveProposalRow = PortfolioProposal & { voting: VotingState }

export const portfolioActiveProposalsAtom = atom<ActiveProposalRow[]>((get) => {
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
    .map((p) => ({ ...p, voting: resolveState(p) }))
    .filter((p) => ACTIVE_STATES.has(p.voting.state))
    .sort((a, b) => Number(b.creationTime) - Number(a.creationTime))
})

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
        totalSupply: '',
      },
      underlying: {
        name: params.underlyingSymbol,
        symbol: params.underlyingSymbol,
        address: params.underlyingAddress,
        decimals: 18,
      },
      legacyGovernance: [],
      rewardTokens: [],
      chainId: params.chainId,
    })
    set(stakingSidebarOpenAtom, true)
  }
)
