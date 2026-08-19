import { Button } from '@/components/button'
import { Metric } from '@/components/metric'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import { candidateSemanticRoles as roles } from './candidate-semantic-roles'
import GovernanceProposalStateReview from './governance-proposal-state-review'
import { LifecycleStatusPill } from '@/components/lifecycle-status'

const AUCTIONS_ROUTE = '/bsc/index-dtf/cmc20/auctions'

interface RebalanceDiagnostic {
  label: string
  value: string
  tone?: 'performance-negative'
}

interface RebalanceOperationalMetric {
  label: string
  value: string
}

interface RebalanceRecordBase {
  title: string
  status: string
  proposedAt: string
  proposer: string
}

interface OperationalRebalanceRecord extends RebalanceRecordBase {
  state: 'ready' | 'ongoing'
  auction: string
  metrics: RebalanceOperationalMetric[]
}

interface CompletedRebalanceRecord extends RebalanceRecordBase {
  state: 'completed'
  auctionCount: string
  metrics: RebalanceDiagnostic[]
}

type RebalanceRecordData = OperationalRebalanceRecord | CompletedRebalanceRecord

const REBALANCE_RECORDS: RebalanceRecordData[] = [
  {
    title: 'September 2026 Rebalance',
    state: 'ready',
    status: 'Ready to start',
    auction: 'Auction 1',
    metrics: [
      {
        label: 'Permissionless in',
        value: '18h',
      },
      { label: 'Expires in', value: '2d 4h' },
    ],
    proposedAt: 'Fri Aug 14, 11:20 am',
    proposer: '0xb209…5015',
  },
  {
    title: 'Swap Wrapped TONCOIN Basket Component',
    state: 'ongoing',
    status: 'Ongoing',
    auction: 'Auction 2',
    metrics: [
      {
        label: 'Current auction ends in',
        value: '12 min',
      },
      {
        label: 'Rebalance expires in',
        value: '1d 6h',
      },
    ],
    proposedAt: 'Thu Aug 13, 04:39 am',
    proposer: '0xb209…5015',
  },
  {
    title: 'August 2026 Rebalance',
    state: 'completed',
    status: 'Completed',
    auctionCount: '1 auction',
    metrics: [
      { label: 'Rebalance accuracy', value: '100%' },
      {
        label: 'Total price impact',
        value: '−1.51%',
        tone: 'performance-negative',
      },
      { label: 'Value traded', value: '$11,593' },
    ],
    proposedAt: 'Mon Aug 03, 08:50 pm',
    proposer: '0xb209…5015',
  },
  {
    title: 'July 2026 Rebalance',
    state: 'completed',
    status: 'Completed',
    auctionCount: '3 auctions',
    metrics: [
      {
        label: 'Rebalance accuracy',
        value: '96.4%',
        tone: 'performance-negative',
      },
      {
        label: 'Total price impact',
        value: '−6.20%',
        tone: 'performance-negative',
      },
      { label: 'Value traded', value: '$84,210' },
    ],
    proposedAt: 'Wed Jul 15, 02:12 pm',
    proposer: '0x4a36…7128',
  },
]

const RichRecordReview = () => (
  <section
    data-testid="rich-record-review"
    className="space-y-4"
    aria-labelledby="rich-record-review-title"
  >
    <div>
      <p className="text-sm font-medium text-primary">Visual decision</p>
      <h2 id="rich-record-review-title" className="mt-1 text-xl font-medium">
        Rich navigable record hierarchy
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        Real CMC20 proposal and rebalance records normalized with the accepted
        typography, spacing, color, and shape rules. Review each family in its
        own evidenced composition before comparing their shared grammar.
      </p>
    </div>

    <div className="space-y-10">
      <GovernanceProposalStateReview
        reviewScope={
          <ReviewScope
            review={[
              'Active versus quiet lifecycle progress emphasis.',
              'Separate lifecycle, outcome, and supporting-time pills.',
              'Quorum and vote evidence for standard proposals versus challenge evidence for optimistic proposals.',
              'Fast and Contested as qualifiers rather than lifecycle states.',
            ]}
            later="Final production adoption, colored vote-role aliases, hover refinement, and final route-level responsive transformation."
          />
        }
      />
      <RebalanceRecordReview />

      <div className="border-t border-border pt-4 text-sm font-light leading-6 text-muted-foreground">
        <p className="font-medium text-foreground">Compare only after review</p>
        <p className="mt-1 max-w-3xl">
          Decide whether their shared 24px axis, 16px/500 title, square white
          surface, and content-driven regions make them feel related enough.
          They are not being proposed as one universal Row component.
        </p>
      </div>
    </div>
  </section>
)

