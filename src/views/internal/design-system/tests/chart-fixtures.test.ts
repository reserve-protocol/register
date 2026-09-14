import { describe, expect, it } from 'vitest'
import { CAPTURED_DENSE, chartSample } from '../charts/fixtures'
import monthly from '../charts/fixtures/monthly-daily.json'
import weekly from '../charts/fixtures/weekly-hourly.json'
import dense from '../charts/fixtures/monthly-hourly.json'
import { homePoints, overviewPoints, photon } from '../charts/source-data'

describe('chart review supplied-data boundary', () => {
  it('replays each PHOTON capture without reconciling, deduping or deriving returns', () => {
    expect(homePoints.map((p) => [p.timestamp, p.value])).toEqual(
      photon.homePoints
    )
    expect(overviewPoints.map((p) => [p.timestamp, p.price])).toEqual(
      photon.overviewPoints
    )
    expect(homePoints).toHaveLength(252)
    expect(overviewPoints).toHaveLength(257)
    expect(photon.provenance.overviewHeadline.price).toBe('$81.50')
    expect(photon.homePrice).toBe(83.61926833752679)
    expect(photon.homeChange).toBe(76.30198876215192)
  })
  it('retains every captured value and timestamp without resampling', () => {
    for (const [range, capture] of [
      ['1M', monthly],
      ['7D', weekly],
    ] as const) {
      const sample = chartSample(range, 'captured')
      expect(sample.points.map((p) => [p.timestamp, p.value])).toEqual(
        capture.points
      )
      expect(sample.simulated).toBe(false)
      expect(capture.sourceSha256).toMatch(/^[a-f0-9]{64}$/)
    }
    expect(CAPTURED_DENSE.map((p) => [p.timestamp, p.value])).toEqual(
      dense.points
    )
    expect([
      monthly.points.length,
      weekly.points.length,
      dense.points.length,
    ]).toEqual([31, 169, 721])
    expect(chartSample('1M', 'captured').points.at(-1)?.valueLabel).toBe(
      '$6.6391'
    )
    expect(chartSample('1M', 'captured').points.at(-1)?.timeLabel).toBe(
      '13 Sept 2026, 13:55 UTC'
    )
  })

  it('keeps missing, zero, gaps and estimates explicit and separate', () => {
    for (const state of ['loading', 'empty', 'unavailable'] as const) {
      expect(chartSample('7D', state)).toMatchObject({
        range: '7D',
        points: [],
        simulated: true,
      })
    }
    expect(
      chartSample('1M', 'zero').points.every(
        (p) => p.value === 0 && p.valueLabel === '$0.00'
      )
    ).toBe(true)
    const gap = chartSample('1M', 'gapped')
    expect(gap.points).toHaveLength(21)
    expect(gap.points.filter((p) => p.breakBefore)).toHaveLength(1)
    expect(gap.points[10].timestamp).toBe(monthly.points[20][0])
    expect(
      chartSample('1M', 'estimated').points.filter((p) => p.estimated)
    ).toHaveLength(8)
    expect(chartSample('1M', 'delayed').points).toEqual(
      chartSample('1M', 'captured').points
    )
    expect(
      chartSample('1M', 'captured').points.every(
        (p) => p.estimated === undefined && p.breakBefore === undefined
      )
    ).toBe(true)
  })
})
