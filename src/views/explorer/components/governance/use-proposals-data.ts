import useIndexDTFList from '@/hooks/useIndexDTFList'
import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { getProposalState as getYieldProposalState } from '@/views/yield-dtf/governance/views/proposal-detail/atom'
import {
  getProposalState as getSdkProposalState,
  type Amount,
} from '@reserve-protocol/react-sdk'
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/use-query'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { walletAtom } from 'state/atoms'
import { getCurrentTime } from 'utils'
import { ChainId } from 'utils/chains'
import {
  INDEX_DTF_CHAINS,
  LISTED_RTOKEN_ADDRESSES,
  supportedChainList,
} from 'utils/constants'
import { Address, formatEther, getAddress, zeroAddress } from 'viem'
import { useBlockNumber } from 'wagmi'
import { type ProposalRecord, filtersAtom } from './atoms'

// Re-export for consumers
export type { ProposalRecord } from './atoms'

// --- Yield DTF query ---

const yieldProposalsQuery = gql`
  query getAllProposals($voter: String!) {
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
      votes(where: { voter_: { address: $voter } }) {
        choice
      }
    }
  }
`

// --- Index DTF queries ---

const indexProposalsQuery = gql`
  query getAllIndexProposals(
    $voter: String!
    $governanceIds: [String!]!
    $skip: Int!
  ) {
    proposals(
      where: { governance_in: $governanceIds }
      orderBy: creationTime
      orderDirection: desc
      first: 1000
      skip: $skip
    ) {
      id
      description
      creationTime
      state
      isOptimistic
      vetoThreshold
      vetoThresholdVotes
      optimisticSnapshotSupply
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
      votes(where: { voter_: { address: $voter } }) {
        choice
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
      stToken {
        governance {
          id
        }
        legacyGovernance
      }
      legacyTradingGovernances {
        id
      }
      legacyAdminGovernances {
        id
      }
    }
  }
`

type GovernanceReference = { id: string }

type IndexDTFGovernanceRecord = {
  id: Address
  ownerGovernance?: GovernanceReference
  tradingGovernance?: GovernanceReference
  stToken?: {
    governance?: GovernanceReference
    legacyGovernance?: string[]
  }
  legacyTradingGovernances?: GovernanceReference[]
  legacyAdminGovernances?: GovernanceReference[]
}

type IndexDTFGovernanceResponse = {
  dtfs: IndexDTFGovernanceRecord[]
}

export const getGovernanceIds = (dtf: IndexDTFGovernanceRecord): string[] => {
  const governanceIds = [
    dtf.ownerGovernance?.id,
    dtf.tradingGovernance?.id,
    dtf.stToken?.governance?.id,
    ...(dtf.stToken?.legacyGovernance ?? []),
    ...(dtf.legacyTradingGovernances ?? []).map(({ id }) => id),
    ...(dtf.legacyAdminGovernances ?? []).map(({ id }) => id),
  ].filter((id): id is string => !!id)

  return [...new Set(governanceIds.map((id) => id.toLowerCase()))]
}

// A staking-token governance can be shared by several listed DTFs.
export const getGovernanceToDTFs = (
  dtfs: IndexDTFGovernanceRecord[],
  dtfInfoMap: Map<string, DTFInfo>
): Map<string, DTFInfo[]> => {
  const governanceToDTFs = new Map<string, DTFInfo[]>()
  for (const dtf of dtfs) {
    const info = dtfInfoMap.get(dtf.id.toLowerCase())
    if (!info) continue

    for (const governanceId of getGovernanceIds(dtf)) {
      const infos = governanceToDTFs.get(governanceId) ?? []
      infos.push(info)
      governanceToDTFs.set(governanceId, infos)
    }
  }
  return governanceToDTFs
}

type IndexProposalsResponse = {
  proposals: {
    id: string
    description: string
    creationTime: string
    state: string
    isOptimistic?: boolean
    vetoThreshold?: string | null
    vetoThresholdVotes?: string | null
    optimisticSnapshotSupply?: string | null
    forWeightedVotes: string
    againstWeightedVotes: string
    abstainWeightedVotes: string
    quorumVotes: string
    voteStart: string
    voteEnd: string
    executionETA?: string
    governance: { id: string }
    votes: { choice: string }[]
  }[]
}

const amountFromRaw = (value: string): Amount => {
  const raw = BigInt(value)

  return { raw, formatted: formatEther(raw) }
}

const isIntegerString = (value: string | null | undefined): value is string =>
  typeof value === 'string' && /^\d+$/.test(value)

const MAX_UINT256 = (1n << 256n) - 1n

const getOptimisticContext = (
  proposal: IndexProposalsResponse['proposals'][number]
) => {
  if (!proposal.isOptimistic) return undefined

  const { vetoThreshold, vetoThresholdVotes, optimisticSnapshotSupply } =
    proposal
  if (
    !isIntegerString(vetoThreshold) ||
    !isIntegerString(vetoThresholdVotes) ||
    !isIntegerString(optimisticSnapshotSupply)
  ) {
    return undefined
  }

  return {
    snapshotSupply: amountFromRaw(optimisticSnapshotSupply),
    vetoThreshold: BigInt(vetoThreshold),
    vetoThresholdVotes: amountFromRaw(vetoThresholdVotes),
  }
}

