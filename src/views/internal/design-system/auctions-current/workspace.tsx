import { useEffect, useRef, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { CurrentProgress } from './facts'
import { CurrentResult } from './result-panel'
import { CurrentOperation } from './operation'
import { CurrentAuction } from './auction-panel'
import { resultRow } from './result'
import type { HistoricalRebalance } from '../auctions-browse/history-model'
import { useWorkspace } from './use-workspace'
import { CurrentHeader } from './header'
import { SimulationSteps } from './simulation'
import type {
  DataState,
  Outcome,
  Scenario,
  SourceRecord,
  Viewer,
} from './fixtures'

export interface WorkspaceProps {
  record: SourceRecord
  scenario: Scenario
  data: DataState
  viewer: Viewer
  network: boolean
  playing: boolean
  outcome: Outcome
  onConnect: () => void
  onNetwork: () => void
  onArchive: (row: HistoricalRebalance) => void
}

export function CurrentWorkspace(props: WorkspaceProps) {
  const { record, scenario } = props
  const [recovered, setRecovered] = useState(false)
  useEffect(() => setRecovered(false), [props.data])
  const data = recovered ? 'ready' : props.data
  const { state, dispatch } = useWorkspace(
    record,
    scenario,
    props.outcome,
    props.playing
  )
  const heading = useRef<HTMLHeadingElement>(null)
  const previousStage = useRef(state.stage)
  useEffect(() => {
    if (previousStage.current !== state.stage) {
      const operation = heading.current
        ?.closest('article')
        ?.querySelector('[data-testid="current-operation"]')
      if (
        document.activeElement === document.body ||
        operation?.contains(document.activeElement)
      )
        (
          heading.current
            ?.closest('article')
            ?.querySelector<HTMLElement>(
              '[data-testid="current-auction-heading"]'
            ) ?? heading.current
        )?.focus()
    }
    previousStage.current = state.stage
  }, [state.stage])
  const closed = state.stage === 'finished'
  const busy = ['wallet', 'pending', 'indexing'].includes(state.operation)
  const guarded =
    busy ||
    state.editing ||
    (scenario === 'filler' &&
      state.stage === 'live' &&
      state.filler === 'running')
  useEffect(() => {
    if (!guarded) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [guarded])
  if (state.archived) return null
  return (
    <div
      data-testid="current-rebalance-workspace"
      data-record={record.symbol}
      data-stage={state.stage}
      data-operation={state.operation}
      data-guarded={guarded || undefined}
      className="min-w-0"
    >
      <article
        data-testid="current-rebalance-card"
        className="min-w-0 bg-card [container-type:inline-size]"
      >
        <CurrentHeader record={record} state={state} heading={heading} />
        <div className="space-y-6 p-6">
          <Separator data-testid="current-context-divider" />
          {closed ? (
            <CurrentResult
              record={record}
              state={state}
              data={data}
              result={resultRow(record, state, data)}
              onRetry={() => setRecovered(true)}
            >
              {busy && (
                <CurrentOperation
                  {...props}
                  data={data}
                  state={state}
                  dispatch={dispatch}
                  warnings={false}
                />
              )}
            </CurrentResult>
          ) : (
            <>
              <CurrentAuction
                {...props}
                data={data}
                state={state}
                dispatch={dispatch}
                onRetry={() => setRecovered(true)}
                onDone={() =>
                  heading.current
                    ?.closest('article')
                    ?.querySelector<HTMLElement>(
                      '[data-testid="current-auction-heading"]'
                    )
                    ?.focus()
                }
              />
              <Separator data-testid="current-progress-divider" />
              <CurrentProgress state={state} data={data} />
            </>
          )}
        </div>
      </article>
      <SimulationSteps
        state={state}
        dispatch={dispatch}
        record={record}
        filler={scenario === 'filler'}
        data={data}
        onArchive={() => {
          dispatch({ type: 'archive' })
          props.onArchive(resultRow(record, state, data))
        }}
      />
    </div>
  )
}
