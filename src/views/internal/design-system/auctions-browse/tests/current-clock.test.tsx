import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useWorkspace } from '../../auctions-current/use-workspace'
import { SOURCE_RECORDS, type Outcome } from '../../auctions-current/fixtures'

afterEach(() => vi.useRealTimers())

it('captures the selected outcome at launch and cleans up all timers', () => {
  vi.useFakeTimers()
  const record = SOURCE_RECORDS.cmc20
  const { result, rerender, unmount } = renderHook(
    ({ outcome }: { outcome: Outcome }) =>
      useWorkspace(record, 'ready', outcome, true),
    { initialProps: { outcome: 'indexing' as Outcome } }
  )
  act(() =>
    result.current.dispatch({
      type: 'launch',
      record,
      viewer: 'launcher',
      network: true,
      data: 'ready',
      outcome: 'indexing',
    })
  )
  rerender({ outcome: 'success' })
  act(() => vi.advanceTimersByTime(1200))
  expect(result.current.state.operation).toBe('pending')
  act(() => vi.advanceTimersByTime(1200))
  expect(result.current.state.operation).toBe('indexing')
  act(() => vi.advanceTimersByTime(20000))
  expect(result.current.state.operation).toBe('indexing')
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})

it.each(['reject', 'revert'] as const)(
  'leaves a retryable %s outcome without changing the record or phase',
  (outcome) => {
    vi.useFakeTimers()
    const record = SOURCE_RECORDS.cmc20
    const { result, unmount } = renderHook(() =>
      useWorkspace(record, 'ready', outcome, false)
    )
    act(() =>
      result.current.dispatch({
        type: 'launch',
        record,
        viewer: 'launcher',
        network: true,
        data: 'ready',
        outcome,
      })
    )
    act(() => vi.advanceTimersByTime(1200))
    if (outcome === 'revert') act(() => vi.advanceTimersByTime(1200))
    expect(result.current.state).toMatchObject({
      stage: 'preparing',
      operation: outcome === 'reject' ? 'rejected' : 'failed',
      runs: 0,
    })
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  }
)
