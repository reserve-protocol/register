import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import { IndexDTF } from '@/types'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { Address, formatEther } from 'viem'

type DTFQueryResponse = {
  dtf: {
    id: Address
    deployer: Address
    ownerAddress: Address
    mintingFee: string // bigint D18
    tvlFee: string // bigint D18
    annualizedTvlFee: string // bigint D18
    mandate: string
    auctionDelay: string // bigint
    auctionLength: string // bigint
    auctionApprovers: Address[]
    auctionLaunchers: Address[]
    brandManagers: Address[]
    ownerGovernance?: {
      id: Address
      votingDelay: number
      votingPeriod: number
      timelock: {
        id: Address
        guardians: Address[]
        executionDelay: number
      }
    }
    tradingGovernance?: {
      id: Address
      votingDelay: number
      votingPeriod: number
      timelock: {
        id: Address
        guardians: Address[]
        executionDelay: number
      }
    }
    token: {
      id: Address
      name: string
      symbol: string
      decimals: number
      totalSupply: string
    }
    stToken?: {
      id: Address
      token: {
        name: string
        symbol: string
        decimals: number
        totalSupply: string
      }
      underlying: {
        name: string
        symbol: string
        address: Address
        decimals: number
      }
    }
  }
}

const dtfQuery = gql`
  query getDTF($id: String!) {
    dtf(id: $id) {
      id
      deployer
      ownerAddress
      mintingFee
      tvlFee
      annualizedTvlFee
      mandate
      auctionDelay
      auctionLength
      auctionApprovers
      auctionLaunchers
      brandManagers
      ownerGovernance {
        id
        votingDelay
        votingPeriod
        timelock {
          id
          guardians
          executionDelay
        }
      }
      tradingGovernance {
        id
        votingDelay
        votingPeriod
        timelock {
          id
          guardians
          executionDelay
        }
      }
      token {
        id
        name
        symbol
        decimals
        totalSupply
      }
      stToken {
        id
        token {
          name
          symbol
          decimals
          totalSupply
        }
        underlying {
          name
          symbol
          address
          decimals
        }
      }
    }
  }
`

const useIndexDTF = (address: string | undefined, chainId: number) => {
  return useQuery<IndexDTF | undefined>({
    queryKey: ['index-dtf-metadata', address, chainId],
    queryFn: async () => {
      if (!address) return undefined

      const { dtf }: DTFQueryResponse = await request(
        INDEX_DTF_SUBGRAPH_URL[chainId],
        dtfQuery,
        {
          id: address.toLowerCase(),
        }
      )

      if (!dtf) return undefined

      const data: IndexDTF = {
        ...dtf,
        mintingFee: +formatEther(BigInt(dtf.mintingFee)),
        tvlFee: +formatEther(BigInt(dtf.tvlFee)),
        annualizedTvlFee: +formatEther(BigInt(dtf.annualizedTvlFee)),
        auctionDelay: Number(dtf.auctionDelay),
        auctionLength: Number(dtf.auctionLength),
      }

      return data
    },
    enabled: !!address,
  })
}

export default useIndexDTF
