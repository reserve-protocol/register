import { useAssetPrices } from '@/hooks/useAssetPrices'
import {
  chainIdAtom,
  INDEX_DTF_SUBGRAPH_URL,
} from '@/state/chain/atoms/chainAtoms'
import { indexDTFAtom, indexDTFBasketPricesAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { getCurrentTime } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  allPricesAtom,
  AssetTrade,
  dtfTradeMapAtom,
  dtfTradesAtom,
  dtfTradesByProposalMapAtom,
  expectedBasketAtom,
  getTradeState,
  proposedBasketAtom,
  selectedProposalAtom,
  selectedTradesAtom,
  TRADE_STATE,
} from './atoms'
import useSnapshotBasket from '@/hooks/useSnapshotBasket'
import useSimulatedBasket from '@/hooks/useSimulatedBasket'

type Response = {
  trades: {
    id: string
    sell: Token
    buy: Token
    soldAmount: string
    boughtAmount: string
    approvedStartPrice: string
    approvedEndPrice: string
    startPrice: string
    endPrice: string
    sellLimitSpot: string
    sellLimitHigh: string
    sellLimitLow: string
    buyLimitLow: string
    buyLimitSpot: string
    buyLimitHigh: string
    availableAt: string
    launchTimeout: string
    start: string
    end: string
    availableRuns: string
    approvedBlock: string
    approvedTimestamp: string
    launchedTimestamp: string
    approvedBlockNumber: string
    bids: {
      id: string
      bidder: string
      sellAmount: string
      buyAmount: string
      blockNumber: string
      timestamp: string
      transactionHash: string
    }[]
  }[]
}

const query = gql`
  query getGovernanceStats($dtf: String!) {
    trades(where: { dtf: $dtf }) {
      id
      sell {
        address
        name
        symbol
        decimals
      }
      buy {
        address
        name
        symbol
        decimals
      }
      soldAmount
      boughtAmount
      approvedStartPrice
      approvedEndPrice
      startPrice
      endPrice
      sellLimitSpot
      sellLimitHigh
      sellLimitLow
      buyLimitLow
      buyLimitSpot
      buyLimitHigh
      availableAt
      launchTimeout
      start
      end
      availableRuns
      approvedBlockNumber
      approvedTimestamp
      launchedTimestamp
      bids {
        id
        bidder
        sellAmount
        buyAmount
        blockNumber
        timestamp
        transactionHash
      }
    }
  }
`

const useTrades = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)

  return useQuery({
    queryKey: ['trades', dtf?.id],
    queryFn: async () => {
      if (!dtf?.id) return undefined

      const data = await request<Response>(
        INDEX_DTF_SUBGRAPH_URL[chainId],
        query,
        {
          dtf: dtf?.id ?? '',
        }
      )

      // Return an array of trades
      return data.trades.map((trade) => {
        const parsedTrade: AssetTrade = {
          ...trade,
          soldAmount: BigInt(trade.soldAmount),
          boughtAmount: BigInt(trade.boughtAmount),
          startPrice: BigInt(trade.startPrice),
          endPrice: BigInt(trade.endPrice),
          approvedStartPrice: BigInt(trade.approvedStartPrice),
          approvedEndPrice: BigInt(trade.approvedEndPrice),
          sellLimitSpot: BigInt(trade.sellLimitSpot),
          sellLimitHigh: BigInt(trade.sellLimitHigh),
          sellLimitLow: BigInt(trade.sellLimitLow),
          buyLimitLow: BigInt(trade.buyLimitLow),
          buyLimitSpot: BigInt(trade.buyLimitSpot),
          buyLimitHigh: BigInt(trade.buyLimitHigh),
          availableAt: Number(trade.availableAt),
          launchTimeout: Number(trade.launchTimeout),
          start: Number(trade.start),
          end: Number(trade.end),
          availableRuns: Number(trade.availableRuns),
          approvedTimestamp: Number(trade.approvedTimestamp),
          launchedTimestamp: Number(trade.launchedTimestamp),
          approvedBlockNumber: trade.approvedBlockNumber,
          bids: trade.bids.map((bid) => ({
            ...bid,
            sellAmount: BigInt(bid.sellAmount),
            buyAmount: BigInt(bid.buyAmount),
            blockNumber: Number(bid.blockNumber),
            timestamp: Number(bid.timestamp),
          })),
          state: 'PENDING',
        }
        parsedTrade.state = getTradeState(parsedTrade)

        return parsedTrade
      })
    },
    enabled: !!dtf?.id,
    refetchInterval: 1000 * 60, // every minute!
  })
}

const missingTradeTokensAtom = atom<string[] | undefined>((get) => {
  const trades = get(dtfTradesAtom)
  const currentTokens = Object.keys(get(indexDTFBasketPricesAtom))

  if (!trades || !currentTokens.length) return undefined

  const tokenSet = new Set(currentTokens)
  const missingTokenSet = new Set<string>()

  trades.forEach((trade) => {
    if (!tokenSet.has(trade.sell.address.toLowerCase())) {
      missingTokenSet.add(trade.sell.address.toLowerCase())
    }
    if (!tokenSet.has(trade.buy.address.toLowerCase())) {
      missingTokenSet.add(trade.buy.address.toLowerCase())
    }
  })

  return [...missingTokenSet]
})

