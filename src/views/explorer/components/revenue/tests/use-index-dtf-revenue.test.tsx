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
import { describe, expect, it, vi } from 'vitest'
import { WagmiProvider, createConfig } from 'wagmi'
import { connect, switchChain } from 'wagmi/actions'
import { base, mainnet } from 'wagmi/chains'
import { mock } from 'wagmi/connectors'
import useIndexDTFRevenue from '../use-index-dtf-revenue'

const dtfs = [
  { address: '0x1111111111111111111111111111111111111111', chainId: mainnet.id, price: 2 },
  { address: '0x2222222222222222222222222222222222222222', chainId: base.id, price: 3 },
]

vi.mock('@/hooks/useIndexDTFList', () => ({
  default: () => ({ data: dtfs }),
}))

const ONE_SHARE = encodeAbiParameters([{ type: 'uint256' }], [10n ** 18n])

// Answers every multicall with one pending fee share per call.
const transport = custom({
  request: async ({ method, params }) => {
    if (method !== 'eth_call') throw new Error(`unexpected ${method}`)
    const [{ data }] = params as [{ data: Hex }]
    const { args } = decodeFunctionData({ abi: multicall3Abi, data })
    const calls = args?.[0] as readonly unknown[]
    return encodeFunctionResult({
      abi: multicall3Abi,
      functionName: 'aggregate3',
      result: calls.map(() => ({ success: true, returnData: ONE_SHARE })),
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
  return { config, wrapper }
}

describe('useIndexDTFRevenue', () => {
  // Regression: the fee read is keyed by the wallet chain, so a chain switch emptied the list and remounted the table.
  it('keeps the rows while the wallet switches chain', async () => {
    const { config, wrapper } = setup()
    const seen: (number | undefined)[] = []
    const { result } = renderHook(
      () => {
        const revenue = useIndexDTFRevenue()
        seen.push(revenue?.length)
        return revenue
      },
      { wrapper }
    )

    await act(() => connect(config, { connector: config.connectors[0] }))
    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current?.map((item) => item.pendingUsd)).toEqual([3, 2])
    const loadedAt = seen.length

    await act(() => switchChain(config, { chainId: base.id }))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })

    expect(seen.slice(loadedAt)).not.toContain(undefined)
    expect(result.current).toHaveLength(2)
  })
})
