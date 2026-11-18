import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  custom,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionResult,
  multicall3Abi,
  type Hex,
} from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WagmiProvider, createConfig } from 'wagmi'
import { connect, switchChain } from 'wagmi/actions'
import { base, mainnet } from 'wagmi/chains'
import { mock } from 'wagmi/connectors'
import useIndexDTFRevenue, {
  type IndexDTFRevenue,
} from '../use-index-dtf-revenue'

const A = { address: '0x1111111111111111111111111111111111111111', chainId: mainnet.id, price: 2 }
const B = { address: '0x2222222222222222222222222222222222222222', chainId: base.id, price: 3 }
const C = { address: '0x4444444444444444444444444444444444444444', chainId: base.id, price: 1 }

// Pending fee shares per DTF, so a fee that lands on the wrong DTF changes its USD value.
const SHARES: Record<string, bigint> = {
  [A.address]: 1n,
  [B.address]: 5n,
  [C.address]: 7n,
}
const USD = { [A.address]: 2, [B.address]: 15, [C.address]: 7 }

let list = [A, B]

vi.mock('@/hooks/useIndexDTFList', () => ({
  default: () => ({ data: list }),
}))

let ethCalls = 0

const transport = custom({
  request: async ({ method, params }) => {
    if (method !== 'eth_call') throw new Error(`unexpected ${method}`)
    ethCalls += 1
    const [{ data }] = params as [{ data: Hex }]
    const { args } = decodeFunctionData({ abi: multicall3Abi, data })
    const calls = args?.[0] as readonly { target: string }[]
    return encodeFunctionResult({
      abi: multicall3Abi,
      functionName: 'aggregate3',
      result: calls.map(({ target }) => ({
        success: true,
        returnData: encodeAbiParameters(
          [{ type: 'uint256' }],
          [SHARES[target.toLowerCase()] * 10n ** 18n]
        ),
      })),
    })
  },
})

const setup = () => {
  const config = createConfig({
    chains: [mainnet, base],
    connectors: [
      mock({ accounts: ['0x3333333333333333333333333333333333333333'] }),
    ],
    transports: { [mainnet.id]: transport, [base.id]: transport },
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
  const seen: (IndexDTFRevenue[] | undefined)[] = []
  const hook = renderHook(
    () => {
      const revenue = useIndexDTFRevenue()
      seen.push(revenue)
      return revenue
    },
    { wrapper }
  )
  return { config, seen, ...hook }
}

const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50))
  })

const expectOwnFees = (snapshots: (IndexDTFRevenue[] | undefined)[]) => {
  for (const snapshot of snapshots) {
    for (const { dtf, pendingUsd } of snapshot ?? []) {
      expect(pendingUsd, dtf.address).toBe(USD[dtf.address])
    }
  }
}

describe('useIndexDTFRevenue', () => {
  beforeEach(() => {
    list = [A, B]
  })

  // Regression: the fee read is keyed by the wallet chain, so a chain switch emptied the list and remounted the table.
  it('keeps the rows while the wallet switches chain', async () => {
    const { config, seen, result } = setup()

    await act(() => connect(config, { connector: config.connectors[0] }))
    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current?.map((item) => item.pendingUsd)).toEqual([15, 2])
    const loadedAt = seen.length

    await act(() => switchChain(config, { chainId: base.id }))
    await settle()

    expect(seen.slice(loadedAt)).not.toContain(undefined)
    expectOwnFees(seen)
  })

  it('never gives a DTF the fees of another one when the list changes order', async () => {
    const { seen, result, rerender } = setup()
    await waitFor(() => expect(result.current).toHaveLength(2))

    list = [B, A]
    rerender()
    await settle()

    await waitFor(() => expect(result.current).toHaveLength(2))
    expectOwnFees(seen)
  })

  it('reads the new DTF when the list grows', async () => {
    const { seen, result, rerender } = setup()
    await waitFor(() => expect(result.current).toHaveLength(2))

    list = [A, B, C]
    rerender()

    await waitFor(() => expect(result.current).toHaveLength(3))
    expect(result.current?.map((item) => item.dtf.address).sort()).toEqual(
      [A.address, B.address, C.address].sort()
    )
    expectOwnFees(seen)
  })

  it('does not read the fees again when only the wallet chain changes', async () => {
    const { config, result } = setup()
    await act(() => connect(config, { connector: config.connectors[0] }))
    await waitFor(() => expect(result.current).toHaveLength(2))
    const readsBefore = ethCalls

    await act(() => switchChain(config, { chainId: base.id }))
    await settle()

    expect(ethCalls).toBe(readsBefore)
  })
})
