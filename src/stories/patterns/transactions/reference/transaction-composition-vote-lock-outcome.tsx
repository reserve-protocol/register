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
} from './story-dialog'
import { IconButton } from '@/components/icon-button'
import { cn } from '@/lib/utils'

import { TransactionOutcomeDetailRow } from './transaction-outcome-detail-row'
import { TransactionOutcomeStatus } from './transaction-outcome-status'
import { transactionOutcomeGeometry } from '@/components/design-system-v1/transaction-task-geometry'
import { transactionOutcomeMotion } from './transaction-outcome-motion'
import {
  VOTE_LOCK_TASK_WIDTH,
  VOTE_LOCK_TRANSACTION,
} from './transaction-composition-vote-lock-support'

export const VoteLockOutcomeDialog = ({
  kind,
  onClose,
  onDone,
}: {
  kind: 'lock' | 'unlock'
  onClose: () => void
  onDone: () => void
}) => {
  const isUnlock = kind === 'unlock'

  return (
    <DialogSurface
      width="standard"
      className={cn(
        VOTE_LOCK_TASK_WIDTH,
        transactionOutcomeGeometry.minimumSurfaceHeight,
        'overflow-hidden p-0 outline-none ring-2 ring-card'
      )}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-label="Govern PHOTON"
    >
      <div
        data-testid="vote-lock-outcome-hero"
        className="relative isolate flex flex-1 flex-col text-brand-foreground"
      >
        {isUnlock ? (
          <div
            aria-hidden="true"
            data-outcome-surface="delayed"
            data-testid="vote-lock-outcome-surface"
            className={cn(
              'absolute inset-0 rounded-lg bg-brand',
              transactionOutcomeMotion.surface
            )}
          />
        ) : (
          <OrganicBrandSurface
            data-outcome-surface="immediate"
            data-testid="vote-lock-outcome-surface"
            className={cn(
              'absolute inset-0 rounded-lg bg-brand',
              transactionOutcomeMotion.surface
            )}
          />
        )}
        <header
          data-testid="vote-lock-outcome-header"
          className={cn(
            'relative z-10 flex min-h-8 items-center justify-between gap-4 px-4 pb-4 pt-4',
            transactionOutcomeMotion.content
          )}
        >
          <DialogTitle className="sr-only">
            {isUnlock
              ? 'Unlock initiated successfully'
              : 'Vote lock successful'}
          </DialogTitle>
          <TransactionOutcomeStatus
            label={isUnlock ? 'Unlocking' : 'Completed'}
            remaining={isUnlock ? '13d 23h' : undefined}
            remainingAnnouncement={
              isUnlock ? '13 days 23 hours remaining' : undefined
            }
            status={isUnlock ? 'delayed' : 'complete'}
            testId="vote-lock-outcome-status"
          />
          <IconButton
            label="Close Vote Lock"
            icon={<X />}
            size="compact"
            onClick={onClose}
          />
        </header>
        <DialogBody
          data-testid="vote-lock-outcome-value-region"
          className={cn(
            'relative z-10 flex flex-col justify-end px-0 pb-2',
            transactionOutcomeMotion.content
          )}
        >
          <TransactionAmountObject
            label={isUnlock ? 'Pending withdrawal' : 'Received'}
            amount={isUnlock ? '1.0188' : '0.98155'}
            readOnly
            presentation="output"
            tone="inverse"
            className="bg-transparent px-6"
            unit={isUnlock ? 'RSR' : 'vlRSR'}
            supporting={isUnlock ? '$8.34' : '$8.18'}
          />
        </DialogBody>
      </div>

      <section className="mx-2 bg-card" data-testid="vote-lock-outcome-details">
        <dl className="grid gap-2 px-4 pb-4 pt-4">
          <TransactionOutcomeDetailRow
            label={isUnlock ? 'You unlock:' : 'You lock:'}
            value={isUnlock ? '1 vlRSR' : '1 RSR'}
          />
          <TransactionOutcomeDetailRow
            label="Exchange rate"
            value="1 vlRSR = 1.0188 RSR"
          />
          {isUnlock && (
            <TransactionOutcomeDetailRow
              testId="vote-lock-unlock-next-action-fact"
              label="Next action"
              value="Withdraw RSR when ready"
            />
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
              href={VOTE_LOCK_TRANSACTION.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              View transaction
              <span className="sr-only"> on BscScan (opens in a new tab)</span>
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
