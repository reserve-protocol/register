import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { formatXAxisTick } from '../chart-formatters'

describe('formatXAxisTick', () => {
  const ts = Math.floor(Date.UTC(2026, 2, 15) / 1_000) // 15 Mar 2026

  it('formats ytd ticks as day + month', () => {
    expect(formatXAxisTick(ts, 'ytd')).toBe(dayjs.unix(ts).format('D MMM'))
  })

  it('distinguishes ytd from the 1y month/year format', () => {
    expect(formatXAxisTick(ts, 'ytd')).not.toBe(formatXAxisTick(ts, '1y'))
  })
})
