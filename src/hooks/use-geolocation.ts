import { trackCompliance } from '@/hooks/useTrackPage'
import { walletAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

export type GeolocationStatus = {
  country: string
  countryCode: string
  restricted: boolean
  isVPN: boolean
}

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
  const wallet = useAtomValue(walletAtom)

  return useQuery({
    queryKey: ['geolocation', wallet?.toLowerCase()],
    queryFn: async (): Promise<GeolocationStatus> => {
      const response = await fetch(
        `${RESERVE_API}v2/compliance/geolocation${wallet ? `?address=${wallet}` : ''}`
      )

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

      return payload
    },
  })
}

export default useGeolocation
