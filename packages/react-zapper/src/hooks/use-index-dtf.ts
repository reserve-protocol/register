import { ChainId } from '../utils/chains'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { Address, formatEther } from 'viem'

const INDEX_DTF_SUBGRAPH_URL = {
  [ChainId.Mainnet]:
    'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-mainnet/api',
  [ChainId.Base]:
    'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-base/api',
  [ChainId.Arbitrum]:
    'https://subgraph.satsuma-prod.com/327d6f1d3de6/reserve/dtf-index-arbitrum/api',
}

type DTFQueryResponse = {
  dtf: {
    id: Address
    mintingFee: string // bigint D18
    tvlFee: string // bigint D18
    token: {
      id: Address
      name: string
      symbol: string
      decimals: number
      totalSupply: string
    }
  }
}

const dtfQuery = gql`
  query getDTF($id: String!) {
    dtf(id: $id) {
      id
      mintingFee
      tvlFee
      token {
        id
        name
        symbol
        decimals
        totalSupply
      }
    }
  }
`

export const useIndexDTF = (address: string | undefined, chainId: number) => {
  return useQuery({
    queryKey: ['index-dtf-metadata', address, chainId],
    queryFn: async () => {
      if (!address) return undefined

      const subgraphUrl =
        INDEX_DTF_SUBGRAPH_URL[chainId as keyof typeof INDEX_DTF_SUBGRAPH_URL]
      if (!subgraphUrl) throw new Error(`Unsupported chain ID: ${chainId}`)

      const { dtf }: DTFQueryResponse = await request(subgraphUrl, dtfQuery, {
        id: address.toLowerCase(),
      })

      if (!dtf) return undefined

      return {
        ...dtf,
        chainId,
        mintingFee: +formatEther(BigInt(dtf.mintingFee)),
        tvlFee: +formatEther(BigInt(dtf.tvlFee)),
      }
    },
    enabled: !!address,
  })
}
