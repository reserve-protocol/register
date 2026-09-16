import { describe, expect, it } from 'vitest'
import {
  filterRowsToPoints,
  formatTimelineTick,
  getRangeStart,
  getRangeWindow,
  getTimelineTicks,
  pointsInRange,
} from '../range-control'

const timestamp = (iso: string) => Date.parse(iso) / 1000

describe('next-family requested history windows', () => {
  it('gives finite ranges the complete requested domain without inventing points', () => {
    const availableFrom = timestamp('2026-07-27T03:17:21Z')
    const asOf = timestamp('2026-08-24T19:17:05Z')
    const points = [
      { timestamp: availableFrom, value: 1.12 },
      { timestamp: timestamp('2026-08-10T00:00:00Z'), value: 1.13 },
      { timestamp: asOf, value: 1.14 },
      { timestamp: timestamp('2026-08-25T00:00:00Z'), value: 99 },
    ]

    const window = getRangeWindow(points, '1y', asOf)

    expect(window.domain).toEqual([timestamp('2025-08-24T19:17:05Z'), asOf])
    expect(window.points).toEqual(points.slice(0, 3))
    expect(window.availableFrom).toBe(availableFrom)
    expect(window.isPartialCoverage).toBe(true)
  })

  it('can present ordinary ranges on their available real-point bounds', () => {
    const availableFrom = timestamp('2026-07-27T03:17:21Z')
    const asOf = timestamp('2026-08-24T19:17:05Z')
    const points = [
      { timestamp: availableFrom, value: 1.12 },
      { timestamp: timestamp('2026-08-10T00:00:00Z'), value: 1.13 },
      { timestamp: asOf, value: 1.14 },
    ]

    const window = getRangeWindow(points, '1y', asOf, 'available')

    expect(window.points).toEqual(points)
    expect(window.domain).toEqual([availableFrom, asOf])
    expect(window.isPartialCoverage).toBe(true)
  })

  it('uses actual available minimum and maximum for All', () => {
    const earliest = { timestamp: timestamp('2025-08-25T23:13:29Z') }
    const middle = { timestamp: timestamp('2026-01-01T00:00:00Z') }
    const latest = { timestamp: timestamp('2026-08-24T19:17:05Z') }
    const points = [latest, earliest, middle]

    expect(
      getRangeWindow(points, 'all', timestamp('2026-09-01T00:00:00Z'))
    ).toEqual({
      points: [earliest, middle, latest],
      domain: [earliest.timestamp, latest.timestamp],
      isPartialCoverage: false,
      availableFrom: earliest.timestamp,
    })
    expect(points).toEqual([latest, earliest, middle])
  })

  it('sorts finite real points without extending beyond the supplied as-of time', () => {
    const asOf = timestamp('2026-08-24T19:17:05Z')
    const included = [
      { timestamp: timestamp('2026-08-10T00:00:00Z') },
      { timestamp: timestamp('2026-08-20T00:00:00Z') },
    ]
    const points = [
      included[1],
      { timestamp: timestamp('2026-08-25T00:00:00Z') },
      included[0],
    ]

    expect(getRangeWindow(points, '1m', asOf).points).toEqual(included)
  })

  it('defaults an unsorted finite series to its actual latest timestamp', () => {
    const early = { timestamp: timestamp('2026-08-10T00:00:00Z') }
    const middle = { timestamp: timestamp('2026-08-20T00:00:00Z') }
    const latest = { timestamp: timestamp('2026-08-25T00:00:00Z') }

    expect(pointsInRange([latest, middle, early], '7d')).toEqual([
      middle,
      latest,
    ])
  })

  it('derives two narrow and three desktop ticks from the requested domain', () => {
    const domain: [number, number] = [
      timestamp('2025-08-24T19:17:05Z'),
      timestamp('2026-08-24T19:17:05Z'),
    ]

    expect(getTimelineTicks(domain, 320)).toEqual(domain)
    expect(getTimelineTicks(domain, 640)).toEqual([
      domain[0],
      Math.round((domain[0] + domain[1]) / 2),
      domain[1],
    ])
  })

  it('deduplicates coincident ticks and handles one or no available point', () => {
    expect(getTimelineTicks([10, 11], 640)).toEqual([10, 11])
    expect(getTimelineTicks([10, 10], 640)).toEqual([10])
    expect(getTimelineTicks(undefined, 640)).toEqual([])
    expect(getRangeWindow([], 'all', 10)).toEqual({
      points: [],
      domain: undefined,
      isPartialCoverage: false,
      availableFrom: undefined,
    })
  })

  it('keeps a finite requested domain when only one real point is available', () => {
    const asOf = timestamp('2026-08-24T00:00:00Z')
    const point = { timestamp: asOf, value: 1 }

    expect(getRangeWindow([point], '1m', asOf)).toEqual({
      points: [point],
      domain: [timestamp('2026-07-24T00:00:00Z'), asOf],
      isPartialCoverage: true,
      availableFrom: asOf,
    })
  })

  it('clamps UTC calendar windows at month and leap-year boundaries', () => {
    expect(getRangeStart('1m', timestamp('2024-03-31T12:30:15Z'))).toBe(
      timestamp('2024-02-29T12:30:15Z')
    )
    expect(getRangeStart('3m', timestamp('2024-05-31T12:30:15Z'))).toBe(
      timestamp('2024-02-29T12:30:15Z')
    )
    expect(getRangeStart('1y', timestamp('2024-02-29T12:30:15Z'))).toBe(
      timestamp('2023-02-28T12:30:15Z')
    )
    expect(getRangeStart('ytd', timestamp('2024-08-24T12:30:15Z'))).toBe(
      timestamp('2024-01-01T00:00:00Z')
    )
  })

  it('includes years when the requested domain crosses a year boundary', () => {
    const crossYear: [number, number] = [
      timestamp('2025-08-24T19:17:05Z'),
      timestamp('2026-08-24T19:17:05Z'),
    ]
    const sameYear: [number, number] = [
      timestamp('2026-07-24T19:17:05Z'),
      timestamp('2026-08-24T19:17:05Z'),
    ]

    expect(formatTimelineTick(crossYear[0], crossYear)).toBe('24 Aug 2025')
    expect(formatTimelineTick(crossYear[1], crossYear)).toBe('24 Aug 2026')
    expect(formatTimelineTick(sameYear[0], sameYear)).toBe('24 Jul')
  })

  it('keeps CSV rows only for the visible real points', () => {
    const rows = [
      { timestamp: '1', value: 'captured-1' },
      { timestamp: '2', value: 'captured-2' },
      { timestamp: '3', value: 'captured-3' },
    ]

    expect(filterRowsToPoints(rows, [{ timestamp: 2 }])).toEqual([rows[1]])
  })
})
