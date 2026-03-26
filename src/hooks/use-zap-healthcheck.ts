import { ZAPPER_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { AvailableChain } from '@/utils/chains'

interface ZapperStatus {
  chainId: number
  ok: boolean
}

interface HealthResponse {
  ok: boolean
  chains: ZapperStatus[]
}

const useZapHealthcheck = (chainId: AvailableChain) => {
  const { data } = useQuery({
    queryKey: ['zapper-healthcheck', chainId],
    queryFn: async (): Promise<ZapperStatus[]> => {
      const response = await fetch(`${ZAPPER_API}health`)

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const json: HealthResponse = await response.json()
      return json.chains
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
