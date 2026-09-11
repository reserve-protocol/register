import { describe, expect, it } from 'vitest'
import { Children, isValidElement, type ReactNode } from 'react'
import {
  renderPerformancePatternSeries,
  renderPerformanceStrokeSeries,
} from '../performance-chart-renderers'

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
