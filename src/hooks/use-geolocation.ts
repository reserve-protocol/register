import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'

export type GeolocationStatus = {
  country: string
  countryCode: string
  restricted: boolean
  isVPN: boolean
}

const GEOLOCATION_QUERY_KEY = ['geolocation'] as const

const useGeolocation = () => {
  return useQuery({
    queryKey: GEOLOCATION_QUERY_KEY,
    queryFn: async (): Promise<GeolocationStatus> => {
      const response = await fetch(`${RESERVE_API}v2/compliance/geolocation`)

      if (!response.ok) {
        throw new Error('Failed to fetch geolocation')
      }

      return response.json()
    },
  })
}

export default useGeolocation
