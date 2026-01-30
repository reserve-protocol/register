import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import { indexDTFAtom, indexDTFVersionAtom, isHybridDTFAtom } from '@/state/dtf/atoms'
import { WeightRange } from '@reserve-protocol/dtf-rebalance-lib'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { originalRebalanceWeightsAtom, rebalanceAuctionsAtom } from '../atoms'
import {
  FOLIO_VERSION_V5,
  getFolioVersion,
  getRebalanceTokens,
  getRebalanceWeights,
  transformV4Rebalance,
  transformV5Rebalance,
} from '../utils/transforms'

const RebalanceHistoricalWeightsUpdater = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const auctions = useAtomValue(rebalanceAuctionsAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const setOriginalWeights = useSetAtom(originalRebalanceWeightsAtom)
  const versionString = useAtomValue(indexDTFVersionAtom)

  const folioVersion = useMemo(
    () => getFolioVersion(versionString),
    [versionString]
  )
  const abi = folioVersion === FOLIO_VERSION_V5 ? dtfIndexAbiV5 : dtfIndexAbiV4

  // Query for historical weights at first auction block for hybrid DTFs
  const result = useReadContract({
    abi,
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
      const historicalRebalance =
        folioVersion === FOLIO_VERSION_V5
          ? transformV5Rebalance(result.data as readonly unknown[])
          : transformV4Rebalance(result.data as readonly unknown[])

      const tokens = getRebalanceTokens(historicalRebalance, folioVersion)
      const weightList = getRebalanceWeights(historicalRebalance, folioVersion)

      const weights: Record<string, WeightRange> = {}
      for (let i = 0; i < tokens.length; i++) {
        weights[tokens[i].toLowerCase()] = weightList[i]
      }
      setOriginalWeights(weights)
    }
  }, [result.data, isHybridDTF, folioVersion, setOriginalWeights])

  return null
}

export default RebalanceHistoricalWeightsUpdater
