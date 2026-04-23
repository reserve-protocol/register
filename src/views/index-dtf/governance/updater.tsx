import { PartialProposal } from '@/lib/governance'
import { chainIdAtom, INDEX_DTF_SUBGRAPH_URL } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useQuery } from '@tanstack/react-query'
import request, { gql } from 'graphql-request'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { Address, formatEther } from 'viem'
import { indexGovernanceOverviewAtom, refetchTokenAtom } from './atoms'
import {
  getDTFSettingsGovernance,
  getGovernanceVoteTokenAddress,
} from './governance-helpers'
import { useGovernanceTokenSupply } from './hooks/use-governance-token-supply'

type Response = {
  governances: {
    id: string
    proposals: PartialProposal[]
    proposalCount: string
    token?: {
      totalDelegates: string
      token: {
        totalSupply: string
      }
      delegates: {
        address: Address
        delegatedVotes: string
        numberVotes: string
      }[]
    }
  }[]
}

const query = gql`
  query getGovernanceStats($governanceIds: [String!]!) {
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
      token {
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
  const primaryGovernanceId = getDTFSettingsGovernance(dtf)?.id
  const primaryVoteTokenAddress = getGovernanceVoteTokenAddress(
    getDTFSettingsGovernance(dtf),
    dtf?.stToken?.id
  )
  const { voteSupply } = useGovernanceTokenSupply(primaryVoteTokenAddress)

  const { data } = useQuery({
    queryKey: ['governance-overview', dtf?.id, primaryGovernanceId, refetchToken],
    queryFn: async () => {
      const governanceIds = Array.from(
        new Set(
          [
            dtf?.ownerGovernance?.id,
            ...(dtf?.legacyAdmins || []),
            dtf?.tradingGovernance?.id,
            ...(dtf?.legacyAuctionApprovers || []),
            dtf?.stToken?.governance?.id,
            ...(dtf?.stToken?.legacyGovernance || []),
          ].filter(Boolean)
        )
      )

      const data = await request<Response>(
        INDEX_DTF_SUBGRAPH_URL[chainId],
        query,
        {
          governanceIds,
        }
      )

      const primaryGovernance = data.governances.find(
        (governance) =>
          governance.id.toLowerCase() === primaryGovernanceId?.toLowerCase()
      )

      return {
        proposals: data.governances
          .flatMap((g) =>
            g.proposals.map((proposal) => ({
              ...proposal,
              governor: g.id as Address,
            }))
          )
          .sort((a, b) => b.creationTime - a.creationTime),
        proposalCount: data.governances.reduce(
          (count, governance) => count + Number(governance.proposalCount),
          0
        ),
        delegates:
          primaryGovernance?.token?.delegates.map((delegate) => ({
            ...delegate,
            delegatedVotes: Number(delegate.delegatedVotes),
            numberVotes: Number(delegate.numberVotes),
          })) ?? [],
        delegatesCount: Number(primaryGovernance?.token?.totalDelegates ?? 0),
        voteSupply: +formatEther(
          BigInt(primaryGovernance?.token?.token.totalSupply ?? '0')
        ),
      }
    },
    enabled: !!primaryGovernanceId,
    refetchInterval: 1000 * 60 * 10, // 10 minutes
  })

  useEffect(() => {
    if (data) {
      setGovernanceOverview({
        ...data,
        voteSupply: voteSupply ?? data.voteSupply,
      })
    } else {
      setGovernanceOverview(undefined)
    }
  }, [data, voteSupply])

  return null
}

export default Updater
