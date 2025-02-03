import { useAssetPrices } from '@/hooks/useAssetPrices'
import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import { indexDTFAtom, indexDTFBasketPricesAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { getCurrentTime } from '@/utils'
import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  allPricesAtom,
  AssetTrade,
  dtfTradeMapAtom,
  dtfTradesAtom,
  getTradeState,
  selectedTradesAtom,
  TRADE_STATE,
} from './atoms'

type Response = {
  trades: {
    id: string
    sell: Token
    buy: Token
    soldAmount: string
    boughtAmount: string
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
    approvedBlock: string
    approvedTimestamp: string
    launchedTimestamp: string
    closedTimestamp: string
    approvedBlockNumber: string
    closedTransactionHash: string
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
      approvedBlockNumber
      approvedTimestamp
      launchedTimestamp
      closedTimestamp
      closedTransactionHash
    }
  }
`

const useTrades = () => {
  const dtf = useAtomValue(indexDTFAtom)

  return useQuery({
    queryKey: ['trades', dtf?.id],
    queryFn: async () => {
      if (!dtf?.id) return undefined

      const data = await request<Response>(
        INDEX_DTF_SUBGRAPH_URL[ChainId.Base],
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
          approvedTimestamp: Number(trade.approvedTimestamp),
          launchedTimestamp: Number(trade.launchedTimestamp),
          closedTimestamp: Number(trade.closedTimestamp),
          approvedBlockNumber: trade.approvedBlockNumber,
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
        trade.availableAt > currentTime &&
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

const Updater = () => {
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

export default Updater
