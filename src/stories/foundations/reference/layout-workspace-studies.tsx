import { Check, CircleDashed } from 'lucide-react'
import { StudyCard } from './layout-study-card'

export const AuctionsStudy = () => (
  <StudyCard
    label="Auctions · discard centered islands"
    copy="The list and selected auction are two states of one browse-and-act task. Persistent adjacency gives the list a real job and lets detail use the available workspace."
  >
    <div className="grid gap-px bg-secondary lg:grid-cols-2">
      <Specimen label="Current · separate routes">
        <MiniShell>
          <div className="flex min-h-64 items-center justify-center bg-card">
            <div className="w-[58%] space-y-px bg-secondary p-px">
              <MiniRow label="Active rebalances" />
              <MiniRow label="Historical rebalances" />
              <MiniRow label="Historical rebalances" />
            </div>
          </div>
        </MiniShell>
      </Specimen>
      <Specimen label="Candidate · browse and inspect" recommended>
        <MiniShell>
          <div className="grid min-h-64 grid-cols-[minmax(9rem,0.8fr)_minmax(0,1.8fr)] gap-0.5 bg-secondary">
            <div className="space-y-px bg-card p-2">
              <p className="px-2 py-2 text-xs font-medium">Rebalances</p>
              <MiniRow label="August rebalance" selected />
              <MiniRow label="July rebalance" />
              <MiniRow label="June rebalance" />
            </div>
            <div className="bg-card p-4">
              <p className="text-sm font-medium">August rebalance</p>
              <p className="mt-1 text-xs font-light text-muted-foreground">
                Active · Round 2
              </p>
              <div className="mt-6 h-20 bg-muted" />
              <div className="mt-0.5 grid grid-cols-3 gap-px bg-secondary">
                <MiniMetric />
                <MiniMetric />
                <MiniMetric />
              </div>
            </div>
          </div>
        </MiniShell>
      </Specimen>
    </div>
  </StudyCard>
)

export const GovernanceStudy = () => (
  <StudyCard
    label="Governance · later opportunity, not a V1 prerequisite"
    copy="The current view is acceptable enough for the compressed migration. Preserve the proposal-summary direction as a later opportunity while V1 improves foundations, components, spacing, and hierarchy in the existing composition."
  >
    <div className="grid gap-px bg-secondary xl:grid-cols-3">
      <Specimen label="Current · permanent mixed support">
        <GovernanceFrame mode="current" />
      </Specimen>
      <Specimen label="Later idea · nothing selected">
        <GovernanceFrame mode="landing" />
      </Specimen>
      <Specimen label="Later idea · proposal summary">
        <GovernanceFrame mode="selected" />
      </Specimen>
    </div>
    <div className="grid gap-px border-t border-secondary bg-secondary md:grid-cols-3">
      <Rule title="Persistent">
        V1 keeps the current page structure so this redesign cannot block the
        system rollout.
      </Rule>
      <Rule title="Landing context">
        Later, vote-lock promotion and essential context could occupy the empty
        detail state.
      </Rule>
      <Rule title="Secondary reference">
        A selected proposal should show a deliberately complete summary plus a
        clear “View full proposal” action—not a compressed full view.
      </Rule>
    </div>
  </StudyCard>
)

const GovernanceFrame = ({
  mode,
}: {
  mode: 'current' | 'landing' | 'selected'
}) => (
  <MiniShell>
    <div className="grid min-h-64 grid-cols-[1.2fr_1fr] gap-0.5 bg-secondary">
      <div className="space-y-px bg-card p-2">
        <p className="px-2 py-2 text-xs font-medium">Proposals</p>
        <MiniRow label="August rebalance" selected={mode === 'selected'} />
        <MiniRow label="Protocol upgrade" />
        <MiniRow label="Fee change" />
      </div>
      <div className="bg-card p-3">
        {mode === 'current' && <CurrentSupport />}
        {mode === 'landing' && <LandingSupport />}
        {mode === 'selected' && <SelectedProposal />}
      </div>
    </div>
  </MiniShell>
)

const CurrentSupport = () => (
  <div className="space-y-0.5">
    {['Vote-lock', 'Account', 'Statistics', 'Roles + delegates'].map(
      (label) => (
        <div
          key={label}
          className="flex h-11 items-center bg-muted px-3 text-[10px] font-medium"
        >
          {label}
        </div>
      )
    )}
  </div>
)

const LandingSupport = () => (
  <div>
    <p className="text-sm font-medium">Participate in governance</p>
    <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">
      Vote-lock to govern this DTF and earn rewards.
    </p>
    <div className="mt-5 h-20 bg-muted" />
    <p className="mt-4 text-xs font-medium">Governance essentials</p>
  </div>
)

const SelectedProposal = () => (
  <div>
    <p className="text-sm font-medium">August rebalance</p>
    <p className="mt-1 text-xs font-light text-muted-foreground">
      Executed · 100% for
    </p>
    <div className="mt-5 h-20 bg-muted" />
    <div className="mt-0.5 h-10 bg-muted" />
  </div>
)

const Specimen = ({
  label,
  recommended = false,
  children,
}: {
  label: string
  recommended?: boolean
  children: React.ReactNode
}) => (
  <div className="bg-card p-5">
    <div className="mb-3 flex items-center gap-2">
      {recommended && <Check className="h-4 w-4 text-primary" />}
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
    </div>
    {children}
  </div>
)

const MiniShell = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-0.5 bg-secondary">
    <div className="bg-card" />
    {children}
  </div>
)

const MiniRow = ({
  label,
  selected = false,
}: {
  label: string
  selected?: boolean
}) => (
  <div
    className={`flex min-h-11 items-center px-2 text-xs font-light ${selected ? 'bg-accent text-accent-foreground' : 'bg-card'}`}
  >
    <span className="truncate">{label}</span>
  </div>
)

const MiniMetric = () => (
  <div className="h-10 bg-card p-2">
    <div className="h-2 w-8 bg-muted" />
  </div>
)

const Rule = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div className="bg-card p-4">
    <div className="flex items-center gap-2">
      <CircleDashed className="h-3.5 w-3.5 text-primary" />
      <p className="text-sm font-medium">{title}</p>
    </div>
    <p className="mt-2 text-xs font-light leading-5 text-muted-foreground">
      {children}
    </p>
  </div>
)
