import { Children, isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PERFORMANCE_COLORS } from '@/utils/chart-performance-colors'
import { renderPriceChartDefs } from '../price-chart-defs'
import { renderPriceChartSeries } from '../price-chart-series'
import {
  ChartLatestPointMarker,
  getYAxisPresentation,
  measureDisplayedYAxisLabelWidth,
} from '../chart-presentation'

const baseProps = {
  dotFillColor: PERFORMANCE_COLORS.positive.dot,
  dotsFadeGradientId: 'fade',
  dotsMaskId: 'mask',
  dotsPatternId: 'dots',
  fillGradientId: 'fill',
  isYieldMode: false,
  performanceDirection: 'positive' as const,
  preLaunchDotsPatternId: 'pre-launch',
  priceColors: PERFORMANCE_COLORS,
  priceLineShadowFilterId: 'shadow',
  priceStrokeGradientId: 'stroke',
  usePerformanceColors: true,
}

describe('price chart presentation opt-ins', () => {
  it('preserves the existing object-bounding-box gradient by default', () => {
    const markup = renderToStaticMarkup(renderPriceChartDefs(baseProps))

    expect(markup).toContain(
      '<linearGradient id="stroke" x1="0" y1="1" x2="0" y2="0">'
    )
    expect(markup).not.toContain('gradientUnits="userSpaceOnUse"')
  })

  it('uses supplied plot coordinates for an exact shared line and marker gradient', () => {
    const markup = renderToStaticMarkup(
      renderPriceChartDefs({
        ...baseProps,
        strokeGradientCoordinates: { top: 5, bottom: 295 },
      })
    )

    expect(markup).toContain(
      '<linearGradient id="stroke" x1="0" y1="295" x2="0" y2="5" gradientUnits="userSpaceOnUse">'
    )
  })

  it('keeps the renderer Y axis defaults when the opt-in is omitted', () => {
    expect(
      getYAxisPresentation({
        isCompact: false,
        isMobile: false,
      })
    ).toEqual({
      tick: { fontSize: 13, opacity: 0.7, textAnchor: 'end', dx: 44 },
      tickMargin: 5,
      tickSize: undefined,
      width: 55,
    })
  })

  it('right-aligns compact labels with ring clearance and keeps mobile hidden', () => {
    expect(
      getYAxisPresentation({
        isCompact: true,
        isMobile: false,
        labelWidth: 64,
        plotEdgeInset: 3,
      })
    ).toEqual({
      tick: { fontSize: 13, opacity: 0.7, textAnchor: 'end', dx: 69 },
      tickMargin: 8,
      tickSize: 0,
      width: 77,
    })
    expect(
      getYAxisPresentation({
        isCompact: true,
        isMobile: true,
      })
    ).toEqual({ tick: false, width: 0 })
  })

  it('measures only the labels that the Y axis actually displays', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <svg>
        <g class="recharts-yAxis">
          <text>$45K</text><text>$30K</text><text>$15K</text><text>$0</text>
        </g>
      </svg>
    `
    const widths = new Map([
      ['$45K', 30.6],
      ['$30K', 29.8],
      ['$15K', 29.4],
      ['$0', 13.2],
    ])
    for (const label of root.querySelectorAll<SVGTextElement>('text')) {
      label.getBBox = () =>
        ({ width: widths.get(label.textContent ?? '') ?? 0 }) as DOMRect
    }

    expect(measureDisplayedYAxisLabelWidth(root)).toBe(30.6)
  })

  it('centers the shared marker geometry on the scaled point', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <ChartLatestPointMarker
          fill="url(#stroke)"
          isInspecting={false}
          point={{ timestamp: 20, value: 40 }}
          ringColor="hsl(var(--card))"
          xAxisMap={{ 0: { scale: (value) => value + 3 } }}
          yAxisMap={{ 0: { scale: (value) => value + 5 } }}
        />
      </svg>
    )

    expect(markup).toContain('cx="23"')
    expect(markup).toContain('cy="45"')
    expect(markup).toContain('r="3"')
    expect(markup).toContain('stroke-width="2"')
    expect(markup).not.toContain('transform=')
  })

  it('suppresses Recharts active dots only for the custom marker opt-in', () => {
    const props = {
      chartKey: 'price' as const,
      dotsMaskId: 'mask',
      fill: 'fill',
      isYieldMode: false,
      preLaunchFill: 'pre',
      priceLineShadowFilterId: 'shadow',
      shouldSplit: true,
      strokeColor: 'stroke',
    }
    const activeDots = (value: ReturnType<typeof renderPriceChartSeries>) =>
      Children.toArray(value).map((child) =>
        isValidElement(child) ? child.props.activeDot : null
      )

    expect(activeDots(renderPriceChartSeries(props))).toEqual([
      true,
      true,
      true,
      true,
    ])
    expect(
      activeDots(renderPriceChartSeries({ ...props, activeDot: false }))
    ).toEqual([false, false, false, false])
  })
})
