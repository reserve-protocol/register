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

describe('historicalConfigs intervals', () => {
  it('uses sub-daily fetch intervals only for the short ranges (24h/7d/1m)', () => {
    expect(historicalConfigs['24h'].interval).toBe('5m')
    expect(historicalConfigs['7d'].interval).toBe('1h')
    expect(historicalConfigs['1m'].interval).toBe('1h')
    expect(historicalConfigs['3m'].interval).toBe('1d')
    expect(historicalConfigs['1y'].interval).toBe('1d')
    expect(historicalConfigs.all.interval).toBe('1d')
  })

  it('buckets 24h to 15 minutes and 1m to 6 hours for display', () => {
    expect(historicalConfigs['24h'].bucket).toBe(900)
    expect(historicalConfigs['1m'].bucket).toBe(21_600)
    expect(historicalConfigs['7d'].bucket).toBeUndefined()
    expect(historicalConfigs['3m'].bucket).toBeUndefined()
  })
})
