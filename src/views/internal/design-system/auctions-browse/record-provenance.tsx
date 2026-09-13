import { Skeleton } from '@/components/design-system-v1/loading'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils'
import dayjs from 'dayjs'
import { type RebalanceIdentity } from './fixtures'

export function RecordProvenance({
  identity,
  loading,
  className,
  compactDate = false,
  chainId = 56,
}: {
  identity: RebalanceIdentity
  loading: boolean
  className?: string
  compactDate?: boolean
  chainId?: number
}) {
  return (
    <div
      data-testid="rebalance-metadata"
      aria-hidden={loading || undefined}
      className={cn(
        type.supporting,
        'pointer-events-none relative mt-3 flex flex-wrap items-center gap-x-1 text-muted-foreground',
        loading && 'invisible',
        className
      )}
    >
      <span>Proposed</span>{' '}
      <time dateTime={new Date(identity.creationTime * 1000).toISOString()}>
        {compactDate
          ? formatCompactDate(identity.creationTime * 1000)
          : formatDate(identity.creationTime * 1000)}
      </time>{' '}
      <span
        data-testid="rebalance-proposer-group"
        className="inline-flex items-center gap-1"
      >
        <span>by</span>
        {loading ? (
          <span>
            {identity.proposer.slice(0, 6)}…{identity.proposer.slice(-4)}
          </span>
        ) : (
          <a
            data-testid="rebalance-proposer-link"
            data-table-focus={`proposer-${identity.id}`}
            href={`${chainId === 8453 ? 'https://basescan.org' : 'https://bscscan.com'}/address/${identity.proposer}`}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'pointer-events-auto relative z-10 underline underline-offset-2 hover:text-foreground',
              roles.focus.visibleOnContent
            )}
          >
            {identity.proposer.slice(0, 6)}…{identity.proposer.slice(-4)}
          </a>
        )}
      </span>
      {loading && (
        <Skeleton className="visible absolute left-0 top-0 h-5 w-60 max-w-full" />
      )}
    </div>
  )
}

function formatCompactDate(timestamp: number) {
  const date = dayjs(timestamp)
  return date.format(
    date.year() === dayjs().year() ? 'MMM D, h:mma' : 'MMM D, YYYY, h:mma'
  )
}
