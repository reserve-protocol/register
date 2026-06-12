import { indexDTFAtom } from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address } from 'viem'

// 'geolocation' is legacy, kept while the backend migrates to the granular
// geolocation-* values.
export type DTFRestrictionReason =
  | 'none'
  | 'geolocation'
  | 'geolocation-restricted' // qualified-investor jurisdiction
  | 'geolocation-prohibited' // absolute bar
  | 'vpn'

type DTFRestrictedData = {
  restricted: boolean
  reason?: Exclude<DTFRestrictionReason, 'none'>
}

type DTFRestrictedResult = {
  data?: DTFRestrictedData
  isLoading: boolean
  isError: boolean
}

type DTFGeolocationStatus = {
  country: string
  countryCode: string
  restricted: boolean
  restriction: DTFRestrictionReason
}

const isDTFRestrictionReason = (
  value: unknown
): value is DTFRestrictionReason =>
  value === 'none' ||
  value === 'geolocation' ||
  value === 'geolocation-restricted' ||
  value === 'geolocation-prohibited' ||
  value === 'vpn'

const isDTFGeolocationStatus = (
  value: unknown
): value is DTFGeolocationStatus => {
  if (typeof value !== 'object' || value === null) return false
  const data = value as Record<string, unknown>
  return (
    typeof data.country === 'string' &&
    typeof data.countryCode === 'string' &&
    typeof data.restricted === 'boolean' &&
    isDTFRestrictionReason(data.restriction)
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
      return { data: undefined, isLoading: true, isError: false }
    }

    // Fail-closed on error: restricted with unknown reason
    if (dtfGeolocation.isError || !dtfGeolocation.data) {
      return {
        data: { restricted: true },
        isLoading: false,
        isError: true,
      }
    }

    if (!dtfGeolocation.data.restricted) {
      return {
        data: { restricted: false },
        isLoading: false,
        isError: false,
      }
    }

    // Restricted: prefer the backend's reason; default to 'geolocation' if
    // it ever comes back as 'none' (shouldn't happen, but defensive).
    const restriction = dtfGeolocation.data.restriction
    const reason = restriction === 'none' ? 'geolocation' : restriction

    return {
      data: { restricted: true, reason },
      isLoading: false,
      isError: false,
    }
  }, [
    dtf,
    dtfGeolocation.data,
    dtfGeolocation.isError,
    dtfGeolocation.isLoading,
  ])
}

export default useDTFRestricted
