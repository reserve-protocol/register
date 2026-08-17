import { Metric } from '@/components/metric'
import { Skeleton } from '@/components/ui/skeleton'

const MetricStateSheet = () => (
  <section
    data-testid="metric-state-sheet"
    className="space-y-4"
    aria-labelledby="metric-state-sheet-title"
  >
    <div>
      <h2 id="metric-state-sheet-title" className="text-xl font-medium">
        Canonical candidate
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        Metric owns label/value typography and alignment. Its parent owns the
        card, grid, separators, help affordances, and responsive composition.
        Headline anatomy follows the strong Home source: a 16px/300 label and
        16px/500 value.
      </p>
    </div>

    <div className="grid gap-0.5 bg-secondary p-0.5 xl:grid-cols-2">
      <CandidateCell label="Inline key / value">
        <div className="w-full space-y-3">
          <Metric label="Market cap" value="$48.3M" />
          <Metric label="24h volume" value="$1.26M" />
          <Metric label="Annualized TVL fee" value="1.50%" />
        </div>
      </CandidateCell>
      <CandidateCell label="Headline strip">
        <div className="grid w-full grid-cols-2 gap-px bg-border">
          <Metric
            className="bg-card p-4"
            role="headline"
            label="TVL"
            value="$531M"
          />
          <Metric
            className="bg-card p-4"
            role="headline"
            label="Mint volume"
            value="$1.7B"
          />
        </div>
      </CandidateCell>
      <CandidateCell label="Missing canonical · loading dependency provisional">
        <div className="w-full space-y-3">
          <Metric label="Market cap" value="—" />
          <Metric
            label="24h volume"
            value={<Skeleton className="h-5 w-20" />}
          />
        </div>
      </CandidateCell>
      <CandidateCell label="Boundary">
        <p className="text-sm font-light leading-6 text-muted-foreground">
          Parent compositions own grids, framing, help, and optional icons.
          Auction selector evidence reuses inline Metric anatomy rather than
          creating an auction-specific variant; the parent may consistently
          emphasize every value in the group.
        </p>
      </CandidateCell>
    </div>
  </section>
)

const CandidateCell = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="min-w-0 bg-card">
    <p className="border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="flex min-h-36 items-center p-4">{children}</div>
  </div>
)

export default MetricStateSheet
