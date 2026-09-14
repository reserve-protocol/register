import type { ReactNode } from 'react'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { HistoricalRebalance } from '../auctions-browse/history-model'
import { Fact, StackedFact, CurrentValue } from './facts'
import { usdFromCents } from './weights-model'
import { CurrentMessages } from './messages'
import type { DataState, SourceRecord } from './fixtures'
import type { WorkspaceState } from './model'
import { AuctionHeading } from './status'

export function CurrentResult({
  state,
  data,
  result,
  onRetry,
  children,
  record,
}: {
  state: WorkspaceState
  data: DataState
  result: HistoricalRebalance
  onRetry: () => void
  children?: ReactNode
  record: SourceRecord
}) {
  return (
    <div data-testid="current-result" className="space-y-6">
      <AuctionHeading state={state} data={data} record={record} />
      {(data !== 'ready' || state.progress !== 100) && (
        <p className={cn(type.supporting, 'text-muted-foreground')}>
          {data !== 'ready'
            ? 'Lab: completion metrics are unavailable; no outcome is inferred.'
            : 'Lab: the rebalance expired before reaching its target.'}
        </p>
      )}
      <div className="grid min-w-0 grid-cols-1 gap-8 [@container(min-width:52rem)]:grid-cols-2 [@container(min-width:52rem)]:gap-x-12">
        <dl data-testid="current-outcome-primary" className="min-w-0 space-y-4">
          <StackedFact
            prominent
            label={
              <ResultLabel
                label="Rebalance accuracy"
                help="A measure of how closely the new basket rebalanced compared to the proposed basket"
              />
            }
          >
            <CurrentValue data={data}>{result.accuracy}</CurrentValue>
          </StackedFact>
          <div className="space-y-3">
            <Fact label="Execution progress">
              <CurrentValue data={data}>{state.progress}%</CurrentValue>
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
            <Fact label="Auctions completed">
              <span data-testid="current-completed-auctions">{state.runs}</span>
            </Fact>
          </div>
        </dl>
        <dl
          data-testid="current-outcome-financial"
          className="min-w-0 space-y-4"
        >
          <StackedFact
            prominent
            label={
              <ResultLabel
                label="NAV Change"
                help="How much the value of the DTF basket changed due to the latest rebalance"
              />
            }
          >
            <CurrentValue data={data}>{result.navChange.value}</CurrentValue>
          </StackedFact>
          <div className="space-y-3">
            <Fact label="Total traded so far">
              <CurrentValue data={data}>
                {state.traded ? usdFromCents(state.traded) : '$0'}
              </CurrentValue>
            </Fact>
            <Fact label="Total price impact">
              <CurrentValue data={data}>
                {result.priceImpact.value}
              </CurrentValue>
              <span
                data-testid="current-result-impact-usd"
                className={cn(type.supporting, 'block text-muted-foreground')}
              >
                <CurrentValue data={data}>{result.priceImpactUsd}</CurrentValue>
              </span>
            </Fact>
          </div>
        </dl>
      </div>
      <CurrentMessages data={data} warnings={false} onRetry={onRetry} />
      {children}
    </div>
  )
}

function ResultLabel({ label, help }: { label: string; help: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {label}
      <HelpTooltip accessibleLabel={`About ${label}`} content={help} />
    </span>
  )
}
