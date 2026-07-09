import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { fetchDtfOndoLimits } from '@/utils/dtf-ondo'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

// Whether the current DTF holds Ondo tokenized equities. Shares the
// 'dtf-ondo-limits' query cache with the async-mint wizard so this adds no
// extra request.
const useDtfHasOndoAssets = () => {
  const chainId = useAtomValue(chainIdAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const address = dtf?.id

  const { data, isLoading } = useQuery({
    queryKey: ['dtf-ondo-limits', chainId, address?.toLowerCase()],
    queryFn: () => fetchDtfOndoLimits(chainId, address!),
    enabled: !!chainId && !!address,
    staleTime: 60_000,
  })

  return {
    hasOndoAssets: (data?.assets.length ?? 0) > 0,
    isLoading: !!address && isLoading,
  }
}

export default useDtfHasOndoAssets
