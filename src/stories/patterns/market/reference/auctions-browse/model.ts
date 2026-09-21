import { type LifecycleStatusRole } from '@/components/lifecycle-status'
import {
  CMC20_ADDRESS,
  ILLUSTRATIVE_METRICS,
  ONGOING_FIXTURE,
  REBALANCE_IDENTITIES,
  type AuctionPhase,
  type AuctionsRun,
  type PreviewState,
  type RebalanceIdentity,
} from './fixtures'

export interface RecordMetric {
  kind?: 'permissionless' | 'auction-end' | 'expiry' | 'auctions-run'
  label: string
  value: string | null
  tone?: 'positive' | 'negative'
}

export interface BrowseRecord {
  identity: RebalanceIdentity
  href: string
  active: boolean
  status: string
  role: LifecycleStatusRole
  metrics: RecordMetric[]
  metricsLoading: boolean
  access?: 'restricted' | 'launcher' | 'permissionless'
  notice?: boolean
  auctionNumber?: number
}

export function browseRecords(
  mode: PreviewState,
  phase: AuctionPhase,
  launcherWallet = false,
  auctionsRun: AuctionsRun = 0
): BrowseRecord[] {
  if (mode === 'empty') return []
  return REBALANCE_IDENTITIES.map((identity, index): BrowseRecord => {
    const href = `/bsc/index-dtf/${CMC20_ADDRESS}/auctions/rebalance/${identity.id}`
    if (index === 0)
      return activeRecord(
        identity,
        href,
        phase,
        launcherWallet,
        auctionsRun,
        mode === 'price-unavailable'
      )
    const unavailable =
      mode === 'unavailable' || (mode === 'pressure' && index === 3)
    const metrics = unavailable
      ? { accuracy: null, priceImpact: null, auctions: null, traded: null }
      : mode === 'zero'
        ? { accuracy: null, priceImpact: 0, auctions: 0, traded: '$0' }
        : ILLUSTRATIVE_METRICS[index - 1]
    return {
      identity,
      href,
      active: false,
      status: metrics.auctions === 0 ? 'Expired' : 'Completed',
      role: 'closed',
      metricsLoading: mode === 'metrics-loading',
      metrics: [
        { label: 'Rebalance accuracy', value: percentage(metrics.accuracy) },
        {
          label: 'Total price impact',
          ...priceImpactDisplay(metrics.priceImpact),
        },
        {
          label:
            metrics.auctions === null
              ? 'Auctions run'
              : `${metrics.auctions} ${metrics.auctions === 1 ? 'Auction' : 'Auctions'} run`,
          value: metrics.traded === null ? null : `${metrics.traded} Traded`,
        },
      ],
    }
  }).filter((record) => mode !== 'historical' || !record.active)
}

function activeRecord(
  identity: RebalanceIdentity,
  href: string,
  phase: AuctionPhase,
  launcherWallet: boolean,
  auctionsRun: AuctionsRun,
  pricesUnavailable: boolean
): BrowseRecord {
  const ongoing = phase === 'ongoing'
  const notice = pricesUnavailable && !ongoing
  const now = ongoing
    ? ONGOING_FIXTURE.frozenAt
    : identity.restrictedUntil + (phase === 'restricted' ? -64_800 : 60)
  return {
    identity,
    href,
    active: true,
    status: notice
      ? 'Price unavailable — cannot launch'
      : ongoing
        ? 'Ongoing'
        : 'Ready to start',
    auctionNumber: auctionsRun + 1,
    role: ongoing ? 'active' : notice ? 'waiting' : 'actionable',
    notice,
    access: ongoing
      ? undefined
      : phase === 'permissionless'
        ? 'permissionless'
        : launcherWallet
          ? 'launcher'
          : 'restricted',
    metricsLoading: false,
    metrics: [
      ...(ongoing
        ? [
            {
              kind: 'auction-end' as const,
              label: 'Ends in',
              value: duration(ONGOING_FIXTURE.endTime - now),
            },
          ]
        : phase === 'restricted'
          ? [
              {
                kind: 'permissionless' as const,
                label: 'Permissionless in',
                value: duration(identity.restrictedUntil - now),
              },
            ]
          : []),
      {
        kind: 'expiry',
        label: 'Expires in',
        value: duration(identity.availableUntil - now),
      },
      ...(auctionsRun > 0
        ? [
            {
              kind: 'auctions-run' as const,
              label: 'Auctions run',
              value: String(auctionsRun),
            },
          ]
        : []),
    ],
  }
}

export function priceImpactDisplay(
  cost: number | null
): Pick<RecordMetric, 'value' | 'tone'> {
  if (cost === null || !Number.isFinite(cost)) return { value: null }
  return {
    value: `${cost > 0 ? '−' : cost < 0 ? '+' : ''}${percentage(Math.abs(cost))}`,
    tone: cost > 0 ? 'negative' : cost < 0 ? 'positive' : undefined,
  }
}

function percentage(value: number | null) {
  return value === null || !Number.isFinite(value)
    ? null
    : `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)}%`
}

function duration(seconds: number) {
  const minutes = Math.max(0, Math.floor(seconds / 60))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days) return `${days}d${hours ? ` ${hours}h` : ''}`
  if (hours) return `${hours}h${minutes % 60 ? ` ${minutes % 60} min` : ''}`
  return `${minutes} min`
}
