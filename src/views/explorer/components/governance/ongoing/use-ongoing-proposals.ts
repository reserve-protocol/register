import {
  getProposalState,
  useIndexDtfProposals,
  type IndexDtfProposalSummary,
  type ProposalState,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import useIndexDTFList, { type IndexDTFItem } from 'hooks/useIndexDTFList'
import { useAssetPrices } from 'hooks/usePrices'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { timestampAtom } from 'state/chain/atoms/chainAtoms'
import { INDEX_GRAPH_CLIENTS } from 'state/chain/atoms/chainAtoms'
import { type AssetPrice } from 'types/prices'
import { INDEX_DTF_CHAINS, isSelfAppreciatingVoteLock } from 'utils/constants'
import { type Address, type Hex } from 'viem'
import { calculateProposalGaps, classifyProposal } from './utils'

const RESULT_LIMIT = 1000
const GOVERNANCE_LIMIT = 100
const REFRESH_INTERVAL = 60_000
const MAINNET_CHAIN = INDEX_DTF_CHAINS[0] as SupportedChainId
const BASE_CHAIN = INDEX_DTF_CHAINS[1] as SupportedChainId
const BSC_CHAIN = INDEX_DTF_CHAINS[2] as SupportedChainId

type GovernanceRef = {
  id: Address
  timelock: { id: Address } | null
}

type GovernanceDtf = {
  id: Address
  proxyAdmin: Address | null
  legacyAdmins: Address[]
  legacyAuctionApprovers: Address[]
  ownerGovernance: GovernanceRef | null
  tradingGovernance: GovernanceRef | null
  stToken: {
    id: Address
    legacyGovernance: Address[]
    token: {
      id: Address
      symbol: string
      decimals: number
    }
    underlying: {
      id: Address
      symbol: string
      decimals: number
    }
    governance: GovernanceRef | null
  }
}

type ProposalEnrichment = {
  id: string
  governance: { id: Address }
  proposer: { address: Address }
  targets: Address[]
  calldatas: Hex[]
  votes: { voter: { address: Address } }[]
}

type GovernedDtf = Pick<
  IndexDTFItem,
  'address' | 'brand' | 'name' | 'status' | 'symbol'
> & {
  trustedTargets: Address[]
  voteToken: GovernanceDtf['stToken']['token']
  underlyingToken: GovernanceDtf['stToken']['underlying']
}

type ChainEnrichment = {
  governanceIds: Address[]
  dtfsByGovernance: Map<string, GovernedDtf[]>
  proposalByKey: Map<string, ProposalEnrichment>
  truncated: boolean
}

export type OngoingProposal = {
  id: string
  chainId: SupportedChainId
  governance: Address
  description: string
  state: ProposalState
  voteStart: number
  voteEnd: number
  isOptimistic: boolean
  hasVotes: boolean
  proposerVoted?: boolean
  category?: ReturnType<typeof classifyProposal>
  dtfs: GovernedDtf[]
  primaryDtf: GovernedDtf
  voteToken?: {
    address: Address
    symbol: string
    decimals: number
    price?: number
  }
  gaps: ReturnType<typeof calculateProposalGaps>
}

export type OngoingProposalData = {
  proposals: OngoingProposal[]
  isLoading: boolean
  errors: (
    | { type: 'discovery' }
    | { type: 'chain'; chainId: SupportedChainId }
  )[]
  warnings: ('proposal-limit' | 'governance-limit')[]
}

const dtfGovernanceQuery = gql`
  query GetOngoingGovernanceDtfs($ids: [String!]!) {
    dtfs(first: 1000, where: { id_in: $ids }) {
      id
      proxyAdmin
      legacyAdmins
      legacyAuctionApprovers
      ownerGovernance {
        id
        timelock {
          id
        }
      }
      tradingGovernance {
        id
        timelock {
          id
        }
      }
      stToken {
        id
        legacyGovernance
        token {
          id
          symbol
          decimals
        }
        underlying {
          id
          symbol
          decimals
        }
        governance {
          id
          timelock {
            id
          }
        }
      }
    }
  }
`

const proposalEnrichmentQuery = gql`
  query GetOngoingGovernanceEnrichment(
    $governanceIds: [String!]!
    $now: BigInt!
  ) {
    proposals(
      first: 1000
      orderBy: creationTime
      orderDirection: desc
      where: {
        governance_in: $governanceIds
        state_in: [PENDING, ACTIVE]
        voteEnd_gt: $now
      }
    ) {
      id
      governance {
        id
      }
      proposer {
        address
      }
      targets
      calldatas
      votes(first: 1000) {
        voter {
          address
        }
      }
    }
  }
`

const proposalKey = (
  chainId: SupportedChainId,
  governance: string,
  proposalId: string
) => `${chainId}:${governance.toLowerCase()}:${proposalId}`

const governanceRefs = (dtf: GovernanceDtf) => [
  dtf.ownerGovernance,
  dtf.tradingGovernance,
  dtf.stToken.governance,
]

const uniqueAddresses = (addresses: (Address | null | undefined)[]) =>
  [
    ...new Set(
      addresses.filter(Boolean).map((address) => address!.toLowerCase())
    ),
  ] as Address[]

const buildGovernedDtf = (
  dtf: GovernanceDtf,
  identity: IndexDTFItem
): GovernedDtf => ({
  address: identity.address,
  brand: identity.brand,
  name: identity.name,
  status: identity.status,
  symbol: identity.symbol,
  trustedTargets: uniqueAddresses([
    identity.address,
    dtf.proxyAdmin,
    dtf.stToken.id,
    ...governanceRefs(dtf).flatMap((governance) =>
      governance ? [governance.id, governance.timelock?.id] : []
    ),
    ...dtf.legacyAdmins,
    ...dtf.legacyAuctionApprovers,
    ...dtf.stToken.legacyGovernance,
  ]),
  voteToken: dtf.stToken.token,
  underlyingToken: dtf.stToken.underlying,
})

const fetchChainEnrichment = async (
  chainId: SupportedChainId,
  identities: IndexDTFItem[],
  timestamp: number
): Promise<ChainEnrichment> => {
  if (!identities.length) {
    return {
      governanceIds: [],
      dtfsByGovernance: new Map(),
      proposalByKey: new Map(),
      truncated: false,
    }
  }

  const { dtfs } = await INDEX_GRAPH_CLIENTS[chainId].request<{
    dtfs: GovernanceDtf[]
  }>(dtfGovernanceQuery, {
    ids: identities.map((dtf) => dtf.address.toLowerCase()),
  })

  const identityByAddress = new Map(
    identities.map((dtf) => [dtf.address.toLowerCase(), dtf])
  )
  const dtfsByGovernance = new Map<string, GovernedDtf[]>()

  for (const dtf of dtfs) {
    const identity = identityByAddress.get(dtf.id.toLowerCase())
    if (!identity) continue

    const governedDtf = buildGovernedDtf(dtf, identity)
    const governanceIds = uniqueAddresses([
      ...governanceRefs(dtf).map((governance) => governance?.id),
      ...dtf.legacyAdmins,
      ...dtf.legacyAuctionApprovers,
      ...dtf.stToken.legacyGovernance,
    ])

    for (const governanceId of governanceIds) {
      const current = dtfsByGovernance.get(governanceId) ?? []
      current.push(governedDtf)
      dtfsByGovernance.set(governanceId, current)
    }
  }

  const governanceIds = [...dtfsByGovernance.keys()] as Address[]
  if (!governanceIds.length) {
    return {
      governanceIds: [],
      dtfsByGovernance,
      proposalByKey: new Map(),
      truncated: false,
    }
  }

  const { proposals } = await INDEX_GRAPH_CLIENTS[chainId].request<{
    proposals: ProposalEnrichment[]
  }>(proposalEnrichmentQuery, {
    governanceIds,
    now: timestamp.toString(),
  })

  return {
    governanceIds: uniqueAddresses(
      proposals.map((proposal) => proposal.governance.id)
    ),
    dtfsByGovernance,
    proposalByKey: new Map(
      proposals.map((proposal) => [
        proposalKey(chainId, proposal.governance.id, proposal.id),
        proposal,
      ])
    ),
    truncated: proposals.length === RESULT_LIMIT,
  }
}

const useChainEnrichment = (
  chainId: SupportedChainId,
  identities: IndexDTFItem[] | undefined,
  timestamp: number
) =>
  useQuery({
    queryKey: [
      'ongoing-governance-enrichment',
      chainId,
      identities?.map((dtf) => dtf.address),
    ],
    queryFn: () => fetchChainEnrichment(chainId, identities ?? [], timestamp),
    enabled: identities !== undefined,
    staleTime: REFRESH_INTERVAL,
    refetchInterval: REFRESH_INTERVAL,
  })

const getSdkParams = (
  chainId: SupportedChainId,
  enrichment: ChainEnrichment | undefined
) => {
  if (!enrichment) return undefined

  return {
    chainId,
    governanceAddresses:
      enrichment.governanceIds.length <= GOVERNANCE_LIMIT
        ? enrichment.governanceIds
        : [],
    limit: RESULT_LIMIT,
  } as const
}

const priceMap = (prices: AssetPrice[] | undefined) =>
  new Map(
    prices
      ?.filter((price) => Number.isFinite(price.price) && price.price > 0)
      .map((price) => [price.address.toLowerCase(), price.price]) ?? []
  )

const buildProposals = (
  chainId: SupportedChainId,
  summaries: readonly IndexDtfProposalSummary[] | undefined,
  enrichment: ChainEnrichment | undefined,
  prices: AssetPrice[] | undefined,
  timestamp: number
): OngoingProposal[] => {
  if (!summaries || !enrichment) return []

  const pricesByAddress = priceMap(prices)

  return summaries.flatMap((summary) => {
    const votingState = getProposalState(summary, timestamp)
    if (votingState.state !== 'PENDING' && votingState.state !== 'ACTIVE') {
      return []
    }

    const dtfs =
      enrichment.dtfsByGovernance.get(summary.governance.toLowerCase()) ?? []
    if (!dtfs.length) return []

    const proposalEnrichment = enrichment.proposalByKey.get(
      proposalKey(chainId, summary.governance, summary.id)
    )
    const sortedDtfs = [...dtfs].sort((left, right) =>
      left.symbol.localeCompare(right.symbol)
    )
    const targetDtf = sortedDtfs.find((dtf) =>
      proposalEnrichment?.targets.some(
        (target) => target.toLowerCase() === dtf.address.toLowerCase()
      )
    )
    const primaryDtf = targetDtf ?? sortedDtfs[0]
    const voteTokenDtf =
      sortedDtfs.find(
        (dtf) =>
          dtf.voteToken.id.toLowerCase() === summary.voteToken.toLowerCase()
      ) ?? primaryDtf
    const optimisticTarget =
      summary.isOptimistic &&
      votingState.threshold.hasTarget &&
      votingState.threshold.targetVotes
        ? votingState.threshold.targetVotes.raw
        : undefined

    return [
      {
        id: summary.id,
        chainId,
        governance: summary.governance,
        description: summary.description,
        state: votingState.state,
        voteStart: summary.voteStart,
        voteEnd: summary.voteEnd,
        isOptimistic: summary.isOptimistic === true,
        hasVotes:
          summary.forWeightedVotes.raw +
            summary.againstWeightedVotes.raw +
            summary.abstainWeightedVotes.raw >
          0n,
        proposerVoted: proposalEnrichment
          ? proposalEnrichment.votes.length === RESULT_LIMIT
            ? undefined
            : proposalEnrichment.votes.some(
                (vote) =>
                  vote.voter.address.toLowerCase() ===
                  summary.proposer.toLowerCase()
              )
          : undefined,
        category: proposalEnrichment
          ? classifyProposal(
              proposalEnrichment.targets,
              proposalEnrichment.calldatas,
              {
                rebalanceTargets: new Set(
                  sortedDtfs.map((dtf) => dtf.address.toLowerCase())
                ),
                trustedTargets: new Set(
                  sortedDtfs.flatMap((dtf) =>
                    dtf.trustedTargets.map((address) => address.toLowerCase())
                  )
                ),
              }
            )
          : undefined,
        dtfs: sortedDtfs,
        primaryDtf,
        voteToken: voteTokenDtf
          ? {
              address: voteTokenDtf.voteToken.id,
              symbol: voteTokenDtf.voteToken.symbol,
              decimals: voteTokenDtf.voteToken.decimals,
              price: isSelfAppreciatingVoteLock(
                chainId,
                voteTokenDtf.voteToken.id
              )
                ? undefined
                : pricesByAddress.get(
                    voteTokenDtf.underlyingToken.id.toLowerCase()
                  ),
            }
          : undefined,
        gaps: calculateProposalGaps({
          state: votingState.state,
          isOptimistic: summary.isOptimistic === true,
          quorum: summary.quorumVotes.raw,
          forVotes: summary.forWeightedVotes.raw,
          againstVotes: summary.againstWeightedVotes.raw,
          abstainVotes: summary.abstainWeightedVotes.raw,
          optimisticTarget,
        }),
      },
    ]
  })
}

const chainError = (
  chainId: SupportedChainId,
  enrichment: UseQueryResult<ChainEnrichment>,
  proposals: ReturnType<typeof useIndexDtfProposals>
) => {
  if (enrichment.error || proposals.error) {
    return { type: 'chain' as const, chainId }
  }
  return undefined
}

const useOngoingProposals = (): OngoingProposalData => {
  const timestamp = useAtomValue(timestampAtom)
  const dtfList = useIndexDTFList()
  const dtfsByChain = useMemo(
    () =>
      Object.fromEntries(
        INDEX_DTF_CHAINS.map((chainId) => [
          chainId,
          dtfList.data?.filter((dtf) => dtf.chainId === chainId),
        ])
      ) as Record<SupportedChainId, IndexDTFItem[] | undefined>,
    [dtfList.data]
  )

  const mainnetEnrichment = useChainEnrichment(
    MAINNET_CHAIN,
    dtfsByChain[MAINNET_CHAIN],
    timestamp
  )
  const baseEnrichment = useChainEnrichment(
    BASE_CHAIN,
    dtfsByChain[BASE_CHAIN],
    timestamp
  )
  const bscEnrichment = useChainEnrichment(
    BSC_CHAIN,
    dtfsByChain[BSC_CHAIN],
    timestamp
  )

  const mainnetProposals = useIndexDtfProposals(
    getSdkParams(MAINNET_CHAIN, mainnetEnrichment.data),
    { refetchInterval: REFRESH_INTERVAL }
  )
  const baseProposals = useIndexDtfProposals(
    getSdkParams(BASE_CHAIN, baseEnrichment.data),
    { refetchInterval: REFRESH_INTERVAL }
  )
  const bscProposals = useIndexDtfProposals(
    getSdkParams(BSC_CHAIN, bscEnrichment.data),
    { refetchInterval: REFRESH_INTERVAL }
  )

  const mainnetPrices = useAssetPrices(
    mainnetEnrichment.data
      ? uniqueAddresses(
          [...mainnetEnrichment.data.dtfsByGovernance.values()].flatMap(
            (dtfs) => dtfs.map((dtf) => dtf.underlyingToken.id)
          )
        )
      : undefined,
    MAINNET_CHAIN
  )
  const basePrices = useAssetPrices(
    baseEnrichment.data
      ? uniqueAddresses(
          [...baseEnrichment.data.dtfsByGovernance.values()].flatMap((dtfs) =>
            dtfs.map((dtf) => dtf.underlyingToken.id)
          )
        )
      : undefined,
    BASE_CHAIN
  )
  const bscPrices = useAssetPrices(
    bscEnrichment.data
      ? uniqueAddresses(
          [...bscEnrichment.data.dtfsByGovernance.values()].flatMap((dtfs) =>
            dtfs.map((dtf) => dtf.underlyingToken.id)
          )
        )
      : undefined,
    BSC_CHAIN
  )

  const proposals = useMemo(
    () =>
      [
        ...buildProposals(
          MAINNET_CHAIN,
          mainnetProposals.data,
          mainnetEnrichment.data,
          mainnetPrices.data,
          timestamp
        ),
        ...buildProposals(
          BASE_CHAIN,
          baseProposals.data,
          baseEnrichment.data,
          basePrices.data,
          timestamp
        ),
        ...buildProposals(
          BSC_CHAIN,
          bscProposals.data,
          bscEnrichment.data,
          bscPrices.data,
          timestamp
        ),
      ].sort((left, right) => left.voteEnd - right.voteEnd),
    [
      baseEnrichment.data,
      basePrices.data,
      baseProposals.data,
      bscEnrichment.data,
      bscPrices.data,
      bscProposals.data,
      mainnetEnrichment.data,
      mainnetPrices.data,
      mainnetProposals.data,
      timestamp,
    ]
  )

  const errors = [
    dtfList.error ? ({ type: 'discovery' } as const) : undefined,
    chainError(MAINNET_CHAIN, mainnetEnrichment, mainnetProposals),
    chainError(BASE_CHAIN, baseEnrichment, baseProposals),
    chainError(BSC_CHAIN, bscEnrichment, bscProposals),
  ].filter((error): error is OngoingProposalData['errors'][number] =>
    Boolean(error)
  )

  const warnings = [
    mainnetEnrichment.data?.truncated ||
    baseEnrichment.data?.truncated ||
    bscEnrichment.data?.truncated
      ? ('proposal-limit' as const)
      : undefined,
    [mainnetEnrichment.data, baseEnrichment.data, bscEnrichment.data].some(
      (enrichment) =>
        enrichment && enrichment.governanceIds.length > GOVERNANCE_LIMIT
    )
      ? ('governance-limit' as const)
      : undefined,
  ].filter((warning): warning is OngoingProposalData['warnings'][number] =>
    Boolean(warning)
  )

  const enrichmentLoading = [
    mainnetEnrichment,
    baseEnrichment,
    bscEnrichment,
  ].some((query) => query.isLoading)
  const proposalLoading = [
    [mainnetEnrichment.data, mainnetProposals],
    [baseEnrichment.data, baseProposals],
    [bscEnrichment.data, bscProposals],
  ].some(
    ([enrichment, query]) =>
      enrichment &&
      (enrichment as ChainEnrichment).governanceIds.length > 0 &&
      (query as ReturnType<typeof useIndexDtfProposals>).isLoading
  )

  return {
    proposals,
    isLoading: dtfList.isLoading || enrichmentLoading || proposalLoading,
    errors,
    warnings,
  }
}

export default useOngoingProposals
