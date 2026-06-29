import type { MutableRefObject, RefObject } from 'react'
import type { AssetTickerItem } from '../highlighted-dtfs/types'
import { PATH_START_X, type VisualGeometry } from './constants'
import type { Geometry, PackingFrame } from './geometry'
import { PackingTickerText } from './packing-ticker-text'

export const PackingAnimationSvg = ({
  animationHeight,
  assets,
  geometry,
  initialFrame,
  pathD,
  pathId,
  tickerLineGradientId,
  visual,
  trajectoryGroupRef,
  cardRectRef,
  tickerGroupRef,
  tickerTextRefs,
  tickerPathRefs,
}: {
  animationHeight: number
  assets: AssetTickerItem[]
  geometry: Geometry
  initialFrame: PackingFrame
  pathD: string
  pathId: string
  tickerLineGradientId: string
  visual: VisualGeometry
  trajectoryGroupRef: RefObject<SVGGElement>
  cardRectRef: RefObject<SVGRectElement>
  tickerGroupRef: RefObject<SVGGElement>
  tickerTextRefs: MutableRefObject<(SVGTextElement | null)[]>
  tickerPathRefs: MutableRefObject<(SVGTextPathElement | null)[]>
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

    <g ref={trajectoryGroupRef} opacity={initialFrame.trajectoryOpacity}>
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
      ref={cardRectRef}
      x={initialFrame.borderX}
      y={geometry.cardY}
      width={initialFrame.borderWidth}
      height={geometry.cardHeight}
      rx={geometry.cardHeight / 2}
      className="fill-primary/10 stroke-primary"
      strokeWidth="1.5"
      opacity={initialFrame.cardOpacity}
    />

    <g
      ref={tickerGroupRef}
      style={{ display: initialFrame.isReveal ? 'none' : undefined }}
    >
      {assets.map((asset, index) => (
        <PackingTickerText
          key={`${asset.key}-${index}`}
          asset={asset}
          pathId={pathId}
          initialOpacity={initialFrame.tickers[index]?.opacity ?? 0}
          initialVisibleProgress={
            initialFrame.tickers[index]?.visibleProgress ?? 0
          }
          textRef={(node) => {
            tickerTextRefs.current[index] = node
          }}
          pathRef={(node) => {
            tickerPathRefs.current[index] = node
          }}
        />
      ))}
    </g>
  </svg>
)
