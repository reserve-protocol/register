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
            Withdrawals temporarily disabled
          </span>
          <span className="block mt-1 text-warning">
            Trading has been temporarily paused due to an abundance of caution related to the Kelp DAO exploit, the protocol keeps staked RSR available as a safety measure
            in case recollateralization is needed — this means withdrawals are
            blocked until trading resumes.{' '}
            <a
              href="https://x.com/reserveprotocol/status/2046007367679267080"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Read more
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}

export default TradingPausedBanner
