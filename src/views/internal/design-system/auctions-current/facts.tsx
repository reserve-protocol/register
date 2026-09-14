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
  const initial =
    state.runs === 0 && state.stage === 'preparing' && !state.traded
  return (
    <section
      data-testid="current-progress"
      data-initial={initial || undefined}
      className={cn(
        'min-w-0',
        initial ? 'flex flex-wrap items-center gap-x-8 gap-y-4' : 'space-y-4'
      )}
      aria-label="Rebalance so far"
    >
      <h4 className={cn(type.label, 'text-muted-foreground')}>
        Rebalance so far
      </h4>
      <dl
        className={
          initial
            ? 'flex min-w-0 flex-wrap gap-x-8 gap-y-3'
            : 'grid grid-cols-1 gap-x-8 gap-y-4 [@container(min-width:32rem)]:grid-cols-2 [@container(min-width:64rem)]:grid-cols-4'
        }
      >
        {initial ? (
          <>
            <Fact label="Auctions completed" inline>
              <span data-testid="current-completed-auctions">0</span>
            </Fact>
            <Fact label="Current basket deviation" inline>
              <CurrentValue data={data}>−10.39%</CurrentValue>
            </Fact>
          </>
        ) : (
          <CumulativeFacts state={state} data={data} />
        )}
      </dl>
    </section>
  )
}

export function CumulativeFacts({
  state,
  data,
  stacked = false,
}: {
  state: WorkspaceState
  data: DataState
  stacked?: boolean
}) {
  return (
    <>
      <div data-testid="current-execution-fact" className="min-w-0">
        <SummaryFact label="Execution progress" stacked={stacked}>
          <CurrentValue data={data}>{state.progress}%</CurrentValue>
        </SummaryFact>
      </div>
      <SummaryFact label="Current basket deviation" stacked={stacked}>
        <CurrentValue data={data}>
          {state.progress === 100 ? '0%' : state.progress ? '−3.6%' : '−10.39%'}
        </CurrentValue>
      </SummaryFact>
      <SummaryFact label="Auctions completed" stacked={stacked}>
        <span data-testid="current-completed-auctions">{state.runs}</span>
      </SummaryFact>
      <SummaryFact label="Total traded so far" stacked={stacked}>
        <CurrentValue data={data}>
          {state.traded ? usdFromCents(state.traded) : '$0'}
        </CurrentValue>
      </SummaryFact>
    </>
  )
}

function SummaryFact({
  label,
  children,
  stacked,
}: {
  label: ReactNode
  children: ReactNode
  stacked: boolean
}) {
  if (stacked) return <StackedFact label={label}>{children}</StackedFact>
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 self-start [@container(min-width:64rem)]:flex-col [@container(min-width:64rem)]:items-start [@container(min-width:64rem)]:justify-start">
      <dt className={cn(type.supporting, 'text-muted-foreground')}>{label}</dt>
      <dd
        className={cn(
          type.label,
          'ml-auto text-right [@container(min-width:64rem)]:ml-0 [@container(min-width:64rem)]:text-left [@container(min-width:64rem)]:text-base [@container(min-width:64rem)]:font-light [@container(min-width:64rem)]:leading-6'
        )}
      >
        {children}
      </dd>
    </div>
  )
}

export function StackedFact({
  label,
  children,
  prominent = false,
}: {
  label: ReactNode
  children: ReactNode
  prominent?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className={cn(type.supporting, 'text-muted-foreground')}>{label}</dt>
      <dd className={prominent ? type.sectionTitle : type.body}>{children}</dd>
    </div>
  )
}
