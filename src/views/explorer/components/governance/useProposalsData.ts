import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { publicClient } from 'state/chain'
import { atomWithLoadable } from 'utils/atoms/utils'
import { supportedChainList } from 'utils/constants'
import { getAddress } from 'viem'
import {
  getProposalState,
  getProposalStatus,
} from 'views/governance/views/proposal-detail/atom'
import { filtersAtom } from './atoms'

const explorerProposalsQuery = gql`
  query getAllProposals {
    proposals(orderBy: creationTime, orderDirection: desc) {
      id
      description
      creationTime
      state
      governance
      forWeightedVotes
      againstWeightedVotes
      quorumVotes
      startBlock
      endBlock
      governance {
        rToken {
          id
          token {
            symbol
          }
        }
      }
    }
  }
`

export interface ProposalRecord {
  id: string
  description: string
  creationTime: string
  state: string
  governance: string
  forWeightedVotes: string
  againstWeightedVotes: string
  quorumVotes: string
  startBlock: string
  endBlock: string
  status: string
  rTokenAddress: string
  rTokenSymbol: string
  chain: number
}

const chainBlocksAtom = atomWithLoadable(async () => {
  const result = await Promise.all(
    supportedChainList.map((chain) =>
      publicClient({ chainId: chain }).getBlockNumber()
    )
  )

  return supportedChainList.reduce((acc, chain, index) => {
    acc[chain] = Number(result[index])
    return acc
  }, {} as Record<number, number>)
})

const useProposalsData = () => {
  const blocks = useAtomValue(chainBlocksAtom)
  const filters = useAtomValue(filtersAtom)
  const { data } = useMultichainQuery(explorerProposalsQuery)

  return useMemo(() => {
    if (!data) return []

    const proposals: ProposalRecord[] = []

    for (const chain of supportedChainList) {
      if (data[chain]) {
        proposals.push(
          ...data[chain].proposals.map((entry: any) => {
            const state = getProposalState(entry, blocks?.[chain] || 0, chain)

            return {
              ...entry,
              status: state.state,
              chain,
              rTokenAddress: getAddress(entry.governance.rToken.id),
              rTokenSymbol: entry.governance.rToken.token.symbol,
            }
          })
        )
      }
    }

    if (filters.tokens.length || filters.status.length) {
      return proposals.filter((proposal) => {
        return (
          (!filters.tokens.length ||
            filters.tokens.includes(proposal.rTokenAddress.toLowerCase())) &&
          (!filters.status.length || filters.status.includes(proposal.status))
        )
      })
    }

    return proposals
  }, [data, blocks, filters])
}

export default useProposalsData
