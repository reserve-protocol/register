import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { trackClick } from '@/hooks/useTrackPage'
import { useWalletModal } from '@/hooks/use-wallet-modal'
import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import { ArrowRight, TriangleAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { MigrationModal } from './migration-modal'
import { useMigrationFlow } from './use-migration-flow'
import type { VoteLockMigration } from './use-vote-lock-migrations'

type Layout = 'card' | 'banner'

const Shell = ({
  layout,
  badge,
  title,
  description,
  action,
  className,
}: {
  layout: Layout
  badge: ReactNode
  title: ReactNode
  description: ReactNode
  action?: ReactNode
  className?: string
}) => {
  const { t } = useLingui()
  const isBanner = layout === 'banner'
  return (
    <section
      data-testid="vote-lock-migration-card"
      aria-label={t`Vote-lock migration`}
      className={cn(
        'rounded-3xl',
        isBanner
          ? 'border border-warning/20 bg-warning/10 p-4 sm:flex sm:items-center sm:gap-6 sm:p-6'
          : 'bg-background p-2',
        className
      )}
    >
      <div className={cn('min-w-0', isBanner ? 'sm:flex-1' : 'p-4 pb-6')}>
        <div className={isBanner ? 'mb-3' : 'mb-10'}>{badge}</div>
        <h2 className="text-xl font-semibold leading-snug text-foreground">{title}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-legend">{description}</p>
      </div>
      {action && (
        <div className={isBanner ? 'mt-4 sm:mt-0 sm:min-w-44 sm:self-end' : undefined}>{action}</div>
      )}
    </section>
  )
}

const WarningBadge = ({ children, icon = true }: { children: ReactNode; icon?: boolean }) => (
  <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-3 text-sm font-medium text-warning">
    {icon && <TriangleAlert size={16} className="text-warning" />}
    {children}
  </span>
)

const CtaButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <Button data-testid="vote-lock-migration-cta" className="h-12 w-full gap-2 rounded-xl" onClick={onClick}>
    {children}
    <ArrowRight size={17} strokeWidth={1.75} />
  </Button>
)

export const MigrationCard = ({
  migration,
  page,
  layout = 'card',
  context = 'dtf',
  className,
  open: controlledOpen,
  onOpenChange,
}: {
  migration: VoteLockMigration
  page: string
  layout?: Layout
  // Portfolio has no DTF in scope, so the copy names the old vault instead.
  context?: 'dtf' | 'vault'
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const flow = useMigrationFlow(migration)
  const symbol = migration.underlyingSymbol || 'RSR'
  const vault = migration.newSymbol || 'vlRSR'
  const track = (cta: string) =>
    trackClick(page, cta, migration.oldVoteLock, migration.oldSymbol, migration.chainId)

  if (flow.record.acknowledged && !open) return null

  const isComplete = flow.step === 'done'
  const isPending = flow.isConfirming
  const isRecovering = !isComplete && !!flow.record.redeem

  const card = isComplete ? (
    <Shell
      layout={layout}
      className={className}
      badge={
        <TokenLogo
          size="xl"
          symbol={vault}
          address={migration.newVoteLock}
          underlyingAddress={migration.underlying}
          chain={migration.chainId}
        />
      }
      title={<Trans>Your {symbol} is locked in {vault}</Trans>}
      description={
        migration.shared ? (
          <Trans>Your position is in the shared vlRSR vault.</Trans>
        ) : (
          <Trans>Your position is in the {vault} vault.</Trans>
        )
      }
      action={
        <Button
          data-testid="vote-lock-migration-dismiss"
          variant="outline"
          className="h-12 w-full rounded-xl"
          onClick={flow.acknowledge}
        >
          <Trans>Done</Trans>
        </Button>
      }
    />
  ) : (
    <Shell
      layout={layout}
      className={className}
      badge={
        <WarningBadge>
          {isRecovering ? <Trans>Migration in progress</Trans> : <Trans>Action needed</Trans>}
        </WarningBadge>
      }
      title={
        isPending ? (
          <Trans>Your {symbol} transaction is confirming</Trans>
        ) : isRecovering ? (
          <Trans>Finish re-locking your {symbol}</Trans>
        ) : (
          <Trans>Re-lock your {symbol} in {vault}</Trans>
        )
      }
      description={
        isPending ? (
          <Trans>Your transaction was submitted. Check its status before taking another action.</Trans>
        ) : isRecovering ? (
          <Trans>
            Your old vote-lock has been redeemed. Your {symbol} is in your wallet but cannot vote or earn
            rewards yet. Lock it in {vault} to finish.
          </Trans>
        ) : context === 'vault' ? (
          <Trans>
            This wallet still holds an old {migration.oldSymbol} vote-lock. You can't vote or earn rewards
            with it anymore. Redeem its shares, then lock the {symbol} you receive in {vault}.
          </Trans>
        ) : (
          <Trans>
            This wallet still holds an old vote-lock for this DTF. You can't vote or earn rewards with it
            anymore. Redeem its shares, then lock the {symbol} you receive in {vault}.
          </Trans>
        )
      }
      action={
        <CtaButton
          onClick={() => {
            track('vote_lock_migration_open')
            setOpen(true)
          }}
        >
          {isPending ? (
            <Trans>View progress</Trans>
          ) : isRecovering ? (
            <Trans>Continue migration</Trans>
          ) : (
            <Trans>Start migration</Trans>
          )}
        </CtaButton>
      }
    />
  )

  return (
    <>
      {card}
      <MigrationModal migration={migration} flow={flow} open={open} onOpenChange={setOpen} onTrack={track} />
    </>
  )
}

export const MigrationConnectPrompt = ({
  page,
  vault = 'vlRSR',
  className,
}: {
  page: string
  vault?: string
  className?: string
}) => {
  const { openConnectModal } = useWalletModal()
  return (
    <Shell
      layout="card"
      className={className}
      badge={
        <WarningBadge icon={false}>
          <Trans>Vote-lock upgrade</Trans>
        </WarningBadge>
      }
      title={<Trans>Old vote-locks need to move to {vault}</Trans>}
      description={
        <Trans>
          Old vote-locks for this DTF no longer vote or earn rewards. If you already moved yours or only locked
          in {vault}, you're all set. Connect to check this wallet.
        </Trans>
      }
      action={
        <CtaButton
          onClick={() => {
            trackClick(page, 'vote_lock_migration_connect')
            openConnectModal?.()
          }}
        >
          <Trans>Connect to check</Trans>
        </CtaButton>
      }
    />
  )
}
