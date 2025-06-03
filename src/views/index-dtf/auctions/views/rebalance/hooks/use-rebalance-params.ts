import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import useAssetPricesWithSnapshot from '@/hooks/use-asset-prices-with-snapshot'
import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { parseEther } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'
import { currentRebalanceAtom } from '../../../atoms'

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
        const [supply, [assets, amounts]] = data

        return {
          supply,
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

  return useMemo(
    () => ({
      isReady: !!dtfData && !!initialFolio && !!prices,
      dtfData,
      initialFolio,
      prices,
    }),
    [dtfData, initialFolio, prices]
  )
}

export default useRebalanceParams
