import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { getFolioRoute } from '@/utils'
import { useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  useAssetTickerTransition,
  useHighlightedCardVisibility,
  useTranscriptPlayback,
} from '../../hooks/use-highlighted-dtf-animation'
import { FeatureCardAssetTicker } from './asset-ticker'
import { ChainTabs } from './chain-tabs'
import {
  ASSET_CHAIN_ENTER_MS,
  ASSET_CHAIN_EXIT_MS,
  FEATURE_CARD_CLASS_NAME,
  TRANSCRIPT_WORD_DELAY_MS,
  TRANSCRIPT_WORDS,
} from './constants'
import { FeatureCardHeader } from './feature-card-header'
import { TranscriptPreview } from './transcript-preview'
import type { ChartPlacement, HighlightedDTFItem } from './types'
import {
  formatPerformancePeriodLabel,
  formatPercentageChange,
  getExposureTickerAssets,
  getPerformanceDirection,
} from './utils'

const PHOTON_ALIAS_ROUTE = '/bsc/index-dtf/photon/overview'

const getHighlightedDtfRoute = (dtf: HighlightedDTFItem) => {
  if (dtf.symbol.toUpperCase() === 'PHOTON') return PHOTON_ALIAS_ROUTE

  return getFolioRoute(dtf.address, dtf.chainId)
}

export const IndexDTFFeatureCard = ({
  dtf,
  bottomSlot,
  chartPlacement = 'body',
  performanceLabel,
  showTranscript = true,
}: {
  dtf: HighlightedDTFItem
  bottomSlot?: ReactNode
  chartPlacement?: ChartPlacement
  performanceLabel?: string
  showTranscript?: boolean
}) => {
  const chainVersions = dtf.chainVersions
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0)
  const selectedVersion = chainVersions?.[selectedVersionIndex] ?? dtf
  const route = getHighlightedDtfRoute(selectedVersion)
  const versionKey = `${selectedVersion.chainId}-${selectedVersion.address}`
  const exposureAssets = useMemo(
    () => getExposureTickerAssets(selectedVersion),
    [selectedVersion]
  )
  const oneMonthPerformance = selectedVersion.performance
  const percentageChange = formatPercentageChange(
    selectedVersion,
    oneMonthPerformance
  )
  const displayedPerformanceLabel =
    performanceLabel ??
    formatPerformancePeriodLabel(selectedVersion.priceChange?.period)
  const performanceDirection = getPerformanceDirection(oneMonthPerformance)
  const [isTranscriptActive, setIsTranscriptActive] = useState(false)
  const isDesktop = useIsDesktop()
  const { cardRef, isAssetTickerVisible, isCardInView } =
    useHighlightedCardVisibility<HTMLAnchorElement>(isDesktop)
  const isActive =
    showTranscript && (isDesktop ? isTranscriptActive : isCardInView)
  const {
    displayedValue: displayedBacking,
    displayedVersionKey,
    transitionState,
  } = useAssetTickerTransition({
    enterMs: ASSET_CHAIN_ENTER_MS,
    exitMs: ASSET_CHAIN_EXIT_MS,
    value: exposureAssets,
    versionKey,
  })
  const { highlightedWords, transcriptScrollOffset, transcriptWordRefs } =
    useTranscriptPlayback({
      active: isActive,
      enabled: showTranscript,
      wordCount: TRANSCRIPT_WORDS.length,
      wordDelayMs: TRANSCRIPT_WORD_DELAY_MS,
    })
  const hasPerformanceChart = oneMonthPerformance.length > 0
  const handleCardClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-card-action]')) {
      event.preventDefault()
    }
  }

  return (
    <Link
      ref={cardRef}
      to={route}
      onClick={handleCardClick}
      onMouseEnter={() =>
        showTranscript && isDesktop && setIsTranscriptActive(true)
      }
      onMouseLeave={() =>
        showTranscript && isDesktop && setIsTranscriptActive(false)
      }
      onFocus={() => showTranscript && setIsTranscriptActive(true)}
      onBlur={(event) => {
        if (
          showTranscript &&
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        ) {
          setIsTranscriptActive(false)
        }
      }}
      className={cn(
        FEATURE_CARD_CLASS_NAME,
        'select-none',
        isInactiveDTF(selectedVersion.status) && 'opacity-60'
      )}
    >
      <FeatureCardHeader
        chainVersions={chainVersions ?? []}
        chartPlacement={chartPlacement}
        hasPerformanceChart={hasPerformanceChart}
        oneMonthPerformance={oneMonthPerformance}
        percentageChange={percentageChange}
        performanceLabel={displayedPerformanceLabel}
        performanceDirection={performanceDirection}
        selectedVersion={selectedVersion}
        selectedVersionIndex={selectedVersionIndex}
        setSelectedVersionIndex={setSelectedVersionIndex}
        versionKey={versionKey}
      />
      <FeatureCardAssetTicker
        assets={displayedBacking}
        displayedVersionKey={displayedVersionKey}
        isVisible={isAssetTickerVisible}
        selectedVersionName={selectedVersion.name}
        transitionState={transitionState}
      />
      {showTranscript ? (
        <TranscriptPreview
          highlightedWords={highlightedWords}
          selectedVersion={selectedVersion}
          transcriptScrollOffset={transcriptScrollOffset}
          transcriptWordRefs={transcriptWordRefs}
        />
      ) : (
        bottomSlot
      )}
    </Link>
  )
}
