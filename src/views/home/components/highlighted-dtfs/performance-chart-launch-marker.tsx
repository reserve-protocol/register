import TokenLogo from '@/components/token-logo'
import { cn } from '@/lib/utils'
import {
  PERFORMANCE_COLORS,
  type PerformanceDirection,
} from '@/utils/chart-performance-colors'
import { useLingui } from '@lingui/react/macro'
import { useEffect, useRef, useState } from 'react'

type LaunchMarkerToken = {
  address: string
  chainId: number
  logoSrc?: string
  symbol: string
}

export const PerformanceChartLaunchMarker = ({
  chartWidth,
  isActive,
  leftPercent,
  onActiveChange,
  performanceDirection,
  token,
}: {
  chartWidth: number
  isActive: boolean
  leftPercent: number
  onActiveChange: (active: boolean) => void
  performanceDirection: PerformanceDirection
  token: LaunchMarkerToken
}) => {
  const { t } = useLingui()
  const priceDataLabelRef = useRef<HTMLSpanElement>(null)
  const [priceDataLabelWidth, setPriceDataLabelWidth] = useState(78)
  const createdLabel = t`DTF Created`
  const backtrackedLabel = t`Est. Historical Price ✱`
  const compactBacktrackedLabel = t`Est. Hist. Price ✱`
  const minimalBacktrackedLabel = t`Est. Price ✱`
  const priceDataLabel = t`DTF price data`
  const markerSize = 18
  const iconSize = 10
  const createdLabelWidth = 74
  const segmentLabelGap = 10
  const labelPadding = 8
  const longBacktrackedLabelWidth = 112
  const compactBacktrackedLabelWidth = 86
  const minimalBacktrackedLabelWidth = 58
  const markerCenterX = (chartWidth * leftPercent) / 100
  const isBadgeClippedLeft = chartWidth > 0 && markerCenterX < markerSize / 2
  const isCreatedLabelVisible = isActive || isBadgeClippedLeft
  const leftLabelSpace =
    markerCenterX - markerSize / 2 - segmentLabelGap - labelPadding
  const rightLabelSpace =
    chartWidth - markerCenterX - markerSize / 2 - segmentLabelGap - labelPadding
  const visibleBacktrackedLabel = isBadgeClippedLeft
    ? null
    : leftLabelSpace >= longBacktrackedLabelWidth
      ? backtrackedLabel
      : leftLabelSpace >= compactBacktrackedLabelWidth
        ? compactBacktrackedLabel
        : leftLabelSpace >= minimalBacktrackedLabelWidth
          ? minimalBacktrackedLabel
          : null
  const showPriceDataLabel =
    !isBadgeClippedLeft && rightLabelSpace >= priceDataLabelWidth
  const annotationClassName = cn(
    'pointer-events-none absolute z-30 whitespace-nowrap rounded-full border border-border bg-card px-2 py-1 text-center text-[10px] font-medium leading-none text-foreground shadow-sm transition-[opacity,transform] duration-150 lg:text-primary lg:dark:text-card-foreground',
    isCreatedLabelVisible
      ? 'translate-y-0 opacity-100'
      : 'translate-y-1 opacity-0'
  )
  const segmentAnnotationClassName = cn(
    'pointer-events-none absolute z-30 whitespace-nowrap text-[10px] font-medium leading-none text-muted-foreground transition-[opacity,transform] duration-150',
    isActive ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
  )
  const priceDataLabelColor =
    performanceDirection === 'positive'
      ? PERFORMANCE_COLORS.positive.end
      : performanceDirection === 'negative'
        ? PERFORMANCE_COLORS.negative.end
        : 'hsl(var(--legend))'

  useEffect(() => {
    const element = priceDataLabelRef.current
    if (!element) return

    const updateWidth = () =>
      setPriceDataLabelWidth(Math.ceil(element.getBoundingClientRect().width))
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [priceDataLabel])

  return (
    <>
      <span
        ref={priceDataLabelRef}
        aria-hidden="true"
        className={cn(segmentAnnotationClassName, 'invisible absolute')}
      >
        {priceDataLabel}
      </span>
      <span
        aria-hidden={!isCreatedLabelVisible}
        className={annotationClassName}
        style={{
          bottom: 32,
          left: `clamp(8px, calc(${leftPercent}% - ${
            createdLabelWidth / 2
          }px), calc(100% - ${createdLabelWidth}px - 8px))`,
          width: createdLabelWidth,
        }}
      >
        {createdLabel}
      </span>
      {visibleBacktrackedLabel && (
        <span
          aria-hidden={!isActive}
          className={cn(segmentAnnotationClassName, 'text-right')}
          style={{
            bottom: 8,
            right: `calc(100% - ${leftPercent}% + ${
              markerSize / 2 + segmentLabelGap
            }px)`,
          }}
        >
          {visibleBacktrackedLabel}
        </span>
      )}
      {showPriceDataLabel && (
        <span
          aria-hidden={!isActive}
          className={cn(segmentAnnotationClassName, 'text-left')}
          style={{
            bottom: 8,
            color: priceDataLabelColor,
            left: `calc(${leftPercent}% + ${
              markerSize / 2 + segmentLabelGap
            }px)`,
          }}
        >
          {priceDataLabel}
        </span>
      )}
      {!isBadgeClippedLeft && (
        <span
          aria-label={createdLabel}
          className="absolute z-40 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          data-card-action="launch-marker"
          role="button"
          tabIndex={0}
          onBlur={() => onActiveChange(false)}
          onClick={(event) => event.preventDefault()}
          onFocus={() => onActiveChange(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
            }
          }}
          onMouseEnter={() => onActiveChange(true)}
          onMouseLeave={() => onActiveChange(false)}
          style={{
            bottom: 8,
            height: markerSize,
            left: `${leftPercent}%`,
            transform: 'translateX(-50%)',
            width: markerSize,
          }}
        >
          <span
            className="absolute inset-x-0 bottom-0 flex items-center justify-center rounded-full border bg-card shadow-sm"
            style={{
              borderColor: isActive
                ? 'hsl(var(--primary))'
                : 'hsl(var(--primary) / 0.5)',
              borderWidth: 1,
              boxShadow: '0 0px 16px rgba(0, 0, 0, 0.18)',
              height: markerSize,
              width: markerSize,
            }}
          >
            <span
              className="flex items-center justify-center"
              style={{ height: iconSize, width: iconSize }}
            >
              <TokenLogo
                address={token.address}
                chain={token.chainId}
                height={iconSize}
                src={token.logoSrc}
                symbol={token.symbol}
                width={iconSize}
              />
            </span>
          </span>
        </span>
      )}
    </>
  )
}

export type { LaunchMarkerToken }
