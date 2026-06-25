import TokenLogo from '@/components/token-logo'
import { useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { useLingui } from '@lingui/react/macro'
import { useId, useMemo, useRef } from 'react'
import {
  useMeasuredElementWidth,
  usePackingAnimationFrame,
} from '../../hooks/use-packing-animation-state'
import { getExposureTickerAssets } from '../highlighted-dtfs/utils'
import {
  DESKTOP_ANIMATION_HEIGHT,
  DESKTOP_PATH_CENTER_Y,
  DESKTOP_VISUAL_GEOMETRY,
  MOBILE_ANIMATION_HEIGHT,
  MOBILE_PATH_CENTER_Y,
  MOBILE_VISUAL_GEOMETRY,
  PATH_START_X,
  TEXT_PATH_GAP,
} from './constants'
import { computePackingFrame, getGeometry } from './geometry'
import { PackingAnimationSvg } from './packing-animation-svg'
import { useFeaturedPhoton } from './use-featured-photon'

const DTFPackingAnimation = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const photon = useFeaturedPhoton()
  const { ref, width } = useMeasuredElementWidth<HTMLDivElement>()
  const isDesktop = useIsDesktop()
  const id = useId().replace(/:/g, '')
  const pathId = `${id}-packing-path`
  const tickerLineGradientId = `${id}-ticker-line-gradient`

  const exposureAssets = useMemo(
    () => (photon ? getExposureTickerAssets(photon) : []),
    [photon]
  )
  const animationHeight = isDesktop
    ? DESKTOP_ANIMATION_HEIGHT
    : MOBILE_ANIMATION_HEIGHT
  const pathCenterY = isDesktop ? DESKTOP_PATH_CENTER_Y : MOBILE_PATH_CENTER_Y
  const visual = isDesktop ? DESKTOP_VISUAL_GEOMETRY : MOBILE_VISUAL_GEOMETRY
  const textPathRadius = visual.trajectoryRadius + TEXT_PATH_GAP
  const geometry = useMemo(
    () => getGeometry(width, pathCenterY, visual),
    [pathCenterY, visual, width]
  )
  const itemCount = exposureAssets.length
  const initialFrame = useMemo(
    () => computePackingFrame(0, geometry, visual, itemCount),
    [geometry, visual, itemCount]
  )

  const trajectoryGroupRef = useRef<SVGGElement>(null)
  const cardRectRef = useRef<SVGRectElement>(null)
  const tickerGroupRef = useRef<SVGGElement>(null)
  const tickerTextRefs = useRef<(SVGTextElement | null)[]>([])
  const tickerPathRefs = useRef<(SVGTextPathElement | null)[]>([])
  const logoRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const applyFrame = (time: number) => {
    const frame = computePackingFrame(time, geometry, visual, itemCount)

    const trajectory = trajectoryGroupRef.current
    if (trajectory) {
      trajectory.setAttribute('opacity', String(frame.trajectoryOpacity))
    }

    const cardRect = cardRectRef.current
    if (cardRect) {
      cardRect.setAttribute('x', String(frame.borderX))
      cardRect.setAttribute('width', String(frame.borderWidth))
      cardRect.setAttribute('opacity', String(frame.cardOpacity))
    }

    const tickerGroup = tickerGroupRef.current
    if (tickerGroup) tickerGroup.style.display = frame.isReveal ? 'none' : ''

    for (let index = 0; index < frame.tickers.length; index++) {
      const ticker = frame.tickers[index]
      const textNode = tickerTextRefs.current[index]
      if (textNode) textNode.setAttribute('opacity', String(ticker.opacity))
      const pathNode = tickerPathRefs.current[index]
      if (pathNode) {
        pathNode.setAttribute('startOffset', `${ticker.visibleProgress * 100}%`)
      }
    }

    const logo = logoRef.current
    if (logo) logo.style.left = `${frame.logoLeft}px`

    const detail = detailRef.current
    if (detail) {
      detail.style.left = `${frame.detailLeft}px`
      detail.style.maxWidth = `${frame.detailMaxWidth}px`
      detail.style.opacity = String(frame.detailOpacity)
    }
  }

  usePackingAnimationFrame(applyFrame, ref)

  const pathD = [
    `M ${PATH_START_X} ${geometry.textOrbitBottomY}`,
    `L ${geometry.centerX} ${geometry.textOrbitBottomY}`,
    `A ${textPathRadius} ${textPathRadius} 0 0 0 ${geometry.textOrbitRightX} ${geometry.centerY}`,
    `A ${textPathRadius} ${textPathRadius} 0 0 0 ${geometry.centerX} ${geometry.textOrbitTopY}`,
    `A ${textPathRadius} ${textPathRadius} 0 0 0 ${geometry.textOrbitLeftX} ${geometry.centerY}`,
    `A ${textPathRadius} ${textPathRadius} 0 0 0 ${geometry.centerX} ${geometry.textOrbitBottomY}`,
  ].join(' ')
  const price = photon
    ? `$${formatCurrency(photon.price, photon.price >= 1 ? 2 : 5)}`
    : ''

  const logoSize = visual.logoRadius * 2

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-[152px] w-full overflow-hidden text-foreground lg:h-56',
        className
      )}
      aria-label={t`PHOTON packs multiple collateral assets into one DTF token`}
    >
      {photon && width > 0 && (
        <>
          <PackingAnimationSvg
            animationHeight={animationHeight}
            assets={exposureAssets}
            geometry={geometry}
            initialFrame={initialFrame}
            pathD={pathD}
            pathId={pathId}
            tickerLineGradientId={tickerLineGradientId}
            visual={visual}
            trajectoryGroupRef={trajectoryGroupRef}
            cardRectRef={cardRectRef}
            tickerGroupRef={tickerGroupRef}
            tickerTextRefs={tickerTextRefs}
            tickerPathRefs={tickerPathRefs}
          />

          <div
            ref={logoRef}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: initialFrame.logoLeft,
              top: geometry.centerY - visual.logoRadius,
              width: logoSize,
              height: logoSize,
            }}
          >
            <TokenLogo
              address={photon.address}
              chain={photon.chainId}
              src={photon.brand?.icon || undefined}
              symbol={photon.symbol}
              width={logoSize}
              height={logoSize}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div
            ref={detailRef}
            className="pointer-events-none absolute min-w-0 text-left"
            style={{
              left: initialFrame.detailLeft,
              top: geometry.centerY - 22,
              maxWidth: initialFrame.detailMaxWidth,
              opacity: initialFrame.detailOpacity,
            }}
          >
            <div className="text-base font-normal leading-tight text-foreground">
              {photon.symbol}
            </div>
            <div className="mt-1 text-sm font-normal leading-tight text-primary">
              {price}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DTFPackingAnimation
