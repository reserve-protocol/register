import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { Address } from 'viem'

export type InternalDTF = {
  id: Address
  timestamp: number
  chainId: number
  deployer: Address
  token: {
    name: string
    symbol: string
    decimals: number
    totalSupply: string
    holders?: {
      balance: string
    }[]
  }
  ownerGovernance?: {
    votingDelay: number
    votingPeriod: number
    timelock: {
      guardians: Address[]
    }
  }
  tradingGovernance?: {
    votingDelay: number
    votingPeriod: number
    timelock: {
      guardians: Address[]
    }
  }
  stToken?: {
    governance?: {
      votingDelay: number
      votingPeriod: number
      timelock: {
        guardians: Address[]
      }
    }
  }
  marketCap?: number // Will be fetched separately from API
  hasBalance?: boolean // Computed field
}

const dtfsQuery = gql`
  query GetDTFs($first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!, $where: DTF_filter) {
    dtfs(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
      id
      timestamp
      deployer
      token {
        name
        symbol
        decimals
        totalSupply
      }
      ownerGovernance {
        votingDelay
        votingPeriod
        timelock {
          guardians
        }
      }
      tradingGovernance {
        votingDelay
        votingPeriod
        timelock {
          guardians
        }
      }
      stToken {
        governance {
          votingDelay
          votingPeriod
          timelock {
            guardians
          }
        }
      }
    }
  }
`

const countQuery = gql`
  query GetDTFCount($where: DTF_filter) {
    dtfs(first: 1000, where: $where) {
      id
    }
  }
`

export const useInternalDTFList = (
  page: number,
  pageSize: number,
  where?: any
) => {
  return useQuery({
    queryKey: ['internal-dtf-list', page, pageSize, where],
    queryFn: async () => {
      const allDTFs: InternalDTF[] = []
      
      // Fetch from all supported chains
      const chains = [ChainId.Base, ChainId.Mainnet, ChainId.BSC]
      
      for (const chainId of chains) {
        try {
          const client = INDEX_GRAPH_CLIENTS[chainId]
          if (!client) continue

          const response = await client.request(dtfsQuery, {
            first: pageSize,
            skip: page * pageSize,
            orderBy: 'timestamp',
            orderDirection: 'desc',
            where: where || {}
          })

          const dtfsWithChain = response.dtfs.map((dtf: any) => ({
            ...dtf,
            chainId
          }))

          allDTFs.push(...dtfsWithChain)
        } catch (error) {
          console.error(`Failed to fetch DTFs from chain ${chainId}:`, error)
        }
      }

      // Sort by timestamp across all chains
      allDTFs.sort((a, b) => b.timestamp - a.timestamp)
      
      // Return paginated results
      return allDTFs.slice(0, pageSize)
    },
    staleTime: 60000, // 1 minute
  })
}

export const useInternalDTFCount = (where?: any) => {
  return useQuery({
    queryKey: ['internal-dtf-count', where],
    queryFn: async () => {
      let totalCount = 0

      const chains = [ChainId.Base, ChainId.Mainnet, ChainId.BSC]

      for (const chainId of chains) {
        try {
          const client = INDEX_GRAPH_CLIENTS[chainId]
          if (!client) continue

          const response = await client.request(countQuery, {
            where: where || {},
          })
          totalCount += response.dtfs.length
        } catch (error) {
          console.error(`Failed to fetch DTF count from chain ${chainId}:`, error)
        }
      }

      return totalCount
    },
    staleTime: 300000, // 5 minutes
  })
}