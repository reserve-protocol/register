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
            A vulnerability was found in a 3rd-party auction contract (Gnosis
            EasyAuction). Trading has been paused as a precaution while
            governance proposals to disable batch auctions complete. No funds
            are at risk. Staked RSR withdrawals are temporarily disabled during this
            period.{' '}
            <a
              href="https://x.com/reserveprotocol/status/2027121090343174359"
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
