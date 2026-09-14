import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import {
  ComponentAuditBadge,
  ComponentDeliveryBadge,
  ComponentPriorityBadge,
  ComponentReviewBadge,
  DesignAuthorityBadge,
  OutputBadge,
  StatusBadge,
} from './catalog-ui'
import { COMPONENT_GROUPS, COMPONENT_ITEMS } from './component-catalog'
import type { ComponentItem } from './catalog-types'
import ComponentVisualOutput from './component-visual-output'

const visibleItems = COMPONENT_GROUPS.flatMap((group) => group.items).filter(
  (item) => item.outputStatus === 'rendered'
)
const baselineCount = COMPONENT_ITEMS.filter(
  (item) => item.designAuthority === 'current-baseline'
).length
const adoptedCount = COMPONENT_ITEMS.filter(
  (item) => item.adoptionStatus === 'in-use'
).length
const unresolvedItems = COMPONENT_GROUPS.flatMap((group) =>
  group.items
    .filter((item) => item.outputStatus !== 'rendered')
    .map((item) => ({ groupName: group.name, item }))
)

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
          Complete shared state sheets appear directly in family order. Detail
          pages retain evidence, rationale, history, and extended compositions;
          composition-only evidence and unprepared or deferred capabilities
          appear once below without invented UI.
        </p>
      </div>
      <span className="text-xs font-light text-muted-foreground">
        {visibleItems.length} standalone outputs · {baselineCount} current
        baselines across the inventory · {adoptedCount} adopted ·{' '}
        {COMPONENT_GROUPS.length} families
      </span>
    </div>
    <div data-testid="canonical-component-overview" className="space-y-10">
      {COMPONENT_GROUPS.map((group) => {
        const renderedItems = group.items.filter(
          (item) => item.outputStatus === 'rendered'
        )

        if (renderedItems.length === 0) return null

        return (
          <section
            key={group.id}
            data-testid={`component-group-${group.id}`}
            aria-labelledby={`component-group-${group.id}-title`}
            className="space-y-6"
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
                  {renderedItems.length} complete state{' '}
                  {renderedItems.length === 1 ? 'sheet' : 'sheets'}
                </span>
              </div>
              <p className="mt-1 text-sm font-light text-muted-foreground">
                {group.description}
              </p>
            </div>

            <div className="space-y-8">
              {renderedItems.map((item) => (
                <CompleteStateSheet key={item.id} item={item} />
              ))}
            </div>
          </section>
        )
      })}

      <section
        data-testid="component-unresolved-inventory"
        aria-labelledby="component-unresolved-inventory-title"
        className="space-y-4"
      >
        <div className="border-b border-border pb-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3
              id="component-unresolved-inventory-title"
              className="text-xl font-medium"
            >
              Additional inventory
            </h3>
            <span className="text-xs font-light text-muted-foreground">
              {unresolvedItems.length} capabilities · no invented output
            </span>
          </div>
          <p className="mt-1 text-sm font-light text-muted-foreground">
            Composition-only evidence, work not prepared for review, and
            deliberately deferred or unnecessary capabilities. This is not a
            work queue; each entry records its own authority and next action.
          </p>
        </div>
        <div className="divide-y divide-border border border-border bg-card">
          {unresolvedItems.map(({ groupName, item }) => (
            <UnrenderedComponentRow
              key={item.id}
              groupName={groupName}
              item={item}
            />
          ))}
        </div>
      </section>
    </div>
  </section>
)

const CompleteStateSheet = ({ item }: { item: ComponentItem }) => (
  <article
    data-testid={`component-overview-${item.id}`}
    className="min-w-0 space-y-5"
  >
    <div className="border-b border-border pb-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-medium">{item.name}</h4>
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
        <span data-testid="component-overview-authority">
          <DesignAuthorityBadge item={item} />
        </span>
        <ComponentDeliveryBadge item={item} />
      </div>
    </div>
    <div
      data-testid="component-overview-output"
      className={cn('min-w-0', item.id === 'table' && 'overflow-x-auto')}
    >
      <ComponentVisualOutput itemId={item.id} />
    </div>
  </article>
)

const UnrenderedComponentRow = ({
  groupName,
  item,
}: {
  groupName: string
  item: ComponentItem
}) => (
  <Link
    data-testid={`component-unrendered-${item.id}`}
    to={`/internal/design-system/components/${item.id}`}
    className={cn(
      'group grid gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[minmax(12rem,0.7fr)_minmax(16rem,1fr)_auto] md:items-center',
      roles.interaction.contentHover
    )}
  >
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {groupName}
      </p>
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium">{item.name}</h4>
        <ExternalLink className="size-3.5 text-muted-foreground" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <OutputBadge item={item} />
        {item.status === 'not-needed' && <StatusBadge item={item} />}
        <ComponentReviewBadge review={item.review} />
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
