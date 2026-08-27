import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFExposureDataAtom,
} from '@/state/dtf/atoms'
import { fetchDtfOndoLimits } from '@/utils/dtf-ondo'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

// Ondo tokenized equities are named <TICKER>on (NVDAon, GLWon, AAPLon).
const ONDO_SYMBOL = /^[A-Z0-9.]+on$/

// Whether the current DTF holds Ondo tokenized equities. Shares the
// 'dtf-ondo-limits' query cache with the async-mint wizard so this adds no
// extra request. The API answers 503 when Ondo or the RPC is down; an outage
// must never raise the eligibility gate on its own (the buy flow is down with
// it anyway), so on error the answer comes from local data only — the basket
// symbols or the exposure groups — and defaults to false.
const useDtfHasOndoAssets = () => {
  const chainId = useAtomValue(chainIdAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const exposureData = useAtomValue(indexDTFExposureDataAtom)
  const address = dtf?.id

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dtf-ondo-limits', chainId, address?.toLowerCase()],
    queryFn: () => fetchDtfOndoLimits(chainId, address!),
    enabled: !!chainId && !!address,
    staleTime: 60_000,
  })

  const fromApi = data ? data.assets.length > 0 : undefined
  const fromLocal =
    !!basket?.some((token) => ONDO_SYMBOL.test(token.symbol)) ||
    !!exposureData?.some((group) =>
      group.tokens.some((token) => token.bridge?.id === 'ondo')
    )

  return {
    hasOndoAssets: fromApi ?? (isError && fromLocal),
    isLoading: !!address && isLoading,
  }
}

export default useDtfHasOndoAssets
