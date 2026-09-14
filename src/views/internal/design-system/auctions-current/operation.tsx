import { useId, type Dispatch, type ReactNode } from 'react'
import { Trans } from '@lingui/react/macro'
import { Button } from '@/components/button'
import { HelpTooltip } from '@/components/design-system-v1/help-tooltip'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { Fact, CurrentValue } from './facts'
import { mayLaunch, type WorkspaceEvent, type WorkspaceState } from './model'
import type { DataState, SourceRecord, Viewer, Outcome } from './fixtures'
import { AuctionSizeWarning } from './messages'

export function CurrentOperation({
  state,
  dispatch,
  record,
  data,
  viewer,
  network,
  warnings,
  onConnect,
  onNetwork,
  children,
  outcome,
  descriptionId,
}: {
  state: WorkspaceState
  dispatch: Dispatch<WorkspaceEvent>
  record: SourceRecord
  data: DataState
  viewer: Viewer
  network: boolean
  warnings: boolean
  onConnect: () => void
  onNetwork: () => void
  children?: ReactNode
  outcome: Outcome
  descriptionId?: string
}) {
  const weightsNoteId = useId()
  const busy = ['wallet', 'pending', 'indexing'].includes(state.operation)
  const restricted = state.now < record.identity.restrictedUntil
  const noCommunity =
    record.identity.restrictedUntil === record.identity.availableUntil
  const requiresWeights =
    record.symbol === 'LCAP' && state.runs === 0 && !state.weights
  return (
    <div
      data-testid="current-operation"
      data-operation={state.operation}
      className="flex min-w-0 flex-col gap-4"
    >
      {state.stage === 'finished' && busy && (
        <h4 className={type.itemTitle}>Auction {state.runs + 1}</h4>
      )}
      {state.stage !== 'live' && (
        <div className="space-y-2">
          <dl
            className="space-y-3"
            aria-describedby={requiresWeights ? weightsNoteId : undefined}
          >
            <Fact label="Estimated trade value">
              {requiresWeights ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                <CurrentValue data={data}>
                  {warnings ? '$72,419.16' : '$626,416.81'}
                </CurrentValue>
              )}
            </Fact>
            {!warnings && (
              <Fact
                label={
                  <span
                    data-testid="current-target-label"
                    className="inline-flex items-center gap-2"
                  >
                    Execution target
                    <HelpTooltip
                      accessibleLabel="About target execution progress"
                      content="Estimated total rebalance progress this auction is configured to reach, including progress from earlier auctions. This is not a guaranteed result; more auctions may be needed."
                    />
                  </span>
                }
              >
                {requiresWeights ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  <CurrentValue data={data}>100%</CurrentValue>
                )}
              </Fact>
            )}
            {warnings && (
              <Fact label="Rebalance Percent">
                <span
                  data-testid="current-effective-size"
                  className="text-feedback-warning-foreground"
                >
                  2% · Ondo limits
                </span>
              </Fact>
            )}
            <Fact label="Duration">{record.duration / 60} minutes</Fact>
          </dl>
          {requiresWeights && (
            <p
              id={weightsNoteId}
              data-testid="current-weight-estimates-note"
              className={cn(type.supporting, 'text-muted-foreground')}
            >
              <Trans>Available after confirming target weights</Trans>
            </p>
          )}
        </div>
      )}
      {warnings && state.stage !== 'live' && <AuctionSizeWarning />}
      {state.stage !== 'live' && (
        <div className="space-y-3">
          {!busy && restricted && viewer !== 'launcher' && (
            <p className={cn(type.supporting, 'text-muted-foreground')}>
              {noCommunity
                ? 'Community launch is not available for this rebalance'
                : 'Only the auction launcher can start auctions'}
            </p>
          )}
          {['rejected', 'failed'].includes(state.operation) && (
            <InlineMessage density="compact" tone="danger" role="status">
              <InlineMessageTitle>
                Transaction rejected or failed
              </InlineMessageTitle>
            </InlineMessage>
          )}
          {busy ? (
            <>
              <p
                role="status"
                data-testid="current-operation-status"
                className={type.label}
              >
                {state.operation === 'indexing'
                  ? 'Lab: launch confirmed; waiting for auction data. Launch remains disabled.'
                  : 'Lab: ' +
                    (state.operation === 'wallet'
                      ? 'wallet confirmation'
                      : 'transaction receipt pending')}
              </p>
              <Button loading data-testid="current-launch" className="w-full">
                Launching...
              </Button>
              {state.operation === 'indexing' && (
                <Button
                  tone="secondary"
                  className="self-start"
                  data-testid="current-index-refresh"
                  onClick={() =>
                    dispatch({ type: 'indexed', duration: record.duration })
                  }
                >
                  Refresh
                </Button>
              )}
            </>
          ) : viewer === 'visitor' ? (
            <Button
              data-testid="current-connect"
              className="w-full"
              onClick={onConnect}
            >
              Connect wallet
            </Button>
          ) : !network ? (
            <Button
              data-testid="current-network"
              className="w-full"
              onClick={onNetwork}
            >
              Switch to {record.chainId === 56 ? 'BNB Smart Chain' : 'Base'}
            </Button>
          ) : (
            <Button
              data-testid="current-launch"
              aria-describedby={requiresWeights ? descriptionId : undefined}
              disabled={!mayLaunch(state, record, viewer, network, data)}
              className="w-full"
              onClick={() =>
                dispatch({
                  type: 'launch',
                  record,
                  viewer,
                  network,
                  data,
                  outcome,
                })
              }
            >
              Start auction {state.runs + 1}
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
