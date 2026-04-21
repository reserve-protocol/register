import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
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
    enabled: !!dtf?.id && !!chainId,
    staleTime: 1800000,
  })
}

export default useIndexDTFApyHistory
