import useIndexDTFList from '@/hooks/useIndexDTFList'
import { getProposalState as getIndexProposalState } from '@/lib/governance'
import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { getProposalState as getYieldProposalState } from '@/views/yield-dtf/governance/views/proposal-detail/atom'
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/use-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ChainId } from 'utils/chains'
import { LISTED_RTOKEN_ADDRESSES, supportedChainList } from 'utils/constants'
import { Address, formatEther, getAddress, zeroAddress } from 'viem'
import { useBlockNumber } from 'wagmi'
import { type ProposalRecord, filtersAtom } from './atoms'

// Re-export for consumers
export type { ProposalRecord } from './atoms'

// --- Yield DTF query ---

const yieldProposalsQuery = gql`
  query getAllProposals {
    proposals(orderBy: creationTime, orderDirection: desc, first: 1000) {
      id
      description
      creationTime
      state
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

// --- Index DTF queries ---

const indexProposalsQuery = gql`
  query getAllIndexProposals {
    proposals(orderBy: creationTime, orderDirection: desc, first: 1000) {
      id
      description
      creationTime
      state
      forWeightedVotes
      againstWeightedVotes
      abstainWeightedVotes
      quorumVotes
      voteStart
      voteEnd
      executionETA
      governance {
        id
      }
    }
  }
`

// Query governance IDs for whitelisted DTFs only
const indexDtfGovernanceQuery = gql`
  query getDTFGovernance($ids: [String!]!) {
    dtfs(where: { id_in: $ids }, first: 1000) {
      id
      ownerGovernance {
        id
      }
      tradingGovernance {
        id
      }
    }
  }
