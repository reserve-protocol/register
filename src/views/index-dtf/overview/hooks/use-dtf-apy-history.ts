import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { isYieldIndexDTFAtom } from '@/state/dtf/yield-index-atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

export type ApyDataPoint = {
  timestamp: number
  collateralAPY: number
  redirectAPY: number
  totalAPY: number
}

const useIndexDTFApyHistory = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const isYieldIndexDTF = useAtomValue(isYieldIndexDTFAtom)

  return useQuery({
    queryKey: ['dtf-apy-history', dtf?.id, chainId],
    queryFn: async (): Promise<ApyDataPoint[]> => {
      if (!dtf?.id) return []

      const response = await fetch(
        `${RESERVE_API}v1/dtf/apy/historical/${dtf.id}?chainId=${chainId}`
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch APY history: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: !!dtf?.id && !!chainId && isYieldIndexDTF,
    staleTime: 1800000,
  })
}

export default useIndexDTFApyHistory
