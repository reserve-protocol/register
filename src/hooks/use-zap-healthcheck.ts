import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { AvailableChain } from '@/utils/chains'

interface ZapperStatus {
  chainId: number
  ok: boolean
}

const useZapHealthcheck = (chainId: AvailableChain) => {
  const { data } = useQuery({
    queryKey: ['zapper-healthcheck', chainId],
    queryFn: async (): Promise<ZapperStatus[]> => {
      const response = await fetch(`${RESERVE_API}zapper/healthcheck`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      return response.json()
    },
    staleTime: 120_000,
    refetchInterval: 60_000,
  })

  const status = data?.find((status) => status.chainId === chainId)
  if (!status) {
    return true
  }

  return status.ok
}

export default useZapHealthcheck
