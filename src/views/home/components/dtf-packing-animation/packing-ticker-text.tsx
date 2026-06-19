import { formatCurrency } from '@/utils'
import type { AssetTickerItem } from '../highlighted-dtfs/types'
import {
  FADE_IN_PROGRESS,
  FADE_OUT_END_PROGRESS,
  FADE_OUT_START_PROGRESS,
} from './constants'
import { clamp } from './geometry'

const formatWeight = (weight?: string | number) => {
  const value = Number.parseFloat(String(weight ?? '0'))
  if (!Number.isFinite(value)) return `${weight ?? '0'}%`
  return `${formatCurrency(value, value < 1 ? 2 : 1, {
    minimumFractionDigits: 0,
  })}%`
}

export const PackingTickerText = ({
  asset,
  index,
  pathId,
  cycleTime,
  travelMs,
  spacingMs,
}: {
  asset: AssetTickerItem
  index: number
  pathId: string
  cycleTime: number
  travelMs: number
  spacingMs: number
}) => {
  const itemTime = cycleTime - index * spacingMs
  const progress = itemTime / travelMs
  const visibleProgress = clamp(progress)
  const fadeIn = clamp(visibleProgress / FADE_IN_PROGRESS)
  const fadeOut =
    1 -
    clamp(
      (visibleProgress - FADE_OUT_START_PROGRESS) /
        (FADE_OUT_END_PROGRESS - FADE_OUT_START_PROGRESS)
    )
  const opacity =
    progress < 0 || progress > FADE_OUT_END_PROGRESS ? 0 : fadeIn * fadeOut

  return (
    <text
      className="fill-foreground text-xs font-normal"
      opacity={opacity}
      dominantBaseline="middle"
    >
      <textPath href={`#${pathId}`} startOffset={`${visibleProgress * 100}%`}>
        <tspan>{asset.symbol}</tspan>
        <tspan className="fill-muted-foreground" dx="4">
          {formatWeight(asset.weight)}
        </tspan>
      </textPath>
    </text>
  )
}
