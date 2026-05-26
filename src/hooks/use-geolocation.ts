import { RESERVE_API } from '@/utils/constants'
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
    /^[A-Z]{2}$/.test(data.countryCode.toUpperCase()) &&
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
        throw new Error('Failed to fetch geolocation')
      }

      const payload: unknown = await response.json()
      if (!isGeolocationStatus(payload)) {
        throw new Error('Invalid geolocation payload')
      }

      return payload
    },
  })
}

export default useGeolocation
