import {
  useIndexDtfExposure,
  useIndexDtfPrice,
} from '@reserve-protocol/react-sdk'
import { useMemo } from 'react'
import { Address } from 'viem'
import type { FeaturedExposureGroup } from '../../hooks/use-featured-dtfs'
import type { AssetTickerItem } from '../highlighted-dtfs/types'
import { mapExposureGroupsToTickers } from '../highlighted-dtfs/utils'

// PHOTON identity is static (the hero always shows this DTF), so it paints
// instantly. Price + exposure come from per-DTF SDK endpoints that resolve well
// before the full featured payload, and the branded logo is hardcoded from the
// featured API so it shows without waiting on a network round-trip.
export const PHOTON = {
  address: '0xa0Fe4e0aEca5479705ce996615B2EACB6b6a10Fb' as Address,
  chainId: 56,
  symbol: 'PHOTON',
  logo: 'https://l5394zf57b.ufs.sh/f/mupND8QUUvXxYmQhYtkGhrj2ScsDNeUp3lRftPgCi0ZM65Vz',
} as const

const PARAMS = { address: PHOTON.address, chainId: PHOTON.chainId }

export const usePhotonAnimationData = () => {
  const { data: price } = useIndexDtfPrice(PARAMS)
  const { data: exposure } = useIndexDtfExposure({ ...PARAMS, period: '24h' })

  const exposureAssets = useMemo<AssetTickerItem[]>(
    () =>
      exposure?.length
        ? // The SDK types exposure `native` as `unknown`, but /dtf/exposure and
          // the featured endpoint share one ExposureService and emit the same
          // shape (verified: native.caip2 = 'nasdaq'/'nyse', tokens[].weight).
          mapExposureGroupsToTickers(
            exposure as unknown as FeaturedExposureGroup[]
          )
        : [],
    [exposure]
  )

  return {
    address: PHOTON.address,
    chainId: PHOTON.chainId,
    symbol: PHOTON.symbol,
    logo: PHOTON.logo,
    price: price?.price,
    exposureAssets,
  }
}
