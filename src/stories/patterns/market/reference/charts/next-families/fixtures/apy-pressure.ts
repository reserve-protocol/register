import type { HistoricalPoint } from '../types'

export const APY_PRESSURE_PROVENANCE =
  'Lab-simulated APY levels; the repository capture does not contain the external yield-history inputs needed to replay the production derivation.'

export const apyPressurePoints: HistoricalPoint[] = [
  { timestamp: Date.parse('2026-08-01T00:00:00Z') / 1000, value: 5.42 },
  { timestamp: Date.parse('2026-08-05T00:00:00Z') / 1000, value: 5.37 },
  { timestamp: Date.parse('2026-08-09T00:00:00Z') / 1000, value: 5.61 },
  { timestamp: Date.parse('2026-08-13T00:00:00Z') / 1000, value: 5.58 },
  { timestamp: Date.parse('2026-08-17T00:00:00Z') / 1000, value: 5.76 },
  { timestamp: Date.parse('2026-08-21T00:00:00Z') / 1000, value: 5.69 },
  { timestamp: Date.parse('2026-08-25T00:00:00Z') / 1000, value: 5.83 },
  { timestamp: Date.parse('2026-08-29T00:00:00Z') / 1000, value: 5.79 },
]
