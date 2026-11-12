import { useQuery } from '@tanstack/react-query'
import { DefiLlamaPool } from '@/types/defillama'
import { RESERVE_API } from '@/utils/constants'

export const reserveYieldChartUrl = (poolId: string) =>
  `${RESERVE_API}v1/yields/chart/${poolId}`

const useReserveYieldPools = () =>
  useQuery({
    queryKey: ['reserve-yield-pools'],
    queryFn: async (): Promise<DefiLlamaPool[]> => {
      const response = await fetch(`${RESERVE_API}v1/yields/pools`)
      if (!response.ok) {
        throw new Error(`Failed to fetch yield pools: ${response.status}`)
      }
      const json = await response.json()
      return json.data ?? []
    },
    staleTime: 1000 * 60 * 60,
  })

export default useReserveYieldPools
