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
import React, { useMemo } from 'react'
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
    const icons: { project: string; icon: React.ReactElement }[] = []
    for (const p of poolsData) {
      if (!seen.has(p.project) && PROJECT_ICONS[p.project]) {
        seen.add(p.project)
        icons.push({ project: p.project, icon: PROJECT_ICONS[p.project] })
      }
      if (p.poolMeta) {
        const slug = p.poolMeta.toLowerCase().includes('uniswap')
          ? 'uniswap-v3'
          : p.poolMeta.toLowerCase()
        if (!seen.has(slug) && PROJECT_ICONS[slug]) {
          seen.add(slug)
          icons.push({ project: slug, icon: PROJECT_ICONS[slug] })
        }
      }
    }
    return icons
  }, [poolsData])

  const uniqueProjects = useMemo(() => {
    if (!poolsData) return 0
    const projects = new Set<string>()
    for (const p of poolsData) {
      projects.add(p.project)
      if (p.poolMeta) {
        const venue = p.poolMeta.replace(/V\d+/g, '').trim().toLowerCase()
        projects.add(venue)
      }
    }
    return projects.size
  }, [poolsData])

  const scrollToComposition = () => {
    const el = document.getElementById('composition')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToComposition}
      className="flex items-center justify-between w-full text-xs sm:text-base pt-4 border-t border-secondary mt-4 text-left hover:opacity-80 transition-opacity"
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
        <div className="flex items-center gap-1">
          {protocolIcons.length > 0 && (
            <div className="flex items-center -space-x-2">
              {protocolIcons.map((p, i) => (
                <div
                  key={p.project}
                  className="w-4 h-4 rounded-full overflow-hidden"
                  style={{ zIndex: protocolIcons.length - i }}
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

        {/* Separator: vertical on desktop, horizontal on mobile */}
        <div className="hidden sm:block w-px bg-border" />
        <div className="sm:hidden border-t border-secondary my-2" />

        {/* Right: Est. APY */}
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
      </div>

      <ExposureSummary />
    </div>
  )
}

export default YieldIndexAssetExposure
