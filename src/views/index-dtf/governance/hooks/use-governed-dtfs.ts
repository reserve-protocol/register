import useIndexDTFSubgraph from '@/hooks/useIndexDTFSugbraph'
import { gql } from 'graphql-request'
import { Address } from 'viem'

export type GovernedDtf = {
  id: Address
  token: {
    name: string
    symbol: string
  }
}

type GovernedDtfsResponse = {
  dtfs: GovernedDtf[]
}

const GOVERNED_DTFS_QUERY = gql`
  query GetGovernedDtfs($voteLockAddress: String!) {
    dtfs(
      first: 100
      where: { ownerGovernance_: { token: $voteLockAddress } }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      token {
        name
        symbol
      }
    }
  }
`

const useGovernedDtfs = (voteLockAddress?: Address, chainId?: number) => {
  return useIndexDTFSubgraph(
    voteLockAddress ? GOVERNED_DTFS_QUERY : null,
    { voteLockAddress: voteLockAddress?.toLowerCase() },
    {
      enabled: Boolean(voteLockAddress && chainId),
      select: (data: GovernedDtfsResponse | undefined) => data?.dtfs ?? [],
      staleTime: 1000 * 60 * 5,
    },
    chainId
  )
}

export default useGovernedDtfs
