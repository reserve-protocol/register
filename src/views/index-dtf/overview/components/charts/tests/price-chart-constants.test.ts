import { describe, expect, it } from 'vitest'
import { currentHour, historicalConfigs } from '../price-chart-constants'

describe('historicalConfigs.ytd', () => {
  it('spans Jan 1 (UTC) of the current year with a daily interval', () => {
    const expectedFrom = Math.floor(
      Date.UTC(new Date().getUTCFullYear(), 0, 1) / 1_000
    )

    expect(historicalConfigs.ytd.from).toBe(expectedFrom)
    expect(historicalConfigs.ytd.to).toBe(currentHour)
    expect(historicalConfigs.ytd.interval).toBe('1d')
  })
})
