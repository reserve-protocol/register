import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useTimeRemaining from '../use-time-remaining'

describe('useTimeRemaining', () => {
  const NOW = 1700000000000 // Fixed timestamp for consistent tests

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty string when no timestamp provided', () => {
    const { result } = renderHook(() => useTimeRemaining())
    expect(result.current).toBe('')
  })

  it('returns empty string when timestamp is undefined', () => {
    const { result } = renderHook(() => useTimeRemaining(undefined))
    expect(result.current).toBe('')
  })

  it('returns "Ended" when timestamp is in the past', () => {
    const pastTimestamp = Math.floor(NOW / 1000) - 100
    const { result } = renderHook(() => useTimeRemaining(pastTimestamp))
    expect(result.current).toBe('Ended')
  })

  it('formats days, hours, minutes correctly', () => {
    // 2 days, 4 hours, 30 minutes from now
    const futureTimestamp = Math.floor(NOW / 1000) + (2 * 86400) + (4 * 3600) + (30 * 60)
    const { result } = renderHook(() => useTimeRemaining(futureTimestamp))
    expect(result.current).toBe('2d 4h 30m')
  })

  it('shows hours and minutes when no days', () => {
    // 4 hours, 15 minutes from now
    const futureTimestamp = Math.floor(NOW / 1000) + (4 * 3600) + (15 * 60)
    const { result } = renderHook(() => useTimeRemaining(futureTimestamp))
    expect(result.current).toBe('4h 15m')
  })

  it('shows seconds when less than 1 hour remaining', () => {
    // 30 minutes, 45 seconds from now
    const futureTimestamp = Math.floor(NOW / 1000) + (30 * 60) + 45
    const { result } = renderHook(() => useTimeRemaining(futureTimestamp))
    expect(result.current).toBe('30m 45s')
  })

  it('shows only seconds when very short time remaining', () => {
    // 45 seconds from now
    const futureTimestamp = Math.floor(NOW / 1000) + 45
    const { result } = renderHook(() => useTimeRemaining(futureTimestamp))
    // Hook doesn't show minutes when there are 0 minutes
    expect(result.current).toBe('45s')
  })

  it('updates countdown as time passes', () => {
    // 2 minutes from now
    const futureTimestamp = Math.floor(NOW / 1000) + 120
    const { result } = renderHook(() => useTimeRemaining(futureTimestamp))

    expect(result.current).toBe('2m 0s')

    // Advance 60 seconds
    act(() => {
      vi.advanceTimersByTime(60 * 1000)
    })

    expect(result.current).toBe('1m 0s')

    // Advance another 60 seconds
    act(() => {
      vi.advanceTimersByTime(60 * 1000)
    })

    expect(result.current).toBe('Ended')
  })

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    const futureTimestamp = Math.floor(NOW / 1000) + 3600

    const { unmount } = renderHook(() => useTimeRemaining(futureTimestamp))
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})
