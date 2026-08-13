import type { ReactNode } from 'react'
import { ArrowRight, CircleCheck, CircleDashed } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  COMPONENT_AUDIT_LABELS,
  COMPONENT_PRIORITY_LABELS,
  OUTPUT_LABELS,
  STATUS_LABELS,
  type CatalogItem,
  type ComponentItem,
  type DefinitionSlot,
} from './catalog-types'

export const StatusBadge = ({ item }: { item: CatalogItem }) => (
  <span
    className={cn(
      'w-fit rounded-full px-2.5 py-1 text-xs font-medium',
      item.status === 'defined' &&
        'bg-success/10 text-foreground ring-1 ring-inset ring-success/30',
      item.status === 'evidence-found' && 'bg-accent text-accent-foreground',
      item.status === 'audit-pending' && 'bg-muted text-muted-foreground',
      item.status === 'not-needed' &&
        'border border-border text-muted-foreground'
    )}
  >
    {STATUS_LABELS[item.status]}
  </span>
)

export const OutputBadge = ({ item }: { item: CatalogItem }) => {
  if (item.outputStatus === 'none') return null

  return (
    <span
      className={cn(
        'w-fit rounded-full px-2.5 py-1 text-xs font-medium',
        item.outputStatus === 'current-baseline' &&
          'bg-primary/10 text-primary',
        item.outputStatus === 'proposal' &&
          'bg-warning/10 text-foreground ring-1 ring-inset ring-warning/30',
        item.outputStatus === 'accepted' &&
          'bg-success/10 text-foreground ring-1 ring-inset ring-success/30'
      )}
    >
      {OUTPUT_LABELS[item.outputStatus]}
    </span>
  )
}

export const CatalogBadges = ({ item }: { item: CatalogItem }) => (
  <span className="flex flex-wrap items-center gap-2">
    {isComponentItem(item) && <ComponentPriorityBadge item={item} />}
    <StatusBadge item={item} />
    <OutputBadge item={item} />
  </span>
)

export const ComponentPriorityBadge = ({ item }: { item: ComponentItem }) => (
  <span
    className={cn(
      'w-fit rounded-full px-2.5 py-1 text-xs font-medium',
      item.priority === 'v1-core' && 'bg-primary/10 text-primary',
      item.priority === 'v1-conditional' && 'bg-muted text-muted-foreground',
      item.priority === 'product-extension' &&
        'bg-accent text-accent-foreground'
    )}
  >
    {COMPONENT_PRIORITY_LABELS[item.priority]}
  </span>
)

export const ComponentAuditBadge = ({ item }: { item: ComponentItem }) => (
  <span className="text-xs text-muted-foreground">
    {COMPONENT_AUDIT_LABELS[item.auditStatus]}
  </span>
)

export const CatalogCard = ({
  item,
  to,
}: {
  item: CatalogItem
  to: string
}) => (
  <Link
    to={to}
    className={cn(
      'group flex min-h-48 flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      item.outputStatus === 'none' && 'border-dashed bg-card/50'
    )}
  >
    <div>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{item.name}</h3>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {item.description}
      </p>
    </div>
    <CatalogBadges item={item} />
    {isComponentItem(item) && <ComponentAuditBadge item={item} />}
  </Link>
)

const isComponentItem = (item: CatalogItem): item is ComponentItem =>
  'priority' in item && 'auditStatus' in item

export const PageHeader = ({
  eyebrow,
  title,
  description,
  trailing,
}: {
  eyebrow: string
  title: string
  description: string
  trailing?: ReactNode
}) => (
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div>
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
    {trailing}
  </div>
)

export const ExpectedDecisions = ({ items }: { items: DefinitionSlot[] }) => (
  <section aria-labelledby="expected-decisions-heading" className="space-y-4">
    <div>
      <h2 id="expected-decisions-heading" className="text-xl font-semibold">
        Definition slots
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        These decisions remain visible until the v1 system fills them in.
      </p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.name}
          className={cn(
            'flex min-h-20 items-center justify-between gap-3 rounded-xl border bg-card/50 p-4',
            item.status === 'open'
              ? 'border-dashed border-border'
              : 'border-success/30'
          )}
        >
          <span>
            <span className="block text-sm font-medium">{item.name}</span>
            {item.detail && (
              <span className="mt-1 block max-w-xl text-xs leading-5 text-muted-foreground">
                {item.detail}
              </span>
            )}
          </span>
          <span
            className={cn(
              'flex shrink-0 items-center gap-1.5 text-xs',
              item.status === 'open'
                ? 'text-muted-foreground'
                : 'text-foreground'
            )}
          >
            {item.status === 'open' ? (
              <CircleDashed className="h-3.5 w-3.5" />
            ) : (
              <CircleCheck className="h-3.5 w-3.5" />
            )}
            {item.status === 'open' ? 'Open' : 'Defined'}
          </span>
        </div>
      ))}
    </div>
  </section>
)

export const DetailSidebar = ({
  title,
  items,
  path,
}: {
  title: string
  items: CatalogItem[]
  path: string
}) => (
  <aside className="hidden lg:block">
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </p>
    <nav aria-label={`${title} items`} className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.id}
          to={`${path}/${item.id}`}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive && 'bg-muted font-medium text-foreground'
            )
          }
        >
          {item.name}
          <span
            className={cn(
              'h-2 w-2 shrink-0 rounded-full',
              item.outputStatus !== 'none' ? 'bg-primary' : 'bg-border'
            )}
          />
        </NavLink>
      ))}
    </nav>
  </aside>
)
