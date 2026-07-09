import { formatCurrency } from '@/utils'
import type { Ref } from 'react'
import type { AssetTickerItem } from '../highlighted-dtfs/types'

const formatWeight = (weight?: string | number) => {
  const value = Number.parseFloat(String(weight ?? '0'))
  if (!Number.isFinite(value)) return `${weight ?? '0'}%`
  return `${formatCurrency(value, value < 1 ? 2 : 1, {
    minimumFractionDigits: 0,
  })}%`
}

// WHY: opacity and startOffset are animated imperatively via refs in the RAF
// loop (see DTFPackingAnimation). This node only renders structure + the
// initial (time=0) frame so the first paint matches the running animation.
export const PackingTickerText = ({
  asset,
  pathId,
  initialOpacity,
  initialVisibleProgress,
  textRef,
  pathRef,
}: {
  asset: AssetTickerItem
  pathId: string
  initialOpacity: number
  initialVisibleProgress: number
  textRef: Ref<SVGTextElement>
  pathRef: Ref<SVGTextPathElement>
}) => (
  <text
    ref={textRef}
    className="fill-foreground text-xs font-normal"
    opacity={initialOpacity}
    dominantBaseline="middle"
  >
    <textPath
      ref={pathRef}
      href={`#${pathId}`}
      startOffset={`${initialVisibleProgress * 100}%`}
    >
      <tspan>{asset.symbol}</tspan>
      <tspan className="fill-muted-foreground" dx="4">
        {formatWeight(asset.weight)}
      </tspan>
    </textPath>
  </text>
)
