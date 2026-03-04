import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useDebounce from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Change value
    rerender({ value: 'updated', delay: 500 })

    // Value should still be initial before delay
    expect(result.current).toBe('initial')

    // Fast forward past delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('cancels pending update on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'first', delay: 500 } }
    )

    // Rapid changes
    rerender({ value: 'second', delay: 500 })
    act(() => vi.advanceTimersByTime(200))

    rerender({ value: 'third', delay: 500 })
    act(() => vi.advanceTimersByTime(200))

    rerender({ value: 'fourth', delay: 500 })

    // Still should be first value
    expect(result.current).toBe('first')

    // Complete the delay
    act(() => vi.advanceTimersByTime(500))

    // Should be the last value, not intermediate ones
    expect(result.current).toBe('fourth')
  })

  it('works with numbers', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    )

    rerender({ value: 100, delay: 300 })
    expect(result.current).toBe(0)

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(100)
  })

  it('works with objects (same reference)', () => {
    const obj = { amount: '100' }
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: obj, delay: 300 } }
    )

    const newObj = { amount: '200' }
    rerender({ value: newObj, delay: 300 })

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toEqual({ amount: '200' })
  })
})