const RebalanceRecordReview = () => (
  <section aria-labelledby="rebalance-record-review-title">
    <div className="mb-4">
      <h3
        id="rebalance-record-review-title"
        className="text-sm font-medium text-foreground"
      >
        Auction rebalance browse list
      </h3>
      <p className="mt-1 text-sm font-light leading-6 text-muted-foreground">
        Source-grounded lifecycle and outcome jobs use deterministic fixture
        values in a wider browse-column trial. The selected detail region is
        present only to establish the future left-list context.
      </p>
    </div>

    <div className="grid gap-8 xl:grid-cols-[32rem_minmax(0,1fr)] xl:gap-0.5 xl:bg-secondary">
      <section
        data-testid="rebalance-browse-list"
        className="w-full max-w-[32rem] space-y-0.5 bg-secondary xl:max-w-none"
      >
        <RebalanceListHeading title="Active rebalances" count={2} />
        <div className="space-y-px bg-secondary">
          {REBALANCE_RECORDS.slice(0, 2).map((record, index) => (
            <RebalanceListRecord
              key={record.title}
              record={record}
              selected={index === 0}
            />
          ))}
        </div>
        <RebalanceListHeading title="Recent rebalances" count={2} />
        <div className="space-y-px bg-secondary">
          {REBALANCE_RECORDS.slice(2).map((record) => (
            <RebalanceListRecord
              key={record.title}
              record={record}
              selected={false}
            />
          ))}
        </div>
      </section>

      <SelectedRebalanceContext record={REBALANCE_RECORDS[0]} />
    </div>

    <div className="mt-4">
      <ReviewScope
        columns
        review={[
          'Whether the top-right status clearly combines the current auction with its actionable or processing state.',
          'Whether consistently weighted inline values make operational activity and historical outcomes easier to scan without bordered cells.',
          'Whether the current-auction countdown remains distinct from the rebalance expiry.',
          'Whether one inset evidence axis and vertical divider organize each state without repeated icons.',
        ]}
        later="Current-auction bids and value traded remain in the selected/full view. The exact Auctions split and breakpoint, anomaly thresholds, selected-detail design, list interaction API, responsive route-to-detail behavior, and production adoption are also deferred."
      />
    </div>
  </section>
)

const RebalanceListHeading = ({
  title,
  count,
}: {
  title: string
  count: number
}) => (
  <header className="flex items-center justify-between gap-4 bg-card px-6 py-4 text-base leading-6">
    <p className="font-medium text-foreground">{title}</p>
    <span className="font-light tabular-nums text-muted-foreground">
      {count}
    </span>
  </header>
)

const RebalanceListRecord = ({
  record,
  selected,
}: {
  record: RebalanceRecordData
  selected: boolean
}) => (
  <a
    data-testid="rebalance-list-record"
    data-selected={selected ? 'true' : 'false'}
    aria-current={selected ? 'true' : undefined}
    href={AUCTIONS_ROUTE}
    target="_blank"
    rel="noreferrer"
    className={cn(
      'group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
      v1LayoutRecipes.inset.ordinaryContent,
      selected
        ? roles.surface.content
        : cn(roles.surface.recessedContent, 'hover:bg-card')
    )}
  >
    <RebalanceRecordTitle record={record} selected={selected} />

    <div className="mt-4">
      <RebalanceRecordSummary record={record} />
    </div>

    <RebalanceMetadata record={record} className="mt-4" />
  </a>
)

const RebalanceRecordTitle = ({
  record,
  selected,
}: {
  record: RebalanceRecordData
  selected: boolean
}) => (
  <div
    data-testid="rebalance-record-header"
    className={cn(
      'flex flex-wrap items-start justify-between',
      v1LayoutRecipes.cluster.relatedContent
    )}
  >
    <h4
      className={cn(
        'min-w-0 flex-[1_1_16rem] text-base font-medium leading-6 group-hover:text-primary',
        selected && 'text-primary'
      )}
    >
      {record.title}
    </h4>
    <RebalanceStatus record={record} />
  </div>
)

