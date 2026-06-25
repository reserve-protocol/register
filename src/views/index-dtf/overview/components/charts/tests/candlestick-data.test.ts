import { describe, expect, it } from 'vitest'
import {
  getCandleInterval,
  getCandleYDomain,
  mapCandles,
  type ChartCandle,
  type DTFCandlesResponse,
} from '../use-candlestick-data'

const DAY = 86_400
const YEAR = 31_536_000

const candle = (over: Partial<DTFCandlesResponse['candles'][number]> = {}) => ({
  timestamp: 1_700_000_000,
  open: 10,
  high: 12,
  low: 9,
  close: 11,
  count: 1,
  ...over,
})

describe('mapCandles', () => {
  it('returns [] for missing input', () => {
    expect(mapCandles(undefined)).toEqual([])
    expect(mapCandles({ address: '0x', candles: [] })).toEqual([])
  })

  it('attaches the [low, high] tuple the Bar renders against', () => {
    const [mapped] = mapCandles({ address: '0x', candles: [candle()] })
    expect(mapped.highLow).toEqual([9, 12])
    expect(mapped).toMatchObject({ open: 10, high: 12, low: 9, close: 11 })
  })

  it('drops candles with non-positive prices', () => {
    const result = mapCandles({
      address: '0x',
      candles: [
        candle({ low: 0 }),
        candle({ open: -1 }),
        candle({ close: 0 }),
        candle(),
      ],
    })
    expect(result).toHaveLength(1)
  })

  it('drops inverted candles where high < low', () => {
    const result = mapCandles({
      address: '0x',
      candles: [candle({ high: 5, low: 8 })],
    })
    expect(result).toEqual([])
  })
})

describe('getCandleInterval', () => {
  it('maps the named ranges to the expected bucket size', () => {
    expect(getCandleInterval(1 * DAY)).toBe('1h') // 24h
    expect(getCandleInterval(7 * DAY)).toBe('4h') // 7d
    expect(getCandleInterval(30 * DAY)).toBe('1d') // 1m
    expect(getCandleInterval(90 * DAY)).toBe('1d') // 3m
    expect(getCandleInterval(YEAR)).toBe('7d') // 1y
  })

  it('switches from daily to weekly candles at 4 months', () => {
    expect(getCandleInterval(120 * DAY - DAY)).toBe('1d')
    expect(getCandleInterval(120 * DAY)).toBe('7d')
  })

  it('switches to monthly candles at 2 years and beyond', () => {
    expect(getCandleInterval(2 * YEAR - DAY)).toBe('7d')
    expect(getCandleInterval(2 * YEAR)).toBe('30d')
    expect(getCandleInterval(4 * YEAR)).toBe('30d')
  })

  it('handles a tiny span (brand-new DTF) with the finest bucket', () => {
    expect(getCandleInterval(0)).toBe('1h')
    expect(getCandleInterval(3 * 3_600)).toBe('1h')
  })
})

describe('getCandleYDomain', () => {
  it('falls back to auto bounds when empty', () => {
    expect(getCandleYDomain([])).toEqual(['auto', 'auto'])
  })

  it('spans the min low and max high with padding', () => {
    const candles: ChartCandle[] = [
      { timestamp: 1, open: 10, high: 12, low: 9, close: 11, highLow: [9, 12] },
      { timestamp: 2, open: 11, high: 15, low: 8, close: 14, highLow: [8, 15] },
    ]
    const [min, max] = getCandleYDomain(candles, 0.1) as [number, number]
    // span = 15 - 8 = 7, pad = 0.7
    expect(min).toBeCloseTo(8 - 0.7)
    expect(max).toBeCloseTo(15 + 0.7)
  })

  it('handles a single flat candle (high === low) without NaN', () => {
    const candles: ChartCandle[] = [
      { timestamp: 1, open: 10, high: 10, low: 10, close: 10, highLow: [10, 10] },
    ]
    const [min, max] = getCandleYDomain(candles, 0.05) as [number, number]
    expect(Number.isFinite(min)).toBe(true)
    expect(Number.isFinite(max)).toBe(true)
    expect(min).toBeLessThan(max)
  })
})
