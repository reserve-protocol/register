import { ZapResponse } from '@/views/yield-dtf/issuance/components/zapV2/api'
import {
  ZapDeployBody,
  ZapDeployUngovernedBody,
} from '@/views/yield-dtf/issuance/components/zapV2/api/types'
import { useQuery } from '@tanstack/react-query'

export const useZapDeployQuery = (
  url: string,
  payload: ZapDeployBody | ZapDeployUngovernedBody | undefined,
  disabled: boolean
) => {
  return useQuery({
    queryKey: ['zapDeploy', url, payload],
    queryFn: async (): Promise<ZapResponse> => {
      const modifiedPayload = payload && {
        ...payload,
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modifiedPayload),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      return response.json()
    },
    enabled: !!payload && !disabled,
    staleTime: 12000,
    refetchInterval: 12000,
  })
}
