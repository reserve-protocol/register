import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketSharesAtom,
  indexDTFRebalanceControlAtom,
} from '@/state/dtf/atoms'
import { DecodedCalldata, Token } from '@/types'
import { calculatePriceFromRange } from '@/utils'
import { RESERVE_API } from '@/utils/constants'
import { getTargetBasket } from '@reserve-protocol/dtf-rebalance-lib'
import { useQuery } from '@tanstack/react-query'
import { atom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  Abi,
  Address,
  decodeFunctionData,
  formatUnits,
  getAbiItem,
  Hex,
  toFunctionSelector,
} from 'viem'
import useAssetPricesWithSnapshot from './use-asset-prices-with-snapshot'
import useTokensInfo from './useTokensInfo'
import type { IndexDTFPerformance } from '@/views/index-dtf/overview/hooks/use-dtf-price-history'

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

const START_REBALANCE_V4_SELECTOR = toFunctionSelector(
  'startRebalance(address[],(uint256,uint256,uint256)[],(uint256,uint256)[],(uint256,uint256,uint256),uint256,uint256)'
)
const START_REBALANCE_V5_SELECTOR = toFunctionSelector(
  'startRebalance((address,(uint256,uint256,uint256),(uint256,uint256),uint256,bool)[],(uint256,uint256,uint256),uint256,uint256)'
)

const getDecodedCalldata = (abi: Abi, calldata: Hex): DecodedCalldata => {
  const { functionName, args } = decodeFunctionData({
    abi,
    data: calldata,
  })

  const result = getAbiItem({
    abi,
    name: functionName as string,
  })

  return {
    signature: functionName,
    parameters:
      result && 'inputs' in result
        ? result.inputs.map((input) => `${input.name}: ${input.type}`)
        : [],
    callData: calldata,
    data: (args ?? []) as unknown as unknown[] as string[],
  }
}

// V5 TokenRebalanceParams structure from the ABI
type TokenRebalanceParams = {
  token: Address
  weight: Range
  price: { low: bigint; high: bigint }
  maxAuctionSize: bigint
  inRebalance: boolean
}

export const useDecodedRebalanceCalldata = (
  calldata: Hex[] | undefined
): { data: RebalanceCall; calldata: DecodedCalldata } | undefined => {
  const rebalanceCalldata = calldata?.length === 1 ? calldata[0] : undefined

  return useMemo(() => {
    // Rebalance calls is always only one
    if (!rebalanceCalldata) return undefined

    const selector = rebalanceCalldata.slice(0, 10)
    const isV5 = selector === START_REBALANCE_V5_SELECTOR
    let abi: Abi | undefined

    if (isV5) abi = dtfIndexAbiV5
    if (selector === START_REBALANCE_V4_SELECTOR) abi = dtfIndexAbiV4

    if (!abi) return undefined

    try {
      const decodedCalldata = getDecodedCalldata(abi, rebalanceCalldata)

      if (decodedCalldata.signature !== 'startRebalance') return undefined

      if (isV5) {
        // V5 format: startRebalance(TokenRebalanceParams[], limits, auctionLauncherWindow, ttl)
        const data = decodedCalldata.data as unknown as [
          TokenRebalanceParams[],
          Range,
          bigint,
          bigint,
        ]

        const tokenParams = data[0]

        return {
          data: {
            tokens: tokenParams.map((t) => t.token),
            weights: tokenParams.map((t) => t.weight),
            prices: tokenParams.map((t) => t.price),
            limits: data[1],
            auctionLauncherWindow: data[2],
            ttl: data[3],
          } as RebalanceCall,
          calldata: decodedCalldata,
        }
      } else {
        // V4 format: startRebalance(tokens[], weights[], prices[], limits, auctionLauncherWindow, ttl)
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
      }
    } catch {
      return undefined
    }
  }, [rebalanceCalldata])
}

type SnapshotBasketToken = { address: string; price: number; amount: number }

// Any non-finite input yields undefined (indeterminate) — otherwise `.toFixed` renders literal "Infinity"/"NaN" weights.
export const computeSnapshotWeights = (
  basket: readonly SnapshotBasketToken[],
  dtfPrice: number
): Record<string, string> | undefined => {
  if (!(Number.isFinite(dtfPrice) && dtfPrice > 0)) return undefined

  const weights: Record<string, string> = {}
  for (const token of basket) {
    const weight = ((token.price * token.amount) / dtfPrice) * 100
    if (!Number.isFinite(weight)) return undefined
    weights[token.address.toLowerCase()] = weight.toFixed(2)
  }
  return weights
}

