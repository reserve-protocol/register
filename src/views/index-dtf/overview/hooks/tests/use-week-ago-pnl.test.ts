import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import useWeekAgoPnl, { calculateWeekAgoPnl } from '../use-week-ago-pnl'

// The SDK primitives are mocked — these tests pin register's PRODUCT layer:
// the value-diff semantics and the composition/settling wiring.
const mocks = vi.hoisted(() => ({
  snapshot: vi.fn(),
  priceHistory: vi.fn(),
}))

vi.mock('@reserve-protocol/react-sdk', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  useIndexDtfIdentity: () => ({
    address: '0x00000000000000000000000000000000000000d1',
    chainId: 8453,
  }),
  useIndexDtfAccountBalanceSnapshot: mocks.snapshot,
  useIndexDtfPriceHistory: mocks.priceHistory,
}))

const ACCOUNT = '0x00000000000000000000000000000000000000a1' as const
const TOKEN = '0x00000000000000000000000000000000000000d1' as const

const settled = (data: unknown) => ({ data, isSuccess: true, isError: false })
const loading = { data: undefined, isSuccess: false, isError: false }

describe('calculateWeekAgoPnl (product math)', () => {
  it('is the value diff against the position value a week ago', () => {
    expect(
      calculateWeekAgoPnl({ snapshotAmount: 2, priceThen: 10, currentValue: 25 })
    ).toBe(5)
  })

  it('hides when the wallet was not holding a week ago', () => {
    expect(
      calculateWeekAgoPnl({ snapshotAmount: null, priceThen: 10, currentValue: 25 })
    ).toBeNull()
    expect(
      calculateWeekAgoPnl({ snapshotAmount: 0, priceThen: 10, currentValue: 25 })
    ).toBeNull()
  })

  it('hides when an input is unavailable — never fabricates from a 0 price', () => {
    expect(
      calculateWeekAgoPnl({ snapshotAmount: 2, priceThen: 0, currentValue: 25 })
    ).toBeNull()
    expect(
      calculateWeekAgoPnl({ snapshotAmount: 2, priceThen: null, currentValue: 25 })
    ).toBeNull()
    expect(
      calculateWeekAgoPnl({ snapshotAmount: 2, priceThen: 10, currentValue: undefined })
    ).toBeNull()
  })
})

describe('useWeekAgoPnl (composition over SDK primitives)', () => {
  it('derives pnl from the snapshot balance and the price at the mark', () => {
    mocks.snapshot.mockReturnValue(
      settled({ balance: { raw: 2n * 10n ** 18n, formatted: '2' }, timestamp: 1 })
    )
    // Leading zero-price row skipped by selectPriceAtMark.
    mocks.priceHistory.mockReturnValue(
      settled([
        { timestamp: 1, price: 0 },
        { timestamp: 2, price: 10 },
      ])
    )

    const { result } = renderHook(() =>
      useWeekAgoPnl({ account: ACCOUNT, token: TOKEN, currentValue: 25 })
    )

    expect(result.current.pnl).toBe(5)
    expect(result.current.isResolved).toBe(true)
  })

  it('no holding at the mark → hidden pnl, resolved, price read never enabled', () => {
    mocks.snapshot.mockReturnValue(settled(null))
    mocks.priceHistory.mockImplementation((params) => {
      // The composition must pass undefined params (disabled) without holding.
      expect(params).toBeUndefined()
      return loading
    })

    const { result } = renderHook(() =>
      useWeekAgoPnl({ account: ACCOUNT, token: TOKEN, currentValue: 25 })
    )

    expect(result.current.pnl).toBeNull()
    expect(result.current.isResolved).toBe(true)
  })

  it('not resolved while the snapshot is still loading', () => {
    mocks.snapshot.mockReturnValue(loading)
    mocks.priceHistory.mockReturnValue(loading)

    const { result } = renderHook(() =>
      useWeekAgoPnl({ account: ACCOUNT, token: TOKEN, currentValue: 25 })
    )

    expect(result.current.pnl).toBeNull()
    expect(result.current.isResolved).toBe(false)
  })
})
