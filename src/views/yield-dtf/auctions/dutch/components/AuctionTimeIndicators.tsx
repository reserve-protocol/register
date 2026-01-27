import { Trans } from '@lingui/macro'
import AuctionsIcon from 'components/icons/AuctionsIcon'
import { useAtomValue } from 'jotai'
import { blockTimestampAtom } from 'state/atoms'
import Spinner from '@/components/ui/spinner'
import { parseDuration } from 'utils'

const AuctionTimeIndicators = ({
  start,
  end,
}: {
  start: number
  end: number
}) => {
  // Calculations
  const currentTime = useAtomValue(blockTimestampAtom)
  const timeLeft = Math.max(0, end - currentTime)
  const auctionLength = end - start
  const bufferTime = Math.round(auctionLength * 0.05)
  const finalPriceTime = start + (auctionLength - bufferTime)
  const isEnding = currentTime >= finalPriceTime

  return (
    <div className="flex items-center flex-wrap ml-0 xl:ml-auto mt-1 xl:mt-0 pr-3">
      <Spinner
        className={isEnding ? 'text-warning' : 'text-primary'}
        size={16}
      />
      {!isEnding && (
        <>
          <span className="text-legend ml-2 mr-1">
            <Trans>Final price in:</Trans>
          </span>
          <span className="font-semibold mr-3">
            {parseDuration(finalPriceTime - currentTime, {
              units: ['m'],
              round: true,
            })}
          </span>
        </>
      )}
      {!isEnding && <AuctionsIcon />}
      <span className="ml-2 mr-1">Auction ends in:</span>
      <span className="hidden sm:block">
        (
        {parseDuration(timeLeft, {
          units: ['m'],
          round: true,
        })}
        )
      </span>
    </div>
  )
}

export default AuctionTimeIndicators
