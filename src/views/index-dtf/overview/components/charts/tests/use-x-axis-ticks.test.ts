import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useXAxisTicks } from '../use-price-chart-data'

describe('useXAxisTicks', () => {
  it('gives a single-point chart one tick, not the same timestamp six times', () => {
    const { result } = renderHook(() => useXAxisTicks([{ timestamp: 1_793_835_000 }], false))
    expect(result.current).toEqual([1_793_835_000])
  })

  it('spreads ticks over a long series', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ timestamp: i + 1 }))
    const { result } = renderHook(() => useXAxisTicks(data, false))
    expect(result.current).toEqual([6, 24, 42, 60, 78, 96])
  })
})
