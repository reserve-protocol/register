import Decimal from 'decimal.js-light'
import { formatUnits } from 'viem'
import { formatCurrency, formatPercentage } from '@/utils'
import captured from './fixtures/hyusd-history.json'
import {
  APY_PRESSURE_PROVENANCE,
  apyPressurePoints,
} from './fixtures/apy-pressure'
import type { HistoricalMetric, HistoricalPoint } from './types'

type RawSnapshot = {
  timestamp: string
  priceUSD?: string
  supply?: string
  rsrStaked?: string
}

const chronological = (points: HistoricalPoint[]) =>
  [...points].sort((a, b) => a.timestamp - b.timestamp)

const priceSnapshots = captured.price.data.token.snapshots
const supplySnapshots = captured.supplyAndStakedRSR.data.token.snapshots
const stakedRsrSnapshots = captured.supplyAndStakedRSR.data.rtoken.snapshots

const pricePoints = chronological(
  priceSnapshots.map((snapshot: RawSnapshot) => ({
    timestamp: Number(snapshot.timestamp),
    value: Number(snapshot.priceUSD),
  }))
)

const supplyPoints = chronological(
  supplySnapshots.map((snapshot: RawSnapshot) => ({
    timestamp: Number(snapshot.timestamp),
    value: supplyValue(snapshot),
  }))
)

const stakedRsrPoints = chronological(
  stakedRsrSnapshots.map((snapshot: RawSnapshot) => ({
    timestamp: Number(snapshot.timestamp),
    value: stakedRsrUsdValue(snapshot),
  }))
)

const lastValue = (points: HistoricalPoint[]) => points.at(-1)?.value ?? 0
const lastTimestamp = (points: HistoricalPoint[]) =>
  points.at(-1)?.timestamp ?? 0

export const capturedYieldProvenance = captured.provenance
export const capturedRsrPriceProvenance = captured.rsrPrice

export const historicalMetrics: HistoricalMetric[] = [
  {
    id: 'price',
    heading: 'hyUSD Price',
    headline: `$${formatCurrency(lastValue(pricePoints), 3)}`,
    unit: 'USD per hyUSD',
    sourceLabel: `Captured ${captured.provenance.snapshotMeta.capturedAt}`,
    isSynthetic: false,
    asOfTimestamp: lastTimestamp(pricePoints),
    points: pricePoints,
    csv: {
      headers: [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'priceUSD', label: 'Price USD' },
      ],
      rows: priceSnapshots.map((snapshot) => ({
        timestamp: snapshot.timestamp,
        priceUSD: snapshot.priceUSD,
      })),
      filename: 'hyUSD-historical-price',
    },
  },
  {
    id: 'apy',
    heading: 'hyUSD APY',
    headline: formatPercentage(lastValue(apyPressurePoints)),
    unit: 'Annual percentage yield',
    sourceLabel: APY_PRESSURE_PROVENANCE,
    isSynthetic: true,
    asOfTimestamp: lastTimestamp(apyPressurePoints),
    points: apyPressurePoints,
    csvUnavailableReason: 'Unavailable for simulated APY input',
  },
  {
    id: 'supply',
    heading: 'Supply',
    headline: `${formatCurrency(lastValue(supplyPoints))} hyUSD`,
    unit: 'hyUSD',
    sourceLabel: `Captured ${captured.provenance.snapshotMeta.capturedAt}`,
    isSynthetic: false,
    asOfTimestamp: lastTimestamp(supplyPoints),
    points: supplyPoints,
    csv: {
      headers: [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'supply', label: 'Supply' },
      ],
      rows: supplySnapshots.map((snapshot) => ({
        timestamp: snapshot.timestamp,
        supply: supplyValue(snapshot),
      })),
      filename: 'hyUSD-historical-supply',
    },
  },
  {
    id: 'staked-rsr',
    heading: 'RSR Staked',
    headline: `$${formatCurrency(lastValue(stakedRsrPoints))}`,
    unit: 'USD value of RSR staked',
    sourceLabel: `Captured RSR history ${captured.provenance.snapshotMeta.capturedAt}; independently captured RSR/USD ${captured.rsrPrice.capturedAt}`,
    isSynthetic: false,
    asOfTimestamp: lastTimestamp(stakedRsrPoints),
    points: stakedRsrPoints,
    csv: {
      headers: [
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'rsrStaked', label: 'RSR Staked (USD)' },
      ],
      rows: stakedRsrSnapshots.map((snapshot) => ({
        timestamp: snapshot.timestamp,
        rsrStaked: stakedRsrUsdValue(snapshot),
      })),
      filename: 'hyUSD-historical-staking',
    },
  },
]

export const emptyMetric: HistoricalMetric = {
  ...historicalMetrics[0],
  headline: '—',
  sourceLabel: 'Lab-simulated empty state',
  isSynthetic: true,
  points: [],
  csv: undefined,
  csvUnavailableReason: 'Unavailable when no chart data is present',
}

function supplyValue(snapshot: RawSnapshot) {
  return Number(formatUnits(BigInt(snapshot.supply ?? '0'), 18))
}

function stakedRsrUsdValue(snapshot: RawSnapshot) {
  return new Decimal(formatUnits(BigInt(snapshot.rsrStaked ?? '0'), 18))
    .mul(captured.rsrPrice.usd)
    .toNumber()
}
