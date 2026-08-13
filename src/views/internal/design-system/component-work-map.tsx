import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { COMPONENT_GROUPS, COMPONENT_ITEMS } from './component-catalog'

const passes = [
  {
    index: '01',
    title: 'Actions',
    copy: 'Establish hierarchy, size, icons, and async action states.',
    groups: ['actions'],
  },
  {
    index: '02',
    title: 'Fields + selection',
    copy: 'Share anatomy and state logic before domain-specific pickers.',
    groups: ['fields', 'selection'],
  },
  {
    index: '03',
    title: 'Overlays + feedback',
    copy: 'Combine elevation, focus, dismissal, motion, and lifecycle states.',
    groups: ['overlays', 'feedback'],
  },
  {
    index: '04',
    title: 'Data display',
    copy: 'Move from identity and metrics into tables and charts.',
    groups: ['data-display'],
  },
  {
    index: '05',
    title: 'Navigation + disclosure',
    copy: 'Resolve tabs and modes early; defer conditional patterns until proven.',
    groups: ['navigation', 'disclosure'],
  },
] as const

const ComponentWorkMap = () => {
  const core = COMPONENT_ITEMS.filter((item) => item.priority === 'v1-core')
  const extensions = COMPONENT_ITEMS.filter(
    (item) => item.priority === 'product-extension'
  )
  const conditional = COMPONENT_ITEMS.filter(
    (item) => item.priority === 'v1-conditional'
  )
  const mapped = COMPONENT_ITEMS.filter((item) => item.auditStatus === 'mapped')

  return (
    <section className="space-y-4" aria-labelledby="component-work-map-heading">
      <div>
        <p className="text-sm font-medium text-primary">Working inventory</p>
        <h2
          id="component-work-map-heading"
          className="mt-1 text-xl font-semibold"
        >
          Define contracts, not a component zoo
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
          The registry is the source of truth. A slot can be retained, combined,
          or marked unnecessary after audit. State sheets later render from
          these contracts, so changing a foundation does not require rebuilding
          the inventory.
        </p>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        <Count value={COMPONENT_ITEMS.length} label="contracts inventoried" />
        <Count value={core.length} label="V1 core" />
        <Count value={extensions.length} label="Register extensions" />
        <Count
          value={`${mapped.length}/${COMPONENT_ITEMS.length}`}
          label="usage mapped"
        />
      </div>

      <div className="border border-border bg-card">
        <div className="border-b border-border p-5">
          <h3 className="font-medium">Recommended family passes</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Work in dependency order, but finish one family contract at a time.
          </p>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2 xl:grid-cols-5">
          {passes.map((pass) => {
            const itemCount = COMPONENT_GROUPS.filter((group) =>
              pass.groups.includes(group.id as never)
            ).reduce((total, group) => total + group.items.length, 0)
            return (
              <div
                key={pass.index}
                className="flex min-h-44 flex-col bg-card p-4"
              >
                <span className="text-xs font-medium text-primary">
                  {pass.index}
                </span>
                <p className="mt-3 text-sm font-medium">{pass.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {pass.copy}
                </p>
                <p className="mt-auto text-xs text-muted-foreground">
                  {itemCount} contracts
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <PriorityCard
          title="V1 core"
          copy="Define these unless product evidence proves two slots should merge."
          items={core}
        />
        <PriorityCard
          title="Register extensions"
          copy="Domain primitives built from core contracts without forcing product behavior into generic UI."
          items={extensions}
        />
        <PriorityCard
          title="Conditional"
          copy="Keep visible, but build only after a real repeated need survives audit."
          items={conditional}
        />
      </div>
    </section>
  )
}

const Count = ({ value, label }: { value: number | string; label: string }) => (
  <div className="bg-card p-5">
    <p className="text-2xl font-light text-primary">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{label}</p>
  </div>
)

const PriorityCard = ({
  title,
  copy,
  items,
}: {
  title: string
  copy: string
  items: typeof COMPONENT_ITEMS
}) => (
  <article className="border border-border bg-card p-5">
    <h3 className="font-medium">{title}</h3>
    <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">
      {copy}
    </p>
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/internal/design-system/components/${item.id}`}
          className="group inline-flex min-h-8 items-center gap-1 rounded-full border border-border px-3 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {item.name}
          <ArrowRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  </article>
)

export default ComponentWorkMap
