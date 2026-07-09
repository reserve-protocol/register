import { renderHook } from '@testing-library/react'
import { AsyncZapOrderState } from '@reserve-protocol/async-zap-sdk'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useOrderExpiryCountdown } from '../hooks/use-order-expiry-countdown'
import { useOrderFillAnimation } from '../hooks/use-order-fill-animation'
import { useSlowQuoteIndicator } from '../hooks/use-slow-quote-indicator'

const order = ({
  legId = 'leg-1',
  phase,
  validTo,
}: {
  legId?: string
  phase: AsyncZapOrderState['phase']
  validTo?: number | string
}) =>
  ({
    legId,
    phase,
    order: validTo === undefined ? undefined : { validTo },
  }) as AsyncZapOrderState

describe('async mint order hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows and hides the slow quote indicator after the configured delay', () => {
    const { result, rerender } = renderHook(
      ({ waiting }) => useSlowQuoteIndicator(waiting, 1000),
      { initialProps: { waiting: true } }
    )

    expect(result.current.showSlowQuote).toBe(false)

    act(() => vi.advanceTimersByTime(999))
    expect(result.current.showSlowQuote).toBe(false)

    act(() => vi.advanceTimersByTime(1))
    expect(result.current.showSlowQuote).toBe(true)

    act(() => result.current.hideSlowQuote())
    expect(result.current.showSlowQuote).toBe(false)

    rerender({ waiting: false })
    expect(result.current.showSlowQuote).toBe(false)
  })

  it('counts down to the nearest active order expiry', () => {
    const nowSec = Math.floor(Date.now() / 1000)
    const { result } = renderHook(() =>
      useOrderExpiryCountdown({
        executionStarted: true,
        orderStates: [
          order({ phase: 'fulfilled', validTo: nowSec + 5 }),
          order({ phase: 'failed', validTo: nowSec + 10 }),
          order({ phase: 'waiting', validTo: String(nowSec + 65) }),
          order({ phase: 'submitted', validTo: nowSec + 90 }),
        ],
      })
    )

    expect(result.current.orderExpirySeconds).toBe(65)
    expect(result.current.orderExpiryCountdown).toBe('1m 05s')

    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.orderExpirySeconds).toBe(64)
    expect(result.current.orderExpiryCountdown).toBe('1m 04s')
  })

  it('returns no expiry when every order is inactive or invalid', () => {
    const { result } = renderHook(() =>
      useOrderExpiryCountdown({
        executionStarted: true,
        orderStates: [
          order({ phase: 'fulfilled', validTo: 1 }),
          order({ phase: 'failed', validTo: 2 }),
          order({ phase: 'waiting', validTo: 'not-a-number' }),
        ],
      })
    )

    expect(result.current.orderExpirySeconds).toBeUndefined()
    expect(result.current.orderExpiryCountdown).toBeUndefined()
  })

  it('animates newly fulfilled orders and clears animation state', () => {
    const { result, rerender } = renderHook(
      (props: Parameters<typeof useOrderFillAnimation>[0]) =>
        useOrderFillAnimation(props),
      {
        initialProps: {
          executionStarted: true,
          filledOrderCount: 0,
          orderCount: 1,
          orderStates: [order({ phase: 'waiting' })],
        },
      }
    )

    expect(result.current.countPulseActive).toBe(false)
    expect([...result.current.recentlyFilledLegIds]).toEqual([])

    rerender({
      executionStarted: true,
      filledOrderCount: 1,
      orderCount: 1,
      orderStates: [order({ phase: 'fulfilled' })],
    })

    expect(result.current.countPulseActive).toBe(true)
    expect([...result.current.recentlyFilledLegIds]).toEqual(['leg-1'])

    act(() => vi.advanceTimersByTime(800))
    expect(result.current.countPulseActive).toBe(false)
    expect([...result.current.recentlyFilledLegIds]).toEqual(['leg-1'])

    act(() => vi.advanceTimersByTime(1000))
    expect([...result.current.recentlyFilledLegIds]).toEqual([])
  })

  it('does not animate orders that are fulfilled on first render', () => {
    const { result } = renderHook(() =>
      useOrderFillAnimation({
        executionStarted: true,
        filledOrderCount: 1,
        orderCount: 1,
        orderStates: [order({ phase: 'fulfilled' })],
      })
    )

    expect(result.current.countPulseActive).toBe(false)
    expect([...result.current.recentlyFilledLegIds]).toEqual([])
  })
})
