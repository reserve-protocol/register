import { Button } from '@/components/ui/button'
import TokenLogo from '@/components/token-logo'
import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'
import { ArrowRight, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { MigrationPreviewModal } from './migration-preview-modal'
import { migrationPreviewLegacyVoteLock } from './preview-portfolio-data'
import {
  migrationPreviewTargetKey,
  useMigrationPreviewProgress,
  type MigrationPreviewMode,
} from './preview-state'

type Props = {
  mode: MigrationPreviewMode
  targetKey: string
  tokenSymbol: string
  voteLockSymbol?: string
  layout?: 'card' | 'banner'
  hideWhenComplete?: boolean
  className?: string
  onPreviewConnect?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MigrationPreviewCard({
  mode,
  targetKey,
  tokenSymbol,
  voteLockSymbol,
  layout = 'card',
  hideWhenComplete = false,
  className,
  onPreviewConnect,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: Props) {
  const { t } = useLingui()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen
  const [previewConnected, setPreviewConnected] = useState(false)
  const { step, pending } = useMigrationPreviewProgress(targetKey)
  const displayedVoteLockSymbol =
    voteLockSymbol ??
    (targetKey ===
    migrationPreviewTargetKey(
      migrationPreviewLegacyVoteLock.chainId,
      migrationPreviewLegacyVoteLock.stTokenAddress
    )
      ? migrationPreviewLegacyVoteLock.symbol
      : undefined)
  const displayedMode =
    mode === 'disconnected' && previewConnected ? 'affected' : mode
  const isComplete = displayedMode === 'affected' && step === 3
  const isAffected = displayedMode === 'affected' && !isComplete
  const isRecovering = isAffected && (step > 0 || !!pending)
  const isBanner = layout === 'banner'

  const title = isComplete
    ? `Your ${tokenSymbol} is locked in vlRSR`
    : pending
      ? `Your ${tokenSymbol} transaction is confirming`
      : isRecovering
        ? `Finish re-locking your ${tokenSymbol}`
        : displayedMode === 'disconnected'
          ? t`Old vote-locks need to move to vlRSR`
          : displayedMode === 'unaffected'
            ? t`No old vote-lock to migrate`
            : `Re-lock your ${tokenSymbol} in vlRSR`
  const description = isComplete
    ? 'Your position is in the shared vlRSR vault.'
    : pending
      ? 'Your transaction was submitted. Check its status before taking another action.'
      : isRecovering
        ? `Your old vote-lock has been redeemed. Your ${tokenSymbol} is in your wallet but cannot vote or earn rewards yet. Lock it in vlRSR to finish.`
        : displayedMode === 'disconnected'
          ? t`Old vote-locks for this DTF no longer vote or earn rewards. If you already moved yours or only locked in vlRSR, you're all set. Connect to check this wallet.`
          : displayedMode === 'unaffected'
            ? 'This wallet has no old vote-locked position to migrate for this DTF.'
            : t`This wallet still holds an old vote-lock for this DTF. You can't vote or earn rewards with it anymore. Redeem its shares, then lock the RSR you receive in vlRSR.`

  if (hideWhenComplete && isComplete && !open) return null

  return (
    <>
      <section
        data-testid="vote-lock-migration-card"
        className={cn(
          'rounded-3xl',
          isBanner
            ? 'border border-warning/20 bg-warning/10 p-4 sm:flex sm:items-center sm:gap-6 sm:p-6'
            : 'bg-background p-2',
          className
        )}
        aria-label="Vote-lock migration"
      >
        <div className={cn('min-w-0', isBanner ? 'sm:flex-1' : 'p-4 pb-6')}>
          <div className={isBanner ? 'mb-3' : 'mb-10'}>
            {isAffected || displayedMode === 'disconnected' ? (
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 text-sm font-medium text-warning">
                {isAffected && (
                  <TriangleAlert size={16} className="text-warning" />
                )}
                {displayedMode === 'disconnected'
                  ? t`Vote-lock upgrade`
                  : isRecovering
                    ? 'Migration in progress'
                    : 'Action needed'}
              </span>
            ) : (
              <TokenLogo
                size="xl"
                symbol={displayedVoteLockSymbol ?? tokenSymbol}
              />
            )}
          </div>
          <h2 className="text-xl font-semibold leading-snug text-foreground">
            {title}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-legend">
            {description}
          </p>
        </div>
        {(isAffected || displayedMode === 'disconnected') && (
          <div
            className={
              isBanner ? 'mt-4 sm:mt-0 sm:min-w-44 sm:self-end' : undefined
            }
          >
            <Button
              data-testid="vote-lock-migration-cta"
              className="h-12 w-full gap-2 rounded-xl"
              onClick={
                displayedMode === 'disconnected'
                  ? () => {
                      setPreviewConnected(true)
                      onPreviewConnect?.()
                    }
                  : () => setOpen(true)
              }
            >
              {displayedMode === 'disconnected'
                ? t`Connect to check`
                : pending
                  ? 'View progress'
                  : step > 0
                    ? 'Continue migration'
                    : 'Start migration'}
              <ArrowRight size={17} strokeWidth={1.75} />
            </Button>
          </div>
        )}
      </section>
      {displayedMode === 'affected' && (
        <MigrationPreviewModal
          open={open}
          targetKey={targetKey}
          onOpenChange={setOpen}
          tokenSymbol={tokenSymbol}
          voteLockSymbol={displayedVoteLockSymbol}
        />
      )}
    </>
  )
}
