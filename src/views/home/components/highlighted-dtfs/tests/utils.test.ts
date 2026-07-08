import type { Address } from 'viem'
import { describe, expect, it } from 'vitest'
import type {
  FeaturedDTFItem,
  FeaturedExposureGroup,
} from '../../../hooks/use-featured-dtfs'
import { BACKING_LIMIT } from '../constants'
import {
  formatPerformancePeriodLabel,
  getExposureTickerAssets,
  mapExposureGroupsToTickers,
} from '../utils'

const makeDtf = (overrides: Partial<FeaturedDTFItem>): FeaturedDTFItem =>
  ({
    address: '0x1',
    symbol: 'TEST',
    name: 'Test DTF',
    basket: [],
    performance: [],
    exposure: [],
    ...overrides,
  }) as FeaturedDTFItem

const token = (symbol: string, weight: number) => ({
  address: `0x${symbol}` as Address,
  symbol,
  weight,
})

describe('mapExposureGroupsToTickers', () => {
  it('orders tickers by weight descending before applying the limit', () => {
    const exposure: FeaturedExposureGroup[] = [
      {
        native: null,
        totalWeight: 24.31,
        tokens: [token('AXTI', 1.17), token('LITE', 16.28), token('MTSI', 6.86)],
      },
      {
        native: {
          symbol: 'XRP',
          name: 'XRP',
          logo: '',
          caip2: 'xrp:mainnet',
        },
        totalWeight: 20,
        tokens: [token('wXRP', 20)],
      },
    ]

    const tickers = mapExposureGroupsToTickers(exposure)

    expect(tickers.map((asset) => asset.symbol)).toEqual([
      'XRP',
      'LITE',
      'MTSI',
      'AXTI',
    ])
  })

  it('keeps the heaviest assets when the list exceeds the limit', () => {
    const exposure: FeaturedExposureGroup[] = [
      {
        native: null,
        totalWeight: 100,
        tokens: Array.from({ length: BACKING_LIMIT + 3 }, (_, index) =>
          token(`T${index}`, index + 1)
        ),
      },
    ]

    const tickers = mapExposureGroupsToTickers(exposure)

    expect(tickers).toHaveLength(BACKING_LIMIT)
    expect(tickers[0].symbol).toBe(`T${BACKING_LIMIT + 2}`)
    expect(tickers.map((asset) => Number(asset.weight))).toEqual(
      Array.from({ length: BACKING_LIMIT }, (_, index) => BACKING_LIMIT + 3 - index)
    )
  })
})

describe('getExposureTickerAssets', () => {
  it('sorts the basket fallback by weight descending', () => {
    const dtf = makeDtf({
      exposure: [],
      basket: [
        { address: '0xa', symbol: 'A', name: 'A', weight: '1.5' },
        { address: '0xb', symbol: 'B', name: 'B', weight: '55.2' },
        { address: '0xc', symbol: 'C', name: 'C', weight: '12.01' },
      ],
    })

    expect(getExposureTickerAssets(dtf).map((asset) => asset.symbol)).toEqual([
      'B',
      'C',
      'A',
    ])
  })
})

describe('formatPerformancePeriodLabel', () => {
  it("renders the server's ytd period as YTD", () => {
    expect(formatPerformancePeriodLabel('ytd')).toBe('YTD')
  })

  it('falls back to YTD when the server omits the period', () => {
    expect(formatPerformancePeriodLabel(undefined)).toBe('YTD')
  })
})
