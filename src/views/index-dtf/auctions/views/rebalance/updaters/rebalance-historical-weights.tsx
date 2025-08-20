import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { indexDTFAtom, isHybridDTFAtom } from '@/state/dtf/atoms'
import { WeightRange } from '@reserve-protocol/dtf-rebalance-lib/dist/types'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { originalRebalanceWeightsAtom, rebalanceAuctionsAtom } from '../atoms'

const RebalanceHistoricalWeightsUpdater = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const setOriginalWeights = useSetAtom(originalRebalanceWeightsAtom)

  // Query for historical weights at first auction block for hybrid DTFs
  const result = useReadContract({
    abi: dtfIndexAbiV4,
    address: dtf?.id,
    functionName: 'getRebalance',
    chainId: dtf?.chainId,
    args: [],
    blockNumber: auctions[0]?.blockNumber
      ? BigInt(auctions[0].blockNumber)
      : undefined,
    query: {
      enabled:
        isHybridDTF &&
        auctions.length > 0 &&
        !!auctions[0]?.blockNumber &&
        !!dtf?.id,
    },
  })

  // Store historical weights for hybrid DTFs
  useEffect(() => {
    if (result.data && isHybridDTF) {
      const { data: historicalRebalance } = result

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
  }, [result.data, isHybridDTF, setOriginalWeights])

  return null
}

export default RebalanceHistoricalWeightsUpdater
