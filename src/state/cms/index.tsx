import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import {
  CollateralMetadata,
  UnderlyingMetadata,
  collateralsMetadataAtom,
} from './atoms'
import { stringToHex } from 'viem'
import { getCollaterals } from '@/lib/meta'

const setCollateralsMetadataAtom = atom(
  null,
  (get, set, collaterals: ReturnType<typeof getCollaterals>) => {
    const collateralData: Record<string, CollateralMetadata> = {}

    for (const item of collaterals) {
      const underlying = item.underlyings.reduce(
        (acc, token) => {
          acc[token.tokenTicker] = {
            symbol: token.tokenTicker,
            addresses: token.addresses ?? {},
            color: token.color ?? stringToHex(token.tokenTicker),
            description: token.description,
            rating: token.rating,
            website: token.website,
          }

          return acc
        },
        {} as Record<string, UnderlyingMetadata>
      )

      collateralData[item.id] = {
        id: item.id,
        name: item.name,
        displaySymbol: item.displaySymbol,
        llamaId: item.llamaId,
        description: item.description,
        color: item.color ?? stringToHex(item.id),
        tokenDistribution: item.tokenDistribution,
        underlying,
        protocol: {
          name: item.protocol.protocolName,
          description: item.protocol.protocolDescription,
          website: item.protocol.website,
          docs: item.protocol.docs ?? '',
          logo: item.protocol.logo.url,
          color: item.protocol.color ?? 'grey',
        },
      }
    }
    set(collateralsMetadataAtom, collateralData)
  }
)

// Fetch collaterals CMS data
const CMSUpdater = () => {
  const setCollateralsMetadata = useSetAtom(setCollateralsMetadataAtom)

  useEffect(() => {
    const collaterals = getCollaterals()
    setCollateralsMetadata(collaterals)
  }, [setCollateralsMetadata])

  return null
}

export default CMSUpdater
