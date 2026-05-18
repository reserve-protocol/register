import { useQuery } from '@tanstack/react-query'

export type GeolocationStatus = {
  country: string
  country_code: string
  restricted: boolean
}

const GEOLOCATION_QUERY_KEY = ['geolocation'] as const

const GEOLOCATION_URLS = [
  'https://one.one.one.one/cdn-cgi/trace',
  'https://1.0.0.1/cdn-cgi/trace',
  'https://cloudflare-dns.com/cdn-cgi/trace',
  'https://cloudflare-eth.com/cdn-cgi/trace',
  'https://cloudflare-ipfs.com/cdn-cgi/trace',
  'https://workers.dev/cdn-cgi/trace',
  'https://pages.dev/cdn-cgi/trace',
  'https://cloudflare.tv/cdn-cgi/trace',
]

const RESTRICTED_COUNTRY_CODES = new Set([
  'AF', // Afghanistan
  'BY', // Belarus
  'CA', // Canada
  'CU', // Cuba
  'IR', // Iran
  'LY', // Libya
  'MM', // Myanmar
  'KP', // North Korea
  'RU', // Russia
  'SO', // Somalia
  'SS', // South Sudan
  'SD', // Sudan
  'SY', // Syria
  'UA', // Temporary country-level fallback for disputed Ukrainian regions
  'US', // United States
])

const UNKNOWN_COUNTRY_CODES = new Set(['T1', 'XX'])

const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/

const UNKNOWN_GEOLOCATION: GeolocationStatus = {
  country: 'Unknown',
  country_code: 'unknown',
  restricted: true,
}

const REGION_NAMES = new Intl.DisplayNames(['en'], { type: 'region' })

const useGeolocation = () => {
  return useQuery({
    queryKey: GEOLOCATION_QUERY_KEY,
    queryFn: async (): Promise<GeolocationStatus> => {
      let response: Response | undefined

      for (const url of GEOLOCATION_URLS) {
        try {
          response = await fetch(url)

          if (response.ok) break
        } catch {}
      }

      if (!response?.ok) {
        return UNKNOWN_GEOLOCATION
      }

      const trace = await response.text()
      const entries = trace
        .trim()
        .split('\n')
        .map((entry) => entry.split('='))
      const countryCode = (
        Object.fromEntries(entries) as Record<string, string>
      ).loc?.toUpperCase()

      if (
        !countryCode ||
        !COUNTRY_CODE_REGEX.test(countryCode) ||
        UNKNOWN_COUNTRY_CODES.has(countryCode)
      ) {
        return UNKNOWN_GEOLOCATION
      }

      return {
        country: REGION_NAMES.of(countryCode) ?? countryCode,
        country_code: countryCode.toLowerCase(),
        restricted: RESTRICTED_COUNTRY_CODES.has(countryCode),
      }
    },
  })
}

export default useGeolocation
