import type { ReactNode } from 'react'
import { Button } from '@/components/button'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { HistoricalRebalance } from '../auctions-browse/history-model'
import { CurrentProgress, StackedFact, CurrentValue } from './facts'
import { CurrentMessages } from './messages'
import type { DataState } from './fixtures'
import type { WorkspaceState } from './model'

export function CurrentResult({
  state,
  data,
  result,
  busy,
  onRetry,
  onArchive,
  children,
}: {
  state: WorkspaceState
  data: DataState
  result: HistoricalRebalance
  busy: boolean
  onRetry: () => void
  onArchive: () => void
  children?: ReactNode
}) {
  return (
    <div data-testid="current-result" className="space-y-6">
      <CurrentProgress state={state} data={data} />
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6 [@container(min-width:52rem)]:grid-cols-3">
        <StackedFact
          label={
            <ResultLabel
              label="Rebalance accuracy"
              help="A measure of how closely the new basket rebalanced compared to the proposed basket"
            />
          }
        >
          <CurrentValue data={data}>{result.accuracy}</CurrentValue>
        </StackedFact>
        <StackedFact
          label={
            <ResultLabel
              label="NAV Change"
              help="How much the value of the DTF basket changed due to the latest rebalance"
            />
          }
        >
          <CurrentValue data={data}>{result.navChange.value}</CurrentValue>
        </StackedFact>
        <StackedFact label="Total price impact">
          <CurrentValue data={data}>{result.priceImpact.value}</CurrentValue>
          <span
            data-testid="current-result-impact-usd"
            className={cn(type.supporting, 'block text-muted-foreground')}
          >
            <CurrentValue data={data}>{result.priceImpactUsd}</CurrentValue>
          </span>
        </StackedFact>
      </dl>
      <CurrentMessages data={data} warnings={false} onRetry={onRetry} />
      {children}
      <p className={cn(type.supporting, 'text-muted-foreground')}>
        {data !== 'ready'
          ? 'Lab: completion metrics are unavailable; no outcome is inferred.'
          : state.progress === 100
            ? 'Rebalance Finished'
            : 'Lab: the rebalance expired before reaching its target.'}
      </p>
      <Button
        tone="secondary"
        data-testid="current-history-handoff"
        disabled={busy || data !== 'ready'}
        onClick={onArchive}
      >
        Historical Rebalances
      </Button>
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
