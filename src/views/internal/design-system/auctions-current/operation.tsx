import type { Dispatch, ReactNode } from 'react'
import { Button } from '@/components/button'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { Fact, CurrentValue } from './facts'
import {
  mayLaunch,
  timeRemaining,
  type WorkspaceEvent,
  type WorkspaceState,
} from './model'
import type { DataState, SourceRecord, Viewer, Outcome } from './fixtures'

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
}) {
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
      <dl className="space-y-3 empty:hidden">
        {state.stage === 'live' ? null : requiresWeights ? (
          <Fact label="Duration">{record.duration / 60} minutes</Fact>
        ) : (
          <>
            <Fact label="Estimated trade value">
              <CurrentValue data={data}>
                {warnings ? '$72,419.16' : '$626,416.81'}
              </CurrentValue>
            </Fact>
            <Fact label="Duration">{record.duration / 60} minutes</Fact>
            {!warnings && (
              <Fact label="Next auction target">
                <CurrentValue data={data}>100%</CurrentValue>
              </Fact>
            )}
            {warnings && (
              <Fact label="Rebalance Percent">
                <span data-testid="current-effective-size">
                  2% · Ondo limits
                </span>
              </Fact>
            )}
          </>
        )}
        {restricted && !noCommunity && (
          <Fact label="Permissionless in">
            <span data-testid="current-permissionless-time">
              {timeRemaining(record.identity.restrictedUntil - state.now)}
            </span>
          </Fact>
        )}
        {record.symbol === 'LCAP' && (
          <Fact label="Weights saved">
            {state.weights || state.runs ? 'Yes' : 'No'}
          </Fact>
        )}
      </dl>
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
              <Button loading data-testid="current-launch" className="w-full">
                Launching...
              </Button>
              <p
                role="status"
                data-testid="current-operation-status"
                className={cn(type.supporting, 'text-muted-foreground')}
              >
                {state.operation === 'indexing'
                  ? 'Lab: launch confirmed; waiting for auction data. Launch remains disabled.'
                  : 'Lab: ' +
                    (state.operation === 'wallet'
                      ? 'wallet confirmation'
                      : 'transaction receipt pending')}
              </p>
              {state.operation === 'indexing' && (
                <Button
                  tone="secondary"
                  className="w-full"
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
          ) : requiresWeights && viewer === 'launcher' ? (
            <Button
              disabled={data !== 'ready'}
              data-testid="current-edit"
              className="w-full"
              onClick={() => dispatch({ type: 'edit' })}
            >
              Manage Weights
            </Button>
          ) : (
            <Button
              data-testid="current-launch"
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
          {!busy &&
            state.weights &&
            state.runs === 0 &&
            viewer === 'launcher' && (
              <Button
                tone="quiet"
                data-testid="current-edit"
                className="w-full"
                disabled={data !== 'ready'}
                onClick={() => dispatch({ type: 'edit' })}
              >
                Manage Weights
              </Button>
            )}
        </div>
      )}
      {children}
    </div>
  )
}
