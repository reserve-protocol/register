import { gql } from 'graphql-request'
import { useCMSQuery } from 'hooks/useQuery'
import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { AddressMap } from 'types'
import {
  CollateralMetadata,
  UnderlyingMetadata,
  collateralsMetadataAtom,
} from './atoms'
import { stringToHex } from 'viem'

type QueryReponse = {
  rTokenAssetDocumentationCollection: {
    items: {
      displaySymbol: string
      id: string
      llamaId?: string
      name: string
      color?: string
      tokenDistribution?: { token: string; distribution: number }[]
      tokensCollection?: {
        items: {
          tokenTicker: string
          addresses?: AddressMap
          color?: string
          rating?: string
          website?: string
          description?: string
        }[]
      }
      protocol?: {
        id: string
        protocolName: string
        protocolDescription: string
        website?: string
        docs?: string
      }
    }[]
  }
}

// TODO: refactor in favor for normalized data~
// TODO: rushing this, but CollateralAssets / TokenCollection / Protocols should be separate atoms
const collateralsMetaQuery = gql`
  query {
    rTokenAssetDocumentationCollection {
      items {
        name
        id
        llamaId
        tokenDistribution
        color
        displaySymbol
        tokensCollection {
          items {
            tokenTicker
            addresses
            color
            rating
            website
            description
          }
        }
        protocol {
          id
          protocolName
          protocolDescription
          website
          docs
        }
      }
    }
  }
`

const setCollateralsMetadataAtom = atom(
  null,
  (get, set, data: QueryReponse) => {
    const collateralData: Record<string, CollateralMetadata> = {}

    for (const item of data.rTokenAssetDocumentationCollection.items) {
      const underlying =
        item.tokensCollection?.items.reduce((acc, token) => {
          acc[token.tokenTicker] = {
            symbol: token.tokenTicker ?? '',
            addresses: token.addresses ?? {},
            color: token.color ?? stringToHex(token.tokenTicker ?? 'notoken'),
            description: token.description ?? 'No token data',
            rating: token.rating,
            website: token.website,
          }

          return acc
        }, {} as Record<string, UnderlyingMetadata>) ?? {}

      collateralData[item.id] = {
        id: item.id,
        name: item.name,
        displaySymbol: item.displaySymbol,
        llamaId: item.llamaId,
        color: item.color ?? stringToHex(item.id),
        tokenDistribution: item.tokenDistribution,
        underlying,
        protocol: {
          name: item.protocol?.protocolName ?? 'Unknown',
          description: item.protocol?.protocolDescription ?? '',
          website: item.protocol?.website ?? '',
          docs: item.protocol?.docs ?? '',
        },
      }
    }
    set(collateralsMetadataAtom, collateralData)
  }
)

// Fetch collaterals CMS data
const CMSUpdater = () => {
  const { data } = useCMSQuery(collateralsMetaQuery)
  const setCollateralsMetadata = useSetAtom(setCollateralsMetadataAtom)

  useEffect(() => {
    if (data) {
      setCollateralsMetadata(data as QueryReponse)
    }
  }, [data])

  return null
}

export default CMSUpdater
