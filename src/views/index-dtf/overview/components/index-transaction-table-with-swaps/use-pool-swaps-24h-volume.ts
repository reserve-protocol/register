import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { getCurrentTime } from '@/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { compute24hSwapVolumeUsd } from './swap-transactions'
import useUniV4PoolSwaps from './use-uni-v4-pool-swaps'

// 24h Uniswap v4 pool trading volume in USD; 0 volume and isLoading false for
// DTFs without a gated pool (query disabled). Shares the table's query cache —
// no extra network when both are mounted.
const usePoolSwaps24hVolume = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const price = useAtomValue(indexDTFPriceAtom)
  const { data: swaps, isLoading } = useUniV4PoolSwaps(dtf?.id, dtf?.chainId)

  const volume = useMemo(
    () => compute24hSwapVolumeUsd(swaps ?? [], price ?? 0, getCurrentTime()),
    [swaps, price]
  )

  return { volume, isLoading }
}

export default usePoolSwaps24hVolume
