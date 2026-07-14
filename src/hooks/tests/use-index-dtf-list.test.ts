import { normalizeIndexDtfList } from '@/hooks/useIndexDTFList'
import { describe, expect, it } from 'vitest'

describe('normalizeIndexDtfList', () => {
  it('filters to index DTFs and maps staging performance fields', () => {
    const result = normalizeIndexDtfList([
      {
        address: '0x0000000000000000000000000000000000000001',
        symbol: 'LOW',
        name: 'Lower Cap',
        type: 'index',
        chainId: 8453,
        price: 10,
        marketCap: 100,
        basket: [],
        performance: [
          { timestamp: 1000, value: 9 },
          { timestamp: 2000, value: 10 },
        ],
        priceChange: {
          period: '1m',
          displayPeriod: '1M',
          percent: 11.11,
        },
      },
      {
        address: '0x0000000000000000000000000000000000000002',
        symbol: 'YLD',
        name: 'Yield DTF',
        type: 'yield',
        chainId: 1,
      },
      {
        address: '0x0000000000000000000000000000000000000003',
        symbol: 'HIGH',
        name: 'Higher Cap',
        type: 'index',
        chainId: 1,
        marketCap: 200,
        priceChange: {
          period: '1m',
          displayPeriod: '1M',
          percent: -2.5,
        },
      },
      {
        address: '0x0000000000000000000000000000000000000004',
        symbol: 'FLAT',
        name: 'Flat Cap',
        type: 'index',
        chainId: 1,
        marketCap: 150,
        priceChange: {
          period: '1m',
          displayPeriod: '1M',
          percent: null,
        },
      },
      {
        address: '0x0000000000000000000000000000000000000005',
        symbol: 'NEOCLOUD',
        name: 'Reserve AI NeoCloud DTF',
        type: 'index',
        chainId: 56,
        marketCap: 175,
      },
    ])

    expect(result.map((item) => item.symbol)).toEqual([
      'HIGH',
      'NEOCLOUD',
      'FLAT',
      'LOW',
    ])
    expect(result[0]).toMatchObject({
      performance: [],
      performancePercent: -2.5,
      priceChange: {
        period: '1m',
        displayPeriod: '1M',
        percent: -2.5,
      },
    })
    expect(result[1]).toMatchObject({
      name: 'Reserve AI Capacity & Neocloud DTF',
    })
    expect(result[3]).toMatchObject({
      performance: [
        { timestamp: 1000, value: 9 },
        { timestamp: 2000, value: 10 },
      ],
      performancePercent: 11.11,
    })
    expect(result[2]).toMatchObject({
      performancePercent: 0,
      priceChange: {
        period: '1m',
        displayPeriod: '1M',
      },
    })
  })

  it('defaults missing optional list fields', () => {
    const result = normalizeIndexDtfList([
      {
        address: '0x0000000000000000000000000000000000000001',
        symbol: 'DTF',
        name: 'Index DTF',
        type: 'index',
        chainId: 8453,
      },
    ])

    expect(result[0]).toMatchObject({
      basket: [],
      fee: 0,
      marketCap: 0,
      performance: [],
      performancePercent: 0,
      price: 0,
      status: 'active',
    })
  })
})
