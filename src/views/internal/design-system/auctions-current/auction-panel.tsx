import { useEffect, useId, useState, type Dispatch } from 'react'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { AuctionAssets, AssetName } from './assets'
import { AuctionLiquidity } from './liquidity-table'
import { AuctionChart } from './auction-chart'
import { AuctionBids } from './bids'
import { AuctionStatus } from './header'
import { CurrentOperation } from './operation'
import { CurrentMessages } from './messages'
import { WeightsEditor } from './weights-editor'
import { FillerControl } from './inspection'
import { Fact } from './facts'
import {
  timeRemaining,
  type WorkspaceState,
  type WorkspaceEvent,
} from './model'
import type { WorkspaceProps } from './workspace'

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
  const [selectedBid, setSelectedBid] = useState<number | null>(null)
  useEffect(() => setSelectedBid(null), [state.auctionStart])
  const live = state.stage === 'live'
  const warnings = scenario.startsWith('liquidity')
  const needsWeights =
    record.symbol === 'LCAP' && state.runs === 0 && !state.weights
  const description = live
    ? 'Bidding is ongoing...'
    : needsWeights
      ? 'Set exact basket weights before launching the rebalance auctions'
      : data !== 'ready'
        ? '—'
        : scenario === 'remove'
          ? 'Remove ETH from the basket'
          : 'Buy/sell tokens to move closer to proposed weights.'
  return (
    <section
      aria-labelledby={id}
      data-testid="current-auction"
      className="min-w-0 space-y-6"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h4
              id={id}
              tabIndex={-1}
              data-testid="current-auction-heading"
              className={cn(type.itemTitle, 'outline-none')}
            >
              Auction {state.runs + 1}
            </h4>
            <AuctionStatus state={state} data={data} record={record} />
          </div>
          {live && (
            <dl>
              <Fact label="Ends in" inline>
                <span data-testid="current-end-time">
                  {timeRemaining(state.auctionEnd - state.now)}
                </span>
              </Fact>
            </dl>
          )}
        </div>
        <p className={cn(type.supporting, 'text-muted-foreground')}>
          {description}
        </p>
      </div>
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
          className="grid min-w-0 grid-cols-1 items-start gap-6 [@container(min-width:52rem)]:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] [@container(min-width:52rem)]:gap-x-10"
        >
          {live ? (
            <AuctionChart state={state} selected={selectedBid} />
          ) : needsWeights ? (
            <div className="min-w-0 space-y-4">
              <h5 className={type.itemTitle}>Basket</h5>
              <div className="grid grid-cols-2 gap-4">
                {record.tokens.map((token) => (
                  <AssetName
                    key={token.address}
                    token={token}
                    chainId={record.chainId}
                  />
                ))}
              </div>
            </div>
          ) : (
            <AuctionAssets
              record={record}
              data={data}
              removal={scenario === 'remove'}
            />
          )}
          <CurrentOperation
            {...props}
            state={state}
            dispatch={dispatch}
            warnings={warnings}
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
      )}
      {!state.editing && !needsWeights && (
        <AuctionLiquidity
          record={record}
          data={data}
          warnings={warnings}
          marketClosed={scenario === 'liquidity-closed'}
          removal={scenario === 'remove'}
          live={live}
        />
      )}
    </section>
  )
}
