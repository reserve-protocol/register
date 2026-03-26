import { Card } from '@/components/ui/card'
import Help from '@/components/ui/help'
import { Skeleton } from '@/components/ui/skeleton'
import {
  indexDTFApyAtom,
  indexDTFExposureDataAtom,
} from '@/state/dtf/atoms'
import { formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import { Plus } from 'lucide-react'
import SectionAnchor from '@/components/section-anchor'
import { MOCK_ASSET_DESCRIPTION, MOCK_SUMMARY } from './yield-index-mock-data'

const ApyBreakdown = () => {
  const apyData = useAtomValue(indexDTFApyAtom)

  if (!apyData) {
    return <Skeleton className="w-40 h-4" />
  }

  return (
    <div className="flex items-center gap-1 text-sm text-legend flex-wrap">
      <span>{formatPercentage(apyData.collateralAPY)}</span>
      <span>Base APY</span>
      <Plus size={12} />
      <span>{formatPercentage(apyData.redirectAPY)}</span>
      <span>Revenue Boost</span>
      <Help
        content="Revenue Boost is the yield redirected from protocol fees back to token holders."
        size={14}
        className="text-muted-foreground"
      />
    </div>
  )
}

const ExposureSummary = () => {
  const exposureData = useAtomValue(indexDTFExposureDataAtom)

  // TODO: Strategy/asset/protocol counts should come from composition API
  const { strategies, assets, protocols } = MOCK_SUMMARY
  const exposureCount = exposureData?.length ?? assets

  return (
    <div className="flex items-center gap-2 text-sm text-legend pt-4 border-t border-secondary mt-4">
      <span>{strategies} Strategies</span>
      <span>·</span>
      <span>{exposureCount} Assets</span>
      <span>·</span>
      <span>{protocols} Protocols</span>
    </div>
  )
}

const YieldIndexAssetExposure = () => {
  const apyData = useAtomValue(indexDTFApyAtom)
  const exposureData = useAtomValue(indexDTFExposureDataAtom)

  const primaryExposure = exposureData?.[0]

  return (
    <Card className="group/section" id="asset-exposure">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left: Asset Exposure */}
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm text-legend">Asset Exposure</span>
              <SectionAnchor id="asset-exposure" />
            </div>
            <div className="mt-6">
              {primaryExposure ? (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-medium">
                    {primaryExposure.native?.symbol || 'Bitcoin'}
                  </span>
                </div>
              ) : (
                <Skeleton className="w-32 h-6 mb-2" />
              )}
              {/* TODO: Asset description should come from API or brand data */}
              <p className="text-sm text-legend">{MOCK_ASSET_DESCRIPTION}</p>
            </div>
          </div>

          {/* Separator */}
          <div className="hidden sm:block w-px bg-border self-stretch" />

          {/* Right: Est. APY */}
          <div className="flex-1">
            <span className="text-sm text-legend">Est. APY</span>
            <div className="mt-6">
              {apyData ? (
                <span className="text-2xl font-medium">
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
        </div>

        <ExposureSummary />
      </div>
    </Card>
  )
}

export default YieldIndexAssetExposure
