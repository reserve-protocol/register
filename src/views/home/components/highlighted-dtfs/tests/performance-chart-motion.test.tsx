import { describe, expect, it } from 'vitest'
import { Children, isValidElement, type ReactNode } from 'react'
import {
  renderPerformancePatternSeries,
  renderPerformanceStrokeDefs,
  renderPerformanceStrokeSeries,
} from '../performance-chart-renderers'
import { renderToStaticMarkup } from 'react-dom/server'

function animationFlags(node: ReactNode): unknown[] {
  return Children.toArray(node).flatMap((child) => {
    if (!isValidElement(child)) return []
    return child.props.children
      ? animationFlags(child.props.children)
      : [child.props.isAnimationActive]
  })
}

describe('feature chart motion opt-in', () => {
  for (const shouldSplit of [false, true]) {
    it(`disables both actual series layers, split=${shouldSplit}`, () => {
      const patterns = {
        direction: 'positive' as const,
        dotsMaskId: 'mask',
        dotsPatternId: 'dots',
        fillGradientId: 'fill',
        preLaunchDotsPatternId: 'pre',
        shouldSplit,
        showPattern: true,
      }
      const strokes = {
        lineShadowFilterId: 'shadow',
        performanceColor: 'currentColor',
        shouldSplit,
      }
      expect(animationFlags(renderPerformancePatternSeries(patterns))).toEqual(
        shouldSplit ? [true, true] : [true]
      )
      expect(animationFlags(renderPerformanceStrokeSeries(strokes))).toEqual(
        shouldSplit ? [true, true] : [true]
      )
      expect(
        animationFlags(
          renderPerformancePatternSeries({ ...patterns, animate: false })
        )
      ).toEqual(shouldSplit ? [false, false] : [false])
      expect(
        animationFlags(
          renderPerformanceStrokeSeries({ ...strokes, animate: false })
        )
      ).toEqual(shouldSplit ? [false, false] : [false])
    })
  }
})

describe('feature chart gradient coordinates', () => {
  const props = {
    direction: 'positive' as const,
    lineShadowFilterId: 'shadow',
    strokeGradientId: 'stroke',
  }

  it('preserves the existing object-bounding-box gradient by default', () => {
    const markup = renderToStaticMarkup(renderPerformanceStrokeDefs(props))

    expect(markup).toContain(
      '<linearGradient id="stroke" x1="0" y1="1" x2="0" y2="0">'
    )
    expect(markup).not.toContain('gradientUnits="userSpaceOnUse"')
  })

  it('uses supplied plot coordinates for an exact shared line and marker gradient', () => {
    const markup = renderToStaticMarkup(
      renderPerformanceStrokeDefs({
        ...props,
        strokeGradientCoordinates: { top: 6, bottom: 208 },
      })
    )

    expect(markup).toContain(
      '<linearGradient id="stroke" x1="0" y1="208" x2="0" y2="6" gradientUnits="userSpaceOnUse">'
    )
  })
})
