import type { RefObject } from 'react'
import { Link } from '@/components/design-system-v1/link'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { cn } from '@/lib/utils'
import { RecordProvenance } from '../auctions-browse/record-provenance'
import { timeRemaining, type WorkspaceState } from './model'
import type { DataState, SourceRecord } from './fixtures'
import { RebalanceInspection } from './inspection'

export function CurrentHeader({
  record,
  state,
  data,
  heading,
}: {
  record: SourceRecord
  state: WorkspaceState
  data: DataState
  heading: RefObject<HTMLHeadingElement>
}) {
  const closed = state.stage === 'finished'
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-6 pt-6">
      <h3
        ref={heading}
        tabIndex={-1}
        className={cn(type.panelTitle, 'outline-none')}
      >
        <Link
          treatment="contextual"
          className={cn(type.panelTitle, 'whitespace-normal')}
          href={`/${record.chainId === 56 ? 'bsc' : 'base'}/index-dtf/${record.address}/governance/proposal/${record.identity.id}`}
        >
          {record.identity.title}
        </Link>
      </h3>
      <RebalanceInspection record={record} />
      <div
        data-testid="current-header-metadata"
        className={cn(
          type.supporting,
          'col-span-2 flex flex-col items-start gap-x-2 gap-y-1 text-muted-foreground [@container(min-width:32rem)]:flex-row [@container(min-width:32rem)]:flex-wrap [@container(min-width:32rem)]:items-center'
        )}
      >
        <RecordProvenance
          identity={record.identity}
          loading={false}
          compactDate
          chainId={record.chainId}
          className="mt-0"
        />
        <span className="inline-flex items-center gap-2">
          <span
            aria-hidden
            className="hidden [@container(min-width:32rem)]:inline"
          >
            ·
          </span>
          {state.now >= record.identity.availableUntil ? (
            <span className={cn(type.supporting, 'text-muted-foreground')}>
              Ended
            </span>
          ) : (
            <span className="whitespace-nowrap">
              Expires in{' '}
              <span data-testid="current-expiry">
                {timeRemaining(record.identity.availableUntil - state.now)}
              </span>
            </span>
          )}
        </span>
      </div>
      {closed && (
        <div className="col-span-2">
          <AuctionStatus state={state} data={data} record={record} />
        </div>
      )}
    </header>
  )
}

export function AuctionStatus({
  state,
  data,
  record,
}: {
  state: WorkspaceState
  data: DataState
  record: SourceRecord
}) {
  const closed = state.stage === 'finished'
  const busy = ['wallet', 'pending', 'indexing'].includes(state.operation)
  const knownLive = state.stage === 'live' && data !== 'auction-error'
  const needsWeights =
    record.symbol === 'LCAP' && state.runs === 0 && !state.weights
  const status = closed
    ? data !== 'ready'
      ? 'Unavailable'
      : state.progress === 100
        ? 'Completed'
        : 'Expired'
    : busy
      ? 'Launching...'
      : knownLive
        ? 'Ongoing'
        : data === 'pending'
          ? 'Loading'
          : data !== 'ready'
            ? 'Unavailable'
            : needsWeights
              ? 'Lab: weights required'
              : 'Ready to start'
  return (
    <LifecycleStatusPill
      role={
        closed
          ? 'closed'
          : busy
            ? 'processing'
            : knownLive
              ? 'active'
              : data !== 'ready'
                ? 'waiting'
                : 'actionable'
      }
    >
      {status}
    </LifecycleStatusPill>
  )
}
