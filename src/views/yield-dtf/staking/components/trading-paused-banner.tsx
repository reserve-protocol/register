import { Trans } from '@lingui/react/macro'
import AlertIcon from 'components/icons/AlertIcon'
import { useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import { cn } from '@/lib/utils'

const TradingPausedBanner = ({ className }: { className?: string }) => {
  const { tradingPaused } = useAtomValue(rTokenStateAtom)

  if (!tradingPaused) return null

  return (
    <div className={cn('rounded-xl border border-secondary bg-card p-4', className)}>
      <div className="flex items-center">
        <AlertIcon width={32} height={32} />
        <div className="ml-4">
          <span className="font-bold text-warning">
            <Trans>Withdrawals temporarily disabled</Trans>
          </span>
          <span className="block mt-1 text-warning">
            <Trans>
              Trading is paused for this DTF. While it is paused, the protocol
              keeps staked RSR available as a safety measure in case
              recollateralization is needed — this means withdrawals are blocked
              until trading resumes.
            </Trans>
          </span>
        </div>
      </div>
    </div>
  )
}

export default TradingPausedBanner
