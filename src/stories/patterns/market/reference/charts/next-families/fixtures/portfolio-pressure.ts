import type { PortfolioPoint } from '../types'

const DAY = 86_400

export const PORTFOLIO_PRESSURE_PROVENANCE =
  'Lab-simulated category history; no captured non-empty portfolio history exists in the repository.'

export const portfolioPressurePoints: PortfolioPoint[] = [
  point('2025-08-24T00:00:00Z', 0, 0, 0, 0, 0),
  point('2026-01-01T00:00:00Z', 0, 0, 0, 0, 0),
  point('2026-05-24T00:00:00Z', 0, 0, 0, 0, 0),
  point('2026-05-31T23:59:59Z', 0, 0, 0, 0, 0),
  point('2026-06-01T00:00:00Z', 18_400, 9_600, 3_200, 2_400, 1_800),
  point('2026-06-08T00:00:00Z', 19_250, 9_200, 3_350, 2_550, 1_720),
  point('2026-06-15T00:00:00Z', 18_900, 10_100, 3_480, 2_600, 1_650),
  point('2026-06-22T00:00:00Z', 20_600, 10_400, 3_700, 2_760, 1_590),
  point('2026-06-29T00:00:00Z', 21_850, 10_250, 3_920, 2_900, 1_520),
  point('2026-07-06T00:00:00Z', 22_300, 11_100, 4_050, 3_100, 1_470),
  point('2026-07-13T00:00:00Z', 23_750, 11_600, 4_180, 3_260, 1_440),
  point('2026-07-20T00:00:00Z', 23_100, 12_400, 4_260, 3_380, 1_390),
  point('2026-07-27T00:00:00Z', 24_600, 12_900, 4_430, 3_520, 1_340),
  point('2026-08-03T00:00:00Z', 25_900, 13_150, 4_600, 3_680, 1_310),
  point('2026-08-10T00:00:00Z', 26_750, 13_900, 4_820, 3_860, 1_280),
  point('2026-08-17T00:00:00Z', 27_400, 14_300, 5_050, 4_100, 1_240),
  point('2026-08-24T00:00:00Z', 28_600, 14_850, 5_240, 4_360, 1_220),
]

function point(
  timestampIso: string,
  indexDTFs: number,
  yieldDTFs: number,
  stakedRSR: number,
  voteLocked: number,
  rsr: number
): PortfolioPoint {
  const timestamp = Date.parse(timestampIso) / 1000
  return {
    timestamp,
    value: indexDTFs + yieldDTFs + stakedRSR + voteLocked + rsr,
    indexDTFs,
    yieldDTFs,
    stakedRSR,
    voteLocked,
    rsr,
  }
}

export const portfolioEmptyPressurePoints: PortfolioPoint[] = []

export const portfolioPressurePeriodSeconds = 7 * DAY
export const portfolioPressureAsOfTimestamp =
  portfolioPressurePoints.at(-1)!.timestamp
