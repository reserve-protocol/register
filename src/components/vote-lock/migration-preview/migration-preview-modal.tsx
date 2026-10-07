import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { ArrowUpRight, Check, LoaderCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MigrationPreviewComplete } from './migration-preview-complete'
import {
  MIGRATION_STAGES,
  PREVIEW_TRANSACTIONS,
} from './migration-preview-data'
import {
  readStoredMigrationPreviewApproval,
  useMigrationPreviewProgress,
} from './preview-state'

type Props = {
  open: boolean
  targetKey: string
  onOpenChange: (open: boolean) => void
  tokenSymbol: string
  voteLockSymbol?: string
  shareAmount?: string
  receivedRsrAmount?: string
}

export function MigrationPreviewModal({
  open,
  targetKey,
  onOpenChange,
  tokenSymbol,
  voteLockSymbol,
  shareAmount = '1,210',
  receivedRsrAmount = '1,250',
}: Props) {
  const { step, approvalRequired, rejected, pending, updateProgress } =
    useMigrationPreviewProgress(targetKey)
  const [phase, setPhase] = useState<'idle' | 'wallet' | 'rejected'>('idle')
  const [searchParams] = useSearchParams()
  const chainId = Number(targetKey.split(':')[0])
  const approvalPreviewRequired =
    searchParams.get('voteLockMigrationApproval') === 'required'
  const storedApprovalRequired = readStoredMigrationPreviewApproval(targetKey)
  const needsApproval =
    approvalRequired ?? storedApprovalRequired ?? approvalPreviewRequired
  const simulateRejection =
    searchParams.get('voteLockMigrationResult') === 'rejected'
  const isComplete = step === 3
  const currentStage = Math.min(step, 2)
  const visibleStageIndexes = needsApproval ? [0, 1, 2] : [0, 2]
  const buttonLabel = [
    `Redeem ${voteLockSymbol ?? 'old vote-lock'}`,
    `Approve ${tokenSymbol}`,
    `Lock ${tokenSymbol} in vlRSR`,
  ][step]
  useEffect(() => {
    if (
      !open ||
      approvalRequired !== undefined ||
      storedApprovalRequired !== undefined ||
      !approvalPreviewRequired
    )
      return
    updateProgress((current) => ({
      ...current,
      approvalRequired: true,
    }))
  }, [
    open,
    approvalRequired,
    storedApprovalRequired,
    approvalPreviewRequired,
    updateProgress,
  ])

  useEffect(() => {
    if (phase !== 'wallet') return

    const timeout = window.setTimeout(() => {
      if (simulateRejection && !rejected) {
        updateProgress((current) => ({ ...current, rejected: true }))
        setPhase('rejected')
      } else {
        updateProgress((current) => ({
          ...current,
          pending: { step: current.step, dueAt: Date.now() + 900 },
        }))
        setPhase('idle')
      }
    }, 900)

    return () => window.clearTimeout(timeout)
  }, [phase, rejected, simulateRejection, updateProgress])

  useEffect(() => {
    if (!pending) return

    const timeout = window.setTimeout(
      () => {
        updateProgress((current) => {
          if (current.pending?.step !== pending.step) return current
          if (current.step !== pending.step) {
            return { ...current, pending: undefined }
          }
          return {
            ...current,
            step:
              current.step === 0 && !current.approvalRequired
                ? 2
                : Math.min(current.step + 1, 3),
            pending: undefined,
          }
        })
      },
      Math.max(0, pending.dueAt - Date.now())
    )

    return () => window.clearTimeout(timeout)
  }, [pending, updateProgress])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setPhase('idle')
    onOpenChange(nextOpen)
  }

  const startTransaction = () => {
    if (step === 0 && approvalRequired === undefined) {
      updateProgress((current) => ({
        ...current,
        approvalRequired: needsApproval,
      }))
    }
    setPhase('wallet')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={false}
        data-testid="vote-lock-migration-modal"
        className="bottom-0 left-0 top-auto flex max-h-[calc(100dvh-0.5rem)] w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-b-none rounded-t-3xl border-0 bg-secondary p-0 pb-[env(safe-area-inset-bottom)] focus:outline-none sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100dvh-2rem)] sm:max-w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border-2 sm:pb-0"
      >
        <div className="relative shrink-0 border-b border-secondary bg-card pb-7 pl-6 pr-16 pt-7">
          <div className="min-w-0">
            <DialogTitle className="flex items-center gap-2 text-xl leading-tight">
              {isComplete
                ? 'Migration complete'
                : step > 0
                  ? 'Finish re-locking your ' + tokenSymbol
                  : 'Re-lock your ' + tokenSymbol}
              {isComplete && (
                <Check
                  size={20}
                  strokeWidth={2}
                  className="shrink-0 text-success"
                />
              )}
            </DialogTitle>
            <DialogDescription className="mt-2 leading-relaxed">
              {isComplete
                ? 'Your RSR is locked in the shared vlRSR vault.'
                : step > 0
                  ? 'Your redeemed RSR is in your wallet.'
                  : needsApproval
                    ? 'Redeem your old vote-lock, approve the RSR, then lock it in the shared vlRSR vault.'
                    : 'Redeem your old vote-lock, then lock the RSR in the shared vlRSR vault.'}
            </DialogDescription>
          </div>
          <Button
            data-testid="vote-lock-migration-close"
            variant="outline"
            aria-label="Close migration"
            className="absolute right-4 top-4 size-11 rounded-xl p-0 sm:size-9"
            onClick={() => handleOpenChange(false)}
          >
            <X size={16} />
          </Button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain">
          <ol>
            {visibleStageIndexes.map((index, displayIndex) => {
              const { title, detail } = MIGRATION_STAGES[index]
              const done = isComplete || index < currentStage
              const active = !isComplete && index === currentStage
              const amountSymbol = step === 0 ? voteLockSymbol : tokenSymbol
              const showDivider =
                !done &&
                !active &&
                displayIndex + 1 < visibleStageIndexes.length
              const activeDetail =
                step === 0
                  ? 'Redeem all your old-vault shares. RSR arrives in your wallet in this transaction.'
                  : step === 1
                    ? 'Approve the exact RSR amount received for the shared vlRSR vault.'
                    : 'Lock the RSR you received in the shared vlRSR vault.'

              return (
                <li
                  key={title}
                  data-testid={`vote-lock-migration-step-${index + 1}`}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    (active || done) && 'bg-card p-2',
                    index === 0 && active && 'rounded-b-3xl',
                    index === 1 &&
                      (active || done) &&
                      'border-y border-secondary',
                    index === 2 &&
                      (active || done) &&
                      !needsApproval &&
                      'border-t border-secondary',
                    !active && !done && 'relative px-6 py-4'
                  )}
                >
                  {active ? (
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        Step {displayIndex + 1} of {visibleStageIndexes.length}
                      </p>
                      <h3 className="mt-1 text-base font-medium">{title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-legend">
                        {activeDetail}
                      </p>
                    </div>
                  ) : done ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0 px-4 py-2 sm:gap-y-2 sm:py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check
                              size={14}
                              strokeWidth={2}
                              aria-hidden="true"
                            />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-legend">
                              Step {displayIndex + 1} of{' '}
                              {visibleStageIndexes.length}
                            </p>
                            <h3 className="mt-0.5 text-sm font-medium leading-tight">
                              {index === 1
                                ? 'Approval complete'
                                : index === 2
                                  ? 'Lock complete'
                                  : `${title} complete`}
                            </h3>
                          </div>
                        </div>
                        <a
                          href={getExplorerLink(
                            PREVIEW_TRANSACTIONS[index].hash,
                            chainId,
                            ExplorerDataType.TRANSACTION
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${title.toLowerCase()} transaction on explorer`}
                          className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-sm py-2 text-sm tabular-nums text-legend hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-0 sm:py-0"
                        >
                          {PREVIEW_TRANSACTIONS[index].reference}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                      </div>
                      {isComplete && index === 2 && (
                        <MigrationPreviewComplete
                          tokenSymbol={tokenSymbol}
                          receivedRsrAmount={receivedRsrAmount}
                          onDone={() => handleOpenChange(false)}
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-borderSecondary text-xs font-medium text-foreground/70">
                        {displayIndex + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{title}</p>
                        <p className="mt-px text-sm leading-relaxed text-legend">
                          {detail}
                        </p>
                      </div>
                    </div>
                  )}

                  {showDivider && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 left-6 right-6 border-b border-borderSecondary"
                    />
                  )}

                  {active && (
                    <>
                      <div className="mx-4 mt-1 border-t border-border pb-2 pt-4">
                        <p className="text-sm text-legend">
                          {step === 0
                            ? 'Old vote-lock shares'
                            : step === 1
                              ? 'RSR to approve'
                              : 'RSR to lock'}
                        </p>
                        <p className="mt-1 text-2xl font-medium tabular-nums text-foreground">
                          {step === 0 ? shareAmount : receivedRsrAmount}
                          {amountSymbol && (
                            <span className="ml-1 text-xl font-normal text-legend">
                              {amountSymbol}
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-legend">
                          {step === 0
                            ? 'Your full old-vault position'
                            : 'Received from your old-vault redemption'}
                        </p>
                      </div>
                      <Button
                        className="mt-2 h-[49px] w-full rounded-xl"
                        data-testid="vote-lock-migration-next"
                        disabled={phase === 'wallet' || !!pending}
                        onClick={startTransaction}
                      >
                        {(phase === 'wallet' || pending) && (
                          <LoaderCircle
                            className="mr-2 animate-spin"
                            size={17}
                          />
                        )}
                        <span aria-live="polite">
                          {phase === 'wallet'
                            ? 'Confirm in wallet...'
                            : pending
                              ? 'Confirming transaction...'
                              : phase === 'rejected'
                                ? 'Request rejected · Retry'
                                : buttonLabel}
                        </span>
                      </Button>
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
