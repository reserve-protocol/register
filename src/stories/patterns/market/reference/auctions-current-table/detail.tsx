import { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { TableRow } from './model'
import { CurrentStatus, CurrentRound } from './cells'

const REFERENCES = {
  ready: {
    identity: 'August 2026 Rebalance',
    status: 'Start auction 1',
  },
  live: { identity: 'August 2026 Rebalance', status: 'Bids · 2' },
  weights: {
    identity: 'June 2026 Rebalance',
    status: 'Specify Exact Basket Weights',
  },
  completed: {
    identity: 'June 2026 Rebalance',
    status: 'Completed',
  },
  repeat: {
    identity: 'August 2026 Rebalance',
    status: 'Start auction 2',
  },
}

export function RetainedDetailPreview({
  row,
  backHref,
}: {
  row?: TableRow
  backHref: string
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus()
  }, [])
  const reference =
    row?.scenario === 'hybrid'
      ? REFERENCES.weights
      : row?.scenario === 'complete'
        ? REFERENCES.completed
        : row?.scenario === 'repeat'
          ? REFERENCES.repeat
          : row?.status === 'Ongoing'
            ? REFERENCES.live
            : REFERENCES.ready
  return (
    <section data-testid="current-retained-detail" className="space-y-4">
      <Link asChild treatment="return" className="min-h-11">
        <RouterLink
          to={backHref}
          state={{ currentTableReturn: row?.previewId }}
        >
          <ArrowLeft aria-hidden className="size-4" /> Back
        </RouterLink>
      </Link>
      <h3
        ref={heading}
        tabIndex={-1}
        className={cn(type.panelTitle, 'outline-none')}
      >
        {row?.record.identity.title ?? 'Details'}
      </h3>
      {row ? (
        <>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 bg-card p-6">
            <CurrentStatus row={row} detail />
            {row.round !== null && <CurrentRound row={row} />}
          </div>
          <figure
            data-testid="current-detail-reference"
            className="space-y-4 pt-4"
          >
            <figcaption className="space-y-2">
              <h4 className={type.itemTitle}>Reference</h4>
              <p className={cn(type.supporting, 'text-muted-foreground')}>
                Read-only · <time dateTime="2026-09-13">2026-09-13</time>
              </p>
              <p
                data-testid="current-reference-identity"
                className={type.label}
              >
                {reference.identity} · {reference.status}
              </p>
              <p className={cn(type.supporting, 'text-muted-foreground')}>
                Frozen preview, not live data.
              </p>
            </figcaption>
            <div className="border border-border bg-muted/30 p-6">
              <p className={cn(type.body, 'text-foreground')}>
                {reference.identity}
              </p>
              <p className={cn(type.supporting, 'mt-1 text-muted-foreground')}>
                {reference.status}
              </p>
              <p className={cn(type.supporting, 'mt-4 text-muted-foreground')}>
                Visual captures are generated locally for review and are not
                stored in Git.
              </p>
            </div>
          </figure>
        </>
      ) : (
        <p className={type.supporting}>
          no proposal matches this route. No launch state is inferred.
        </p>
      )}
    </section>
  )
}
