import type { Dispatch } from 'react'
import { Button } from '@/components/button'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { DataState, SourceRecord } from './fixtures'
import type { WorkspaceEvent, WorkspaceState } from './model'

export function SimulationSteps({
  state,
  dispatch,
  record,
  filler,
  data,
  onArchive,
}: {
  state: WorkspaceState
  dispatch: Dispatch<WorkspaceEvent>
  record: SourceRecord
  filler: boolean
  data: DataState
  onArchive: () => void
}) {
  return (
    <details className="mt-2 px-6 text-muted-foreground">
      <summary className={cn(type.supporting, 'min-h-11 cursor-pointer py-3')}>
        Lab simulation controls
      </summary>
      <div className="flex flex-wrap gap-2 pt-2">
        {state.stage === 'finished' && (
          <Button
            tone="secondary"
            data-testid="current-history-handoff"
            disabled={
              data !== 'ready' ||
              ['wallet', 'pending', 'indexing'].includes(state.operation)
            }
            onClick={onArchive}
          >
            Historical Rebalances
          </Button>
        )}
        <Button
          tone="secondary"
          disabled={state.stage !== 'live' || !state.hasBids}
          data-testid="current-complete"
          onClick={() => dispatch({ type: 'complete' })}
        >
          Reach target
        </Button>
        {filler && (
          <Button
            tone="secondary"
            disabled={state.stage !== 'live' || state.filler !== 'running'}
            onClick={() => dispatch({ type: 'filler-order' })}
          >
            Submit filler order
          </Button>
        )}
        {filler && (
          <Button
            tone="secondary"
            disabled={state.stage !== 'live'}
            onClick={() => dispatch({ type: 'filler', value: 'error' })}
          >
            Filler error
          </Button>
        )}
        <Button
          tone="secondary"
          disabled={state.stage !== 'live' || state.hasBids}
          onClick={() => dispatch({ type: 'bids' })}
        >
          Receive bids
        </Button>
        <Button
          tone="secondary"
          data-testid="current-advance-phase"
          disabled={
            state.now >= record.identity.restrictedUntil ||
            record.identity.restrictedUntil >= record.identity.availableUntil
          }
          onClick={() =>
            dispatch({
              type: 'advance',
              seconds: Math.max(
                1,
                record.identity.restrictedUntil - state.now + 1
              ),
              expires: record.identity.availableUntil,
            })
          }
        >
          Advance to permissionless
        </Button>
        <Button
          tone="secondary"
          disabled={state.stage !== 'live'}
          data-testid="current-end-auction"
          onClick={() =>
            dispatch({
              type: 'advance',
              seconds: Math.max(1, state.auctionEnd - state.now + 1),
              expires: record.identity.availableUntil,
            })
          }
        >
          End auction
        </Button>
        <Button
          tone="secondary"
          data-testid="current-expire"
          onClick={() =>
            dispatch({
              type: 'advance',
              seconds: Math.max(
                1,
                record.identity.availableUntil - state.now + 1
              ),
              expires: record.identity.availableUntil,
            })
          }
        >
          Expire rebalance
        </Button>
      </div>
    </details>
  )
}
