import { PartialProposal } from '@/lib/governance'
import { chainIdAtom, INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address, formatEther } from 'viem'
import { indexGovernanceOverviewAtom, refetchTokenAtom } from './atoms'

type Response = {
  governances: {
    proposals: PartialProposal[]
    proposalCount: number
  }[]
  ownerGovernance: {
    proposals: PartialProposal[]
    proposalCount: number
  }
  tradingGovernance?: {
    proposals: PartialProposal[]
    proposalCount: number
  }
  vaultGovernance?: {
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
  query getGovernanceStats($governanceIds: [String!]!, $stToken: String!) {
    governances(where: { id_in: $governanceIds }) {
      id
      proposals {
        id
        description
        creationTime
        state
        forWeightedVotes
        abstainWeightedVotes
        againstWeightedVotes
        executionETA
        executionTime
        quorumVotes
        voteStart
        voteEnd
        executionBlock
        creationBlock
        proposer {
          address
        }
      }
      proposalCount
    }
    stakingToken(id: $stToken) {
      id
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
  const refetchToken = useAtomValue(refetchTokenAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const { data } = useQuery({
    queryKey: ['governance-overview', dtf?.ownerGovernance?.id, refetchToken],
    queryFn: async () => {
      const data = await request<Response>(
        INDEX_DTF_SUBGRAPH_URL[chainId],
        query,
        {
          governanceIds: [
            dtf?.ownerGovernance?.id,
            ...(dtf?.legacyAdmins || []),
            dtf?.tradingGovernance?.id,
            ...(dtf?.legacyAuctionApprovers || []),
            dtf?.stToken?.governance?.id,
            ...(dtf?.stToken?.legacyGovernance || []),
          ],
          stToken: dtf?.stToken?.id ?? '',
        }
      )

      return {
        proposals: data.governances
          .flatMap((g) => g.proposals)
          .sort((a, b) => b.creationTime - a.creationTime),
        proposalCount: data.governances.reduce(
          (x, y) => x + Number(y.proposalCount),
          0
        ),
        delegates: data.stakingToken?.delegates ?? [],
        delegatesCount: +(data.stakingToken?.totalDelegates ?? 0),
        voteSupply: +formatEther(data.stakingToken?.token.totalSupply ?? 0n),
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