const RebalanceStatus = ({ record }: { record: RebalanceRecordData }) => {
  const label =
    record.state === 'completed'
      ? `${record.status} · ${record.auctionCount}`
      : `${record.auction} · ${record.status}`

  return (
    <LifecycleStatusPill
      role={
        record.state === 'ready'
          ? 'actionable'
          : record.state === 'ongoing'
            ? 'processing'
            : 'closed'
      }
    >
      {label}
    </LifecycleStatusPill>
  )
}

const RebalanceRecordSummary = ({
  record,
}: {
  record: RebalanceRecordData
}) => (
  <div data-testid="rebalance-evidence-region" className="relative ml-1 pl-4">
    <span
      aria-hidden="true"
      data-testid="rebalance-evidence-rail"
      className="absolute bottom-2 left-0 top-2 w-px bg-border"
    />
    {record.state === 'completed' ? (
      <RebalanceOutcomeSummary record={record} />
    ) : (
      <RebalanceOperationalSummary record={record} />
    )}
  </div>
)

const RebalanceOperationalSummary = ({
  record,
}: {
  record: OperationalRebalanceRecord
}) => (
  <div
    data-testid="rebalance-operational-summary"
    className={v1LayoutRecipes.stack.relatedContent}
  >
    {record.metrics.map((metric) => (
      <RebalanceOperationalMetricRow key={metric.label} metric={metric} />
    ))}
  </div>
)

const RebalanceOperationalMetricRow = ({
  metric,
}: {
  metric: RebalanceOperationalMetric
}) => (
  <Metric
    role="inline"
    label={metric.label}
    value={
      <span data-testid="rebalance-metric-value" className="font-medium">
        {metric.value}
      </span>
    }
  />
)

const RebalanceOutcomeSummary = ({
  record,
}: {
  record: CompletedRebalanceRecord
}) => (
  <div
    data-testid="rebalance-outcome-summary"
    className={v1LayoutRecipes.stack.relatedContent}
  >
    <div
      data-testid="rebalance-outcome-diagnostics"
      className={v1LayoutRecipes.stack.relatedContent}
    >
      {record.metrics.map((metric) => (
        <RebalanceOutcomeMetric key={metric.label} metric={metric} />
      ))}
    </div>
  </div>
)

const RebalanceOutcomeMetric = ({
  metric,
}: {
  metric: RebalanceDiagnostic
}) => (
  <Metric
    role="inline"
    label={metric.label}
    value={
      metric.tone === 'performance-negative' ? (
        <span
          data-testid="rebalance-metric-value"
          className={cn('font-medium', PERFORMANCE_TEXT_CLASSES.negative)}
        >
          {metric.value}
        </span>
      ) : (
        <span data-testid="rebalance-metric-value" className="font-medium">
          {metric.value}
        </span>
      )
    }
  />
)

const RebalanceMetadata = ({
  record,
  className,
}: {
  record: RebalanceRecordData
  className?: string
}) => (
  <div
    data-testid="rebalance-metadata"
    className={cn(
      'flex flex-wrap items-center text-sm font-light leading-5',
      v1LayoutRecipes.cluster.tightText,
      className
    )}
  >
    <span className="text-muted-foreground">Proposed</span>
    <span className="text-foreground">{record.proposedAt}</span>
    <span className="text-muted-foreground">by</span>
    <span className="text-foreground">{record.proposer}</span>
  </div>
)

const SelectedRebalanceContext = ({
  record,
}: {
  record: RebalanceRecordData
}) => (
  <section data-testid="rebalance-selected-detail" className="bg-card p-6">
    <p className="text-sm font-medium text-primary">
      Future selected-auction pane · context only
    </p>
    <div className="mt-4">
      <RebalanceRecordTitle record={record} selected={false} />
    </div>

    <div className="mt-4">
      <RebalanceRecordSummary record={record} />
    </div>

    <RebalanceMetadata record={record} className="mt-4" />

    <Button className="mt-6">Start auction 1</Button>
  </section>
)

const ReviewScope = ({
  review,
  later,
  columns = false,
}: {
  review: string[]
  later: string
  columns?: boolean
}) => (
  <aside
    className={cn(
      'border border-border bg-card p-4 text-sm font-light leading-6 text-muted-foreground',
      columns && 'grid gap-4 lg:grid-cols-2'
    )}
  >
    <div>
      <p className="font-medium text-foreground">Review now</p>
      <ul className="mt-2 space-y-2">
        {review.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
    <div className={cn(!columns && 'mt-4')}>
      <p className="font-medium text-foreground">Leave for later</p>
      <p className="mt-2">{later}</p>
    </div>
  </aside>
)

export default RichRecordReview
