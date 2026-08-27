import { X } from 'lucide-react'

import { Button } from '@/components/button'
import {
  InlineMessage,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import {
  TransactionAmountObject,
  TransactionAmountPair,
  TransactionAmountRelation,
} from '@/components/design-system-v1/transaction-amount-object'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'

import {
  TransactionCompositionFrame,
  type TransactionCompositionState,
} from './transaction-composition-frame'
import { TransactionAmountAsset } from './transaction-system-assets'

export const DelayedTransactionComposition = () => (
  <TransactionCompositionFrame
    id="delayed"
    model="Delayed settlement · current Yield unstake structure"
    title="Unstake and withdraw"
    description="The existing product separates the editable staking page, the review and confirmation task modal, and the persistent withdrawal queue. This slice keeps those boundaries while standardizing their visual language."
    parts={[
      { label: 'Field, dialog, Button, status', status: 'Current baseline' },
      {
        label: 'Page → modal → queue relationship',
        status: 'Retained current',
      },
      {
        label: 'Delayed-state language and queue rows',
        status: 'Proposed candidate',
      },
      { label: 'Queue-index correctness', status: 'Deferred' },
    ]}
  >
    {(state) => <DelayedProductContext state={state} />}
  </TransactionCompositionFrame>
)

const DelayedProductContext = ({
  state,
}: {
  state: TransactionCompositionState
}) => {
  const outcome = state === 'Outcome'

  return (
    <div className="relative mx-auto min-h-[640px] w-full max-w-5xl overflow-hidden bg-background p-4 sm:p-6">
      <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          {outcome && (
            <InlineMessage tone="success">
              <InlineMessageTitle>Cooldown started</InlineMessageTitle>
              <InlineMessageDescription className="mt-1">
                The confirmed amount is now tracked in the withdrawal queue.
              </InlineMessageDescription>
            </InlineMessage>
          )}
          {outcome && <WithdrawalQueue includeCurrent />}
          <section className="bg-card shadow-sm">
            <div className="p-4">
              <TransactionAmountPair>
                <TransactionAmountObject
                  label="You unstake"
                  amount="250"
                  readOnly
                  presentation="input"
                  asset={
                    <TransactionAmountAsset
                      chain={ChainId.Mainnet}
                      symbol="stRSR"
                    />
                  }
                  supporting="$1,462.50"
                  balance="Staked balance 1,420 stRSR"
                />
                <TransactionAmountObject
                  label="Available to withdraw later"
                  amount="≈286.42"
                  readOnly
                  presentation="output"
                  asset={
                    <TransactionAmountAsset
                      chain={ChainId.Mainnet}
                      symbol="RSR"
                    />
                  }
                  supporting="Estimated at the current exchange rate"
                />
                <TransactionAmountRelation />
              </TransactionAmountPair>
              <Button className="mt-4 w-full">Unstake RSR</Button>
            </div>
          </section>
          {!outcome && <WithdrawalQueue />}
        </div>
        <aside className="hidden bg-card p-5 lg:block">
          <h4 className={v1Typography.itemTitle}>Staking overview</h4>
          <p
            className={cn(
              'mt-1',
              v1Typography.supporting,
              roles.text.supporting
            )}
          >
            Exchange rate, APY, and position context stay on this page instead
            of repeating inside the transaction task.
          </p>
        </aside>
      </div>
      {!outcome && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <UnstakeTask state={state} />
        </div>
      )}
    </div>
  )
}

