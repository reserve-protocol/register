import { PartialProposal } from '@/lib/governance'
import { INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address, formatUnits } from 'viem'
import { indexGovernanceOverviewAtom } from './atoms'

type Response = {
  ownerGovernance: {
    proposals: PartialProposal[]
    proposalCount: number
  }
  tradingGovernance?: {
    proposals: PartialProposal[]
    proposalCount: number
  }
  stakingToken?: {
    totalDelegates: number
    token: {
      decimals: number
      totalSupply: bigint
    }
    delegates: {
      address: Address
      delegatedVotes: number
      numberVotes: number
    }[]
  }
}

const query = gql`
  query getGovernanceStats(
    $ownerGovernance: String!
    $tradingGovernance: String!
    $stToken: String!
  ) {
    ownerGovernance: governance(id: $ownerGovernance) {
      proposals {
        id
        description
        creationTime
        state
        forWeightedVotes
        abstainWeightedVotes
        againstWeightedVotes
        executionETA
        quorumVotes
        voteStart
        voteEnd
      }
      proposalCount
    }
    tradingGovernance: governance(id: $tradingGovernance) {
      proposals {
        id
        description
        creationTime
        state
        forWeightedVotes
        abstainWeightedVotes
        againstWeightedVotes
        executionETA
        quorumVotes
        voteStart
        voteEnd
      }
      proposalCount
    }
    stakingToken(id: $stToken) {
      totalDelegates
      token {
        totalSupply
      }
      delegates(
        first: 10
        orderBy: delegatedVotes
        orderDirection: desc
        where: { address_not: "0x0000000000000000000000000000000000000000" }
      ) {
        address
        delegatedVotes
        numberVotes
      }
    }
  }
`

// TODO: Multichain
// TODO: This updater assumes that DTF share same stToken between owner and trading
// TODO: Maybe move this updater to the top of the context? and reset on token change
const Updater = () => {
  const setGovernanceOverview = useSetAtom(indexGovernanceOverviewAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const { data } = useQuery({
    queryKey: ['governance-overview', dtf?.ownerGovernance?.id],
    queryFn: async () => {
      const data = await request<Response>(
        INDEX_DTF_SUBGRAPH_URL[ChainId.Base],
        query,
        {
          ownerGovernance: dtf?.ownerGovernance?.id ?? '',
          tradingGovernance: dtf?.tradingGovernance?.id ?? '',
          stToken: dtf?.stToken?.id ?? '',
        }
      )

      return {
        proposals: [
          ...(data.ownerGovernance.proposals ?? []),
          ...(data.tradingGovernance?.proposals ?? []),
        ],
        proposalCount:
          +data.ownerGovernance.proposalCount +
          +(data.tradingGovernance?.proposalCount ?? 0),
        delegates: data.stakingToken?.delegates ?? [],
        delegatesCount: +(data.stakingToken?.totalDelegates ?? 0),
        voteSupply: data.stakingToken?.token.totalSupply
          ? +formatUnits(
              data.stakingToken.token.totalSupply,
              data.stakingToken.token.decimals
            )
          : 0,
      }
    },
    enabled: !!dtf?.ownerGovernance?.id && !!dtf?.stToken?.id,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  })

  useEffect(() => {
    if (data) {
      setGovernanceOverview(data)
    } else {
      setGovernanceOverview(undefined)
    }
  }, [data])

  return null
}

export default Updater
