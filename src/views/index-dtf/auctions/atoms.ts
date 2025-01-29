import { PartialProposal } from '@/lib/governance'
import { getBasketPortion } from '@/lib/index-rebalance/utils'
import {
  indexDTFBasketPricesAtom,
  indexDTFBasketSharesAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { atom } from 'jotai'
import { governanceProposalsAtom } from '../governance/atoms'

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
  // Calculated after
  currentBuyShare?: number
  currentSellShare?: number
  buyShare?: number
  sellShare?: number
  deltaBuyShare?: number
  deltaSellShare?: number
}

// TODO: Expand this? can know if trades expired or are permissionless or are all run or if there is one active etc
export type TradesByProposal = {
  proposal: PartialProposal
  trades: AssetTrade[]
}
export const allPricesAtom = atom<Record<string, number> | undefined>(undefined)

export const dtfTradesAtom = atom<AssetTrade[] | undefined>(undefined)

export const tradeVolatilityAtom = atom<Record<string, number>>(
  {} as Record<string, number>
)

export const dtfTradesWithSharesAtom = atom<AssetTrade[] | undefined>((get) => {
  const trades = get(dtfTradesAtom)
  const allPrices = get(allPricesAtom)
  const currentShares = get(indexDTFBasketSharesAtom)
  const dtfPrice = get(indexDTFPriceAtom)

  if (
    !allPrices ||
    !trades ||
    !dtfPrice ||
    !Object.keys(currentShares).length
  ) {
    return trades
  }

  return trades.map((trade) => {
    // Make sure we have the prices for both tokens to be able to calculate the shares
    if (
      !allPrices[trade.sell.address.toLowerCase()] ||
      !allPrices[trade.buy.address.toLowerCase()]
    ) {
      return trade
    }

    const sellTokenShares =
      getBasketPortion(
        trade.sellLimitSpot,
        BigInt(trade.sell.decimals),
        allPrices[trade.sell.address.toLowerCase()],
        dtfPrice
      )[0] * 100
    const buyTokenShares =
      getBasketPortion(
        trade.buyLimitSpot,
        BigInt(trade.buy.decimals),
        allPrices[trade.buy.address.toLowerCase()],
        dtfPrice
      )[0] * 100

    return {
      ...trade,
      buyShare: buyTokenShares,
      sellShare: sellTokenShares,
      currentBuyShare: Number(
        currentShares[trade.buy.address.toLowerCase()] || '0'
      ),
      currentSellShare: Number(
        currentShares[trade.sell.address.toLowerCase()] || '0'
      ),
      deltaBuyShare:
        buyTokenShares -
        Number(currentShares[trade.buy.address.toLowerCase()] || '0'),
      deltaSellShare:
        sellTokenShares -
        Number(currentShares[trade.sell.address.toLowerCase()] || '0'),
    }
  })
})

// Maybe... just get the governanceId-tradeId map instead of sending the object!
export const dtfTradesMapAtom = atom<Record<string, AssetTrade>>((get) => {
  const trades = get(dtfTradesWithSharesAtom)
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
    const trades = get(dtfTradesWithSharesAtom)
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
