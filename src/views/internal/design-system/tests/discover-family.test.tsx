import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  DISCOVER,
  previewDiscover,
  finiteValue,
  validTrend,
  trendDomain,
} from '../table-family/discover-fixtures'
import { DiscoverMoney } from '../table-family/discover-cells'
import { DiscoverCardMarket } from '../table-family/discover-card-market'

describe('Discover fixture meaning', () => {
  it('uses the visible card period for the accessible value and tooltip', () => {
    const { container, rerender } = render(
      <DiscoverCardMarket row={DISCOVER[0]} loading={false} />
    )
    expect(screen.getByText('(1M)')).toBeInTheDocument()
    const performance = () =>
      container.querySelector('[data-slot="performance-value"]')
    expect(performance()).toHaveAccessibleName(/^1M performance:/)
    expect(performance()).toHaveAttribute('title', '1M performance')
    rerender(
      <DiscoverCardMarket
        row={{ ...DISCOVER[0], change: null }}
        loading={false}
      />
    )
    expect(performance()).toHaveAccessibleName('1M performance: no data')
    expect(performance()).toHaveTextContent('—')
  })

  it('keeps real held-token counts and percentage units', () => {
    const lcap = DISCOVER.find((row) => row.symbol === 'LCAP')!
    expect(lcap.basket).toHaveLength(8)
    expect(lcap.basket[0]).toMatchObject({ symbol: 'cbBTC', weight: '41.14' })
    expect(lcap.change).toBeCloseTo(27.0523883)
    expect(lcap.series).toHaveLength(31)
  })
  it('does not leak inactive or mutated pressure data into the default sample', () => {
    expect(previewDiscover('default')).toHaveLength(5)
    expect(previewDiscover('inactive')).toHaveLength(6)
    expect(previewDiscover('missing')[0].price).toBe(0)
    expect(previewDiscover('missing')[1].price).toBeNull()
    expect(previewDiscover('long')[0].name).toContain('long-name fixture')
    expect(previewDiscover('short-basket')[0].basket).toHaveLength(1)
    expect(previewDiscover('short-basket')[0].basket[0].weight).toBe('100')
    expect(previewDiscover('default')[0].basket).toHaveLength(18)
    expect(previewDiscover('default')[0].name).toBe(
      'CoinMarketCap 20 Index DTF'
    )
    expect(previewDiscover('default')[0].price).toBeGreaterThan(0)
  })
  it('keeps unavailable prices distinct from a real zero', () => {
    render(
      <>
        <DiscoverMoney value={0} />
        <DiscoverMoney value={null} />
        <DiscoverMoney value={NaN} />
      </>
    )
    expect(screen.getByText('$0.00')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)
    expect(finiteValue(Infinity)).toBeNull()
  })
  it('does not invent or join an invalid series and handles a flat trend', () => {
    expect(validTrend([])).toBe(false)
    expect(validTrend([{ timestamp: 1, value: 1 }])).toBe(false)
    expect(
      validTrend([
        { timestamp: 1, value: 1 },
        { timestamp: 2, value: NaN },
      ])
    ).toBe(false)
    expect(
      validTrend([
        { timestamp: 2, value: 1 },
        { timestamp: 1, value: 1 },
      ])
    ).toBe(false)
    expect(
      validTrend([
        { timestamp: 1, value: 1 },
        { timestamp: 2, value: 1 },
      ])
    ).toBe(true)
    expect(trendDomain([1, 1])).toEqual([0.99, 1.01])
    expect(trendDomain([0, 10])).toEqual([-0.8, 10.8])
  })
})
