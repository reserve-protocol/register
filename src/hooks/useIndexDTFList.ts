import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { Address } from 'viem'

const tokenListQuery = gql`
  query GetIndexDTFList {
    dtfs(orderBy: token__totalSupply, orderDirection: desc) {
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
  dtfs: {
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

export type IndexDTFItem = {
  address: Address
  symbol: string
  name: string
  decimals: number
  price: number
  fee: number
  assets: { address: Address; symbol: string }[]
  performance: { timestamp: number; value: number }[] // [1, 2, 3, 4, 5, 6, 7] price per day!
  stToken?: Address
  chainId: number
}

const REFRESH_INTERVAL = 1000 * 60 * 10 // 10 minutes

// TODO: Top 100 only, worry about pagination later
// TODO: Pagination may become a problem sooner? need to fetch analytics/pricing here as well!
// TODO: Mock data for what should come from the API
const useIndexDTFList = () => {
  return useQuery({
    queryKey: ['index-dtf-list'],
    queryFn: async (): Promise<IndexDTFItem[]> => {
      // TODO: Reusable multichain query? I think multichain is only for tokenList and analytics so it maybe not needed
      const base = await request(
        INDEX_DTF_SUBGRAPH_URL[ChainId.Base],
        tokenListQuery
      )

      return base.dtfs.map((folio: Response['dtfs'][number]) => {
        return {
          address: folio.id,
          symbol: folio.token.symbol,
          name: folio.token.name,
          decimals: 18,
          stToken: folio.stToken?.id,
          chainId: ChainId.Base,
          price: 1,
          fee: 2,
          assets: [
            {
              address: '0x0000000000000000000000000000000000000000',
              symbol: 'USDC',
            },
            {
              address: '0x0000000000000000000000000000000000000000',
              symbol: 'RSR',
            },
            {
              address: '0x0000000000000000000000000000000000000000',
              symbol: 'WETH',
            },
            {
              address: '0x0000000000000000000000000000000000000000',
              symbol: 'eUSD',
            },
            {
              address: '0x0000000000000000000000000000000000000000',
              symbol: 'Shib',
            },
          ],
          performance: [
            { timestamp: 1, value: 1 },
            { timestamp: 2, value: 2 },
            { timestamp: 3, value: 1 },
            { timestamp: 4, value: 4 },
            { timestamp: 5, value: 3 },
            { timestamp: 6, value: 4 },
            { timestamp: 7, value: 5 },
          ],
        }
      })
    },
    refetchInterval: REFRESH_INTERVAL,
    staleTime: REFRESH_INTERVAL,
  })
}

export default useIndexDTFList
