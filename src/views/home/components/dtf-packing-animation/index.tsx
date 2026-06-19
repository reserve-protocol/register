import TokenLogo from '@/components/token-logo'
import { useIsDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { useLingui } from '@lingui/react/macro'
import { useId, useMemo, type CSSProperties } from 'react'
import {
  useMeasuredElementWidth,
  useRafElapsedTime,
} from '../../hooks/use-packing-animation-state'
import { getExposureTickerAssets } from '../highlighted-dtfs/utils'
import {
  CARD_DETAIL_GAP,
  CARD_RIGHT_EXTRA_PADDING,
  DESKTOP_ANIMATION_HEIGHT,
  DESKTOP_PATH_CENTER_Y,
  DESKTOP_VISUAL_GEOMETRY,
  MOBILE_ANIMATION_HEIGHT,
  MOBILE_PATH_CENTER_Y,
  MOBILE_VISUAL_GEOMETRY,
  PATH_START_X,
  TEXT_PATH_GAP,
} from './constants'
import { getCycleState, getGeometry } from './geometry'
import { PackingAnimationSvg } from './packing-animation-svg'
import { useFeaturedPhoton } from './use-featured-photon'

const DTFPackingAnimation = ({ className }: { className?: string }) => {
  const { t } = useLingui()
  const photon = useFeaturedPhoton()
  const { ref, width } = useMeasuredElementWidth<HTMLDivElement>()
  const time = useRafElapsedTime()
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
  const cardPadding = visual.trajectoryRadius - visual.logoRadius
  const cardRightPadding = cardPadding + CARD_RIGHT_EXTRA_PADDING
  const geometry = useMemo(
    () => getGeometry(width, pathCenterY, visual),
    [pathCenterY, visual, width]
  )
  const cycle = getCycleState(time, exposureAssets.length, geometry.pathLength)

  const borderX =
    geometry.centerX -
    visual.trajectoryRadius +
    (geometry.cardX - (geometry.centerX - visual.trajectoryRadius)) *
      cycle.morphProgress
  const borderWidth =
    visual.trajectoryRadius * 2 +
    (geometry.cardWidth - visual.trajectoryRadius * 2) * cycle.morphProgress
  const logoX =
    geometry.centerX +
    (geometry.finalLogoX - geometry.centerX) * cycle.morphProgress

  const logoStyle = {
    left: logoX - visual.logoRadius,
    top: geometry.centerY - visual.logoRadius,
    width: visual.logoRadius * 2,
    height: visual.logoRadius * 2,
  } satisfies CSSProperties

  const detailStyle = {
    left: logoX + visual.logoRadius + CARD_DETAIL_GAP,
    top: geometry.centerY - 22,
    maxWidth:
      geometry.cardX +
      geometry.cardWidth -
      cardRightPadding -
      logoX -
      visual.logoRadius -
      CARD_DETAIL_GAP,
    opacity: cycle.textOpacity,
  } satisfies CSSProperties

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
            borderWidth={borderWidth}
            borderX={borderX}
            cycle={cycle}
            geometry={geometry}
            pathD={pathD}
            pathId={pathId}
            tickerLineGradientId={tickerLineGradientId}
            visual={visual}
          />

          <div
            className="pointer-events-none absolute rounded-full"
            style={logoStyle}
          >
            <TokenLogo
              address={photon.address}
              chain={photon.chainId}
              src={photon.brand?.icon || undefined}
              symbol={photon.symbol}
              width={visual.logoRadius * 2}
              height={visual.logoRadius * 2}
              loading="eager"
              fetchPriority="high"
            />
          </div>

          <div
            className="pointer-events-none absolute min-w-0 text-left"
            style={detailStyle}
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
