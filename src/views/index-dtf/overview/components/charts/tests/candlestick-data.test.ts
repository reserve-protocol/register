import { describe, expect, it } from 'vitest'
import {
  getCandleInterval,
  getCandleYDomain,
  locateCandleBucket,
  mapCandles,
  snapToBucketStart,
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

describe('snapToBucketStart', () => {
  it('is the identity for an already-aligned from', () => {
    // Jan 1 2026 00:00 UTC is exactly 2922 epoch weeks.
    expect(snapToBucketStart(2_922 * 604_800, '7d')).toBe(2_922 * 604_800)
    expect(snapToBucketStart(0, '1d')).toBe(0)
    expect(snapToBucketStart(1_783_368_000, '1h')).toBe(1_783_368_000)
  })

  it('snaps down to the containing epoch-aligned bucket', () => {
    // Jan 1 2025 00:00 UTC falls mid-week (epoch weeks start on Thursdays).
    expect(snapToBucketStart(1_735_689_600, '7d')).toBe(2_869 * 604_800)
    expect(snapToBucketStart(1_735_689_600 + 5_000, '1h')).toBe(
      1_735_689_600 + 3_600
    )
    // The 7d range: hour-aligned from that is not 4h-aligned.
    expect(snapToBucketStart(1_735_689_600 + 3_600, '4h')).toBe(1_735_689_600)
    expect(snapToBucketStart(1_735_689_600 + 5_000, '30d')).toBe(
      669 * 2_592_000
    )
  })
})

describe('locateCandleBucket', () => {
  const bucketCandle = (timestamp: number): ChartCandle => ({
    timestamp,
    open: 10,
    high: 12,
    low: 9,
    close: 11,
    highLow: [9, 12],
  })
  const candles = [bucketCandle(0), bucketCandle(100), bucketCandle(200)]

  it('returns the containing bucket and the fraction into it', () => {
    expect(locateCandleBucket(candles, 150, 100)).toEqual({
      index: 1,
      fraction: 0.5,
    })
    expect(locateCandleBucket(candles, 100, 100)).toEqual({
      index: 1,
      fraction: 0,
    })
  })

  it('returns null outside the candle span', () => {
    expect(locateCandleBucket(candles, -1, 100)).toBeNull()
    expect(locateCandleBucket(candles, 300, 100)).toBeNull()
    expect(locateCandleBucket(candles, 299, 100)).toEqual({
      index: 2,
      fraction: 0.99,
    })
  })

  it('returns null for a timestamp inside a missing (filtered) bucket', () => {
    const withGap = [bucketCandle(0), bucketCandle(200)]
    expect(locateCandleBucket(withGap, 150, 100)).toBeNull()
  })

  it('returns null for an empty series', () => {
    expect(locateCandleBucket([], 100, 100)).toBeNull()
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
