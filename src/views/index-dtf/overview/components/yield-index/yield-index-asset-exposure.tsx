import { Skeleton } from '@/components/ui/skeleton'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import {
  indexDTFApyAtom,
  indexDTFCompositionAtom,
  indexDTFExposureDataAtom,
  indexDTFPoolsDataAtom,
} from '@/state/dtf/atoms'
import { chainIdAtom } from '@/state/atoms'
import { formatPercentage } from '@/utils'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { ChevronRight, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PROJECT_ICONS } from '@/views/earn/hooks/useEarnTableColumns'
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

const ExposureSummary = () => {
  const exposureData = useAtomValue(indexDTFExposureDataAtom)
  const poolsData = useAtomValue(indexDTFPoolsDataAtom)
  const composition = useAtomValue(indexDTFCompositionAtom)
  const chainId = useAtomValue(chainIdAtom)

  const strategyCount = exposureData?.flatMap((g) => g.tokens).length ?? 0

  const underlyingTokens = useMemo(() => {
    if (!composition) return []
    const seen = new Set<string>()
    return composition.assets
      .filter((a) => {
        if (seen.has(a.address)) return false
        seen.add(a.address)
        return true
      })
      .map((a) => ({
        symbol: a.symbol,
        address: a.address,
        chain: chainId,
      }))
  }, [composition, chainId])

  const protocolIcons = useMemo(() => {
    if (!poolsData) return []
    const seen = new Set<string>()
    return poolsData
      .filter((p) => {
        if (seen.has(p.project)) return false
        seen.add(p.project)
        return true
      })
      .map((p) => ({
        project: p.project,
        icon: PROJECT_ICONS[p.project],
      }))
      .filter((p) => p.icon)
  }, [poolsData])

  const uniqueProjects = new Set(poolsData?.map((p) => p.project)).size

  const scrollToComposition = () => {
    const el = document.getElementById('composition')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToComposition}
      className="flex items-center justify-between w-full text-base pt-4 border-t border-secondary mt-4 text-left hover:opacity-80 transition-opacity"
    >
      <div className="flex items-center gap-4">
        <span className="font-semibold">{strategyCount} Strategies</span>
        <div className="flex items-center gap-1">
          {underlyingTokens.length > 0 && (
            <StackTokenLogo
              tokens={underlyingTokens}
              size={18}
              outsource
              reverseStack
            />
          )}
          <span className="font-semibold">
            {underlyingTokens.length} Assets
          </span>
        </div>
        <div className="flex items-center gap-3">
          {protocolIcons.length > 0 && (
            <div className="flex items-center -space-x-6 ml-1">
              {protocolIcons.map((p) => (
                <div
                  key={p.project}
                  className="w-4 h-4 rounded-full overflow-hidden"
                >
                  {p.icon}
                </div>
              ))}
            </div>
          )}
          <span className="font-semibold">{uniqueProjects} Protocols</span>
        </div>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </button>
  )
}

const YieldIndexAssetExposure = () => {
  const apyData = useAtomValue(indexDTFApyAtom)
  const exposureData = useAtomValue(indexDTFExposureDataAtom)

  const primaryExposure = exposureData?.[0]

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row">
        {/* Left: Asset Exposure */}
        <div className="flex-1 sm:pr-6">
          <span className="text-base text-legend">Asset Exposure</span>
          <div className="mt-6">
            {primaryExposure ? (
              <div className="flex items-center gap-2 mb-2">
                {primaryExposure.native?.logo && (
                  <img
                    src={primaryExposure.native.logo}
                    alt={primaryExposure.native.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-xl font-semibold">
                  {primaryExposure.native?.name || 'Bitcoin'}
                </span>
              </div>
            ) : (
              <Skeleton className="w-32 h-6 mb-2" />
            )}
            <p className="text-base text-legend">
              {Math.round(primaryExposure?.totalWeight ?? 0)}%{' '}
              {primaryExposure?.native?.symbol ?? ''} ·{' '}
              {/* TODO: Yield description should come from API or brand data */}
              {MOCK_YIELD_DESCRIPTION}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px bg-border" />

        {/* Right: Est. APY */}
        <div className="flex-1 sm:pl-6 mt-4 sm:mt-0">
          <span className="text-base text-primary">Est. APY</span>
          <div className="mt-6">
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
      </div>

      <ExposureSummary />
    </div>
  )
}

export default YieldIndexAssetExposure
