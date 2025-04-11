import { INDEX_DTF_SUBGRAPH_URL } from '@/state/chain/atoms/chainAtoms'
import { IndexDTF } from '@/types'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { Address, formatEther } from 'viem'

type DTFQueryResponse = {
  dtf: {
    id: Address
    proxyAdmin: Address
    timestamp: number
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
    feeRecipients: string
    ownerGovernance?: {
      id: Address
      votingDelay: number
      votingPeriod: number
      proposalThreshold: number
      quorumNumerator: number
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
      proposalThreshold: number
      quorumNumerator: number
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
      governance?: {
        id: Address
        votingDelay: number
        votingPeriod: number
        proposalThreshold: number
        quorumNumerator: number
        timelock: {
          id: Address
          guardians: Address[]
          executionDelay: number
        }
      }
      rewards: {
        rewardToken: {
          address: Address
          name: string
          symbol: string
          decimals: number
        }
      }[]
    }
    totalRevenue: number
    protocolRevenue: number
    governanceRevenue: number
    externalRevenue: number
  }
}

const dtfQuery = gql`
  query getDTF($id: String!) {
    dtf(id: $id) {
      id
      proxyAdmin
      timestamp
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
      totalRevenue
      protocolRevenue
      governanceRevenue
      externalRevenue
      feeRecipients
      ownerGovernance {
        id
        votingDelay
        votingPeriod
        proposalThreshold
        quorumNumerator
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
        proposalThreshold
        quorumNumerator
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
        governance {
          id
          votingDelay
          votingPeriod
          proposalThreshold
          quorumNumerator
          timelock {
            id
            guardians
            executionDelay
          }
        }
        rewards(where: { active: true }) {
          rewardToken {
            address
            name
            symbol
            decimals
          }
        }
      }
    }
  }
`

const parseFeeRecipients = (raw: string) => {
  const recipients = raw.split(',').map((recipient) => {
    const [address, percentage] = recipient.split(':')
    return {
      address,
      percentage: formatEther(BigInt(percentage) * 100n),
    }
  })

  return recipients as { address: Address; percentage: string }[]
}

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
        chainId,
        mintingFee: +formatEther(BigInt(dtf.mintingFee)),
        tvlFee: +formatEther(BigInt(dtf.tvlFee)),
        annualizedTvlFee: +formatEther(BigInt(dtf.annualizedTvlFee)),
        auctionDelay: Number(dtf.auctionDelay),
        auctionLength: Number(dtf.auctionLength),
        feeRecipients: parseFeeRecipients(dtf.feeRecipients),
        stToken: dtf.stToken
          ? {
              ...dtf.stToken,
              rewardTokens:
                dtf.stToken?.rewards.map((reward) => reward.rewardToken) || [],
            }
          : undefined,
      }

      if (data.ownerGovernance) {
        data.ownerGovernance.proposalThreshold =
          data.ownerGovernance.proposalThreshold * 100
      }

      if (data.tradingGovernance) {
        data.tradingGovernance.proposalThreshold =
          data.tradingGovernance.proposalThreshold * 100
      }

      if (data.stToken?.governance) {
        data.stToken.governance.proposalThreshold =
          data.stToken.governance.proposalThreshold * 100
      }

      return data
    },
    enabled: !!address,
  })
}

export default useIndexDTF
