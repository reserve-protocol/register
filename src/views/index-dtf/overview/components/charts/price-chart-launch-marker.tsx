import { v1Typography as type } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import { useLingui } from '@lingui/react/macro'

type AxisMap = Record<string | number, { scale?: (value: number) => number }>

type ChartOffset = {
  top: number
  height: number
  width?: number
}

export const PriceChartLaunchMarker = ({
  launchTimestamp,
  offset,
  useLaunchLabel = false,
  variant,
  visible,
  width,
  xAxisMap,
}: {
  launchTimestamp?: number
  offset?: ChartOffset
  useLaunchLabel?: boolean
  variant?: 'annotation'
  visible: boolean
  width?: number
  xAxisMap?: AxisMap
}) => {
  const { t } = useLingui()
  const xScale = xAxisMap?.[0]?.scale

  if (!visible || launchTimestamp === undefined || !xScale || !offset) {
    return null
  }

  const x = xScale(launchTimestamp)
  if (!Number.isFinite(x)) return null

  const markerX = Math.round(x) + 0.5
  const isAnnotation = variant === 'annotation'
  const labelHeight = 18
  const labelY = offset.top + offset.height - labelHeight - 10
  const chartWidth = width ?? offset.width ?? markerX * 2
  const labelPadding = 8
  const createdLabel = useLaunchLabel ? t`DTF Launch` : t`DTF Created`
  const createdLabelWidth = 74
  const segmentLabel = t`Est. Historical Price ✱`
  const segmentLabelWidth = isAnnotation ? 128 : 112
  const segmentLabelGap = isAnnotation ? 16 : 10
  const createdLabelX = Math.min(
    Math.max(markerX - createdLabelWidth / 2, labelPadding),
    chartWidth - createdLabelWidth - labelPadding
  )
  const segmentLabelX = Math.min(
    Math.max(
      markerX - createdLabelWidth / 2 - segmentLabelGap - segmentLabelWidth,
      labelPadding
    ),
    chartWidth - segmentLabelWidth - labelPadding
  )
  const showSegmentLabel =
    segmentLabelX + segmentLabelWidth + segmentLabelGap <= createdLabelX

  return (
    <g aria-hidden="true" pointerEvents="none">
      <line
        x1={markerX}
        x2={markerX}
        y1={offset.top + 6}
        y2={isAnnotation ? labelY - 4 : labelY}
        stroke="hsl(var(--foreground))"
        strokeOpacity={0.38}
        strokeDasharray="3 4"
        strokeWidth={1}
      />
      {showSegmentLabel && (
        <text
          x={segmentLabelX + segmentLabelWidth}
          y={labelY + labelHeight / 2}
          dominantBaseline="middle"
          className={
            isAnnotation
              ? cn(type.auxiliary, roles.text.supporting, 'fill-current')
              : undefined
          }
          fill={isAnnotation ? undefined : 'hsl(var(--muted-foreground))'}
          fillOpacity={isAnnotation ? undefined : 0.8}
          fontSize={isAnnotation ? undefined : 10}
          textAnchor="end"
        >
          {segmentLabel}
        </text>
      )}
      {isAnnotation ? (
        <text
          x={createdLabelX + createdLabelWidth / 2}
          y={labelY + labelHeight / 2}
          dominantBaseline="middle"
          textAnchor="middle"
          className={cn(type.auxiliary, roles.text.primary, 'fill-current')}
        >
          {createdLabel}
        </text>
      ) : (
        <foreignObject
          x={createdLabelX}
          y={labelY}
          width={createdLabelWidth}
          height={labelHeight}
        >
          <div
            className="flex h-full w-full items-center justify-center whitespace-nowrap rounded-full border border-border bg-card px-2 text-[10px] font-medium leading-none text-card-foreground shadow-sm"
            style={{ boxSizing: 'border-box' }}
          >
            {createdLabel}
          </div>
        </foreignObject>
      )}
    </g>
  )
}
