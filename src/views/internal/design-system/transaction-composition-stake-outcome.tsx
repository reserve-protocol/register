import { ArrowUpRight, X } from 'lucide-react'

import { Button } from '@/components/button'
import { ActionGroup } from '@/components/design-system-v1/action-group'
import { OrganicBrandSurface } from '@/components/design-system-v1/organic-brand-surface'
import { TransactionAmountObject } from '@/components/design-system-v1/transaction-amount-object'
import {
  DialogBody,
  DialogFooter,
  DialogSurface,
  DialogTitle,
} from '@/components/dialog'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'

import { TransactionOutcomeDetailRow } from './transaction-outcome-detail-row'
import { transactionOutcomeMotion } from './transaction-outcome-motion'
import { TransactionOutcomeStatus } from './transaction-outcome-status'
import { STAKE_TRANSACTION } from './transaction-composition-stake-support'
import {
  getStakeFixtureQuote,
  type StakeFixtureKind,
} from './transaction-composition-stake-fixtures'

export const StakeOutcomeDialog = ({
  amount,
  kind,
  onClose,
  onDone,
}: {
  amount: string
  kind: StakeFixtureKind
  onClose: () => void
  onDone: () => void
}) => {
  const isUnstake = kind === 'unstake'
  const quote = getStakeFixtureQuote(kind, amount)

  return (
    <DialogSurface
      width="standard"
      className={cn(
        isUnstake ? 'min-h-[29.75rem]' : 'min-h-[35.5rem]',
        'overflow-hidden p-0 outline-none ring-2 ring-card'
      )}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-label="Stake or unstake RSR"
    >
      <div className="relative isolate flex flex-1 flex-col text-brand-foreground">
        {isUnstake ? (
          <div
            aria-hidden="true"
            data-outcome-surface="delayed"
            className={cn(
              'absolute inset-0 rounded-lg bg-brand',
              transactionOutcomeMotion.surface
            )}
          />
        ) : (
          <OrganicBrandSurface
            data-outcome-surface="immediate"
            className={cn(
              'absolute inset-0 rounded-lg bg-brand',
              transactionOutcomeMotion.surface
            )}
          />
        )}
        <header
          className={cn(
            'relative z-10 flex min-h-8 items-center justify-between gap-4 px-4 pb-4 pt-4',
            transactionOutcomeMotion.content
          )}
        >
          <DialogTitle className="sr-only">
            {isUnstake ? 'Unstaking initiated' : 'RSR staked successfully'}
          </DialogTitle>
          <TransactionOutcomeStatus
            label={isUnstake ? 'Unstaking' : 'Completed'}
            remaining={isUnstake ? '13d 23h' : undefined}
            remainingAnnouncement={
              isUnstake ? '13 days 23 hours remaining' : undefined
            }
            status={isUnstake ? 'delayed' : 'complete'}
          />
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
          <TransactionAmountObject
            label={isUnstake ? 'Pending withdrawal' : 'Received'}
            amount={quote?.outputAmount ?? '—'}
            readOnly
            presentation="output"
            tone="inverse"
            className="bg-transparent px-6"
            unit={isUnstake ? 'RSR' : 'stRSR'}
            supporting={quote?.usdValue ?? '—'}
          />
        </DialogBody>
      </div>

      <section className="mx-2 bg-card" data-testid="stake-outcome-details">
        <dl className="grid gap-2 px-4 py-4">
          <TransactionOutcomeDetailRow
            label={isUnstake ? 'You unstake:' : 'You stake:'}
            value={`${quote?.inputAmount ?? '—'} ${isUnstake ? 'stRSR' : 'RSR'}`}
          />
          {isUnstake ? (
            <>
              <TransactionOutcomeDetailRow
                label="Unstaking delay"
                value="14 days"
              />
              <TransactionOutcomeDetailRow
                label="Staking yield share ends"
                value="Immediate"
              />
              <TransactionOutcomeDetailRow
                label="Next action"
                value="Withdraw RSR when ready"
              />
            </>
          ) : (
            <TransactionOutcomeDetailRow label="Staking yield" value="Active" />
          )}
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
              <span className="sr-only">
                {' '}
                on Etherscan (opens in a new tab)
              </span>
            </a>
          </Button>
          <Button className="flex-1" onClick={onDone}>
            Done
          </Button>
        </ActionGroup>
      </DialogFooter>
    </DialogSurface>
  )
}
