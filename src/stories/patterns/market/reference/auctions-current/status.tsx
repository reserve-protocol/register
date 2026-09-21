import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { DataState, SourceRecord } from './fixtures'
import { Fact } from './facts'
import { timeRemaining, type WorkspaceState } from './model'

export function AuctionHeading({
  state,
  data,
  record,
  id,
  purpose,
  description,
  descriptionId,
}: {
  state: WorkspaceState
  data: DataState
  record: SourceRecord
  id?: string
  purpose?: string
  description?: string | null
  descriptionId?: string
}) {
  const closed = state.stage === 'finished'
  const live = state.stage === 'live'
  const restricted =
    state.now < record.identity.restrictedUntil &&
    record.identity.restrictedUntil < record.identity.availableUntil
  const timed = !closed && (live || restricted)
  return (
    <div
      data-testid="current-auction-status"
      className="grid grid-cols-1 items-center gap-x-4 gap-y-2 [@container(min-width:52rem)]:grid-cols-[minmax(0,1fr)_auto]"
    >
      <h4
        id={id}
        tabIndex={-1}
        data-testid={
          closed ? 'current-result-heading' : 'current-auction-heading'
        }
        className={cn(type.itemTitle, 'flex min-h-7 items-center outline-none')}
      >
        {closed
          ? data !== 'ready'
            ? 'Unavailable'
            : state.progress === 100
              ? 'Rebalance Finished'
              : 'Expired'
          : `Auction ${state.runs + 1}${purpose ? ` · ${purpose}` : ''}`}
      </h4>
      {description && (
        <p
          id={descriptionId}
          data-testid="current-auction-description"
          className={cn(
            type.supporting,
            'row-start-2 text-muted-foreground [@container(min-width:52rem)]:col-span-2'
          )}
        >
          {description}
        </p>
      )}
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-x-3 gap-y-2 [@container(min-width:52rem)]:col-start-2 [@container(min-width:52rem)]:row-start-1 [@container(min-width:52rem)]:justify-end [@container(min-width:52rem)]:gap-x-4',
          description ? 'row-start-3' : 'row-start-2'
        )}
      >
        {timed && (
          <dl>
            <Fact label={live ? 'Ends in' : 'Anyone can launch in'} inline>
              <span
                data-testid={
                  live ? 'current-end-time' : 'current-permissionless-time'
                }
              >
                {live
                  ? timeRemaining(state.auctionEnd - state.now)
                  : launchWait(record.identity.restrictedUntil - state.now)}
              </span>
            </Fact>
          </dl>
        )}
        <div className="ml-auto">
          <AuctionStatus state={state} data={data} record={record} />
        </div>
      </div>
    </div>
  )
}

function launchWait(seconds: number) {
  if (seconds < 60) return `${Math.max(0, Math.ceil(seconds))}s`
  const minutes = Math.ceil(seconds / 60)
  return minutes < 60 ? `${minutes}m` : timeRemaining(minutes * 60)
}

function AuctionStatus({
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
              ? 'Confirm target weights'
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
