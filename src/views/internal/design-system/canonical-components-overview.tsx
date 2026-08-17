import { ExternalLink, MoreHorizontal, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { EmptyState } from '@/components/empty-state'
import { ChainBadgedLogo, EntityIdentity } from '@/components/entity-identity'
import { IconButton } from '@/components/icon-button'
import { Metric } from '@/components/metric'
import { ChainId } from '@/utils/chains'
import {
  ComponentAuditBadge,
  ComponentDeliveryBadge,
  ComponentReviewBadge,
} from './catalog-ui'
import { COMPONENT_GROUPS } from './component-catalog'
import type { ComponentItem } from './catalog-types'
import InformationRowStateSheet from './information-row-state-sheet'

const canonicalItems = COMPONENT_GROUPS.flatMap((group) => group.items).filter(
  (item) => item.implementationStatus === 'canonical-candidate'
)
const adoptedCount = canonicalItems.filter(
  (item) => item.adoptionStatus === 'in-use'
).length

const CanonicalComponentsOverview = () => (
  <section className="space-y-4" aria-labelledby="canonical-components-heading">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-primary">
          Reusable implementation
        </p>
        <h2
          id="canonical-components-heading"
          className="mt-1 text-2xl font-light"
        >
          Canonical V1 candidates
        </h2>
        <p className="mt-1 max-w-3xl text-sm font-light text-muted-foreground">
          Actual shared candidates, rendered directly. Product adoption remains
          a separate gate.
        </p>
      </div>
      <span className="text-xs font-light text-muted-foreground">
        {canonicalItems.length} reusable candidates · {adoptedCount} adopted
      </span>
    </div>
    <div
      data-testid="canonical-component-overview"
      className="grid gap-4 lg:grid-cols-2"
    >
      {canonicalItems.map((item) => (
        <CanonicalCard key={item.id} item={item} />
      ))}
    </div>
  </section>
)

const CanonicalCard = ({ item }: { item: ComponentItem }) => (
  <article className="flex min-h-64 flex-col border border-border bg-card">
    <div className="flex min-h-40 flex-1 items-center justify-center overflow-hidden border-b border-border bg-background p-5">
      <CanonicalSpecimen id={item.id} />
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

const CanonicalSpecimen = ({ id }: { id: string }) => {
  if (id === 'button') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button>Primary</Button>
        <Button tone="secondary">Secondary</Button>
        <Button tone="quiet">Quiet</Button>
        <Button tone="destructive">Delete</Button>
      </div>
    )
  }

  if (id === 'icon-button') {
    return (
      <div className="flex items-center gap-3">
        <IconButton label="Search" icon={<Search />} />
        <IconButton
          label="More options"
          icon={<MoreHorizontal />}
          tone="quiet"
        />
      </div>
    )
  }

  if (id === 'checkbox') {
    return (
      <div className="flex items-center gap-6">
        <Checkbox aria-label="Unchecked specimen" />
        <Checkbox aria-label="Checked specimen" checked />
        <Checkbox aria-label="Disabled specimen" checked disabled />
      </div>
    )
  }

  if (id === 'dialog') {
    return (
      <DialogSurface
        width="compact"
        className="max-w-sm border border-border shadow-lg"
      >
        <DialogHeader>
          <DialogTitle>Review transaction</DialogTitle>
          <DialogDescription>
            Confirm the operation before continuing.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="h-12 bg-muted" />
        </DialogBody>
        <DialogFooter>
          <Button className="w-full">Confirm</Button>
        </DialogFooter>
      </DialogSurface>
    )
  }

  if (id === 'entity-identity') {
    return (
      <EntityIdentity
        className="max-w-full"
        mark={
          <ChainBadgedLogo
            src="/imgs/socials/cmc20.png"
            chain={ChainId.BSC}
            size="xl"
            alt="CMC20"
          />
        }
        name="CoinMarketCap 20 Index DTF"
        supporting="$CMC20 · BNB Chain"
      />
    )
  }

  if (id === 'metric') {
    return (
      <div className="grid w-full max-w-sm grid-cols-2 gap-px bg-secondary p-px">
        <Metric className="bg-card p-4" label="Market cap" value="$8.42M" />
        <Metric className="bg-card p-4" label="Basket" value="20 assets" />
        <Metric
          className="col-span-2 bg-card p-4"
          role="headline"
          label="TVL"
          value="$21.8M"
        />
      </div>
    )
  }

  return (
    <EmptyState
      className="min-h-32"
      mode="actionable"
      title="No proposals found"
      description="New governance proposals will appear here."
      actions={<Button tone="secondary">Browse governance</Button>}
    />
  )
}

export const ProvisionalCompositionsOverview = () => (
  <section
    className="space-y-4"
    aria-labelledby="provisional-compositions-heading"
  >
    <div>
      <p className="text-sm font-medium text-primary">Composition evidence</p>
      <h2
        id="provisional-compositions-heading"
        className="mt-1 text-2xl font-light"
      >
        Provisional product-facing compositions
      </h2>
      <p className="mt-1 max-w-3xl text-sm font-light text-muted-foreground">
        Useful pressure tests whose canonical children are real, while their
        framing or responsive contract is still provisional.
      </p>
    </div>
    <InformationRowStateSheet />
  </section>
)

export const RemainingComponentInventory = () => (
  <section className="space-y-4" aria-labelledby="remaining-inventory-heading">
    <div>
      <p className="text-sm font-medium text-primary">Capability map</p>
      <h2 id="remaining-inventory-heading" className="mt-1 text-2xl font-light">
        Remaining inventory
      </h2>
      <p className="mt-1 text-sm font-light text-muted-foreground">
        Mapped, blocked, or untouched capabilities stay reachable without
        competing visually with implemented candidates.
      </p>
    </div>
    <div className="border border-border bg-card">
      {COMPONENT_GROUPS.map((group) => {
        const remainingItems = group.items.filter(
          (item) => item.implementationStatus !== 'canonical-candidate'
        )

        if (remainingItems.length === 0) return null

        return (
          <div
            key={group.id}
            className="grid gap-3 border-b border-border p-4 last:border-b-0 lg:grid-cols-[10rem_minmax(0,1fr)]"
          >
            <div>
              <h3 className="text-sm font-medium">{group.name}</h3>
              <p className="mt-1 text-xs font-light text-muted-foreground">
                {remainingItems.length} capabilities
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {remainingItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/internal/design-system/components/${item.id}`}
                  className="border border-border px-2.5 py-1.5 text-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.name}
                  <span className="text-muted-foreground"> · </span>
                  <ComponentAuditBadge item={item} />
                  <span className="text-muted-foreground">
                    {' · '}
                    {item.review.status === 'ready'
                      ? 'reviewable'
                      : item.review.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  </section>
)

export default CanonicalComponentsOverview
