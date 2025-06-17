import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import useAssetPricesWithSnapshot, {
  TokenPriceWithSnapshot,
} from '@/hooks/use-asset-prices-with-snapshot'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFRebalanceControlAtom,
} from '@/state/dtf/atoms'
import { Rebalance } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { parseEther } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'

export type RebalanceParams = {
  supply: bigint
  rebalance: Rebalance
  currentFolio: Record<string, bigint>
  initialFolio: Record<string, bigint>
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
  const { data: dtfData } = useReadContracts({
    contracts: [
      { abi: dtfIndexAbiV4, address: dtf?.id, functionName: 'totalSupply' },
      { abi: dtfIndexAbiV4, address: dtf?.id, functionName: 'getRebalance' },
      {
        abi: dtfIndexAbiV4,
        address: dtf?.id,
        functionName: 'toAssets',
        args: [parseEther('1'), 0],
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

  return useMemo(() => {
    if (!dtfData || !initialFolio || !prices || !rebalanceControl)
      return undefined

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
      initialFolio,
      prices,
      isTrackingDTF: rebalanceControl.weightControl,
    } as RebalanceParams
  }, [dtfData, initialFolio, prices, rebalanceControl])
}

export default useRebalanceParams
