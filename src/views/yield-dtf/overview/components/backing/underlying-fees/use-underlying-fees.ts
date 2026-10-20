import { chainIdAtom } from '@/state/atoms'
import { selectedRTokenAtom } from '@/state/rtoken/atoms/rTokenAtom'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import {
  fetchUnderlyingFees,
  isUnderlyingFeesEnabled,
  UnderlyingFeesRequestError,
  UnderlyingFeesPeriod,
} from './api'

const useUnderlyingFees = (period: UnderlyingFeesPeriod) => {
  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(selectedRTokenAtom)
  const isEnabled = !!rToken && isUnderlyingFeesEnabled(chainId, rToken)

  const query = useQuery({
    queryKey: ['underlying-fees', chainId, rToken?.toLowerCase(), period],
    queryFn: () => fetchUnderlyingFees(chainId, rToken!, period),
    enabled: isEnabled,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
    retry: (failureCount, error) =>
      failureCount < 2 &&
      (error instanceof UnderlyingFeesRequestError
        ? error.status >= 500
        : error instanceof TypeError),
    placeholderData: keepPreviousData,
  })

  return { ...query, isEnabled }
}

export default useUnderlyingFees
