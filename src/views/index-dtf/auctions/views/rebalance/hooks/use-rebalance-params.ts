import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import useAssetPricesWithSnapshot, {
  TokenPriceWithSnapshot,
} from '@/hooks/use-asset-prices-with-snapshot'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFRebalanceControlAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import {
  Rebalance,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { parseEther } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'
import { isAuctionOngoingAtom, rebalanceAuctionsAtom, originalRebalanceWeightsAtom } from '../atoms'
import { chainIdAtom } from '@/state/atoms'
import { Token } from '@/types'
import { calculatePriceFromRange } from '@/utils'

export type RebalanceParams = {
  supply: bigint
  rebalance: Rebalance
  currentFolio: Record<string, bigint>
  initialFolio: Record<string, bigint>
  initialPrices: Record<string, number>
  initialWeights: Record<string, WeightRange>
  prices: TokenPriceWithSnapshot
  isTrackingDTF: boolean
}

const mapToAssets = (
  assets: readonly `0x${string}`[],
  amounts: readonly bigint[]
): Record<string, bigint> => {
  return assets.reduce(
    (acc, asset, index) => {
      acc[asset.toLowerCase()] = amounts[index]
      return acc
    },
    {} as Record<string, bigint>
  )
}

const useRebalanceParams = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isAuctionOngoing = useAtomValue(isAuctionOngoingAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const setOriginalWeights = useSetAtom(originalRebalanceWeightsAtom)
  const originalWeights = useAtomValue(originalRebalanceWeightsAtom)

  const rebalanceTokens = useMemo(() => {
    if (!rebalance || !basket) return []

    const tokens = new Set<string>()

    rebalance.rebalance.tokens.forEach((token) => {
      tokens.add(token.address.toLowerCase())
    })

    basket.forEach((token) => {
      tokens.add(token.address.toLowerCase())
    })

    return Array.from(tokens)
  }, [basket, rebalance])

  const { data: prices } = useAssetPricesWithSnapshot(
    rebalanceTokens,
    Number(rebalance?.proposal.creationTime)
  )
  const { data: dtfData, refetch: refetchDtfData } = useReadContracts({
    contracts: [
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'totalSupply',
        chainId,
      },
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'getRebalance',
        chainId,
      },
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'toAssets',
        args: [parseEther('1'), 0],
        chainId,
      },
    ],
    allowFailure: false,
    query: {
      enabled: !!dtf?.id,
      select: (data) => {
        const [supply, rebalance, [assets, amounts]] = data

        return {
          supply,
          rebalance,
          currentFolio: mapToAssets(assets, amounts),
        }
      },
    },
  })
  const { data: initialFolio } = useReadContract({
    abi: dtfIndexAbiV4,
    address: dtf?.id,
    functionName: 'toAssets',
    chainId,
    args: [parseEther('1'), 0],
    blockNumber: BigInt(rebalance?.proposal.creationBlock ?? '0'),
    query: {
      enabled: !!rebalance?.proposal.creationBlock && !!dtf?.id,
      select: (data) => {
        const [assets, amounts] = data

        return mapToAssets(assets, amounts)
      },
    },
  })
  const { data: initialRebalance } = useReadContract({
    abi: dtfIndexAbiV4,
    address: dtf?.id,
    functionName: 'getRebalance',
    chainId,
    args: [],
    blockNumber: BigInt(rebalance?.rebalance.blockNumber ?? '0'),
    query: {
      enabled: !!rebalance?.rebalance.blockNumber && !!dtf?.id,
    },
  })

  // Query for historical weights at first auction block for hybrid DTFs
  const { data: historicalRebalance } = useReadContract({
    abi: dtfIndexAbiV4,
    address: dtf?.id,
    functionName: 'getRebalance',
    chainId,
    args: [],
    blockNumber: auctions[0]?.blockNumber ? BigInt(auctions[0].blockNumber) : undefined,
    query: {
      enabled: isHybridDTF && auctions.length > 0 && !!auctions[0]?.blockNumber && !!dtf?.id,
    },
  })

  useEffect(() => {
    if (isAuctionOngoing) {
      const interval = setInterval(() => {
        refetchDtfData()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [isAuctionOngoing, refetchDtfData])

  // Store historical weights for hybrid DTFs
  useEffect(() => {
    if (historicalRebalance && isHybridDTF) {
      const weights: Record<string, WeightRange> = {}
      for (let i = 0; i < historicalRebalance[1].length; i++) {
        const token = historicalRebalance[1][i].toLowerCase()
        weights[token] = {
          low: historicalRebalance[2][i].low,
          spot: historicalRebalance[2][i].spot,
          high: historicalRebalance[2][i].high,
        }
      }
      setOriginalWeights(weights)
    }
  }, [historicalRebalance, isHybridDTF, setOriginalWeights])

  return useMemo(() => {
    if (
      !dtfData ||
      !initialFolio ||
      !prices ||
      !rebalanceControl ||
      !initialRebalance ||
      !rebalance
    )
      return undefined

    const tokenMap = rebalance.rebalance.tokens.reduce(
      (acc, token) => {
        acc[token.address.toLowerCase()] = token
        return acc
      },
      {} as Record<string, Token>
    )
    const initialPrices: Record<string, number> = {}
    let initialWeights: Record<string, WeightRange> = {}

    for (let i = 0; i < initialRebalance[1].length; i++) {
      const token = initialRebalance[1][i].toLowerCase()
      const decimals = tokenMap[token].decimals

      initialPrices[token] = calculatePriceFromRange(
        {
          low: initialRebalance[3][i].low,
          high: initialRebalance[3][i].high,
        },
        decimals
      )

      initialWeights[token] = {
        low: initialRebalance[2][i].low,
        spot: initialRebalance[2][i].spot,
        high: initialRebalance[2][i].high,
      }
    }

    // Use historical weights for subsequent auctions in hybrid DTFs
    if (isHybridDTF && auctions.length > 0 && originalWeights) {
      initialWeights = originalWeights
    }

    return {
      supply: dtfData.supply,
      rebalance: {
        nonce: dtfData.rebalance[0],
        tokens: dtfData.rebalance[1],
        weights: dtfData.rebalance[2],
        initialPrices: dtfData.rebalance[3],
        inRebalance: dtfData.rebalance[4],
        limits: dtfData.rebalance[5],
        startedAt: dtfData.rebalance[6],
        restrictedUntil: dtfData.rebalance[7],
        availableUntil: dtfData.rebalance[8],
        priceControl: dtfData.rebalance[9],
      } as Rebalance,
      currentFolio: dtfData.currentFolio,
      initialPrices,
      initialWeights,
      initialFolio,
      prices,
      isTrackingDTF: !rebalanceControl.weightControl,
    } as RebalanceParams
  }, [dtfData, initialFolio, prices, rebalanceControl, initialRebalance, isHybridDTF, auctions.length, originalWeights])
}

export default useRebalanceParams
