import { cn } from '@/lib/utils'
import { Trans, useLingui } from '@lingui/react/macro'
import Help from 'components/help'
import BackingBufferIcon from 'components/icons/BackingBufferIcon'
import ProgressBar from 'components/progress-bar'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import Skeleton from 'react-loading-skeleton'
import {
  rTokenBackingDistributionAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
} from 'state/atoms'
import { formatCurrency, formatPercentage } from 'utils'

const BuckingBuffer = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const rToken = useRToken()
  const backing = useAtomValue(rTokenBackingDistributionAtom)
  const rTokenState = useAtomValue(rTokenStateAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)

  const [percentage, actual, required, percentageOfMCap] = useMemo(() => {
    if (!backing) return [0, 0, 0]

    const _actual = backing.backingBuffer.actual
    const _required = backing.backingBuffer.required
    const _percentage = (_actual / _required) * 100
    const mCap = rTokenPrice * rTokenState.tokenSupply
    const _percentageOfMCap = formatPercentage((_required / mCap) * 100)

    return [
      _percentage,
      formatCurrency(_actual),
      formatCurrency(_required),
      _percentageOfMCap,
    ]
  }, [backing, rTokenPrice, rTokenState])

  return (
    <div className={cn(className)}>
      <div className="px-4 flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between max-[1250px]:min-[1150px]:flex-col max-[1250px]:min-[1150px]:items-start">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <BackingBufferIcon />
            <span className="text-lg font-semibold">
              <Trans>Revenue distribution backing buffer</Trans>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xl opacity-20 mx-2">|</span>
            <span className="font-medium text-legend">
              <Trans>{rToken?.symbol || ''} buffer as % of mcap:</Trans>
            </span>
            <span className="text-sm">{percentageOfMCap}</span>
          </div>
        </div>
      </div>

      <div className="m-4">
        {backing ? (
          <ProgressBar
            percentage={percentage}
            foregroundText={
              <span>
                <span className="hidden sm:inline">
                  <Trans>Current value in buffer:</Trans>{' '}
                </span>
                <span className="font-bold">${actual}</span>
              </span>
            }
            backgroundText={
              <span>
                <Trans>100% at current mcap:</Trans>{' '}
                <span className="font-bold">${required}</span>
              </span>
            }
          />
        ) : (
          <Skeleton height={36} width="100%" />
        )}
      </div>
      <div className="mx-auto px-4 flex items-center gap-2">
        <span className="font-medium text-legend text-left sm:text-right">
          <Trans>
            Collateral yield is distributed as revenue when the backing buffer
            is full
          </Trans>
        </span>
        <Help
          content={t`The backing buffer is extra collateral held to prevent RSR seizure from trading slippage. When the buffer exceeds 100%, any additional appreciation of collateral is recognized as revenue and sold off in auctions.`}
        />
      </div>
    </div>
  )
}

export default BuckingBuffer
