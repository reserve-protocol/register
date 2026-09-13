import type { ReactNode } from 'react'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { TransactionOutcomeDetailRow } from '../transaction-outcome-detail-row'
import type { DataState } from './fixtures'
import type { WorkspaceState } from './model'
import { usdFromCents } from './weights-model'

export function Fact({
  label,
  children,
  inline = false,
}: {
  label: ReactNode
  children: ReactNode
  inline?: boolean
}) {
  return (
    <TransactionOutcomeDetailRow
      testId="current-inline-fact"
      label={label}
      value={children}
      inline={inline}
      wrap
    />
  )
}

export function CurrentValue({
  children,
  data,
}: {
  children: ReactNode
  data: DataState
}) {
  if (data === 'pending')
    return <Skeleton className="inline-block h-5 w-16 align-middle" />
  if (data !== 'ready') return <span className="text-muted-foreground">—</span>
  return <span className="tabular-nums">{children}</span>
}

export function CurrentProgress({
  state,
  data,
}: {
  state: WorkspaceState
  data: DataState
}) {
  const known = data === 'ready'
  const started =
    state.runs > 0 || state.stage === 'live' || state.stage === 'finished'
  return (
    <section
      data-testid="current-progress"
      className="min-w-0 space-y-4"
      aria-label="Rebalance so far"
    >
      <h4 className={type.itemTitle}>Rebalance so far</h4>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-3 [@container(min-width:32rem)]:grid-cols-2 [@container(min-width:64rem)]:grid-cols-4">
        <Fact label="Execution progress">
          <CurrentValue data={data}>{state.progress}%</CurrentValue>
        </Fact>
        <Fact label="Auctions completed">
          <span data-testid="current-completed-auctions">{state.runs}</span>
        </Fact>
        <Fact label="Total traded so far">
          <CurrentValue data={data}>
            {state.traded ? usdFromCents(state.traded) : '$0'}
          </CurrentValue>
        </Fact>
        <Fact label="Current basket deviation">
          <CurrentValue data={data}>
            {state.progress === 100
              ? '0%'
              : state.progress
                ? '−3.6%'
                : '−10.39%'}
          </CurrentValue>
        </Fact>
      </dl>
      {started &&
        (data === 'pending' ? (
          <Skeleton className="h-1 w-full" />
        ) : (
          <svg
            data-testid="current-progress-rail"
            role="img"
            aria-label={
              known
                ? `Execution progress ${state.progress}%`
                : 'Execution progress unavailable'
            }
            viewBox="0 0 100 4"
            preserveAspectRatio="none"
            className="h-1 w-full"
          >
            <rect width="100" height="4" className="fill-secondary" />
            {known && (
              <rect
                width={state.progress}
                height="4"
                className="fill-primary"
              />
            )}
          </svg>
        ))}
    </section>
  )
}

export function StackedFact({
  label,
  children,
}: {
  label: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className={cn(type.supporting, 'text-muted-foreground')}>{label}</dt>
      <dd className={type.body}>{children}</dd>
    </div>
  )
}
