import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ChainId } from 'utils/chains'
import { supportedChainList } from 'utils/constants'
import { getAddress } from 'viem'
import { getProposalState } from '@/views/yield-dtf/governance/views/proposal-detail/atom'
import { useBlockNumber } from 'wagmi'
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
      abstainWeightedVotes
      quorumVotes
      startBlock
      endBlock
      executionETA
      governanceFramework {
        name
      }
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

const useBlockChains = () => {
  const { data: mainnet } = useBlockNumber({ chainId: ChainId.Mainnet })
  const { data: base } = useBlockNumber({ chainId: ChainId.Base })
  const { data: arbitrum } = useBlockNumber({ chainId: ChainId.Arbitrum })

  return {
    [ChainId.Mainnet]: Number(mainnet),
    [ChainId.Base]: Number(base),
    [ChainId.Arbitrum]: Number(arbitrum),
  }
}

const useProposalsData = () => {
  const blocks = useBlockChains()
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
              state,
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
