import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import { cn } from '@/lib/utils'
import { formatCurrency, shortenAddress } from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowUpRight, Check, LoaderCircle, X } from 'lucide-react'
import { formatUnits, isAddressEqual, type Hex } from 'viem'
import type { MigrationFlow } from './use-migration-flow'
import type { VoteLockMigration } from './use-vote-lock-migrations'

type Stage = 'redeem' | 'approve' | 'deposit'

const formatAmount = (value: bigint | undefined) =>
  value === undefined ? '—' : formatCurrency(Number(formatUnits(value, 18)))

const TxLink = ({ hash, chainId, label }: { hash: Hex; chainId: number; label: string }) => (
  <a
    href={getExplorerLink(hash, chainId, ExplorerDataType.TRANSACTION)}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-sm py-2 text-sm tabular-nums text-legend hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-0 sm:py-0"
  >
    {shortenAddress(hash)}
    <ArrowUpRight size={14} aria-hidden="true" />
  </a>
)

type Props = {
  migration: VoteLockMigration
  flow: MigrationFlow
  open: boolean
  onOpenChange: (open: boolean) => void
  onTrack: (cta: string) => void
}

export const MigrationModal = ({ migration, flow, open, onOpenChange, onTrack }: Props) => {
  const { t } = useLingui()
  const { chainId, account, oldSymbol, shared } = migration
  const { step, record } = flow
  const isComplete = step === 'done'
  const stages: Stage[] = flow.needsApproval
    ? ['redeem', 'approve', 'deposit']
    : ['redeem', 'deposit']
  const activeIndex = isComplete ? -1 : stages.indexOf(step as Stage)
  const symbol = migration.underlyingSymbol || 'RSR'
  const vault = migration.newSymbol || 'vlRSR'

  const titles: Record<Stage, string> = {
    redeem: t`Redeem`,
    approve: t`Approve ${symbol}`,
    deposit: t`Lock ${symbol} in ${vault}`,
  }
  const details: Record<Stage, string> = {
    redeem: t`Receive ${symbol} from your old vote-lock.`,
    approve: shared
      ? t`Allow the shared vlRSR vault to use your RSR.`
      : t`Allow the ${vault} vault to use your ${symbol}.`,
    deposit: shared
      ? t`Lock your RSR in the shared vlRSR vault.`
      : t`Lock your ${symbol} in the ${vault} vault.`,
  }
  const doneTitles: Record<Stage, string> = {
    redeem: t`Redeem complete`,
    approve: t`Approval complete`,
    deposit: t`Lock complete`,
  }
  const activeDetails: Record<Stage, string> = {
    redeem: t`Redeem all your old-vault shares. ${symbol} arrives in your wallet in this transaction.`,
    approve: shared
      ? t`Approve the exact RSR amount received for the shared vlRSR vault.`
      : t`Approve the exact ${symbol} amount received for the ${vault} vault.`,
    deposit: shared
      ? t`Lock the RSR you received in the shared vlRSR vault.`
      : t`Lock the ${symbol} you received in the ${vault} vault.`,
  }
  const buttonLabels: Record<Stage, string> = {
    redeem: t`Redeem ${oldSymbol}`,
    approve: t`Approve ${symbol}`,
    deposit: t`Lock ${symbol} in ${vault}`,
  }
  const hashes: Record<Stage, Hex | undefined> = {
    redeem: record.redeem?.hash,
    approve: record.approve?.hash,
    deposit: record.deposit?.hash,
  }

  const delegateText = !flow.delegatee
    ? undefined
    : isAddressEqual(flow.delegatee, account)
      ? t`Your ${vault} votes are delegated to you.`
      : t`Your ${vault} votes are delegated to ${shortenAddress(flow.delegatee)}.`

  const busy = flow.isSigning || flow.isConfirming || flow.isRecovering
  const actionLabel = flow.isSigning
    ? t`Confirm in wallet...`
    : flow.isConfirming
      ? t`Confirming transaction...`
      : flow.isRecovering
        ? t`Checking your redemption...`
        : flow.failed
          ? t`Transaction failed · Retry`
          : flow.rejected
            ? t`Request rejected · Retry`
            : buttonLabels[step as Stage]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        data-testid="vote-lock-migration-modal"
        className="bottom-0 left-0 top-auto flex max-h-[calc(100dvh-0.5rem)] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-b-none rounded-t-3xl border-0 bg-secondary p-0 pb-[env(safe-area-inset-bottom)] focus:outline-none sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100dvh-2rem)] sm:max-w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border-2 sm:pb-0"
      >
        <div className="relative shrink-0 border-b border-secondary bg-card pb-7 pl-6 pr-16 pt-7">
          <DialogTitle className="flex items-center gap-2 text-xl leading-tight">
            {isComplete
              ? t`Migration complete`
              : record.redeem
                ? t`Finish re-locking your ${symbol}`
                : t`Re-lock your ${symbol}`}
            {isComplete && <Check size={20} strokeWidth={2} className="shrink-0 text-success" />}
          </DialogTitle>
          <DialogDescription className="mt-2 leading-relaxed">
            {shared
              ? isComplete
                ? t`Your RSR is locked in the shared vlRSR vault.`
                : record.redeem
                  ? t`Your redeemed RSR is in your wallet.`
                  : flow.needsApproval
                    ? t`Redeem your old vote-lock, approve the RSR, then lock it in the shared vlRSR vault.`
                    : t`Redeem your old vote-lock, then lock the RSR in the shared vlRSR vault.`
              : isComplete
                ? t`Your ${symbol} is locked in the ${vault} vault.`
                : record.redeem
                  ? t`Your redeemed ${symbol} is in your wallet.`
                  : flow.needsApproval
                    ? t`Redeem your old vote-lock, approve the ${symbol}, then lock it in the ${vault} vault.`
                    : t`Redeem your old vote-lock, then lock the ${symbol} in the ${vault} vault.`}
          </DialogDescription>
          <Button
            data-testid="vote-lock-migration-close"
            variant="outline"
            aria-label={t`Close migration`}
            className="absolute right-4 top-4 size-11 rounded-xl p-0 sm:size-9"
            onClick={() => onOpenChange(false)}
          >
            <X size={16} />
          </Button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain">
          <ol>
            {stages.map((stage, index) => {
              const done = isComplete || index < activeIndex
              const active = index === activeIndex
              const hash = hashes[stage]
              return (
                <li
                  key={stage}
                  data-testid={`vote-lock-migration-step-${stage}`}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    (active || done) && 'bg-card p-2',
                    index === 0 && active && 'rounded-b-3xl',
                    index > 0 && (active || done) && 'border-t border-secondary',
                    !active && !done && 'relative px-6 py-4'
                  )}
                >
                  {active ? (
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        <Trans>
                          Step {index + 1} of {stages.length}
                        </Trans>
                      </p>
                      <h3 className="mt-1 text-base font-medium">{titles[stage]}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-legend">{activeDetails[stage]}</p>
                    </div>
                  ) : done ? (
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0 px-4 py-2 sm:gap-y-2 sm:py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check size={14} strokeWidth={2} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-legend">
                            <Trans>
                              Step {index + 1} of {stages.length}
                            </Trans>
                          </p>
                          <h3 className="mt-0.5 text-sm font-medium leading-tight">{doneTitles[stage]}</h3>
                        </div>
                      </div>
                      {hash && (
                        <TxLink hash={hash} chainId={chainId} label={t`View ${titles[stage]} transaction on explorer`} />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-borderSecondary text-xs font-medium text-foreground/70">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{titles[stage]}</p>
                        <p className="mt-px text-sm leading-relaxed text-legend">{details[stage]}</p>
                      </div>
                    </div>
                  )}

                  {!active && !done && index + 1 < stages.length && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 left-6 right-6 border-b border-borderSecondary"
                    />
                  )}

                  {isComplete && stage === 'deposit' && (
                    <>
                      <div className="mx-4 mt-1 border-t border-border pb-2 pt-4">
                        <p className="text-sm text-legend">
                          <Trans>Amount locked</Trans>
                        </p>
                        <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">
                          {formatAmount(record.locked ?? flow.received)}{' '}
                          <span className="text-xl font-normal text-legend">{symbol}</span>
                        </p>
                        {delegateText && <p className="mt-1 text-sm leading-relaxed text-legend">{delegateText}</p>}
                      </div>
                      <Button
                        data-testid="vote-lock-migration-done"
                        className="mt-2 h-[49px] w-full rounded-xl"
                        onClick={() => {
                          flow.acknowledge()
                          onOpenChange(false)
                        }}
                      >
                        <Trans>Done</Trans>
                      </Button>
                    </>
                  )}

                  {active && (
                    <>
                      <div className="mx-4 mt-1 border-t border-border pb-2 pt-4">
                        <p className="text-sm text-legend">
                          {stage === 'redeem'
                            ? t`Old vote-lock shares`
                            : stage === 'approve'
                              ? t`${symbol} to approve`
                              : t`${symbol} to lock`}
                        </p>
                        <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">
                          {stage === 'redeem' ? formatAmount(flow.shares) : formatAmount(flow.lockAmount)}
                          <span className="ml-1 text-xl font-normal text-legend">
                            {stage === 'redeem' ? oldSymbol : symbol}
                          </span>
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-legend">
                          {stage === 'redeem'
                            ? flow.estimate !== undefined
                              ? t`Your full old-vault position · about ${formatAmount(flow.estimate)} RSR`
                              : t`Your full old-vault position`
                            : t`Received from your old-vault redemption`}
                        </p>
                        {stage === 'deposit' && delegateText && (
                          <p className="mt-1 text-sm leading-relaxed text-legend">{delegateText}</p>
                        )}
                      </div>
                      <TransactionButtonContainer chain={chainId}>
                        <Button
                          className="mt-2 h-[49px] w-full rounded-xl"
                          data-testid="vote-lock-migration-next"
                          data-step={stage}
                          disabled={busy}
                          onClick={() => {
                            onTrack(`vote_lock_migration_${stage}`)
                            flow.submit()
                          }}
                        >
                          {busy && <LoaderCircle className="mr-2 animate-spin" size={17} />}
                          <span aria-live="polite">{actionLabel}</span>
                        </Button>
                      </TransactionButtonContainer>
                    </>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  )
}
