import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { getTargetBasket } from '@/lib/index-rebalance-4.0.0/open-auction'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFRebalanceControlAtom,
} from '@/state/dtf/atoms'
import { DecodedCalldata, Token } from '@/types'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address, formatUnits, Hex } from 'viem'
import { getDecodedCalldata } from './use-decoded-call-datas'
import useTokensInfo from './useTokensInfo'

// current/initial/snapshot will be the same at proposal time
type BasketAsset = {
  token: Token
  snapshotPrice: number
  currentPrice: number
  currentWeight: string
  targetWeight: string
  deltaWeight: number
  // Result of calling `getTargetBasket()`
  targetWeightRaw: bigint
}

type RebalanceCall = {
  tokens: Address[]
  weights: Range[]
  prices: { low: bigint; high: bigint }[]
  limits: Range
  auctionLauncherWindow: bigint
  ttl: bigint
}

type RebalanceBasketPreview = {
  decodedCalldata: DecodedCalldata
  rebalance: RebalanceCall
  basket: Record<string, BasketAsset>
}

type Range = {
  low: bigint
  spot: bigint
  high: bigint
}

type HistoricalPriceResponse = {
  address: string
  timeseries: {
    price: number
    timestamp: number
  }[]
}

type TokenPriceResult = Record<
  string,
  { currentPrice: number; snapshotPrice: number }
>

export const useAssetPrices = (
  tokens?: string[],
  chain?: number,
  timestamp?: number
) => {
  return useQuery({
    queryKey: ['asset-price', tokens, chain, timestamp],
    queryFn: async () => {
      if (!tokens?.length) {
        throw new Error('No tokens provided')
      }

      const url = `${RESERVE_API}current/prices?chainId=${chain}&tokens=${tokens.join(',')}`
      const response = await fetch(url)
      const data = await response.json()
      return (
        data as {
          address: Address
          price: number
        }[]
      ).reduce(
        (acc, token) => {
          acc[token.address] = token.price ?? 0
          return acc
        },
        {} as Record<string, number>
      )
    },
    enabled: Boolean(tokens?.length && chain),
  })
}

export const useDecodedRebalanceCalldata = (
  calldata: Hex[] | undefined
): { data: RebalanceCall; calldata: DecodedCalldata } | undefined => {
  return useMemo(() => {
    // Rebalance calls is always only one
    if (calldata?.length !== 1) return undefined

    try {
      const decodedCalldata = getDecodedCalldata(dtfIndexAbiV4, calldata[0])

      if (decodedCalldata.signature !== 'rebalance') return undefined

      const data = decodedCalldata.data as unknown as [
        Address[],
        Range[],
        { low: bigint; high: bigint }[],
        Range,
        bigint,
        bigint,
      ]

      return {
        data: {
          tokens: data[0],
          weights: data[1],
          prices: data[2],
          limits: data[3],
          auctionLauncherWindow: data[4],
          ttl: data[5],
        } as RebalanceCall,
        calldata: decodedCalldata,
      }
    } catch (e) {
      console.error('Error decoding rebalance calldata', e)
      return undefined
    }
  }, [JSON.stringify(calldata)])
}

const currentBasketMapAtom = atom<Record<string, Token> | undefined>((get) => {
  const currentBasket = get(indexDTFBasketAtom)
  return (
    currentBasket?.reduce(
      (acc, token) => {
        acc[token.address] = token
        return acc
      },
      {} as Record<string, Token>
    ) ?? undefined
  )
})

// Fetch Token info for the realance target basket
// Uses current basket info and only fetches missing tokens
const useTokens = (tokens: string[]): Record<string, Token> | undefined => {
  const currentBasketMap = useAtomValue(currentBasketMapAtom)
  // Wait until we have the current basket map to fetch missing tokens info
  const missingTokens = currentBasketMap
    ? tokens.filter((token) => !currentBasketMap[token])
    : []
  const { data: missingTokensInfo } = useTokensInfo(missingTokens)

  return useMemo(() => {
    if (!currentBasketMap || (missingTokens.length && !missingTokensInfo))
      return undefined

    return {
      ...currentBasketMap,
      ...missingTokensInfo,
    }
  }, [currentBasketMap, missingTokensInfo, JSON.stringify(missingTokens)])
}

