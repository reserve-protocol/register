import { indexDTFAtom } from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address } from 'viem'

type DTFRestrictedData = {
  restricted: boolean
}

type DTFRestrictedResult = {
  data?: DTFRestrictedData
  isLoading: boolean
}

type DTFGeolocationStatus = {
  country: string
  countryCode: string
  restricted: boolean
}

const isDTFGeolocationStatus = (
  value: unknown
): value is DTFGeolocationStatus => {
  if (typeof value !== 'object' || value === null) return false
  const data = value as Record<string, unknown>
  return (
    typeof data.country === 'string' &&
    typeof data.countryCode === 'string' &&
    /^[A-Z]{2}$/.test(data.countryCode.toUpperCase()) &&
    typeof data.restricted === 'boolean'
  )
}

const useDTFGeolocation = (dtfAddress?: Address, chainId?: number) => {
  return useQuery({
    queryKey: ['dtf-geolocation', dtfAddress?.toLowerCase(), chainId],
    queryFn: async (): Promise<DTFGeolocationStatus> => {
      if (!dtfAddress || !chainId) {
        throw new Error('Missing DTF address or chainId')
      }

      const response = await fetch(
        `${RESERVE_API}v2/compliance/geolocation/dtf/${dtfAddress}?chainId=${chainId}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch DTF geolocation')
      }

      const payload: unknown = await response.json()
      if (!isDTFGeolocationStatus(payload)) {
        throw new Error('Invalid DTF geolocation payload')
      }

      return payload
    },
    enabled: !!dtfAddress && !!chainId,
  })
}

const useDTFRestricted = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const dtfGeolocation = useDTFGeolocation(dtf?.id, dtf?.chainId)

  return useMemo<DTFRestrictedResult>(() => {
    if (!dtf || dtfGeolocation.isLoading) {
      return { data: undefined, isLoading: true }
    }

    const restricted =
      dtfGeolocation.isError || dtfGeolocation.data?.restricted === true

    return {
      data: { restricted },
      isLoading: false,
    }
  }, [
    dtf,
    dtfGeolocation.data,
    dtfGeolocation.isError,
    dtfGeolocation.isLoading,
  ])
}

export default useDTFRestricted