export const getIndexProposalState = (
  proposal: IndexProposalsResponse['proposals'][number],
  timestamp = getCurrentTime()
) => {
  const optimistic = getOptimisticContext(proposal)
  const transitioned =
    isIntegerString(proposal.vetoThreshold) &&
    BigInt(proposal.vetoThreshold) === MAX_UINT256

  // Do not let an incomplete optimistic row fall through to the SDK's
  // context-less fallback; it cannot determine the veto outcome safely.
  if (proposal.isOptimistic && !optimistic && !transitioned) return undefined

  return getSdkProposalState(
    {
      state: proposal.state,
      isOptimistic: proposal.isOptimistic,
      voteStart: +proposal.voteStart,
      voteEnd: +proposal.voteEnd,
      forWeightedVotes: amountFromRaw(proposal.forWeightedVotes),
      againstWeightedVotes: amountFromRaw(proposal.againstWeightedVotes),
      abstainWeightedVotes: amountFromRaw(proposal.abstainWeightedVotes),
      quorumVotes: amountFromRaw(proposal.quorumVotes),
      executionETA: proposal.executionETA ? +proposal.executionETA : undefined,
      ...(proposal.vetoThreshold && isIntegerString(proposal.vetoThreshold)
        ? { vetoThreshold: BigInt(proposal.vetoThreshold) }
        : {}),
      ...(optimistic ? { optimistic } : {}),
    },
    timestamp
  )
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

type DTFInfo = {
  address: Address
  symbol: string
  logo?: string
}

const useIndexDTFProposals = () => {
  const { data: dtfList } = useIndexDTFList()
  const account = useAtomValue(walletAtom)

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
    queryKey: ['explorer-index-dtf-proposals', dtfsByChain, account],
    queryFn: async () => {
      if (!dtfsByChain || !dtfInfoMap) return null

      const results = await Promise.all(
        INDEX_DTF_CHAINS.map(async (chainId) => {
          const client = INDEX_GRAPH_CLIENTS[chainId]
          const addresses = dtfsByChain[chainId]
          if (!client || !addresses?.length) {
            return {
              chainId,
              proposals: [],
              governanceToDTFs: new Map<string, DTFInfo[]>(),
            }
          }

          // Resolve every governance attached to each listed DTF before fetching
          // proposals. Proposals can belong to the staking-token governor or to
          // a legacy governor, not only the current owner/trading governors.
          const governanceRes =
            await client.request<IndexDTFGovernanceResponse>(
              indexDtfGovernanceQuery,
              { ids: addresses }
            )

          const governanceToDTFs = getGovernanceToDTFs(
            governanceRes.dtfs ?? [],
            dtfInfoMap
          )
          const governanceIds = [...governanceToDTFs.keys()]
          const proposals: IndexProposalsResponse['proposals'] = []

          // Filter at the subgraph and paginate so unrelated DTF history cannot
          // consume the endpoint's first-page limit.
          for (let skip = 0; governanceIds.length; skip += 1000) {
            const proposalsRes = await client.request<IndexProposalsResponse>(
              indexProposalsQuery,
              {
                voter: account?.toLowerCase() ?? zeroAddress,
                governanceIds,
                skip,
              }
            )
            proposals.push(...proposalsRes.proposals)
            if (proposalsRes.proposals.length < 1000) break
          }

          return {
            chainId,
            proposals,
            governanceToDTFs,
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
  const account = useAtomValue(walletAtom)
  const { data: yieldData } = useMultichainQuery(yieldProposalsQuery, {
    voter: account?.toLowerCase() ?? zeroAddress,
  })
  const { data: indexData } = useIndexDTFProposals()

  return useMemo(() => {
    const proposals: ProposalRecord[] = []
    const timestamp = getCurrentTime()

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
            userVote: entry.votes?.[0]?.choice ?? null,
            governance: rToken.id,
            forWeightedVotes: entry.forWeightedVotes,
            againstWeightedVotes: entry.againstWeightedVotes,
            quorumVotes: entry.quorumVotes,
            status: state.state,
            votingEndsIn: +entry.endBlock - timestamp,
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
        for (const entry of result.proposals ?? []) {
          const govId = entry.governance.id.toLowerCase()
          const dtfInfos = result.governanceToDTFs.get(govId)

          // Skip proposals not belonging to a whitelisted DTF
          if (!dtfInfos) continue

          const state = getIndexProposalState(entry)
          if (!state) continue

          // Shared governance renders once, under the filtered DTF when there is one.
          const dtfInfo =
            dtfInfos.find((info) =>
              filters.tokens.includes(info.address.toLowerCase())
            ) ?? dtfInfos[0]

          proposals.push({
            id: entry.id,
            description: entry.description,
            creationTime: entry.creationTime,
            userVote: entry.votes?.[0]?.choice ?? null,
            governance: govId,
            forWeightedVotes: entry.forWeightedVotes,
            againstWeightedVotes: entry.againstWeightedVotes,
            quorumVotes: entry.quorumVotes,
            status: state.state,
            votingEndsIn: +entry.voteEnd - timestamp,
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
      if (filters.status.length && !filters.status.includes(proposal.status)) {
        return false
      }
      return true
    })
  }, [yieldData, indexData, blocks, filters])
}

export default useProposalsData
