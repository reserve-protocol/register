import { trackCompliance } from '@/hooks/useTrackPage'
import { DISABLE_VPN_BLOCK, RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

export type GeolocationStatus = {
  country: string
  countryCode: string
  restricted: boolean
  isVPN: boolean
}

const GEOLOCATION_QUERY_KEY = ['geolocation'] as const

const isGeolocationStatus = (value: unknown): value is GeolocationStatus => {
  if (typeof value !== 'object' || value === null) return false
  const data = value as Record<string, unknown>
  return (
    typeof data.country === 'string' &&
    typeof data.countryCode === 'string' &&
    typeof data.restricted === 'boolean' &&
    typeof data.isVPN === 'boolean'
  )
}

const useGeolocation = () => {
  return useQuery({
    queryKey: GEOLOCATION_QUERY_KEY,
    queryFn: async (): Promise<GeolocationStatus> => {
      const response = await fetch(`${RESERVE_API}v2/compliance/geolocation`)

      if (!response.ok) {
        trackCompliance({ endpoint: 'geolocation', status: 'error' })
        throw new Error('Failed to fetch geolocation')
      }

      const payload: unknown = await response.json()
      if (!isGeolocationStatus(payload)) {
        trackCompliance({ endpoint: 'geolocation', status: 'error' })
        throw new Error('Invalid geolocation payload')
      }

      trackCompliance({
        endpoint: 'geolocation',
        status: 'success',
        restricted: payload.restricted,
        isVPN: payload.isVPN,
        country: payload.country,
        countryCode: payload.countryCode,
      })

      // TEMP: staging-only — clear the VPN signal (and the restriction that
      // comes with it) so the allowed-jurisdiction form can be tested.
      if (DISABLE_VPN_BLOCK && payload.isVPN) {
        return { ...payload, isVPN: false, restricted: false }
      }

      return payload
    },
  })
}

export default useGeolocation
