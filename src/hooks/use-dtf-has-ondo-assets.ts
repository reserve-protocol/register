import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFExposureDataAtom } from '@/state/dtf/atoms'
import { fetchDtfOndoLimits } from '@/utils/dtf-ondo'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

// Whether the current DTF holds Ondo tokenized equities. Shares the
// 'dtf-ondo-limits' query cache with the async-mint wizard so this adds no
// extra request. The API answers 503 when Ondo or the RPC is down: that is
// "unknown", not "no Ondo assets", so fall back to the exposure data (and to
// showing the gate when even that is missing) rather than skipping it.
const useDtfHasOndoAssets = () => {
  const chainId = useAtomValue(chainIdAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const exposureData = useAtomValue(indexDTFExposureDataAtom)
  const address = dtf?.id

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dtf-ondo-limits', chainId, address?.toLowerCase()],
    queryFn: () => fetchDtfOndoLimits(chainId, address!),
    enabled: !!chainId && !!address,
    staleTime: 60_000,
  })

  const hasOndoExposure = exposureData
    ? exposureData.some((group) =>
        group.tokens.some((token) => token.bridge?.id === 'ondo')
      )
    : true

  return {
    hasOndoAssets:
      (data?.assets.length ?? 0) > 0 || (isError && hasOndoExposure),
    isLoading: !!address && isLoading,
  }
}

export default useDtfHasOndoAssets
