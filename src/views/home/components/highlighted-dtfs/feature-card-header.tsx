import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { PERFORMANCE_TEXT_CLASSES } from '@/utils/chart-performance-colors'
import {
  getChartReferenceTimestamp,
  isAIDTF,
} from '@/utils/chart-reference-date'
import { Trans } from '@lingui/react/macro'
import { memo, type Dispatch, type SetStateAction } from 'react'
import { ChainTabs } from './chain-tabs'
import {
  FEATURE_CARD_HEADER_CLASS_NAME,
  FEATURE_CARD_MEDIA_CLASS_NAME,
} from './constants'
import { PerformanceChart } from './performance-chart'
import type { ChainVersion, ChartPlacement, HighlightedDTFItem } from './types'

export const FeatureCardHeader = memo(function FeatureCardHeader({
  chainVersions,
  chartPlacement,
  hasPerformanceChart,
  oneMonthPerformance,
  percentageChange,
  performanceLabel,
  performanceDirection,
  selectedVersion,
  selectedVersionIndex,
  setSelectedVersionIndex,
  versionKey,
}: {
  chainVersions: ChainVersion[]
  chartPlacement: ChartPlacement
  hasPerformanceChart: boolean
  oneMonthPerformance: HighlightedDTFItem['performance']
  percentageChange: string | null
  performanceLabel: string
  performanceDirection: 'positive' | 'negative' | 'neutral'
  selectedVersion: HighlightedDTFItem
  selectedVersionIndex: number
  setSelectedVersionIndex: Dispatch<SetStateAction<number>>
  versionKey: string
}) {
  const hasChainTabs = chainVersions.length > 1
  const launchMarkerToken = {
    address: selectedVersion.address,
    chainId: selectedVersion.chainId,
    logoSrc: selectedVersion.brand?.icon,
    symbol: selectedVersion.symbol,
  }
  const launchTimestamp = getChartReferenceTimestamp(
    selectedVersion.address,
    selectedVersion.chainId,
    selectedVersion.createdAt
  )
  const useLaunchLabel = isAIDTF(
    selectedVersion.address,
    selectedVersion.chainId
  )

  return (
    <div className={FEATURE_CARD_MEDIA_CLASS_NAME}>
      <div className={FEATURE_CARD_HEADER_CLASS_NAME}>
        <div className="flex min-w-0 items-start justify-between">
          <div className="relative w-fit flex-shrink-0">
            <TokenLogo
              address={selectedVersion.address}
              chain={selectedVersion.chainId}
              src={selectedVersion.brand?.icon || undefined}
              symbol={selectedVersion.symbol}
              size="xl"
            />
            <ChainLogo
              chain={selectedVersion.chainId}
              width={16}
              height={16}
              className="absolute -bottom-0.5 -right-1 rounded-md border-2 border-secondary bg-card group-hover:border-card"
            />
          </div>

          <div
            className={cn(
              'relative flex h-8 shrink-0 items-center justify-end',
              hasChainTabs && 'w-[154px]',
              chartPlacement === 'header' && !hasChainTabs && 'h-12 w-28'
            )}
          >
            {hasChainTabs && (
              <ChainTabs
                chainTabs={chainVersions}
                selectedVersionIndex={selectedVersionIndex}
                setSelectedVersionIndex={setSelectedVersionIndex}
              />
            )}
            {!hasChainTabs &&
              chartPlacement === 'header' &&
              hasPerformanceChart && (
                <div className="w-28">
                  <PerformanceChart
                    chartKey={versionKey}
                    className="h-12"
                    direction={performanceDirection}
                    fadeClassName=""
                    launchMarkerToken={launchMarkerToken}
                    launchTimestamp={launchTimestamp}
                    performance={oneMonthPerformance}
                    showPattern={false}
                    useLaunchLabel={useLaunchLabel}
                  />
                </div>
              )}
            {!hasChainTabs && chartPlacement === 'body' && (
              <span className="inline-flex h-8 items-center rounded-full bg-primary px-3.5 text-sm font-medium text-primary-foreground opacity-100 transition-opacity duration-150 ease-out lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
                <Trans context="DTF card">Buy</Trans>
              </span>
            )}
          </div>
        </div>

        <div className="w-full min-w-0">
          <div className="flex min-h-[48px] min-w-0 items-end">
            <div className="flex min-w-0 items-end gap-2">
              <h3 className="min-w-0 text-xl font-normal leading-tight text-foreground [text-wrap:pretty] transition-colors lg:group-hover:text-primary dark:lg:group-hover:text-foreground">
                {selectedVersion.name}
              </h3>
              {isInactiveDTF(selectedVersion.status) && (
                <span className="hidden shrink-0 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400 sm:inline">
                  <Trans>Inactive</Trans>
                </span>
              )}
            </div>
          </div>
          <div className="mt-1.5 flex w-full min-w-0 items-center justify-between gap-3 text-base text-legend">
            <span className="truncate">
              <span className="text-primary tabular-nums transition-colors lg:text-foreground lg:group-hover:text-primary">
                <span className="text-primary/60 transition-colors lg:text-legend lg:group-hover:text-primary/60">
                  $
                </span>
                {formatCurrency(
                  selectedVersion.price,
                  selectedVersion.price >= 1 ? 2 : 5
                )}
              </span>
              <span> · ${selectedVersion.symbol}</span>
            </span>
            <span
              className={cn(
                'shrink-0 tabular-nums',
                performanceDirection === 'positive' &&
                  PERFORMANCE_TEXT_CLASSES.positive,
                performanceDirection === 'negative' &&
                  PERFORMANCE_TEXT_CLASSES.negative
              )}
            >
              {percentageChange ? (
                `${percentageChange} (${performanceLabel})`
              ) : (
                <Trans>No data</Trans>
              )}
            </span>
          </div>
        </div>
      </div>

      {chartPlacement === 'body' && hasPerformanceChart && (
        <PerformanceChart
          chartKey={versionKey}
          className="h-52"
          direction={performanceDirection}
          launchMarkerToken={launchMarkerToken}
          launchTimestamp={launchTimestamp}
          performance={oneMonthPerformance}
          useLaunchLabel={useLaunchLabel}
        />
      )}
    </div>
  )
})
