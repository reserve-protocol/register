import { PartialProposal } from '@/lib/governance'
import { getBasketPortion } from '@/lib/index-rebalance/utils'
import { walletAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketSharesAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { Token } from '@/types'
import { getCurrentTime } from '@/utils'
import { atom } from 'jotai'
import { governanceProposalsAtom } from '../governance/atoms'
import { IndexAuctionSimulation } from '@/hooks/useSimulatedBasket'

export const TRADE_STATE = {
  PENDING: 'PENDING', // Only for auction launcher!
  AVAILABLE: 'AVAILABLE', // Permissionless available
  RUNNING: 'RUNNING', // Auction launched
  COMPLETED: 'COMPLETED', // Auction completed (BIDDED)
  EXPIRED: 'EXPIRED', // Auction expired
}

export function getTradeState(trade: AssetTrade) {
  const currentTime = getCurrentTime()

  if (currentTime >= trade.launchTimeout) {
    if (trade.bids.length > 0) {
      return TRADE_STATE.COMPLETED
    }

    return TRADE_STATE.EXPIRED
  }

  if (currentTime >= trade.start && currentTime < trade.end) {
    return TRADE_STATE.RUNNING
  }

  if (
    currentTime >= trade.end &&
    trade.availableRuns > 1 &&
    trade.boughtAmount < trade.buyLimitSpot &&
    currentTime >= trade.availableAt
  ) {
    return TRADE_STATE.AVAILABLE
  }

  return TRADE_STATE.PENDING
}

export type AssetTrade = {
  id: string
  sell: Token
  buy: Token
  soldAmount: bigint
  boughtAmount: bigint
  startPrice: bigint
  endPrice: bigint
  approvedStartPrice: bigint
  approvedEndPrice: bigint
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
  availableRuns: number
  approvedTimestamp: number
  launchedTimestamp: number
  approvedBlockNumber: string
  // Calculated after
  currentBuyShare?: number
  currentSellShare?: number
  buyShare?: number
  sellShare?: number
  deltaBuyShare?: number
  deltaSellShare?: number
  state: string
  bids: {
    id: string
    bidder: string
    sellAmount: bigint
    buyAmount: bigint
    blockNumber: number
    timestamp: number
    transactionHash: string
  }[]
}

export const VOLATILITY_OPTIONS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

export const VOLATILITY_VALUES = {
  [VOLATILITY_OPTIONS.LOW]: 0.05,
  [VOLATILITY_OPTIONS.MEDIUM]: 0.1,
  [VOLATILITY_OPTIONS.HIGH]: 0.2,
}

// TODO: Expand this? can know if trades expired or are permissionless or are all run or if there is one active etc
export type TradesByProposal = {
  proposal: PartialProposal
  trades: AssetTrade[]
  permissionless: boolean
  completed: number
  expired: number
  expiresAt: number
  availableAt: number
  status: string
  blockNumber: number
}
export const allPricesAtom = atom<Record<string, number> | undefined>(undefined)

export const selectedProposalAtom = atom<string | undefined>(undefined)

export const isAuctionLauncherAtom = atom((get) => {
  const wallet = get(walletAtom)
  const dtf = get(indexDTFAtom)
  return !!dtf?.auctionLaunchers.find(
    (launcher) => launcher.toLowerCase() === wallet?.toLowerCase()
  )
})

// Make this a map so we can easily update the trade state using the id
export const dtfTradeMapAtom = atom<Record<string, AssetTrade> | undefined>(
  undefined
)

export const dtfTradesAtom = atom<AssetTrade[] | undefined>((get) => {
  const tradeMap = get(dtfTradeMapAtom)
  return tradeMap ? Object.values(tradeMap) : undefined
})

export const tradeVolatilityAtom = atom<Record<string, string>>(
  {} as Record<string, string>
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

export const dtfTradeVolatilityAtom = atom<Record<string, string>>({})

export const selectedTradesAtom = atom<Record<string, boolean>>({})

export const addSelectedTradeAtom = atom(null, (get, set, tradeId: string) => {
  const selectedTrades = get(selectedTradesAtom)

  set(selectedTradesAtom, {
    ...selectedTrades,
    [tradeId]: !selectedTrades[tradeId],
  })
})

export const setTradeVolatilityAtom = atom(
  null,
  (get, set, [tradeId, volatility]: [string, string]) => {
    set(dtfTradeVolatilityAtom, {
      ...get(dtfTradeVolatilityAtom),
      [tradeId]: volatility,
    })
  }
)

// TODO: There are some edge cases with this grouping, worth revisiting
export const dtfTradesByProposalMapAtom = atom<
  Record<string, TradesByProposal> | undefined
>((get) => {
  const trades = get(dtfTradesWithSharesAtom)
  const proposals = get(governanceProposalsAtom)

  if (!trades || !proposals) return undefined

  const tradesByProposal: Record<string, TradesByProposal> = {}

  for (const proposal of proposals) {
    if (proposal.executionBlock) {
      tradesByProposal[proposal.executionBlock] = {
        proposal,
        trades: [],
        permissionless: false,
        completed: 0,
        expired: 0,
        availableAt: 0,
        expiresAt: 0,
        blockNumber: Number(proposal.executionBlock),
        status: 'PENDING',
      }
    }
  }

  for (const trade of trades) {
    if (trade.approvedBlockNumber in tradesByProposal) {
      tradesByProposal[trade.approvedBlockNumber].trades.push(trade)
      tradesByProposal[trade.approvedBlockNumber].completed +=
        trade.state === TRADE_STATE.COMPLETED ? 1 : 0
      tradesByProposal[trade.approvedBlockNumber].expired +=
        trade.state === TRADE_STATE.EXPIRED ? 1 : 0
      tradesByProposal[trade.approvedBlockNumber].expiresAt =
        trade.launchTimeout
      tradesByProposal[trade.approvedBlockNumber].availableAt =
        trade.availableAt

      // Update status based on trade states
      const proposal = tradesByProposal[trade.approvedBlockNumber]
      const totalTrades = proposal.trades.length

      if (proposal.completed === totalTrades) {
        proposal.status = 'COMPLETED'
      } else if (proposal.expired === totalTrades) {
        proposal.status = 'EXPIRED'
      } else if (trade.state === TRADE_STATE.RUNNING) {
        proposal.status = 'ONGOING'
      }
    }
  }

  return Object.values(tradesByProposal).reduce(
    (acc, proposal) => {
      proposal.permissionless = proposal.trades.some(
        (trade) => trade.availableAt < proposal.expiresAt
      )
      acc[proposal.proposal.id] = proposal
      return acc
    },
    {} as Record<string, TradesByProposal>
  )
})

export const dtfTradesByProposalAtom = atom<TradesByProposal[] | undefined>(
  (get) => {
    const tradesByProposal = get(dtfTradesByProposalMapAtom)

    if (!tradesByProposal) return undefined

    return Object.values(tradesByProposal)
      .filter((proposal) => proposal.trades.length > 0)
      .sort(
        (a, b) =>
          Number(b.proposal.executionBlock) - Number(a.proposal.executionBlock)
      )
  }
)

export const proposedBasketAtom = atom<IndexAuctionSimulation | undefined>(
  undefined
)
export const expectedBasketAtom = atom<IndexAuctionSimulation | undefined>(
  undefined
)