// Fetch current and snapshot prices for the related rebalance tokens
const useTokenPrices = (tokens: string[] | undefined, timestamp?: number) => {
  const chain = useAtomValue(chainIdAtom)

  return useQuery({
    queryKey: ['asset-price-with-snapshot', tokens, chain, timestamp],
    queryFn: async () => {
      if (!tokens) return {}

      const currentPricesUrl = `${RESERVE_API}current/prices?chainId=${chain}&tokens=${tokens.join(',')}`
      const currentPrices: {
        address: Address
        price?: number
      }[] = await fetch(currentPricesUrl).then((res) => res.json())

      const result = currentPrices.reduce((acc, token) => {
        const price = token.price ?? 0
        acc[token.address.toLowerCase()] = {
          currentPrice: price,
          snapshotPrice: price,
        }
        return acc
      }, {} as TokenPriceResult)

      // Fetch snapshot prices if timestamp is provided
      if (timestamp) {
        // from is timestamp - 1 hour
        const from = Number(timestamp) - 1 * 60 * 60
        const to = Number(timestamp) + 1 * 60 * 60
        const baseUrl = `${RESERVE_API}historical/prices?chainId=${chain}&from=${from}&to=${to}&interval=1h&address=`
        const calls = tokens.map((token) =>
          fetch(`${baseUrl}${token}`).then((res) => res.json())
        )

        const response = await (<Promise<HistoricalPriceResponse[]>>(
          Promise.all(calls)
        ))

        for (const priceResult of response) {
          const price =
            priceResult.timeseries.length === 0
              ? 0
              : priceResult.timeseries[
                  Math.floor(priceResult.timeseries.length / 2)
                ].price

          result[priceResult.address.toLowerCase()] = {
            snapshotPrice: price,
            currentPrice:
              result[priceResult.address.toLowerCase()].currentPrice,
          }
        }

        return result
      }
    },
    enabled: Boolean(tokens?.length && chain),
  })
}

/**
 * Hook to parse and preview rebalance basket changes from calldata
 *
 * Currently processes only the first calldata in the array for 4.0 rebalance flow.
 * Future versions may need to handle multiple calldatas if the rebalance process changes.
 */
const useRebalanceBasketPreview = (
  calldata: Hex[] | undefined,
  timestamp?: number
): RebalanceBasketPreview | undefined => {
  const rebalance = useDecodedRebalanceCalldata(calldata)
  const currentWeights = useAtomValue(indexDTFBasketSharesAtom)
  const tokens = useTokens(rebalance?.data.tokens ?? [])
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const { data: prices } = useTokenPrices(
    tokens ? Object.keys(tokens) : undefined,
    timestamp
  )

  return useMemo(() => {
    if (!rebalance || !prices || !tokens || !rebalanceControl) return undefined

    // keep track of the token order for the target basket
    const tokenList = Object.keys(tokens)
    // if weight control is true (tracking dtf), use current price, otherwise use snapshot price
    const priceList = tokenList.map((token) =>
      rebalanceControl.weightControl
        ? prices[token].currentPrice
        : prices[token].snapshotPrice
    )
    const decimals = tokenList.map((token) => BigInt(tokens[token].decimals))

    // sum up to D18{1}
    const targetBasket = getTargetBasket(
      rebalance.data.weights,
      priceList,
      decimals
    )

    const basket = tokenList.reduce(
      (acc, token, index) => {
        // add 2 decimals so it ranges from 0 to 100
        const targetWeight = formatUnits(targetBasket[index], 16)

        acc[token] = {
          token: tokens[token],
          snapshotPrice: prices[token].snapshotPrice,
          currentPrice: prices[token].currentPrice,
          currentWeight: currentWeights[token],
          targetWeight,
          targetWeightRaw: targetBasket[index],
          deltaWeight: Number(targetWeight) - Number(currentWeights[token]),
        }
        return acc
      },
      {} as Record<string, BasketAsset>
    )

    return {
      decodedCalldata: rebalance.calldata,
      rebalance: rebalance.data,
      basket,
    }
  }, [rebalance, tokens, prices, rebalanceControl, currentWeights])
}

export default useRebalanceBasketPreview
