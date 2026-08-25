import { routeLayoutAudit, type LayoutDisposition } from './route-layout-audit'
import { AuctionsStudy, GovernanceStudy } from './layout-workspace-studies'
import {
  FullWidthContextStudy,
  ProgressiveWorkflowStudy,
} from './layout-workflow-studies'
import { StudyCard } from './layout-study-card'

const LayoutArchitectureStudy = () => (
  <section
    id="layout-architecture-study"
    className="scroll-mt-28 space-y-4"
    aria-labelledby="layout-architecture-heading"
  >
    <Heading />
    <ArchetypeStrip />
    <RouteMap />
    <AuctionsStudy />
    <GovernanceStudy />
    <ProgressiveWorkflowStudy />
    <FullWidthContextStudy />
  </section>
)

const Heading = () => (
  <div>
    <div className="flex flex-wrap items-center gap-2">
      <h2 id="layout-architecture-heading" className="text-xl font-semibold">
        Product layout architecture
      </h2>
      <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium ring-1 ring-inset ring-warning/30">
        Structural audit
      </span>
    </div>
    <p className="mt-1 max-w-4xl text-sm font-light leading-5 text-muted-foreground">
      Map routes to a small set of task-led compositions before legacy screens
      dictate component anatomy. These are migration hypotheses, not universal
      layout components or finished screen designs.
    </p>
  </div>
)

const ArchetypeStrip = () => (
  <div className="grid gap-px bg-secondary sm:grid-cols-2 lg:grid-cols-5">
    {[
      ['Browse + inspect', 'Select an item, then work on it'],
      ['Progressive workflow', 'Focused start, earned expansion'],
      ['Primary + support', 'One task with secondary context'],
      ['Context + regions', 'Shared state governs work below'],
      ['Data index', 'Scan and compare many peers'],
    ].map(([label, description]) => (
      <div key={label} className="bg-card p-4">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    ))}
  </div>
)

const RouteMap = () => (
  <StudyCard
    label="Route-to-layout map"
    copy="Disposition applies to the current composition—not its data or behavior. Component impact names contracts that should wait for this layout assumption."
  >
    <div className="divide-y divide-border">
      {routeLayoutAudit.map((item) => (
        <article
          key={item.family}
          data-layout-audit-entry={item.family}
          className="grid gap-4 p-5 lg:grid-cols-[12rem_minmax(0,1fr)_12rem]"
        >
          <div>
            <div className="flex items-center gap-2">
              <Disposition value={item.disposition} />
              <h4 className="text-sm font-medium">{item.family}</h4>
            </div>
            <code className="mt-2 block text-[11px] leading-5 text-muted-foreground">
              {item.routes}
            </code>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <MapFact label="Current">{item.current}</MapFact>
            <MapFact label="Primary task">{item.primaryTask}</MapFact>
            <MapFact label="Structural call">{item.call}</MapFact>
            <MapFact label="Component impact">{item.componentImpact}</MapFact>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Candidate
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              {item.candidate}
            </p>
          </div>
        </article>
      ))}
    </div>
  </StudyCard>
)

const MapFact = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div>
    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 text-xs font-light leading-5">{children}</p>
  </div>
)

const Disposition = ({ value }: { value: LayoutDisposition }) => {
  const labels: Record<LayoutDisposition, string> = {
    retain: 'Retain',
    rework: 'Rework',
    discard: 'Discard',
  }

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
        value === 'retain'
          ? 'bg-success/10 text-foreground'
          : value === 'discard'
            ? 'bg-destructive/10 text-foreground'
            : 'bg-warning/10 text-foreground'
      }`}
    >
      {labels[value]}
    </span>
  )
}

export default LayoutArchitectureStudy
