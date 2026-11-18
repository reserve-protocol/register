import { RESERVE_API } from '@/utils/constants'
import { useQuery, type QueryClient } from '@tanstack/react-query'

export type GovernanceOutcomeCounts = {
  proposals: number
  executed: number
  defeated: number
  vetoed: number
  canceled: number
  votes: number
}

export type GovernanceAccountDtf = GovernanceOutcomeCounts & {
  chainId: number
  address: string
  symbol: string
  type: 'index' | 'yield'
  votingPowerSince: number | null
  delegators: number | null
}

export type GovernanceAccount = {
  address: string
  totals: GovernanceOutcomeCounts
  firstActionAt: number | null
  lastActionAt: number | null
  dtfs: GovernanceAccountDtf[]
  truncated: boolean
  degradedChains: number[]
}

// The batch route takes this many addresses per call.
const BATCH_LIMIT = 50
const STALE_TIME = 120_000

const read = async <T>(url: string): Promise<T> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Governance account request failed: ${response.status}`)
  }
  return response.json()
}

export const governanceAccountUrl = (address: string, fresh: boolean) =>
  `${RESERVE_API}v1/portfolio/${address}/governance${fresh ? '?fresh=true' : ''}`

const accountKey = (address: string, fresh: boolean) =>
  ['governance-account', address.toLowerCase(), fresh] as const

const accountOptions = (address: string, fresh: boolean) => ({
  queryKey: accountKey(address, fresh),
  queryFn: () => read<GovernanceAccount>(governanceAccountUrl(address, fresh)),
  staleTime: fresh ? 15_000 : STALE_TIME,
})

// Reserve API rather than the SDK: no SDK read filters by proposer or voter, and
// the cross-chain, listed-DTF aggregation lives next to the catalog (/portfolio precedent).
// `fresh` reads past the API caches; use it next to an event the cached profile may predate.
export const useGovernanceAccount = (
  address: string,
  enabled: boolean,
  fresh = false
) => useQuery({ ...accountOptions(address, fresh), enabled })

// The addresses to read with `address`: its page of the list, in list order,
// so every address of that page asks for the same URL.
export const governanceAccountsBatch = (
  group: readonly string[] | undefined,
  address: string
) => {
  const distinct = [...new Set((group ?? []).map((item) => item.toLowerCase()))]
  const position = distinct.indexOf(address.toLowerCase())
  if (position < 0 || distinct.length < 2) return undefined
  const start = Math.floor(position / BATCH_LIMIT) * BATCH_LIMIT
  return distinct.slice(start, start + BATCH_LIMIT)
}

// Hover intent. The hovered address keeps its own read, so its card is never
// slower than without the list; the rest of the list arrives in one call.
export const preloadGovernanceAccount = (
  queryClient: QueryClient,
  {
    address,
    fresh,
    group,
  }: { address: string; fresh: boolean; group?: readonly string[] }
) => {
  void queryClient.prefetchQuery(accountOptions(address, fresh))

  const batch = governanceAccountsBatch(group, address)
  if (!batch) return
  const batchKey = ['governance-accounts', batch]
  queryClient
    .fetchQuery({
      queryKey: batchKey,
      queryFn: () =>
        read<{ accounts: GovernanceAccount[] }>(
          `${RESERVE_API}v1/governance/accounts?addresses=${batch.join(',')}`
        ),
      staleTime: STALE_TIME,
    })
    .then(({ accounts }) => {
      const updatedAt = queryClient.getQueryState(batchKey)?.dataUpdatedAt ?? 0
      // WHY: nothing orders a list snapshot against a single read, so the list only fills profiles that have no data.
      for (const account of accounts) {
        const key = accountKey(account.address, false)
        const state = queryClient.getQueryState(key)
        const isCurrent =
          state?.fetchStatus === 'fetching' || state?.data !== undefined
        if (!isCurrent) queryClient.setQueryData(key, account, { updatedAt })
      }
    })
    // WHY: without the batch each card still does its own read when it opens.
    .catch(() => undefined)
}
