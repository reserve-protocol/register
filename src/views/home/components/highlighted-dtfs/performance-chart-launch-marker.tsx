import TokenLogo from '@/components/token-logo'
import { cn } from '@/lib/utils'
import {
  PERFORMANCE_COLORS,
  type PerformanceDirection,
} from '@/utils/chart-performance-colors'
import { useLingui } from '@lingui/react/macro'

type LaunchMarkerToken = {
  address: string
  chainId: number
  logoSrc?: string
  symbol: string
}

export const PerformanceChartLaunchMarker = ({
  isActive,
  leftPercent,
  onActiveChange,
  performanceDirection,
  token,
}: {
  isActive: boolean
  leftPercent: number
  onActiveChange: (active: boolean) => void
  performanceDirection: PerformanceDirection
  token: LaunchMarkerToken
}) => {
  const { t } = useLingui()
  const createdLabel = t`DTF Created`
  const backtrackedLabel = t`Backtracked basket price`
  const priceDataLabel = t`DTF price data`
  const markerSize = 18
  const iconSize = 10
  const createdLabelWidth = 74
  const segmentLabelWidth = 112
  const segmentLabelGap = 10
  const annotationClassName = cn(
    'pointer-events-none absolute z-30 whitespace-nowrap rounded-full border border-border bg-card px-2 py-1 text-center text-[10px] font-medium leading-none text-primary shadow-sm transition-[opacity,transform] duration-150 dark:text-card-foreground',
    isActive ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
  )
  const segmentAnnotationClassName = cn(
    'pointer-events-none absolute z-30 whitespace-nowrap text-[10px] font-medium leading-none text-muted-foreground transition-[opacity,transform] duration-150',
    isActive ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
  )
  const priceDataLabelColor =
    performanceDirection === 'positive' || performanceDirection === 'negative'
      ? PERFORMANCE_COLORS[performanceDirection].dot
      : PERFORMANCE_COLORS.neutral.dot

  return (
    <>
      <span
        aria-hidden={!isActive}
        className={annotationClassName}
        style={{
          bottom: 32,
          left: `clamp(8px, calc(${leftPercent}% - ${
            createdLabelWidth / 2
          }px + 0.5px), calc(100% - ${createdLabelWidth}px - 8px))`,
          width: createdLabelWidth,
        }}
      >
        {createdLabel}
      </span>
      <span
        aria-hidden={!isActive}
        className={cn(segmentAnnotationClassName, 'text-right')}
        style={{
          bottom: 8,
          left: `clamp(8px, calc(${leftPercent}% - ${
            segmentLabelWidth + markerSize / 2 + segmentLabelGap
          }px), calc(100% - ${segmentLabelWidth}px - 8px))`,
          width: segmentLabelWidth,
        }}
      >
        {backtrackedLabel}
      </span>
      <span
        aria-hidden={!isActive}
        className={cn(segmentAnnotationClassName, 'text-left')}
        style={{
          bottom: 8,
          color: priceDataLabelColor,
          left: `clamp(8px, calc(${leftPercent}% + ${
            markerSize / 2 + segmentLabelGap
          }px), calc(100% - ${segmentLabelWidth}px - 8px))`,
          width: segmentLabelWidth,
        }}
      >
        {priceDataLabel}
      </span>
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
          transform: 'translateX(calc(-50% + 0.5px))',
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
    </>
  )
}

export type { LaunchMarkerToken }
