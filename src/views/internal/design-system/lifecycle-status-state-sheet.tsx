import {
  LifecycleStatusPill,
  type LifecycleStatusRole,
} from '@/components/lifecycle-status'

const LIFECYCLE_ROLES: {
  role: LifecycleStatusRole
  label: string
  example: string
  use: string
}[] = [
  {
    role: 'waiting',
    label: 'Waiting',
    example: 'Pending',
    use: 'No action is currently available.',
  },
  {
    role: 'active',
    label: 'Active',
    example: 'Phase active',
    use: 'A live phase is underway.',
  },
  {
    role: 'actionable',
    label: 'Actionable',
    example: 'Ready to execute',
    use: 'A person can move the process forward now.',
  },
  {
    role: 'processing',
    label: 'Processing',
    example: 'Processing',
    use: 'An indeterminate operation is expected to finish soon.',
  },
  {
    role: 'success',
    label: 'Success',
    example: 'Executed',
    use: 'The lifecycle ended successfully.',
  },
  {
    role: 'unsuccessful',
    label: 'Unsuccessful',
    example: 'Defeated',
    use: 'The lifecycle ended without its intended outcome.',
  },
  {
    role: 'closed',
    label: 'Closed',
    example: 'Expired',
    use: 'The lifecycle ended neutrally or is no longer available.',
  },
]

const LifecycleStatusStateSheet = () => (
  <section data-testid="lifecycle-status-state-sheet" className="space-y-6">
    <div>
      <p className="text-sm font-medium text-primary">Canonical V1 candidate</p>
      <h2 className="mt-1 text-xl font-medium text-foreground">
        Lifecycle status roles
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light leading-6 text-muted-foreground">
        One shared 24px status anatomy communicates process meaning through its
        label, tone, optional indicator, and restrained motion. Category labels,
        counts, and removable chips remain separate unresolved jobs.
      </p>
    </div>

    <div
      data-testid="lifecycle-status-role-matrix"
      className="divide-y divide-border border border-border bg-card"
    >
      {LIFECYCLE_ROLES.map(({ role, label, example, use }) => (
        <div
          key={role}
          className="grid items-center gap-3 p-4 sm:grid-cols-[8rem_10rem_minmax(0,1fr)]"
        >
          <p className="text-sm font-medium text-foreground">{label}</p>
          <div>
            <LifecycleStatusPill role={role}>{example}</LifecycleStatusPill>
          </div>
          <p className="text-sm font-light leading-5 text-muted-foreground">
            {use}
          </p>
        </div>
      ))}
    </div>

    <div className="border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">
        Approved semantic active indicators
      </p>
      <p className="mt-1 text-sm font-light leading-5 text-muted-foreground">
        Replace the generic active dot only when the domain phase is known.
      </p>
      <div
        data-testid="lifecycle-status-semantic-indicators"
        className="mt-3 flex flex-wrap items-center gap-2"
      >
        <LifecycleStatusPill role="active" indicator="voting">
          Voting active
        </LifecycleStatusPill>
        <LifecycleStatusPill role="active" indicator="challenge">
          Challenge active
        </LifecycleStatusPill>
      </div>
    </div>

    <div className="border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">
        Supporting time remains separate
      </p>
      <div
        data-testid="lifecycle-status-supporting-pair"
        className="mt-3 flex flex-wrap items-center gap-2"
      >
        <LifecycleStatusPill role="active" indicator="voting">
          Voting active
        </LifecycleStatusPill>
        <LifecycleStatusPill role="waiting">Ends in 6h</LifecycleStatusPill>
      </div>
    </div>
  </section>
)

export default LifecycleStatusStateSheet
