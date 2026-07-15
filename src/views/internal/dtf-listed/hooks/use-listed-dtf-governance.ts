import { INDEX_GRAPH_CLIENTS } from '@/state/chain/atoms/chainAtoms'
import { ChainId } from '@/utils/chains'
import { useQuery } from '@tanstack/react-query'
import { gql } from 'graphql-request'
import { Address } from 'viem'
import { IndexDTFItem } from '@/hooks/useIndexDTFList'
import { ListedDTFGovernance } from '../atoms'

export type DTFGovernanceResponse = {
  dtfs: {
    id: Address
    token: {
      name: string
      symbol: string
    }
    ownerGovernance?: {
      id: Address
      timelock: {
        id: Address
      }
    }
    tradingGovernance?: {
      id: Address
      timelock: {
        id: Address
      }
    }
  }[]
}

const governanceQuery = gql`
  query getListedDTFsGovernance($ids: [String!]!) {
    dtfs(where: { id_in: $ids }) {
      id
      token {
        name
        symbol
      }
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
    }
  }
`

const SUPPORTED_CHAINS = [ChainId.Mainnet, ChainId.Base, ChainId.BSC] as const

export const mapGovernanceResponse = (
  // Partial: a malformed/partial subgraph response may omit `dtfs` entirely.
  response: Partial<DTFGovernanceResponse> | undefined,
  apiDataMap: Map<string, IndexDTFItem>,
  chainId: number
): ListedDTFGovernance[] =>
  // A malformed/partial subgraph response can omit `dtfs` — guard the array so
  // one bad chain doesn't reject the whole fan-out (Z5).
  (response?.dtfs ?? []).map((dtf) => {
    const apiData = apiDataMap.get(dtf.id.toLowerCase())
    return {
      id: dtf.id,
      name: dtf.token.name,
      symbol: dtf.token.symbol,
      chainId,
      icon: apiData?.brand?.icon,
      marketCap: apiData?.marketCap ?? 0,
      tradingGovernance: dtf.tradingGovernance?.id,
      tradingTimelock: dtf.tradingGovernance?.timelock.id,
      ownerGovernance: dtf.ownerGovernance?.id,
      ownerTimelock: dtf.ownerGovernance?.timelock.id,
    }
  })

// Production fan-out. Isolated from `useQuery` and the concrete graph clients so
// the per-chain degrade-not-reject behavior (Z5) is unit-testable with a fake
// `request`. One chain rejecting must NOT reject the whole Promise.all.
export const fetchListedDTFGovernanceRows = async (
  chains: readonly number[],
  dtfsByChain: Record<number, string[]>,
  apiDataMap: Map<string, IndexDTFItem>,
  request: (chainId: number, ids: string[]) => Promise<DTFGovernanceResponse>
): Promise<ListedDTFGovernance[]> => {
  const results = await Promise.all(
    chains.map(async (chainId) => {
      const ids = dtfsByChain[chainId]
      if (!ids || ids.length === 0) return []

      // Per-chain try/catch mirrors the sibling use-internal-dtf-list.ts so one
      // chain's failure degrades to the chains that answered (Z5).
      try {
        return mapGovernanceResponse(await request(chainId, ids), apiDataMap, chainId)
      } catch (error) {
        console.error(
          `Failed to fetch listed DTF governance from chain ${chainId}:`,
          error
        )
        return []
      }
    })
  )

  // Sort by marketCap descending
  return results.flat().sort((a, b) => b.marketCap - a.marketCap)
}

const useListedDTFGovernance = (dtfList: IndexDTFItem[] | undefined) => {
  return useQuery({
    queryKey: ['listed-dtf-governance', dtfList?.map((d) => d.address)],
    queryFn: async (): Promise<ListedDTFGovernance[]> => {
      if (!dtfList || dtfList.length === 0) return []

      // Create a map from address to API data for enrichment
      const apiDataMap = new Map(
        dtfList.map((dtf) => [dtf.address.toLowerCase(), dtf])
      )

      const dtfsByChain = SUPPORTED_CHAINS.reduce(
        (acc, chainId) => {
          acc[chainId] = dtfList
            .filter((dtf) => dtf.chainId === chainId)
            .map((dtf) => dtf.address.toLowerCase())
          return acc
        },
        {} as Record<number, string[]>
      )

      return fetchListedDTFGovernanceRows(
        SUPPORTED_CHAINS,
        dtfsByChain,
        apiDataMap,
        (chainId, ids) =>
          INDEX_GRAPH_CLIENTS[chainId].request(governanceQuery, { ids })
      )
    },
    enabled: !!dtfList && dtfList.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export default useListedDTFGovernance
