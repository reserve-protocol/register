import { describe, expect, it } from 'vitest'
import { Transaction } from '@/state/dtf/atoms'
import {
  compute24hSwapVolumeUsd,
  mapPoolSwapEvents,
  mergeTransactionRows,
  PoolTransferEvent,
} from '../swap-transactions'

const PM = '0x28e2ea090877bf75740558f6bfb36a5ffee9e9df'
const TRADER = '0x9008d19f58aabd9ed0d60971565aa8510560ab41'
const CHAIN = 56

const event = (overrides: Partial<PoolTransferEvent>): PoolTransferEvent => ({
  id: '0xhash-1',
  hash: '0xhash',
  amount: '1000000000000000000',
  timestamp: '1783782721',
  from: { id: PM },
  to: { id: TRADER },
  ...overrides,
})

describe('mapPoolSwapEvents', () => {
  it('returns empty for empty responses', () => {
    expect(mapPoolSwapEvents({ buys: [], sells: [] }, PM, CHAIN)).toEqual([])
  })

  it('maps directions from the pool manager side', () => {
    const swaps = mapPoolSwapEvents(
      {
        buys: [event({ id: 'a-1', hash: '0xa' })],
        sells: [
          event({
            id: 'b-1',
            hash: '0xb',
            from: { id: TRADER },
            to: { id: PM },
          }),
        ],
      },
      PM,
      CHAIN
    )

    expect(swaps).toHaveLength(2)
    expect(swaps.find((s) => s.hash === '0xa')?.type).toBe('Buy')
    expect(swaps.find((s) => s.hash === '0xb')?.type).toBe('Sell')
  })

  it('converts wei amounts and attaches the chain', () => {
    const [swap] = mapPoolSwapEvents(
      { buys: [event({ amount: '1500000000000000000' })], sells: [] },
      PM,
      CHAIN
    )

    expect(swap.amount).toBe(1.5)
    expect(swap.chain).toBe(CHAIN)
    expect(swap.timestamp).toBe(1783782721)
  })

  it('groups same-direction events of one tx, summing amounts and keeping the max timestamp', () => {
    const swaps = mapPoolSwapEvents(
      {
        buys: [
          event({ id: 'a-1', amount: '1000000000000000000', timestamp: '100' }),
          event({ id: 'a-2', amount: '500000000000000000', timestamp: '105' }),
        ],
        sells: [],
      },
      PM,
      CHAIN
    )

    expect(swaps).toHaveLength(1)
    expect(swaps[0].amount).toBe(1.5)
    expect(swaps[0].timestamp).toBe(105)
    expect(swaps[0].id).toBe('0xhash-Buy')
  })

  it('keeps buy and sell of the same hash as two rows (no netting)', () => {
    const swaps = mapPoolSwapEvents(
      {
        buys: [event({ id: 'a-1' })],
        sells: [event({ id: 'a-2', from: { id: TRADER }, to: { id: PM } })],
      },
      PM,
      CHAIN
    )

    expect(swaps).toHaveLength(2)
    expect(swaps.map((s) => s.type).sort()).toEqual(['Buy', 'Sell'])
  })

  it('skips duplicated event ids and PM→PM transfers', () => {
    const duplicated = event({ id: 'dup' })
    const pmToPm = event({ id: 'pm-pm', from: { id: PM }, to: { id: PM } })
    const swaps = mapPoolSwapEvents(
      { buys: [duplicated, pmToPm], sells: [duplicated, pmToPm] },
      PM,
      CHAIN
    )

    expect(swaps).toHaveLength(1)
    expect(swaps[0].amount).toBe(1)
  })

  it('compares the pool manager address case-insensitively', () => {
    const [swap] = mapPoolSwapEvents(
      { buys: [event({ from: { id: PM.toUpperCase().replace('0X', '0x') } })], sells: [] },
      '0x28E2EA090877bF75740558f6BFB36A5ffeE9e9dF',
      CHAIN
    )

    expect(swap.type).toBe('Buy')
  })

  it('sorts swaps by timestamp descending', () => {
    const swaps = mapPoolSwapEvents(
      {
        buys: [
          event({ id: 'a-1', hash: '0xa', timestamp: '100' }),
          event({ id: 'b-1', hash: '0xb', timestamp: '200' }),
        ],
        sells: [],
      },
      PM,
      CHAIN
    )

    expect(swaps.map((s) => s.hash)).toEqual(['0xb', '0xa'])
  })
})

describe('mergeTransactionRows', () => {
  const mint: Transaction = {
    id: 'mint-1',
    hash: '0xmint',
    amount: 10,
    amountUSD: 55,
    timestamp: 150,
    chain: CHAIN,
    type: 'Mint',
  }

  const swap = (timestamp: number) =>
    mapPoolSwapEvents(
      { buys: [event({ timestamp: String(timestamp) })], sells: [] },
      PM,
      CHAIN
    )[0]

  it('merges and sorts descending by timestamp', () => {
    const rows = mergeTransactionRows([mint], [swap(200), swap(100)], 2)

    expect(rows.map((r) => r.timestamp)).toEqual([200, 150, 100])
    expect(rows.map((r) => r.type)).toEqual(['Buy', 'Mint', 'Buy'])
  })

  it('prices swaps with the given price and keeps atom transactions pre-priced', () => {
    const rows = mergeTransactionRows([mint], [swap(200)], 2)

    expect(rows[0].amountUSD).toBe(2)
    expect(rows[1].amountUSD).toBe(55)
  })

  it('handles a missing price without producing NaN', () => {
    const rows = mergeTransactionRows([], [swap(200)], 0)

    expect(rows[0].amountUSD).toBe(0)
  })

  it('returns empty when both sources are empty', () => {
    expect(mergeTransactionRows([], [], 1)).toEqual([])
  })
})

describe('compute24hSwapVolumeUsd', () => {
  const NOW = 200_000
  const DAY = 24 * 60 * 60

  const swapAt = (timestamp: number, amountWei = '2000000000000000000') =>
    mapPoolSwapEvents(
      {
        buys: [
          event({
            id: `id-${timestamp}`,
            hash: `0x${timestamp}`,
            timestamp: String(timestamp),
            amount: amountWei,
          }),
        ],
        sells: [],
      },
      PM,
      CHAIN
    )[0]

  it('returns 0 for no swaps', () => {
    expect(compute24hSwapVolumeUsd([], 5, NOW)).toBe(0)
  })

  it('sums only swaps inside the trailing 24h window', () => {
    const inside = swapAt(NOW - DAY + 1)
    const atCutoff = swapAt(NOW - DAY)
    const outside = swapAt(NOW - DAY - 1)

    expect(compute24hSwapVolumeUsd([inside, atCutoff, outside], 5, NOW)).toBe(
      10
    )
  })

  it('sums both directions', () => {
    const buy = swapAt(NOW - 100)
    const sell = { ...swapAt(NOW - 50), type: 'Sell' as const }

    expect(compute24hSwapVolumeUsd([buy, sell], 5, NOW)).toBe(20)
  })

  it('returns 0 without NaN when the price is missing', () => {
    expect(compute24hSwapVolumeUsd([swapAt(NOW - 100)], 0, NOW)).toBe(0)
  })
})
