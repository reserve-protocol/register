import { describe, expect, it } from 'vitest'
import { DESKTOP_PATH_CENTER_Y, DESKTOP_VISUAL_GEOMETRY } from '../constants'
import { computePackingFrame, getCycleState, getGeometry } from '../geometry'

const visual = DESKTOP_VISUAL_GEOMETRY
const geometry = getGeometry(500, DESKTOP_PATH_CENTER_Y, visual)
const ITEM_COUNT = 5

describe('computePackingFrame', () => {
  it('produces the resting frame at time 0', () => {
    const frame = computePackingFrame(0, geometry, visual, ITEM_COUNT)

    expect(frame.isReveal).toBe(false)
    expect(frame.cardOpacity).toBe(0)
    expect(frame.trajectoryOpacity).toBe(1)
    // morphProgress is 0 → the card border matches the trajectory circle
    expect(frame.borderX).toBeCloseTo(geometry.centerX - visual.trajectoryRadius)
    expect(frame.borderWidth).toBeCloseTo(visual.trajectoryRadius * 2)
    expect(frame.logoLeft).toBeCloseTo(geometry.centerX - visual.logoRadius)
    expect(frame.tickers).toHaveLength(ITEM_COUNT)
    frame.tickers.forEach((ticker) => {
      expect(ticker.opacity).toBe(0)
      expect(ticker.visibleProgress).toBe(0)
    })
  })

  it('handles an empty asset list without throwing', () => {
    const frame = computePackingFrame(1234, geometry, visual, 0)
    expect(frame.tickers).toEqual([])
  })

  it('is deterministic for the same inputs', () => {
    expect(computePackingFrame(777, geometry, visual, ITEM_COUNT)).toEqual(
      computePackingFrame(777, geometry, visual, ITEM_COUNT)
    )
  })

  it('keeps every animated value within its expected bounds across the cycle', () => {
    const minBorderWidth = visual.trajectoryRadius * 2
    const maxBorderWidth = geometry.cardWidth
    // logoX interpolates between centerX (morph 0) and finalLogoX (morph 1),
    // which may sit on either side of centerX, so bound by both endpoints.
    const logoLeftA = geometry.centerX - visual.logoRadius
    const logoLeftB = geometry.finalLogoX - visual.logoRadius
    const minLogoLeft = Math.min(logoLeftA, logoLeftB)
    const maxLogoLeft = Math.max(logoLeftA, logoLeftB)

    for (let time = 0; time <= 30_000; time += 137) {
      const frame = computePackingFrame(time, geometry, visual, ITEM_COUNT)

      expect(frame.cardOpacity).toBe(frame.isReveal ? 1 : 0)
      expect(frame.borderWidth).toBeGreaterThanOrEqual(minBorderWidth - 1e-6)
      expect(frame.borderWidth).toBeLessThanOrEqual(maxBorderWidth + 1e-6)
      expect(frame.logoLeft).toBeGreaterThanOrEqual(minLogoLeft - 1e-6)
      expect(frame.logoLeft).toBeLessThanOrEqual(maxLogoLeft + 1e-6)
      expect(frame.trajectoryOpacity).toBeGreaterThanOrEqual(0)
      expect(frame.trajectoryOpacity).toBeLessThanOrEqual(1)
      expect(frame.detailOpacity).toBeGreaterThanOrEqual(0)
      expect(frame.detailOpacity).toBeLessThanOrEqual(1)

      frame.tickers.forEach((ticker) => {
        expect(ticker.opacity).toBeGreaterThanOrEqual(0)
        expect(ticker.opacity).toBeLessThanOrEqual(1)
        expect(ticker.visibleProgress).toBeGreaterThanOrEqual(0)
        expect(ticker.visibleProgress).toBeLessThanOrEqual(1)
      })
    }
  })

  it('enters the reveal phase past the ticker window', () => {
    const { tickerMs } = getCycleState(0, ITEM_COUNT, geometry.pathLength)
    const frame = computePackingFrame(tickerMs + 10, geometry, visual, ITEM_COUNT)

    expect(frame.isReveal).toBe(true)
    expect(frame.cardOpacity).toBe(1)
  })
})
