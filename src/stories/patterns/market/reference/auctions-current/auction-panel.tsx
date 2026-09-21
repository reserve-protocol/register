import { useEffect, useId, useRef, useState, type Dispatch } from 'react'
import { Collapsible } from '@/components/design-system-v1/collapsible'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { AuctionAssets } from './assets'
import { BasketWeights } from './basket-weights'
import { AuctionLiquidity, AuctionLiquidityTrigger } from './liquidity-table'
import { AuctionChart } from './auction-chart'
import { AuctionBids } from './bids'
import { AuctionHeading } from './status'
import { CurrentOperation } from './operation'
import { CurrentMessages } from './messages'
import { WeightsEditor } from './weights-editor'
import { FillerControl } from './inspection'
import { type WorkspaceState, type WorkspaceEvent } from './model'
import type {
  DataState,
  Outcome,
  Scenario,
  SourceRecord,
  Viewer,
} from './fixtures'

interface WorkspaceProps {
  record: SourceRecord
  scenario: Scenario
  data: DataState
  viewer: Viewer
  network: boolean
  outcome: Outcome
  onConnect: () => void
  onNetwork: () => void
}

export function CurrentAuction({
  state,
  dispatch,
  onRetry,
  onDone,
  ...props
}: WorkspaceProps & {
  state: WorkspaceState
  dispatch: Dispatch<WorkspaceEvent>
  onRetry: () => void
  onDone: () => void
}) {
  const { record, scenario, data } = props
  const id = useId()
  const descriptionId = `${id}-description`
  const [selectedBid, setSelectedBid] = useState<number | null>(null)
  const [inspecting, setInspecting] = useState(false)
  const liquidityTrigger = useRef<HTMLButtonElement>(null)
  useEffect(() => setSelectedBid(null), [state.auctionStart])
  const live = state.stage === 'live'
  const warnings = scenario.startsWith('liquidity')
  const needsWeights =
    record.symbol === 'LCAP' && state.runs === 0 && !state.weights
  const preparingBasket = record.symbol === 'LCAP' && state.runs === 0 && !live
  const busy = ['wallet', 'pending', 'indexing'].includes(state.operation)
  const purpose =
    live || data !== 'ready'
      ? undefined
      : needsWeights
        ? 'Basket setup'
        : scenario === 'remove'
          ? 'Token removal'
          : scenario === 'progressing'
            ? 'Progressive rebalancing'
            : 'Precision rebalancing'
  const description = live
    ? null
    : needsWeights
      ? 'Confirm the target basket before the first auction. You can keep the defaults unchanged.'
      : data !== 'ready'
        ? null
        : scenario === 'remove'
          ? 'Remove ETH from the basket'
          : 'Trade toward the proposed basket weights.'
  return (
    <Collapsible asChild open={inspecting} onOpenChange={setInspecting}>
      <section
        aria-labelledby={id}
        data-testid="current-auction"
        className="min-w-0 space-y-6"
      >
        <AuctionHeading
          state={state}
          data={data}
          record={record}
          id={id}
          purpose={purpose}
          description={description}
          descriptionId={descriptionId}
        />
        <CurrentMessages data={data} warnings={warnings} onRetry={onRetry} />
        {state.editing ? (
          <WeightsEditor
            record={record}
            state={state}
            dispatch={dispatch}
            enabled={
              props.viewer === 'launcher' && props.network && data === 'ready'
            }
            onDone={onDone}
          />
        ) : (
          <div
            data-testid="current-working-grid"
            className={cn(
              'grid min-w-0 grid-cols-1 gap-6 [@container(min-width:52rem)]:grid-rows-[auto_1fr] [@container(min-width:52rem)]:gap-y-4',
              live
                ? '[@container(min-width:52rem)]:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]'
                : '[@container(min-width:52rem)]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'
            )}
          >
            <div
              data-testid="current-auction-plan"
              className="min-w-0 space-y-4"
            >
              {live ? (
                <AuctionChart
                  state={state}
                  selected={selectedBid}
                  knownLive={data !== 'auction-error'}
                />
              ) : preparingBasket ? (
                <BasketWeights
                  record={record}
                  data={data}
                  state={state}
                  dispatch={dispatch}
                  editable={props.viewer === 'launcher'}
                  disabled={busy || !props.network || data !== 'ready'}
                />
              ) : (
                <AuctionAssets
                  record={record}
                  data={data}
                  removal={scenario === 'remove'}
                />
              )}
            </div>
            <div
              className={cn(
                'relative min-w-0 [@container(min-width:52rem)]:pl-6',
                !live &&
                  '[@container(min-width:52rem)]:flex [@container(min-width:52rem)]:flex-col [@container(min-width:52rem)]:justify-end',
                !needsWeights &&
                  '[@container(min-width:52rem)]:col-start-2 [@container(min-width:52rem)]:row-start-1 [@container(min-width:52rem)]:row-span-2'
              )}
            >
              <Separator
                orientation="vertical"
                data-testid="current-operation-divider"
                className="absolute left-0 top-0 hidden [@container(min-width:52rem)]:block"
              />
              <CurrentOperation
                {...props}
                state={state}
                dispatch={dispatch}
                warnings={warnings}
                descriptionId={descriptionId}
              >
                {live && (
                  <AuctionBids
                    record={record}
                    hasBids={state.hasBids}
                    selected={selectedBid}
                    onSelect={setSelectedBid}
                  />
                )}
                {scenario === 'filler' && live && (
                  <FillerControl state={state} dispatch={dispatch} />
                )}
              </CurrentOperation>
            </div>
            {!needsWeights && (
              <AuctionLiquidityTrigger
                record={record}
                triggerRef={liquidityTrigger}
              />
            )}
          </div>
        )}
        {!state.editing && !needsWeights && (
          <AuctionLiquidity
            record={record}
            data={data}
            warnings={warnings}
            marketClosed={scenario === 'liquidity-closed'}
            removal={scenario === 'remove'}
            live={live}
            onClose={() => {
              setInspecting(false)
              liquidityTrigger.current?.focus()
              liquidityTrigger.current?.scrollIntoView({ block: 'center' })
            }}
          />
        )}
      </section>
    </Collapsible>
  )
}
