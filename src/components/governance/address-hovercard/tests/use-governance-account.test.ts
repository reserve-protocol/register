import { QueryClient } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  governanceAccountsBatch,
  preloadGovernanceAccount,
  type GovernanceAccount,
} from '../use-governance-account'

const A = '0x00000000000000000000000000000000000000aa'
const B = '0x00000000000000000000000000000000000000bb'
const C = '0x00000000000000000000000000000000000000cc'

const profile = (address: string, votes = 0): GovernanceAccount => ({
  address,
  totals: { proposals: 0, executed: 0, defeated: 0, vetoed: 0, canceled: 0, votes },
  firstActionAt: null,
  lastActionAt: null,
  dtfs: [],
  truncated: false,
  degradedChains: [],
})

const key = (address: string, fresh = false) => ['governance-account', address, fresh]

describe('governanceAccountsBatch', () => {
  it('reads the distinct addresses of the list, in list order', () => {
    expect(governanceAccountsBatch([A, B.toUpperCase().replace('0X', '0x'), A, C], B)).toEqual([A, B, C])
  })

  it('reads only the 50-address page that holds the address', () => {
    const list = Array.from({ length: 120 }, (_, i) => `0x${i.toString(16).padStart(40, '0')}`)

    expect(governanceAccountsBatch(list, list[0])).toEqual(list.slice(0, 50))
    expect(governanceAccountsBatch(list, list[75])).toEqual(list.slice(50, 100))
    expect(governanceAccountsBatch(list, list[119])).toEqual(list.slice(100))
  })

  it('has nothing to batch without a list, for a lone address, or for an address outside the list', () => {
    expect(governanceAccountsBatch(undefined, A)).toBeUndefined()
    expect(governanceAccountsBatch([A, A], A)).toBeUndefined()
    expect(governanceAccountsBatch([B, C], A)).toBeUndefined()
  })
})

describe('preloadGovernanceAccount', () => {
  let queryClient: QueryClient
  let calls: string[]
  let batchFails: boolean

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    calls = []
    batchFails = false
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        const url = new URL(input)
        calls.push(url.pathname + url.search)
        if (url.pathname.endsWith('/governance/accounts')) {
          if (batchFails) return { ok: false, status: 503 }
          const addresses = url.searchParams.get('addresses')!.split(',')
          return { ok: true, json: async () => ({ accounts: addresses.map((address) => profile(address, 7)) }) }
        }
        return { ok: true, json: async () => profile(url.pathname.split('/').at(-2)!, 3) }
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const settled = () => vi.waitFor(() => expect(queryClient.isFetching()).toBe(0))

  it('reads the hovered address and the rest of its list in two calls', async () => {
    preloadGovernanceAccount(queryClient, { address: A, fresh: false, group: [A, B, C] })
    await settled()

    expect(calls.sort()).toEqual([
      `/v1/governance/accounts?addresses=${A},${B},${C}`,
      `/v1/portfolio/${A}/governance`,
    ])
    expect(queryClient.getQueryData<GovernanceAccount>(key(A))?.totals.votes).toBe(3)
    expect(queryClient.getQueryData<GovernanceAccount>(key(B))?.totals.votes).toBe(7)
    expect(queryClient.getQueryData<GovernanceAccount>(key(C))?.totals.votes).toBe(7)
  })

  it('needs no call for another address of the list after the first hover', async () => {
    preloadGovernanceAccount(queryClient, { address: A, fresh: false, group: [A, B, C] })
    await settled()
    calls.length = 0

    preloadGovernanceAccount(queryClient, { address: B, fresh: false, group: [A, B, C] })
    await settled()

    expect(calls).toEqual([])
  })

  it('reads only the address when it is not part of a list', async () => {
    preloadGovernanceAccount(queryClient, { address: A, fresh: false })
    await settled()

    expect(calls).toEqual([`/v1/portfolio/${A}/governance`])
  })

  it('reads a fresh profile for the hovered address and leaves the list to the cached route', async () => {
    preloadGovernanceAccount(queryClient, { address: A, fresh: true, group: [A, B] })
    await settled()

    expect(calls.sort()).toEqual([
      `/v1/governance/accounts?addresses=${A},${B}`,
      `/v1/portfolio/${A}/governance?fresh=true`,
    ])
    expect(queryClient.getQueryData<GovernanceAccount>(key(A, true))?.totals.votes).toBe(3)
  })

  it('keeps the hovered address when the list read fails', async () => {
    batchFails = true

    preloadGovernanceAccount(queryClient, { address: A, fresh: false, group: [A, B] })
    await settled()

    expect(queryClient.getQueryData<GovernanceAccount>(key(A))?.totals.votes).toBe(3)
    expect(queryClient.getQueryData(key(B))).toBeUndefined()
  })
})
