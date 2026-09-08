import { Check, Circle, ListChecks } from 'lucide-react'
import {
  COMPONENT_WORK_QUEUE,
  PROGRESS_GATES,
  PROGRESS_GROUPS,
} from './progress-data'

const GATE_LABELS = {
  inventoried: 'Inventoried',
  defined: 'Defined',
  lab: 'In lab',
  applied: 'Applied',
  'design-reviewed': 'Design reviewed',
  'in-use': 'In use',
} as const

const trackedItems = PROGRESS_GROUPS.flatMap((group) => group.items)

const summaryGates = [
  'inventoried',
  'defined',
  'design-reviewed',
  'in-use',
] as const

const ProgressDashboard = () => (
  <section
    id="progress"
    aria-labelledby="progress-heading"
    className="space-y-5"
  >
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-primary">Project tracker</p>
        <h2 id="progress-heading" className="mt-1 text-2xl font-semibold">
          Progress without a fake finish line
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Inventory is provisional until code and visual audits confirm it. Each
          gate is independent, so implementation never silently counts as design
          approval.
        </p>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Verification is recorded in scoped checkpoint reports and component
          evidence, not inferred from these milestones. Current baseline means
          accepted within the recorded scope, not every variant or production
          use.
        </p>
      </div>
      <span className="w-fit rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        Provisional inventory
      </span>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {summaryGates.map((gate) => {
        const complete = trackedItems.filter((item) =>
          item.gates.includes(gate)
        ).length
        return (
          <div
            key={gate}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {GATE_LABELS[gate]}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {complete}
              <span className="text-base font-normal text-muted-foreground">
                /{trackedItems.length}
              </span>
            </p>
          </div>
        )
      })}
    </div>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Work item</th>
                {PROGRESS_GATES.map((gate) => (
                  <th key={gate} className="px-2 py-3 text-center font-medium">
                    {GATE_LABELS[gate]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROGRESS_GROUPS.map((group) => (
                <ProgressGroupRows key={group.id} group={group} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Scheduled component work</h3>
        </div>
        {COMPONENT_WORK_QUEUE.length ? (
          <ol className="mt-4 space-y-4">
            {COMPONENT_WORK_QUEUE.map((item, index) => (
              <li key={item.name} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-3 space-y-2 text-sm font-light leading-5 text-muted-foreground">
            <p>No component work is currently scheduled.</p>
            <p>
              This does not mean the inventory is blocked. Each component
              records its available evidence, remaining scope, and next action.
            </p>
          </div>
        )}
      </aside>
    </div>
  </section>
)

const ProgressGroupRows = ({
  group,
}: {
  group: (typeof PROGRESS_GROUPS)[number]
}) => (
  <>
    <tr className="border-t border-border bg-muted/30 first:border-t-0">
      <th
        colSpan={PROGRESS_GATES.length + 1}
        className="px-4 py-2 text-xs font-semibold"
      >
        {group.name}
      </th>
    </tr>
    {group.items.map((item) => (
      <tr key={item.id} className="border-t border-border">
        <th className="px-4 py-3 font-normal">
          <span className="font-medium">{item.name}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {item.note}
          </span>
        </th>
        {PROGRESS_GATES.map((gate) => {
          const isComplete = item.gates.includes(gate)
          const label = `${item.name}: ${GATE_LABELS[gate]} ${isComplete ? 'complete' : 'not complete'}`
          return (
            <td key={gate} className="px-2 py-3 text-center">
              {isComplete ? (
                <Check
                  aria-label={label}
                  className="mx-auto h-4 w-4 text-success"
                />
              ) : (
                <Circle
                  aria-label={label}
                  className="mx-auto h-3 w-3 text-border"
                />
              )}
            </td>
          )
        })}
      </tr>
    ))}
  </>
)

export default ProgressDashboard
