import { renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import type { ReactNode } from 'react'
import { encodeFunctionData, type Abi, type Address, type Hex } from 'viem'
import { describe, expect, it } from 'vitest'

import dtfIndexAbiV5 from '@/abis/dtf-index-abi'
import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { indexDTFVersionAtom } from '@/state/dtf/atoms'
import { useDecodedRebalanceCalldata } from '../use-rebalance-basket-preview'

const TOKEN = '0x0000000000000000000000000000000000000001' as Address
const WEIGHT_RANGE = { low: 1n, spot: 2n, high: 3n }
const PRICE_RANGE = { low: 4n, high: 5n }
const LIMITS = { low: 6n, spot: 7n, high: 8n }

const createWrapper = (version: string) => {
  const store = createStore()
  // The old decoder used this atom, so tests set the opposite version on purpose.
  store.set(indexDTFVersionAtom, version)

  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
}

describe('useDecodedRebalanceCalldata', () => {
  it('decodes historical v4 startRebalance calldata when current DTF version is v5', () => {
    const calldata = encodeFunctionData({
      abi: dtfIndexAbiV4 as Abi,
      functionName: 'startRebalance',
      args: [[TOKEN], [WEIGHT_RANGE], [PRICE_RANGE], LIMITS, 99n, 100n],
    }) as Hex

    const { result } = renderHook(
      () => useDecodedRebalanceCalldata([calldata]),
      { wrapper: createWrapper('5.0.0') }
    )

    expect(result.current?.calldata.signature).toBe('startRebalance')
    expect(result.current?.data.tokens).toEqual([TOKEN])
    expect(result.current?.data.weights[0]).toMatchObject(WEIGHT_RANGE)
    expect(result.current?.data.prices[0]).toMatchObject(PRICE_RANGE)
    expect(result.current?.data.limits).toMatchObject(LIMITS)
    expect(result.current?.data.auctionLauncherWindow).toBe(99n)
    expect(result.current?.data.ttl).toBe(100n)
  })

  it('decodes v5 startRebalance calldata when current DTF version is v4', () => {
    const calldata = encodeFunctionData({
      abi: dtfIndexAbiV5 as Abi,
      functionName: 'startRebalance',
      args: [
        [
          {
            token: TOKEN,
            weight: WEIGHT_RANGE,
            price: PRICE_RANGE,
            maxAuctionSize: 123n,
            inRebalance: true,
          },
        ],
        LIMITS,
        99n,
        100n,
      ],
    }) as Hex

    const { result } = renderHook(
      () => useDecodedRebalanceCalldata([calldata]),
      { wrapper: createWrapper('4.0.0') }
    )

    expect(result.current?.calldata.signature).toBe('startRebalance')
    expect(result.current?.data.tokens).toEqual([TOKEN])
    expect(result.current?.data.weights[0]).toMatchObject(WEIGHT_RANGE)
    expect(result.current?.data.prices[0]).toMatchObject(PRICE_RANGE)
    expect(result.current?.data.limits).toMatchObject(LIMITS)
    expect(result.current?.data.auctionLauncherWindow).toBe(99n)
    expect(result.current?.data.ttl).toBe(100n)
  })
})
