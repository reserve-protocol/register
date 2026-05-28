import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Address } from 'viem'
import useGeolocation, { GeolocationStatus } from './use-geolocation'

type DTFRestrictedData = {
  restricted: boolean
  geolocation?: GeolocationStatus
  assets: Address[]
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

const RESTRICTED_ASSETS = new Set([
  '0x71E2400CF1Cb83204f33794eD326636A71a9AAfC'.toLowerCase(),
])

const ASSET_RESTRICTED_COUNTRY_CODES = new Set([
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
  const basket = useAtomValue(indexDTFBasketAtom)
  const geolocation = useGeolocation()
  const dtfGeolocation = useDTFGeolocation(dtf?.id, dtf?.chainId)

  const basketRestrictedAssets = useMemo(() => {
    if (!basket) return dtf ? undefined : []

    const restrictedAssets: Address[] = []

    for (const { address } of basket) {
      if (RESTRICTED_ASSETS.has(address.toLowerCase())) {
        restrictedAssets.push(address)
      }
    }

    return restrictedAssets
  }, [basket, dtf])

  return useMemo<DTFRestrictedResult>(() => {
    if (!basketRestrictedAssets) {
      return { data: undefined, isLoading: true }
    }

    const isAssetRestricted = !!basketRestrictedAssets.length

    const dtfGeoLoading = !!dtf && dtfGeolocation.isLoading
    const assetGeoLoading = isAssetRestricted && geolocation.isLoading

    if (dtfGeoLoading || assetGeoLoading) {
      return { data: undefined, isLoading: true }
    }

    // Backend per-DTF geolocation restriction (fail-closed on error)
    const isDTFGeoRestricted =
      !!dtf &&
      (dtfGeolocation.isError || dtfGeolocation.data?.restricted === true)

    // Frontend asset-based restriction for DTFs holding restricted assets
    const isAssetGeoblocked =
      isAssetRestricted &&
      (geolocation.isError ||
        !geolocation.data ||
        ASSET_RESTRICTED_COUNTRY_CODES.has(
          geolocation.data.countryCode.toUpperCase()
        ))

    return {
      data: {
        restricted: isDTFGeoRestricted || isAssetGeoblocked,
        geolocation: geolocation.data,
        assets: basketRestrictedAssets,
      },
      isLoading: false,
    }
  }, [
    dtf,
    dtfGeolocation.data,
    dtfGeolocation.isError,
    dtfGeolocation.isLoading,
    geolocation.data,
    geolocation.isError,
    geolocation.isLoading,
    basketRestrictedAssets,
  ])
}

export default useDTFRestricted
