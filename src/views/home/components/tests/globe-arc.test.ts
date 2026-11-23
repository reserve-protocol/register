import { describe, expect, it } from 'vitest'
import { ARC_HEAD_RADIUS, ARC_LIFT, arcGlobeRadius, arcVisibility, arcWindow, hasVisibleDeparture } from '../globe-arc'

describe('globe arc visibility', () => {
  it('only launches routes with a visible departure and middle', () => {
    expect(hasVisibleDeparture(() => 0)).toBe(false)
    expect(hasVisibleDeparture((u) => u === 0 ? 1 : 0)).toBe(false)
    expect(hasVisibleDeparture(() => 1)).toBe(true)
  })
  it.each([280, 520])('fits a raised trail and dot in a %ipx-wide canvas', (width) => {
    const height = 320
    const maxExtent = arcGlobeRadius(width, height) * (1 + ARC_LIFT) + ARC_HEAD_RADIUS
    expect(maxExtent).toBeLessThan(Math.min(width, height) / 2)
  })

  it('keeps raised trails visible past the limb until the globe actually occludes them', () => {
    expect(arcVisibility(-0.2, 110, 100)).toBe(1)
    expect(arcVisibility(-0.2, 102, 100)).toBeGreaterThan(0)
    expect(arcVisibility(-0.2, 102, 100)).toBeLessThan(1)
    expect(arcVisibility(-0.2, 100, 100)).toBe(0)
    expect(arcVisibility(0.2, 90, 100)).toBe(1)
  })

  it('fades the head through arrival and retires the trail at the destination', () => {
    expect(arcWindow(1).opacity).toBe(1)
    expect(arcWindow(1.01).opacity).toBeGreaterThan(0.95)
    expect(arcWindow(1.4).tail).toBeLessThan(1)
    expect(arcWindow(1.45)).toEqual({ head: 1, tail: 1, opacity: 0 })
  })
})