const UnstakeTask = ({ state }: { state: TransactionCompositionState }) => {
  const title = {
    Review: 'Unstake',
    Execution: 'Confirm unstake in wallet',
    Recovery: 'Unstake failed',
    Outcome: 'Unstake confirmed',
  }[state]

  return (
    <DialogSurface width="standard">
      <DialogHeader
        className="pb-3 pt-2"
        leading={
          <DialogTitle className={v1Typography.itemTitle}>{title}</DialogTitle>
        }
        action={
          <IconButton
            label="Close preview"
            icon={<X />}
            size="compact"
            tone="secondary"
          />
        }
      />
      <DialogBody className="space-y-2 px-0 pb-0">
        {state !== 'Review' && <TaskState state={state} />}
        <div data-testid="unstake-amount-and-details">
          <TransactionAmountPair>
            <TransactionAmountObject
              label="You unstake"
              amount="250"
              readOnly
              presentation="input"
              asset={
                <TransactionAmountAsset
                  chain={ChainId.Mainnet}
                  symbol="stRSR"
                />
              }
              supporting="$1,462.50"
            />
            <TransactionAmountObject
              label="Available to withdraw later"
              amount="≈286.42"
              readOnly
              presentation="output"
              asset={
                <TransactionAmountAsset chain={ChainId.Mainnet} symbol="RSR" />
              }
              supporting="Estimated at the current exchange rate"
            />
            <TransactionAmountRelation />
          </TransactionAmountPair>
          <dl
            data-testid="unstake-details"
            className="space-y-2 border-t border-border px-4 py-4"
          >
            <Detail label="Current cooldown" value="14 days" />
            <Detail label="Staking yield share ends" value="Immediately" />
          </dl>
        </div>
      </DialogBody>
      {state === 'Review' && (
        <DialogFooter className="px-0 pb-0 pt-0">
          <Button className="w-full">Start 14-day cooldown</Button>
        </DialogFooter>
      )}
      {state === 'Recovery' && (
        <DialogFooter className="px-0 pb-0 pt-0">
          <Button className="w-full">Try again</Button>
        </DialogFooter>
      )}
    </DialogSurface>
  )
}

const TaskState = ({ state }: { state: TransactionCompositionState }) => {
  if (state === 'Execution') {
    return (
      <div
        data-testid="unstake-execution-status"
        className="flex items-center justify-between gap-4 px-4 pb-2"
      >
        <p className={cn(v1Typography.supporting, roles.text.supporting)}>
          Wallet confirmation required
        </p>
        <LifecycleStatusPill role="processing">Confirming</LifecycleStatusPill>
      </div>
    )
  }

  if (state === 'Recovery') {
    return (
      <div className="space-y-2">
        <InlineMessage tone="danger">
          <InlineMessageTitle>No cooldown started</InlineMessageTitle>
          <InlineMessageDescription className="mt-1">
            The amount remains available to retry.
          </InlineMessageDescription>
        </InlineMessage>
      </div>
    )
  }

  return null
}

const WithdrawalQueue = ({
  includeCurrent = false,
}: {
  includeCurrent?: boolean
}) => (
  <section className="bg-card p-4 sm:p-6">
    <h4 className="text-xl font-medium">In withdrawal process</h4>
    <div
      data-testid="withdrawal-queue-list"
      className="mt-4 divide-y divide-border border-y border-border"
    >
      {includeCurrent && (
        <QueueRow
          title="RSR cooling down"
          amount="286.42 RSR"
          status="Cooling down"
          role="waiting"
          action="Cancel unstake"
        />
      )}
      <QueueRow
        title="RSR available to withdraw"
        amount="80 RSR"
        status="Claimable"
        role="actionable"
        action="Withdraw"
      />
      <QueueRow
        title="RSR in 14-day cooldown"
        amount="290 RSR"
        status="Cooling down"
        role="waiting"
        action="Cancel unstake"
      />
    </div>
  </section>
)

const QueueRow = ({
  action,
  amount,
  role,
  status,
  title,
}: {
  action: string
  amount: string
  role: 'actionable' | 'waiting'
  status: string
  title: string
}) => (
  <div
    data-testid="withdrawal-queue-row"
    className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
  >
    <div>
      <p className={v1Typography.label}>{title}</p>
      <p className="mt-1 text-xl font-light tabular-nums">{amount}</p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <LifecycleStatusPill role={role}>{status}</LifecycleStatusPill>
      <Button
        size="compact"
        tone={role === 'actionable' ? 'primary' : 'destructive'}
      >
        {action}
      </Button>
    </div>
  </div>
)

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-3">
    <dt className={cn(v1Typography.supporting, roles.text.supporting)}>
      {label}
    </dt>
    <dd className={v1Typography.label}>{value}</dd>
  </div>
)
