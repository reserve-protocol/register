import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  ComponentAuditBadge,
  ComponentDeliveryBadge,
  ComponentPriorityBadge,
  ComponentReviewBadge,
  DesignAuthorityBadge,
} from './catalog-ui'
import { COMPONENT_GROUPS } from './component-catalog'
import type { ComponentItem } from './catalog-types'
import ComponentOverviewSpecimen from './component-overview-specimens'

const visibleItems = COMPONENT_GROUPS.flatMap((group) => group.items).filter(
  (item) => item.outputStatus === 'rendered'
)
const baselineCount = visibleItems.filter(
  (item) => item.designAuthority === 'current-baseline'
).length
const adoptedCount = visibleItems.filter(
  (item) => item.adoptionStatus === 'in-use'
).length

const CanonicalComponentsOverview = () => (
  <section className="space-y-4" aria-labelledby="canonical-components-heading">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-primary">
          Visual component catalog
        </p>
        <h2
          id="canonical-components-heading"
          className="mt-1 text-2xl font-light"
        >
          Components at a glance
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-light text-muted-foreground">
          Scroll through every family without opening detail pages. Rendered
          work appears directly; unresolved capabilities remain visible as
          clearly labeled records without invented UI.
        </p>
      </div>
      <span className="text-xs font-light text-muted-foreground">
        {visibleItems.length} rendered · {baselineCount} current baseline ·{' '}
        {adoptedCount} adopted · {COMPONENT_GROUPS.length} families
      </span>
    </div>
    <div data-testid="canonical-component-overview" className="space-y-8">
      {COMPONENT_GROUPS.map((group) => {
        const renderedItems = group.items.filter(
          (item) => item.outputStatus === 'rendered'
        )
        const unresolvedItems = group.items.filter(
          (item) => item.outputStatus === 'none'
        )

        return (
          <section
            key={group.id}
            data-testid={`component-group-${group.id}`}
            aria-labelledby={`component-group-${group.id}-title`}
            className="space-y-4"
          >
            <div className="border-b border-border pb-3">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h3
                  id={`component-group-${group.id}-title`}
                  className="text-xl font-medium"
                >
                  {group.name}
                </h3>
                <span className="text-xs font-light text-muted-foreground">
                  {renderedItems.length} rendered · {unresolvedItems.length}{' '}
                  unresolved
                </span>
              </div>
              <p className="mt-1 text-sm font-light text-muted-foreground">
                {group.description}
              </p>
            </div>

            {renderedItems.length > 0 && (
              <div className="grid gap-4 lg:grid-cols-2">
                {renderedItems.map((item) => (
                  <CanonicalCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {unresolvedItems.length > 0 && (
              <div className="divide-y divide-border border border-border bg-card">
                {unresolvedItems.map((item) => (
                  <UnrenderedComponentRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  </section>
)

const CanonicalCard = ({ item }: { item: ComponentItem }) => (
  <article
    data-testid={`component-overview-${item.id}`}
    className={cn(
      'flex min-h-64 flex-col border border-border bg-card',
      (item.id === 'card' || item.id === 'table') && 'lg:col-span-2'
    )}
  >
    <div
      className={cn(
        'flex min-h-48 flex-1 items-center justify-center overflow-hidden border-b border-border bg-background p-6',
        (item.id === 'card' || item.id === 'table') &&
          'items-stretch justify-start overflow-x-auto'
      )}
    >
      <ComponentOverviewSpecimen id={item.id} />
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">
            {item.review.scope}
          </p>
        </div>
        <Link
          aria-label={`Inspect ${item.name}`}
          to={`/internal/design-system/components/${item.id}`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ExternalLink className="size-4" />
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <ComponentReviewBadge review={item.review} />
        <ComponentDeliveryBadge item={item} />
      </div>
    </div>
  </article>
)

const UnrenderedComponentRow = ({ item }: { item: ComponentItem }) => (
  <Link
    data-testid={`component-unrendered-${item.id}`}
    to={`/internal/design-system/components/${item.id}`}
    className="group grid gap-3 p-4 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(12rem,0.7fr)_minmax(16rem,1fr)_auto] md:items-center"
  >
    <div>
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">{item.name}</h4>
        <ExternalLink className="size-3.5 text-muted-foreground" />
      </div>
      <p className="mt-1 text-xs font-light leading-5 text-muted-foreground">
        {item.description}
      </p>
    </div>
    <p className="text-xs font-light leading-5 text-muted-foreground">
      {item.statusDetail}
    </p>
    <div className="flex flex-wrap items-center gap-2 md:justify-end">
      <ComponentPriorityBadge item={item} />
      <DesignAuthorityBadge item={item} />
      {item.implementationStatus !== 'none' && (
        <ComponentDeliveryBadge item={item} />
      )}
      <ComponentAuditBadge item={item} />
    </div>
  </Link>
)

export default CanonicalComponentsOverview
