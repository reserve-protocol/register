import { gql } from 'graphql-request'
import { useCMSQuery } from './useQuery'
import { useMemo } from 'react'
import { AddressMap } from 'types'
import { ProjectMetadata, TokenMetadata } from 'state/cms/atoms'

type QueryResponse = {
  componentTokensCollection: {
    items: {
      tokenTicker: string
      addresses?: AddressMap
      color?: string
      name?: string
      rating?: string
      website?: string
      description?: string
    }[]
  }
  protocolDetailsCollection: {
    items: {
      id: string
      protocolName: string
      protocolDescription: string
      website?: string
      docs?: string
      logo?: {
        url: string
      }
      color?: string
    }[]
  }
}

const query = gql`
  query {
    componentTokensCollection {
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
    protocolDetailsCollection {
      items {
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
`

const parseData = (
  data: QueryResponse
): {
  tokens: Record<string, TokenMetadata>
  protocols: Record<string, ProjectMetadata>
} => {
  return {
    tokens: data.componentTokensCollection.items.reduce((acc, item) => {
      acc[item.tokenTicker.toLowerCase()] = {
        symbol: item.tokenTicker,
        name: item.name ?? '',
        addresses: item.addresses || {},
        color: item.color ?? '#ccc',
        website: item.website,
        description: item.description ?? '',
      }
      return acc
    }, {} as Record<string, TokenMetadata>),
    protocols: data.protocolDetailsCollection.items.reduce((acc, item) => {
      acc[item.id.toLowerCase()] = {
        id: item.id,
        name: item.protocolName,
        description: item.protocolDescription,
        website: item.website ?? '',
        docs: item.docs ?? '',
        logo: item?.logo?.url ?? '/svgs/defaultLogo.svg',
        color: item.color,
      }
      return acc
    }, {} as Record<string, ProjectMetadata>),
  }
}

const useCMSMetadata = () => {
  const { data } = useCMSQuery(query)

  return useMemo(() => {
    if (!data) return null

    return parseData(data)
  }, [data])
}

export default useCMSMetadata
