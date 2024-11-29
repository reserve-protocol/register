import { gql } from 'graphql-request'
import { useCMSQuery } from 'hooks/useQuery'
import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { AddressMap } from 'types'
import {
  CollateralMetadata,
  collateralsMetadataAtom,
  protocolMetadataAtom,
  TokenMetadata,
  tokenMetadataAtom,
} from './atoms'
import { stringToHex } from 'viem'
import useCMSMetadata from 'hooks/useCMSMetadata'

type QueryReponse = {
  rTokenAssetDocumentationCollection: {
    items: {
      displaySymbol: string
      id: string
      llamaId?: string
      name: string
      description?: string
      color?: string
      tokenDistribution?: { token: string; distribution: number }[]
      tokensCollection?: {
        items: {
          tokenTicker: string
          name?: string
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
        logo?: {
          url: string
        }
        color?: string
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
        description
        displaySymbol
        tokensCollection {
          items {
            tokenTicker
            name
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
          logo {
            url
          }
          color
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
            name: token.name ?? '',
            symbol: token.tokenTicker ?? '',
            addresses: token.addresses ?? {},
            color: token.color ?? stringToHex(token.tokenTicker ?? 'notoken'),
            description: token.description ?? 'No token data',
            rating: token.rating,
            website: token.website,
          }

          return acc
        }, {} as Record<string, TokenMetadata>) ?? {}

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
          id: item.protocol?.id ?? '',
          name: item.protocol?.protocolName ?? 'Unknown',
          description: item.protocol?.protocolDescription ?? '',
          website: item.protocol?.website ?? '',
          docs: item.protocol?.docs ?? '',
          logo: item.protocol?.logo?.url ?? '/svgs/defaultLogo.svg',
          color: item.protocol?.color ?? 'grey',
        },
      }
    }
    set(collateralsMetadataAtom, collateralData)
  }
)

// Fetch collaterals CMS data
const CMSUpdater = () => {
  const { data } = useCMSQuery(collateralsMetaQuery)
  const metadata = useCMSMetadata()
  const setTokensMetadata = useSetAtom(tokenMetadataAtom)
  const setProtocolsMetadata = useSetAtom(protocolMetadataAtom)
  const setCollateralsMetadata = useSetAtom(setCollateralsMetadataAtom)

  useEffect(() => {
    if (data) {
      setCollateralsMetadata(data as QueryReponse)
    }
  }, [data])

  useEffect(() => {
    if (metadata) {
      setTokensMetadata(metadata.tokens)
      setProtocolsMetadata(metadata.protocols)
    }
  }, [JSON.stringify(metadata)])

  return null
}

export default CMSUpdater
