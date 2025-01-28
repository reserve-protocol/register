import { Token } from '@/types'
import { atom } from 'jotai'
import { governanceProposalsAtom } from '../governance/atoms'
import { PartialProposal } from '@/lib/governance'

export type AssetTrade = {
  id: string
  sell: Token
  buy: Token
  soldAmount: bigint
  boughtAmount: bigint
  startPrice: bigint
  endPrice: bigint
  sellLimitSpot: bigint
  sellLimitHigh: bigint
  sellLimitLow: bigint
  buyLimitLow: bigint
  buyLimitSpot: bigint
  buyLimitHigh: bigint
  availableAt: number
  launchTimeout: number
  start: number
  end: number
  approvedTimestamp: number
  launchedTimestamp: number
  closedTimestamp: number
  approvedBlockNumber: string
}

// TODO: Expand this? can know if trades expired or are permissionless or are all run or if there is one active etc
export type TradesByProposal = {
  proposal: PartialProposal
  trades: AssetTrade[]
}

export const dtfTradesAtom = atom<AssetTrade[] | undefined>(undefined)

export const dtfTradesMapAtom = atom<Record<string, AssetTrade>>((get) => {
  const trades = get(dtfTradesAtom)
  return (
    trades?.reduce(
      (acc, trade) => {
        acc[trade.id] = trade
        return acc
      },
      {} as Record<string, AssetTrade>
    ) ?? {}
  )
})

export const dtfTradeVolatilityAtom = atom<Record<string, number>>(
  {} as Record<string, number>
)

export const selectedTradesAtom = atom<Record<string, string>>({})

// TODO: There are some edge cases with this grouping, worth revisiting
export const dtfTradesByProposalAtom = atom<TradesByProposal[] | undefined>(
  (get) => {
    const trades = get(dtfTradesAtom)
    const proposals = get(governanceProposalsAtom)

    if (!trades || !proposals) return undefined

    const tradesByProposal: Record<string, TradesByProposal> = {}

    for (const proposal of proposals) {
      if (proposal.executionBlock) {
        tradesByProposal[proposal.executionBlock] = {
          proposal,
          trades: [],
        }
      }
    }

    for (const trade of trades) {
      if (trade.approvedBlockNumber in tradesByProposal) {
        tradesByProposal[trade.approvedBlockNumber].trades.push(trade)
      }
    }

    return Object.values(tradesByProposal).sort(
      (a, b) =>
        Number(a.proposal.executionBlock) - Number(b.proposal.executionBlock)
    )
  }
)
