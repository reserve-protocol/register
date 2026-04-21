import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  indexDTFApyAtom,
  indexDTFExposureDataAtom,
} from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import { Info } from 'lucide-react'
import ExposureSummary from './yield-index-exposure-summary'
import { MOCK_YIELD_DESCRIPTION } from './yield-index-mock-data'

const ApyBreakdown = () => {
  const apyData = useAtomValue(indexDTFApyAtom)

  if (!apyData) {
    return <Skeleton className="w-40 h-4" />
  }

  return (
    <div className="flex items-center justify-between text-sm text-legend">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="font-bold text-foreground">
          {formatPercentage(apyData.collateralAPY)}
        </span>
        <span>Base APY</span>
        <span>+</span>
        <span className="text-primary">
          {formatPercentage(apyData.redirectAPY)}
        </span>
        <span>Revenue Boost</span>
      </div>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Info size={16} className="text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent side="top">
            Revenue Boost is the yield redirected from protocol fees back to
            token holders.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

const AssetExposureColumn = () => {
  const exposureData = useAtomValue(indexDTFExposureDataAtom)
  const primary = exposureData?.[0]

  return (
    <div className="flex-1 sm:pr-6">
      <span className="text-base text-legend">Asset Exposure</span>
      <div className="mt-6">
        {primary ? (
          <div className="flex items-center gap-2 mb-2">
            {primary.native?.logo && (
              <img
                src={primary.native.logo}
                alt={primary.native.symbol}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="text-xl font-semibold">
              {primary.native?.name || 'Bitcoin'}
            </span>
          </div>
        ) : (
          <Skeleton className="w-32 h-6 mb-2" />
        )}
        <p className="text-base text-legend">
          {formatPercentage(primary?.totalWeight ?? 0)}{' '}
          {primary?.native?.symbol ?? ''} ·{' '}
          {/* TODO: Yield description should come from API or brand data */}
          {MOCK_YIELD_DESCRIPTION}
        </p>
      </div>
    </div>
  )
}

const EstApyColumn = () => {
  const apyData = useAtomValue(indexDTFApyAtom)

  return (
    <div className="flex-1 sm:pl-6">
      <span className="text-base text-primary">Est. APY</span>
      <div className="mt-3 sm:mt-6">
        {apyData ? (
          <span className="text-2xl font-medium text-primary">
            {formatPercentage(apyData.totalAPY)}
          </span>
        ) : (
          <Skeleton className="w-20 h-8" />
        )}
        <div className="mt-2">
          <ApyBreakdown />
        </div>
      </div>
    </div>
  )
}

const YieldIndexAssetExposure = () => (
  <div className="p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row">
      <AssetExposureColumn />
      <div className="hidden sm:block w-px bg-border" />
      <div className="sm:hidden border-t border-secondary my-2" />
      <EstApyColumn />
    </div>
    <ExposureSummary />
  </div>
)

export default YieldIndexAssetExposure
