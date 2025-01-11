import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { Address } from 'viem'

const tokenListQuery = gql`
  query GetIndexDTFList {
    folios(orderBy: token__totalSupply, orderDirection: desc) {
      id
      stToken {
        id
      }
      token {
        id
        name
        symbol
        totalSupply
      }
    }
  }
`

type Response = {
  folios: {
    id: string
    stToken: {
      id: Address
    }
    token: {
      id: Address
      name: string
      symbol: string
      totalSupply: bigint
    }
  }[]
}

type IndexDTFList = {
  address: Address
  symbol: string
  name: string
  decimals: number
  stToken?: Address
  chainId: number
}

const REFRESH_INTERVAL = 1000 * 60 * 10 // 10 minutes

// TODO: Top 500 only, worry about pagination later
const useIndexDTFList = () => {
  return useQuery({
    queryKey: ['index-dtf-list'],
    queryFn: async (): Promise<IndexDTFList[]> => {
      // TODO: Reusable multichain query? I think multichain is only for tokenList and analytics so it maybe not needed
      const base = await request(
        INDEX_DTF_SUBGRAPH_URL[ChainId.Base],
        tokenListQuery
      )

      return base.folios.map((folio: Response['folios'][number]) => {
        return {
          address: folio.id,
          symbol: folio.token.symbol,
          name: folio.token.name,
          decimals: 18,
          stToken: folio.stToken?.id,
          chainId: ChainId.Base,
        }
      })
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFList
