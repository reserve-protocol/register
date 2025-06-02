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
      quorumDenominator: number
      timelock: {
        id: Address
        guardians: Address[]
        executionDelay: number
      }
    }
    legacyAdmins: Address[]
    tradingGovernance?: {
      id: Address
      votingDelay: number
      votingPeriod: number
      proposalThreshold: number
      quorumNumerator: number
      quorumDenominator: number
      timelock: {
        id: Address
        guardians: Address[]
        executionDelay: number
      }
    }
    legacyAuctionApprovers: Address[]
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
        quorumDenominator: number
        timelock: {
          id: Address
          guardians: Address[]
          executionDelay: number
        }
      }
      legacyGovernance: Address[]
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
        quorumDenominator
        timelock {
          id
          guardians
          executionDelay
        }
      }
      legacyAdmins
      tradingGovernance {
        id
        votingDelay
        votingPeriod
        proposalThreshold
        quorumNumerator
        quorumDenominator
        timelock {
          id
          guardians
          executionDelay
        }
      }
      legacyAuctionApprovers
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
          quorumDenominator
          timelock {
            id
            guardians
            executionDelay
          }
        }
        legacyGovernance
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
  if (!raw) {
    return []
  }
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
        ownerGovernance: dtf.ownerGovernance
          ? {
              ...dtf.ownerGovernance,
              quorum:
                (dtf.ownerGovernance.quorumNumerator /
                  dtf.ownerGovernance.quorumDenominator) *
                100,
            }
          : undefined,
        tradingGovernance: dtf.tradingGovernance
          ? {
              ...dtf.tradingGovernance,
              quorum:
                (dtf.tradingGovernance.quorumNumerator /
                  dtf.tradingGovernance.quorumDenominator) *
                100,
            }
          : undefined,
        stToken: dtf.stToken
          ? {
              ...dtf.stToken,
              rewardTokens:
                dtf.stToken?.rewards.map((reward) => reward.rewardToken) || [],
              governance: dtf.stToken.governance
                ? {
                    ...dtf.stToken.governance,
                    quorum:
                      (dtf.stToken.governance.quorumNumerator /
                        dtf.stToken.governance.quorumDenominator) *
                      100,
                  }
                : undefined,
            }
          : undefined,
      }

      if (data.ownerGovernance) {
        data.ownerGovernance.proposalThreshold =
          data.ownerGovernance.proposalThreshold * 100
        data.ownerGovernance.quorum =
          (data.ownerGovernance.quorumNumerator /
            data.ownerGovernance.quorumDenominator) *
          100
      }

      if (data.tradingGovernance) {
        data.tradingGovernance.proposalThreshold =
          data.tradingGovernance.proposalThreshold * 100
        data.tradingGovernance.quorum =
          (data.tradingGovernance.quorumNumerator /
            data.tradingGovernance.quorumDenominator) *
          100
      }

      if (data.stToken?.governance) {
        data.stToken.governance.proposalThreshold =
          data.stToken.governance.proposalThreshold * 100
        data.stToken.governance.quorum =
          (data.stToken.governance.quorumNumerator /
            data.stToken.governance.quorumDenominator) *
          100
      }

      return data
    },
    enabled: !!address,
  })
}

export default useIndexDTF