// Unusable historical data throws — never substitute today's basket as the proposal-time snapshot.
export const resolveSnapshotWeights = (
  response: IndexDTFPerformance
): Record<string, string> => {
  if (!response.timeseries.length) {
    throw new Error('Historical snapshot unavailable (empty timeseries)')
  }

  const middlePoint = Math.floor(response.timeseries.length / 2)
  const { basket, price } = response.timeseries[middlePoint]
  const weights = computeSnapshotWeights(basket, price)
  if (!weights) {
    throw new Error('Historical snapshot price unavailable')
  }
  return weights
}

// Extracted so the fetch → resolve wiring is testable with only a fetch mock.
export const fetchSnapshotWeights = async (
  dtf: { id: string },
  chainId: number,
  timestamp: number | undefined,
  currentWeights: Record<string, string>
): Promise<Record<string, string>> => {
  if (!timestamp) return currentWeights

  const from = Number(timestamp) - 1 * 60 * 60
  const to = Number(timestamp) + 1 * 60 * 60
  const historical = `${RESERVE_API}historical/dtf?chainId=${chainId}&address=${dtf.id}&from=${from}&to=${to}&interval=1h`
  const response = (await fetch(historical).then((res) =>
    res.json()
  )) as IndexDTFPerformance

  return resolveSnapshotWeights(response)
}

const currentBasketMapAtom = atom<Record<string, Token> | undefined>((get) => {
  const currentBasket = get(indexDTFBasketAtom)
  return (
    currentBasket?.reduce(
      (acc, token) => {
        const address = token.address.toLowerCase() as Address
        acc[address] = { ...token, address }
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
  const tokenAddresses = tokens.map((token) => token.toLowerCase())
  // Wait until we have the current basket map to fetch missing tokens info
  const missingTokens = currentBasketMap
    ? tokenAddresses.filter((token) => !currentBasketMap[token])
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

const useDTFBasketWeights = (timestamp?: number) => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const currentWeights = useAtomValue(indexDTFBasketSharesAtom)

  return useQuery({
    queryKey: ['dtf-basket-weights', dtf, chainId, timestamp, currentWeights],
    queryFn: async () => {
      if (!dtf) return {}
      return fetchSnapshotWeights(dtf, chainId, timestamp, currentWeights)
    },
    enabled: Boolean(dtf && Object.keys(currentWeights).length),
  })
}

/**
 * Hook to parse and preview rebalance basket changes from calldata
 *
 * Historical proposals can use v4 or v5 startRebalance signatures, so decode by
 * calldata selector instead of the DTF's current version.
 */
const useRebalanceBasketPreview = (
  calldata: Hex[] | undefined,
  timestamp?: number
): {
  preview: RebalanceBasketPreview | undefined
  // Old proposals can predate the API's historical data — the snapshot read
  // settles in error and the preview can never resolve.
  snapshotUnavailable: boolean
} => {
  const rebalance = useDecodedRebalanceCalldata(calldata)
  const { data: currentWeights, isError: snapshotUnavailable } =
    useDTFBasketWeights(timestamp)
  const tokens = useTokens(rebalance?.data.tokens ?? [])
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const { data: prices } = useAssetPricesWithSnapshot(
    tokens ? Object.keys(tokens) : undefined
  )

  const preview = useMemo(() => {
    if (
      !rebalance ||
      !prices ||
      !tokens ||
      !rebalanceControl ||
      !currentWeights
    )
      return undefined

    const tokenList = rebalance.data.tokens.map((token) => token.toLowerCase())
    if (tokenList.some((token) => !tokens[token] || !prices[token])) {
      return undefined
    }

    const initialPrices: Record<string, number> = {}
    for (let i = 0; i < rebalance.data.weights.length; i++) {
      const token = tokenList[i]
      const decimals = tokens[token].decimals

      initialPrices[token] = calculatePriceFromRange(
        {
          low: rebalance.data.prices[i].low,
          high: rebalance.data.prices[i].high,
        },
        decimals
      )
    }

    // keep track of the token order for the target basket
    // if weight control is true (tracking dtf), use current price, otherwise use snapshot price
    const priceList = tokenList.map((token, index) => {
      if (rebalanceControl.weightControl) {
        return prices[token].currentPrice
      } else {
        // Calculate from rebalance initial prices
        const priceRange = rebalance.data.prices[index]
        return calculatePriceFromRange(priceRange, tokens[token].decimals)
      }
    })
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
          snapshotPrice: initialPrices[token],
          currentPrice: prices[token].currentPrice,
          currentWeight: currentWeights[token] || '0',
          targetWeight: Number(targetWeight).toFixed(2),
          targetWeightRaw: targetBasket[index],
          deltaWeight:
            Number(targetWeight) - Number(currentWeights[token] || '0'),
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

  return { preview, snapshotUnavailable }
}

export default useRebalanceBasketPreview
