import { indexDTFAtom, indexDTFBasketAtom } from '@/state/dtf/atoms'
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

const RESTRICTED_ASSETS = new Set([
  '0x57f5e098cad7a3d1eed53991d4d66c45c9af7812',
])

const useDTFRestricted = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const geolocation = useGeolocation()

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

    const isGeoblocked = isAssetRestricted
      ? geolocation.isLoading ||
        geolocation.isError ||
        geolocation.data?.restricted === true
      : false

    const isLoading = isAssetRestricted ? geolocation.isLoading : false

    return {
      data: isLoading
        ? undefined
        : {
            restricted: isGeoblocked,
            geolocation: geolocation.data,
            assets: basketRestrictedAssets,
          },
      isLoading,
    }
  }, [
    geolocation.data,
    geolocation.isError,
    geolocation.isLoading,
    basketRestrictedAssets,
  ])
}

export default useDTFRestricted