`

type IndexDTFGovernanceResponse = {
  dtfs: {
    id: Address
    ownerGovernance?: { id: string }
    tradingGovernance?: { id: string }
  }[]
}

type IndexProposalsResponse = {
  proposals: {
    id: string
    description: string
    creationTime: string
    state: string
    forWeightedVotes: string
    againstWeightedVotes: string
    abstainWeightedVotes: string
    quorumVotes: string
    voteStart: string
    voteEnd: string
    executionETA?: string
    governance: { id: string }
  }[]
}

const INDEX_DTF_CHAINS = [ChainId.Mainnet, ChainId.Base, ChainId.BSC] as const

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

type DTFInfo = {
  address: Address
  symbol: string
  logo?: string
}

const useIndexDTFProposals = () => {
  const { data: dtfList } = useIndexDTFList()

  // Build per-chain address lists from whitelisted DTFs
  const dtfsByChain = useMemo(() => {
    if (!dtfList) return null

    const byChain: Record<number, string[]> = {}
    for (const chainId of INDEX_DTF_CHAINS) {
      byChain[chainId] = dtfList
        .filter((dtf) => dtf.chainId === chainId)
        .map((dtf) => dtf.address.toLowerCase())
    }
    return byChain
  }, [dtfList])

  // Build address → DTF info lookup from the API list (has logo, symbol)
  const dtfInfoMap = useMemo(() => {
    if (!dtfList) return null

    const map = new Map<string, DTFInfo>()
    for (const dtf of dtfList) {
      map.set(dtf.address.toLowerCase(), {
        address: getAddress(dtf.address),
        symbol: dtf.symbol,
        logo: dtf.brand?.icon,
      })
    }
    return map
  }, [dtfList])

  return useQuery({
    queryKey: ['explorer-index-dtf-proposals', dtfsByChain],
    queryFn: async () => {
      if (!dtfsByChain || !dtfInfoMap) return null

      const results = await Promise.all(
        INDEX_DTF_CHAINS.map(async (chainId) => {
          const client = INDEX_GRAPH_CLIENTS[chainId]
          const addresses = dtfsByChain[chainId]
          if (!client || !addresses?.length) {
            return { chainId, proposals: [], governanceToDTF: new Map<string, DTFInfo>() }
          }

          // Fetch proposals + governance IDs for whitelisted DTFs in parallel
          const [proposalsRes, governanceRes] = await Promise.all([
            client.request<IndexProposalsResponse>(indexProposalsQuery),
            client.request<IndexDTFGovernanceResponse>(indexDtfGovernanceQuery, {
              ids: addresses,
            }),
          ])

          // Build governance ID → DTF info lookup
          const governanceToDTF = new Map<string, DTFInfo>()
          for (const dtf of governanceRes.dtfs) {
            const info = dtfInfoMap.get(dtf.id.toLowerCase())
            if (!info) continue

            if (dtf.ownerGovernance?.id) {
              governanceToDTF.set(dtf.ownerGovernance.id.toLowerCase(), info)
            }
            if (dtf.tradingGovernance?.id) {
              governanceToDTF.set(dtf.tradingGovernance.id.toLowerCase(), info)
            }
          }

          return {
            chainId,
            proposals: proposalsRes.proposals,
            governanceToDTF,
          }
        })
      )

      return results
    },
    enabled: !!dtfsByChain && !!dtfInfoMap,
    staleTime: 1000 * 60 * 5,
  })
}

const useProposalsData = () => {
  const blocks = useBlockChains()
  const filters = useAtomValue(filtersAtom)
  const { data: yieldData } = useMultichainQuery(yieldProposalsQuery)
  const { data: indexData } = useIndexDTFProposals()

  return useMemo(() => {
    const proposals: ProposalRecord[] = []

    // --- Yield DTF proposals ---
    if (yieldData && filters.type !== 'index') {
      for (const chain of supportedChainList) {
        if (!yieldData[chain]?.proposals) continue

        const listedAddresses = LISTED_RTOKEN_ADDRESSES[chain] || []

        for (const entry of yieldData[chain].proposals) {
          const rToken = entry.governance?.rToken
          if (!rToken?.id) continue

          // Only show proposals from listed yield DTFs
          if (!listedAddresses.includes(rToken.id.toLowerCase())) continue

          const state = getYieldProposalState(
            entry,
            blocks?.[chain] || 0,
            chain
          )

          proposals.push({
            id: entry.id,
            description: entry.description,
            creationTime: entry.creationTime,
            governance: rToken.id,
            forWeightedVotes: entry.forWeightedVotes,
            againstWeightedVotes: entry.againstWeightedVotes,
            quorumVotes: entry.quorumVotes,
            status: state.state,
            votingState: state,
            chain,
            tokenAddress: getAddress(rToken.id),
            tokenSymbol: rToken.token?.symbol || 'Unknown',
            type: 'yield',
          })
        }
      }
    }

    // --- Index DTF proposals (whitelisted only) ---
    if (indexData && filters.type !== 'yield') {
      for (const result of indexData) {
        for (const entry of result.proposals) {
          const govId = entry.governance.id.toLowerCase()
          const dtfInfo = result.governanceToDTF.get(govId)

          // Skip proposals not belonging to a whitelisted DTF
          if (!dtfInfo) continue

          const normalized = {
            id: entry.id,
            timelockId: '',
            description: entry.description,
            state: entry.state,
            creationTime: +entry.creationTime,
            creationBlock: 0,
            voteStart: +entry.voteStart,
            voteEnd: +entry.voteEnd,
            forWeightedVotes: +formatEther(BigInt(entry.forWeightedVotes)),
            againstWeightedVotes: +formatEther(
              BigInt(entry.againstWeightedVotes)
            ),
            abstainWeightedVotes: +formatEther(
              BigInt(entry.abstainWeightedVotes)
            ),
            quorumVotes: +formatEther(BigInt(entry.quorumVotes)),
            executionETA: entry.executionETA
              ? +entry.executionETA
              : undefined,
            proposer: { address: zeroAddress },
          }

          const state = getIndexProposalState(normalized)

          proposals.push({
            id: entry.id,
            description: entry.description,
            creationTime: entry.creationTime,
            governance: govId,
            forWeightedVotes: entry.forWeightedVotes,
            againstWeightedVotes: entry.againstWeightedVotes,
            quorumVotes: entry.quorumVotes,
            status: state.state,
            votingState: state,
            chain: result.chainId,
            tokenAddress: dtfInfo.address,
            tokenSymbol: dtfInfo.symbol,
            tokenLogo: dtfInfo.logo,
            type: 'index',
          })
        }
      }
    }

    // Apply filters
    return proposals.filter((proposal) => {
      if (
        filters.tokens.length &&
        !filters.tokens.includes(proposal.tokenAddress.toLowerCase())
      ) {
        return false
      }
      if (
        filters.status.length &&
        !filters.status.includes(proposal.status)
      ) {
        return false
      }
      return true
    })
  }, [yieldData, indexData, blocks, filters])
}

export default useProposalsData
