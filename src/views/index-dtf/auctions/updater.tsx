import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import { indexDTFAtom, indexDTFBasketPricesAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { use, useEffect } from 'react'
import { allPricesAtom, AssetTrade, dtfTradesAtom } from './atoms'
import { useAssetPrices } from '@/hooks/useAssetPrices'

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
      return data.trades.map((trade) => ({
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
        approvedBlock: trade.approvedBlock,
      })) as AssetTrade[]
    },
    enabled: !!dtf?.id,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
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

const Updater = () => {
  const setTrades = useSetAtom(dtfTradesAtom)
  const untrackedAssets = useAtomValue(missingTradeTokensAtom)
  const { data: untrackedPrices } = useAssetPrices(untrackedAssets ?? [])
  const setAllPrices = useSetAtom(setAllPricesAtom)
  const trades = useTrades()

  useEffect(() => {
    if (trades.data) {
      setTrades(trades.data)
    }
  }, [trades.data])

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
