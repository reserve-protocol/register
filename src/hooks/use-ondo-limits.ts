import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { DtfOndoLimits, fetchDtfOndoLimits } from '@/utils/dtf-ondo'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

const EMPTY: DtfOndoLimits = { market: null, assets: [] }

// Ondo tokenized equities in the current DTF basket: per-session order caps +
// market status. Drives the trading-paused banner, the async zapper SDK's
// maxOrderValueUsd, and the instant zapper's order-too-large warning. Empty
// (no splitting, no warnings) when the DTF has no Ondo assets or the endpoint
// is unreachable.
export const useOndoLimits = (): DtfOndoLimits => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const address = indexDTF?.id

  const { data } = useQuery({
    queryKey: ['dtf-ondo-limits', chainId, address?.toLowerCase()],
    queryFn: () => fetchDtfOndoLimits(chainId, address!),
    enabled: !!chainId && !!address,
    staleTime: 60_000,
  })

  return data ?? EMPTY
}
