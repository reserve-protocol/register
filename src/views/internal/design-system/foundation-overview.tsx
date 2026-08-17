import {
  ArrowRight,
  Check,
  CircleDot,
  Focus,
  MoveRight,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { FOUNDATION_ITEMS } from './foundation-catalog'
import { OutputBadge, StatusBadge } from './catalog-ui'
import { FLOATING_SHADOW, MODAL_SHADOW } from './elevation-study'

const FoundationOverview = () => (
  <div
    data-testid="foundation-visual-overview"
    className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
  >
    {FOUNDATION_ITEMS.map((item) => (
      <Link
        key={item.id}
        to={`/internal/design-system/foundations/${item.id}`}
        className="group flex min-h-64 flex-col border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex min-h-40 flex-1 items-center justify-center overflow-hidden border-b border-border bg-background p-5 transition-colors group-hover:bg-muted/30">
          <FoundationSpecimen foundationId={item.id} />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-medium">{item.name}</h2>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusBadge item={item} />
            <OutputBadge item={item} />
          </div>
        </div>
      </Link>
    ))}
  </div>
)

export const FoundationSpecimen = ({
  foundationId,
}: {
  foundationId: string
}) => {
  if (foundationId === 'color') {
    return (
      <div className="grid w-full max-w-sm grid-cols-4 gap-1 bg-secondary p-1">
        <span className="h-20 bg-card" />
        <span className="h-20 bg-muted" />
        <span className="h-20 bg-primary" />
        <span className="grid h-20 grid-rows-3 gap-1">
          <span className="bg-success" />
          <span className="bg-warning" />
          <span className="bg-destructive" />
        </span>
      </div>
    )
  }

  if (foundationId === 'typography') {
    return (
      <div className="w-full max-w-sm space-y-2">
        <p className="text-[32px] font-light leading-[38px]">Index DTF</p>
        <p className="text-xl font-medium leading-7">Portfolio exposure</p>
        <p className="text-base font-light leading-6">
          Durable onchain products.
        </p>
        <p className="text-sm font-light text-muted-foreground">
          Updated a few seconds ago
        </p>
      </div>
    )
  }

  if (foundationId === 'spacing') {
    return (
      <div className="flex w-full max-w-sm items-end gap-4">
        {[4, 8, 16, 24, 32].map((space) => (
          <span key={space} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={cn(
                'w-full bg-primary/15',
                space === 4 && 'h-2',
                space === 8 && 'h-4',
                space === 16 && 'h-8',
                space === 24 && 'h-12',
                space === 32 && 'h-16'
              )}
            />
            <code className="text-[10px] text-muted-foreground">{space}</code>
          </span>
        ))}
      </div>
    )
  }

  if (foundationId === 'radius') {
    return (
      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
        <span className="h-20 border border-primary bg-primary/10" />
        <span className="h-20 rounded-lg border border-primary bg-primary/10" />
        <span className="h-20 rounded-full border border-primary bg-primary/10" />
      </div>
    )
  }

  if (foundationId === 'layout') {
    return (
      <div className="grid h-28 w-full max-w-sm grid-cols-[3rem_minmax(0,1fr)_5rem] gap-0.5 bg-secondary p-0.5">
        <span className="bg-card p-2">
          <span className="block h-4 rounded-full bg-primary" />
        </span>
        <span className="bg-card p-3">
          <span className="block h-2 w-1/2 bg-muted" />
          <span className="mt-3 block h-14 bg-muted/50" />
        </span>
        <span className="bg-card p-3">
          <span className="block h-full bg-muted/60" />
        </span>
      </div>
    )
  }

  if (foundationId === 'elevation') {
    return (
      <div className="relative h-28 w-full max-w-sm bg-muted/50 p-5">
        <span className="absolute left-5 top-5 h-16 w-24 border border-border bg-card" />
        <span
          className={cn(
            'absolute left-1/2 top-7 h-16 w-24 -translate-x-1/2 border border-border bg-card',
            FLOATING_SHADOW
          )}
        />
        <span
          className={cn(
            'absolute right-5 top-9 h-16 w-24 bg-card',
            MODAL_SHADOW
          )}
        />
      </div>
    )
  }

  if (foundationId === 'motion') {
    return (
      <div className="w-full max-w-sm space-y-3">
        {[
          ['120ms', 'w-1/3'],
          ['180ms', 'w-2/3'],
          ['240ms', 'w-full'],
        ].map(([label, width]) => (
          <div key={label} className="flex items-center gap-3">
            <code className="w-12 text-[10px] text-muted-foreground">
              {label}
            </code>
            <span className={cn('h-2 bg-primary', width)} />
          </div>
        ))}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <MoveRight className="size-4" strokeWidth={1.5} /> ease-out · reduced
          motion preserved
        </p>
      </div>
    )
  }

  if (foundationId === 'iconography') {
    return (
      <div className="flex items-end gap-6 text-foreground">
        <Search className="size-3.5" strokeWidth={1.5} />
        <CircleDot className="size-4" strokeWidth={1.5} />
        <Focus className="size-5" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="grid w-full max-w-sm grid-cols-2 gap-3">
      <span className="flex h-12 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2 ring-offset-card">
        <Check className="size-4" />
      </span>
      <span className="flex h-12 items-center justify-center rounded-full border border-border bg-card text-sm font-medium">
        44px target
      </span>
      <span className="col-span-2 text-center text-xs text-muted-foreground">
        Keyboard · contrast · names · reduced motion
      </span>
    </div>
  )
}

export default FoundationOverview
