import { ArrowUpRight, Vote, X } from 'lucide-react'

import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { CopyableValue } from '@/components/design-system-v1/copyable-value'
import {
  AddressTextInput,
  Field,
  FieldDescription,
  FieldLabel,
  FieldMessage,
} from '@/components/design-system-v1/field'
import {
  InlineMessage,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { OrganicBrandSurface } from '@/components/design-system-v1/organic-brand-surface'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import { transactionOutcomeGeometry } from '@/components/design-system-v1/transaction-task-geometry'
import { v1Typography } from '@/components/design-system-v1/typography'
import {
  DialogBody,
  DialogFooter,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { v1SemanticRecipes as roles } from '@/components/ui/v1-semantic-recipes'
import { cn } from '@/lib/utils'
import { shortenAddress } from '@/utils'

import { TransactionCommittedMode } from './transaction-committed-mode'
import { transactionOutcomeMotion } from './transaction-outcome-motion'
import { TransactionOutcomeStatus } from './transaction-outcome-status'
import {
  STAKE_TRANSACTION,
  type StakeReviewState,
} from './transaction-composition-stake-support'

export const STAKE_DELEGATE = '0x7F4a7A93C9a5E8f62d6cA9E2f4dCB0eA72B4a018'

export const StakeDelegationTask = ({
  delegate,
  onChange,
  state,
}: {
  delegate: string
  onChange: (value: string) => void
  state: StakeReviewState
}) => {
  const isCurrent = state === 'Current delegate'
  const isInvalidAddress = state === 'Invalid address'
  const isUnavailable =
    state === 'No staked balance' || state === 'Wallet disconnected'
  const isLocked =
    state === 'Delegate wallet' ||
    state === 'Delegate confirming' ||
    state === 'Delegate processing' ||
    state === 'Delegate failed'

  return (
    <div
      data-testid="stake-delegation-task"
      className="flex min-h-[15.5rem] flex-col justify-end"
    >
      <section className="grid gap-4 py-4">
        {isUnavailable && (
          <InlineMessage density="compact" icon={false} className="px-4 py-3">
            <p className={cn(v1Typography.supporting, roles.text.supporting)}>
              {state === 'No staked balance'
                ? 'Stake RSR before changing your voting delegate.'
                : 'Connect your wallet to view or change your voting delegate.'}
            </p>
          </InlineMessage>
        )}
        <Field>
          {isCurrent ? (
            <div className="px-4">
              <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-4">
                <div className="space-y-1">
                  <FieldLabel>Voting delegate</FieldLabel>
                  <FieldDescription>
                    Voting on the RToken you are staked on requires you to
                    delegate your vote to yourself or another Eth address.
                  </FieldDescription>
                </div>
                <div className="flex min-w-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className={cn(v1Typography.label, 'text-primary')}>
                    Delegated to you
                  </span>
                  <span
                    className={cn(
                      'whitespace-nowrap font-mono text-sm',
                      roles.text.supporting
                    )}
                  >
                    {shortenAddress(delegate)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1 px-4">
              <FieldLabel htmlFor="stake-voting-delegate">
                Voting delegate
              </FieldLabel>
              <FieldDescription>
                Voting on the RToken you are staked on requires you to delegate
                your vote to yourself or another Eth address.
              </FieldDescription>
            </div>
          )}
          {!isCurrent && (
            <AddressTextInput
              id="stake-voting-delegate"
              aria-label="Voting delegate"
              disabled={isLocked || isUnavailable}
              invalid={isInvalidAddress}
              aria-describedby={
                isInvalidAddress ? 'stake-voting-delegate-error' : undefined
              }
              aria-errormessage={
                isInvalidAddress ? 'stake-voting-delegate-error' : undefined
              }
              placeholder="Wallet address"
              value={
                isUnavailable ? '' : isInvalidAddress ? '0x1234' : delegate
              }
              onChange={(event) => onChange(event.target.value)}
            />
          )}
          {isInvalidAddress && (
            <FieldMessage id="stake-voting-delegate-error" className="px-4">
              Invalid address
            </FieldMessage>
          )}
        </Field>
        {!isUnavailable && (
          <dl className="px-4">
            <div
              data-testid="stake-delegation-voting-power"
              className="flex items-center justify-between gap-3"
            >
              <dt
                className={cn(
                  'flex items-center gap-2',
                  v1Typography.supporting,
                  roles.text.supporting
                )}
              >
                <Vote
                  aria-hidden="true"
                  className="size-4 shrink-0"
                  data-testid="stake-delegation-voting-power-icon"
                />
                <span>Voting power</span>
              </dt>
              <dd className={v1Typography.label}>1,420 stRSR</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  )
}

export const StakeDelegationAction = ({
  onChangeDelegate,
  state,
}: {
  onChangeDelegate: () => void
  state: StakeReviewState
}) => {
  if (state === 'Current delegate') {
    return (
      <Button className="w-full" tone="secondary" onClick={onChangeDelegate}>
        Change delegate
      </Button>
    )
  }

  if (state === 'Delegate wallet') {
    return (
      <Button className="w-full" loading>
        Pending, sign in wallet
      </Button>
    )
  }

  if (state === 'Delegate confirming') {
    return (
      <Button className="w-full" loading>
        Confirming tx...
      </Button>
    )
  }

  if (state === 'Delegate processing') {
    return (
      <Button className="w-full" loading>
        Processing transaction...
      </Button>
    )
  }

  if (state === 'Delegate failed') {
    return (
      <div className="w-full space-y-3">
        <InlineMessage
          data-testid="stake-delegation-recovery-message"
          tone="danger"
          density="compact"
          presentation="summary"
        >
          <InlineMessageTitle>Delegation failed</InlineMessageTitle>
        </InlineMessage>
        <Button className="w-full">Update delegate</Button>
      </div>
    )
  }

  if (state === 'Wallet disconnected') {
    return <Button className="w-full">Connect wallet</Button>
  }

  return (
    <Button
      className="w-full"
      disabled={state === 'Invalid address' || state === 'No staked balance'}
    >
      Update delegate
    </Button>
  )
}

export const StakeDelegationOutcome = ({
  delegate,
  onClose,
  onDone,
}: {
  delegate: string
  onClose: () => void
  onDone: () => void
}) => (
  <DialogSurface
    width="standard"
    className={cn(
      transactionOutcomeGeometry.minimumSurfaceHeight,
      'overflow-hidden p-0 outline-none ring-2 ring-card'
    )}
    role="dialog"
    tabIndex={-1}
    aria-modal="true"
    aria-label="Delegate stRSR voting power"
  >
    <div className="relative isolate flex flex-1 flex-col text-brand-foreground">
      <OrganicBrandSurface
        className={cn(
          'absolute inset-0 rounded-lg bg-brand',
          transactionOutcomeMotion.surface
        )}
      />
      <header
        className={cn(
          'relative z-10 flex min-h-8 items-center justify-between gap-4 px-4 pb-4 pt-4',
          transactionOutcomeMotion.content
        )}
      >
        <TransactionOutcomeStatus label="Completed" status="complete" />
        <IconButton
          label="Close staking"
          icon={<X />}
          size="compact"
          onClick={onClose}
        />
      </header>
      <DialogBody
        className={cn(
          'relative z-10 flex flex-col justify-end px-0 pb-2',
          transactionOutcomeMotion.content
        )}
      >
        <DialogTitle className="sr-only">Delegation updated</DialogTitle>
        <TransactionAmountObject
          label="Voting power delegated"
          amount="1,420"
          readOnly
          presentation="output"
          tone="inverse"
          className="bg-transparent px-6"
          unit="stRSR"
          supporting="1,420.00 stRSR"
        />
      </DialogBody>
    </div>

    <section className="mx-2 bg-card" data-testid="stake-delegation-outcome">
      <dl className="px-4 py-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <dt className={v1Typography.label}>Voting delegate</dt>
          <dd className="flex justify-self-end">
            <CopyableValue treatment="inline" tone="neutral" value={delegate} />
          </dd>
        </div>
      </dl>
    </section>

    <DialogFooter className="px-2 pb-2 pt-0">
      <ActionGroup className="w-full">
        <Button
          asChild
          className="flex-1"
          tone="secondary"
          trailingIcon={<ArrowUpRight />}
        >
          <a
            href={STAKE_TRANSACTION.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            View transaction
            <span className="sr-only"> on Etherscan (opens in a new tab)</span>
          </a>
        </Button>
        <Button className="flex-1" onClick={onDone}>
          Done
        </Button>
      </ActionGroup>
    </DialogFooter>
  </DialogSurface>
)

export const StakeDelegationCommittedMode = ({
  active,
}: {
  active: boolean
}) => (
  <TransactionCommittedMode
    assetSymbol="stRSR"
    isActive={active}
    label="Delegate"
  />
)
