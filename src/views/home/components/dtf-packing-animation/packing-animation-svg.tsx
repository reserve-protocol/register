import type { AssetTickerItem } from '../highlighted-dtfs/types'
import { PATH_START_X, type VisualGeometry } from './constants'
import type { Geometry, getCycleState } from './geometry'
import { PackingTickerText } from './packing-ticker-text'

export const PackingAnimationSvg = ({
  animationHeight,
  assets,
  borderWidth,
  borderX,
  cycle,
  geometry,
  pathD,
  pathId,
  tickerLineGradientId,
  visual,
}: {
  animationHeight: number
  assets: AssetTickerItem[]
  borderWidth: number
  borderX: number
  cycle: ReturnType<typeof getCycleState>
  geometry: Geometry
  pathD: string
  pathId: string
  tickerLineGradientId: string
  visual: VisualGeometry
}) => (
  <svg
    className="absolute inset-0 h-full w-full overflow-visible"
    width={geometry.width}
    height={animationHeight}
    viewBox={`0 0 ${geometry.width} ${animationHeight}`}
    role="img"
    aria-hidden="true"
  >
    <defs>
      <path id={pathId} d={pathD} pathLength={100} />
      <linearGradient
        id={tickerLineGradientId}
        gradientUnits="userSpaceOnUse"
        x1={PATH_START_X}
        y1={geometry.orbitBottomY}
        x2={geometry.centerX}
        y2={geometry.orbitBottomY}
      >
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
      </linearGradient>
    </defs>

    <g opacity={cycle.trajectoryOpacity}>
      <line
        x1={PATH_START_X}
        y1={geometry.orbitBottomY}
        x2={geometry.centerX}
        y2={geometry.orbitBottomY}
        stroke={`url(#${tickerLineGradientId})`}
        strokeWidth="1.5"
      />
      <circle
        cx={geometry.centerX}
        cy={geometry.centerY}
        r={visual.trajectoryRadius}
        className="fill-primary/10 stroke-primary"
        fill="none"
        strokeWidth="1.5"
      />
    </g>

    <rect
      x={borderX}
      y={geometry.cardY}
      width={borderWidth}
      height={geometry.cardHeight}
      rx={geometry.cardHeight / 2}
      className="fill-primary/10 stroke-primary"
      strokeWidth="1.5"
      opacity={cycle.isReveal ? 1 : 0}
    />

    {!cycle.isReveal && (
      <g>
        {assets.map((asset, index) => (
          <PackingTickerText
            key={`${asset.key}-${index}`}
            asset={asset}
            index={index}
            pathId={pathId}
            cycleTime={cycle.cycleTime}
            travelMs={cycle.travelMs}
            spacingMs={cycle.spacingMs}
          />
        ))}
      </g>
    )}
  </svg>
)
