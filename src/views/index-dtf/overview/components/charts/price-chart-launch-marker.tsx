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
  visible,
  width,
  xAxisMap,
}: {
  launchTimestamp?: number
  offset?: ChartOffset
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
  const labelHeight = 18
  const labelY = offset.top + offset.height - labelHeight - 10
  const chartWidth = width ?? offset.width ?? markerX * 2
  const labelPadding = 8
  const createdLabel = t`DTF Created`
  const createdLabelWidth = 74
  const segmentLabel = t`Est. Historical Price ✱`
  const segmentLabelWidth = 112
  const segmentLabelGap = 10
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
        y2={labelY}
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
          fill="hsl(var(--muted-foreground))"
          fillOpacity={0.8}
          fontSize={10}
          textAnchor="end"
        >
          {segmentLabel}
        </text>
      )}
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
    </g>
  )
}