const setAllPricesAtom = atom(
  null,
  (get, set, newPrices: { address: string; price?: number }[]) => {
    const currentPrices = get(indexDTFBasketPricesAtom)
    set(allPricesAtom, {
      ...currentPrices,
      ...(newPrices.reduce(
        (acc, price) => {
          acc[price.address.toLowerCase()] = price.price ?? 0
          return acc
        },
        {} as Record<string, number>
      ) ?? {}),
    })
  }
)

// This atom will run every second! it will make sure that the trade states are updated
const updateTradeStateAtom = atom(null, (get, set) => {
  const tradeMap = get(dtfTradeMapAtom)
  const selectedTrades = get(selectedTradesAtom)

  if (!tradeMap) return

  const currentTime = getCurrentTime()
  const updatedTrades: Record<string, AssetTrade> = {}
  const removedTrades: Record<string, boolean> = {}

  for (const trade of Object.values(tradeMap)) {
    if (trade.state === TRADE_STATE.PENDING) {
      // If the trade is available but not expired
      if (
        currentTime >= trade.availableAt &&
        trade.launchTimeout > currentTime
      ) {
        updatedTrades[trade.id] = {
          ...trade,
          state: TRADE_STATE.AVAILABLE,
        }
      } else if (currentTime + 10 >= trade.launchTimeout) {
        updatedTrades[trade.id] = {
          ...trade,
          state: TRADE_STATE.EXPIRED,
        }
        removedTrades[trade.id] = false
      }
    }
  }

  if (Object.keys(updatedTrades).length > 0) {
    set(dtfTradeMapAtom, { ...tradeMap, ...updatedTrades })

    // Remove selected trades that are no longer available
    if (Object.keys(removedTrades).length > 0) {
      set(selectedTradesAtom, { ...selectedTrades, ...removedTrades })
    }
  }
})

const selectedProposalValueAtom = atom((get) => {
  const selectedProposal = get(selectedProposalAtom)
  const tradesByProposal = get(dtfTradesByProposalMapAtom)

  if (!selectedProposal || !tradesByProposal) return undefined

  return tradesByProposal[selectedProposal]
})

const tradesFromProposalAtom = atom((get) => {
  const proposal = get(selectedProposalValueAtom)
  if (!proposal) return undefined

  return proposal.trades.map((trade) => ({
    sell: trade.sell.address,
    buy: trade.buy.address,
    sellLimit: {
      spot: trade.sellLimitSpot,
      low: trade.sellLimitLow,
      high: trade.sellLimitHigh,
    },
    buyLimit: {
      spot: trade.buyLimitSpot,
      low: trade.buyLimitLow,
      high: trade.buyLimitHigh,
    },
    prices: {
      start: trade.startPrice,
      end: trade.endPrice,
    },
    ttl: BigInt(trade.launchTimeout),
  }))
})

const ProposalBasketSimulationsUpdater = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const selectedProposal = useAtomValue(selectedProposalValueAtom)
  const trades = useAtomValue(tradesFromProposalAtom)
  const setProposedBasket = useSetAtom(proposedBasketAtom)
  const setExpectedBasket = useSetAtom(expectedBasketAtom)
  const isCompletedOrExpired =
    selectedProposal?.status === 'COMPLETED' ||
    selectedProposal?.status === 'EXPIRED'

  // Get the proposed basket
  const { data: proposedBasketSnapshot } = useSnapshotBasket(
    indexDTF?.id,
    chainId,
    selectedProposal?.proposal.creationBlock
  )
  const proposedBasket = useSimulatedBasket(
    proposedBasketSnapshot,
    trades,
    chainId,
    selectedProposal?.proposal.creationTime
  )

  // Get the expected basket
  const { data: expectedBasketSnapshot } = useSnapshotBasket(
    indexDTF?.id,
    chainId,
    isCompletedOrExpired
      ? Number(selectedProposal.proposal.executionBlock)
      : undefined
  )
  const expectedBasket = useSimulatedBasket(
    expectedBasketSnapshot,
    trades,
    chainId,
    isCompletedOrExpired
      ? Number(selectedProposal.proposal.executionTime)
      : undefined
  )

  useEffect(() => {
    setProposedBasket(proposedBasket)
  }, [proposedBasket])

  useEffect(() => {
    setExpectedBasket(expectedBasket)
  }, [expectedBasket])

  return null
}

const TradesUpdater = () => {
  const setTrades = useSetAtom(dtfTradeMapAtom)
  const untrackedAssets = useAtomValue(missingTradeTokensAtom)
  const { data: untrackedPrices } = useAssetPrices(untrackedAssets ?? [])
  const setAllPrices = useSetAtom(setAllPricesAtom)
  const updateTradeState = useSetAtom(updateTradeStateAtom)
  const trades = useTrades()

  useEffect(() => {
    if (trades.data) {
      setTrades(
        trades.data.reduce(
          (acc, trade) => {
            acc[trade.id] = trade
            return acc
          },
          {} as Record<string, AssetTrade>
        )
      )
    }
  }, [
    JSON.stringify(trades.data, (_, v) =>
      typeof v === 'bigint' ? v.toString() : v
    ),
  ])

  // Refresh trade states every second
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateTradeState()
    }, 1000)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    if (untrackedPrices) {
      setAllPrices(untrackedPrices)
    }

    if (untrackedAssets && untrackedAssets.length === 0) {
      // Init all prices using the current basket prices!
      setAllPrices([])
    }
  }, [untrackedAssets, untrackedPrices])

  return null
}

const Updater = () => {
  return (
    <>
      <TradesUpdater />
      <ProposalBasketSimulationsUpdater />
    </>
  )
}
export default Updater
