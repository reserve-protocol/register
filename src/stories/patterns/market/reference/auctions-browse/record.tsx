import { Skeleton } from '@/components/design-system-v1/loading'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { v1LayoutRecipes } from '@/components/ui/v1-layout-recipes'
import { cn } from '@/lib/utils'
import { type BrowseRecord } from './model'
import { RecordMetrics, RecordOperationalContext } from './record-metrics'
import { RecordPlaceholder } from './record-placeholder'
import { RecordProvenance } from './record-provenance'

export function RebalanceListRecord({
  record,
  loading = false,
}: {
  record: BrowseRecord
  loading?: boolean
}) {
  const { identity } = record
  return (
    <article
      data-testid="rebalance-list-record"
      data-proposal-id={identity.id}
      data-loading={loading}
      data-active={record.active}
      aria-busy={loading || record.metricsLoading}
      className={cn(
        'relative min-w-0',
        v1LayoutRecipes.inset.ordinaryContent,
        record.active ? roles.surface.content : roles.surface.recessedContent,
        !loading && roles.interaction.contentHover,
        !loading &&
          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring'
      )}
    >
      <div
        data-testid="rebalance-record-header"
        aria-hidden={loading || undefined}
        className="flex min-w-0 flex-wrap items-start justify-between gap-x-4 gap-y-2"
      >
        <h4
          className={cn(
            type.itemTitle,
            'min-w-0 flex-auto self-center text-foreground'
          )}
        >
          {loading ? (
            <RecordPlaceholder className="top-0 h-6 w-48">
              {identity.title}
            </RecordPlaceholder>
          ) : (
            <a
              data-testid="rebalance-record-link"
              href={record.href}
              target="_blank"
              rel="noreferrer"
              className="outline-none after:absolute after:inset-0 after:z-0"
            >
              {identity.title}
            </a>
          )}
        </h4>
        <div
          data-testid="rebalance-record-state"
          className={cn(
            'pointer-events-none relative inline-flex max-w-full',
            loading && 'invisible'
          )}
        >
          {record.notice ? (
            <InlineMessage
              data-testid="rebalance-prerequisite"
              tone="warning"
              density="compact"
            >
              <InlineMessageTitle>{record.status}</InlineMessageTitle>
            </InlineMessage>
          ) : (
            <LifecycleStatusPill role={record.role}>
              {record.status}
            </LifecycleStatusPill>
          )}
          {loading && (
            <Skeleton
              className={cn(
                'visible absolute inset-0',
                !record.notice && 'rounded-full'
              )}
            />
          )}
        </div>
      </div>
      <div
        className="pointer-events-none relative mt-3 space-y-2"
        aria-hidden={loading || undefined}
      >
        {record.active && (
          <RecordOperationalContext record={record} loading={loading} />
        )}
        <RecordMetrics record={record} loading={loading} />
      </div>
      <RecordProvenance identity={identity} loading={loading} />
    </article>
  )
}
