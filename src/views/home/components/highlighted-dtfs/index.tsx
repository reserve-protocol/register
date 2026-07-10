import { isInactiveDTF } from '@/hooks/use-dtf-status'
import { cn } from '@/lib/utils'
import { useMemo, type CSSProperties } from 'react'
import useFeaturedDtfs from '../../hooks/use-featured-dtfs'
import { useHighlightedScrollMetrics } from '../../hooks/use-highlighted-dtf-animation'
import { CollateralAssetAnimationStyles } from './collateral-asset-animation-styles'
import {
  END_FADE_DISTANCE,
  FEATURE_CARD_GRID_CLASS_NAME,
  HIGHLIGHTED_LIMIT,
} from './constants'
import {
  HighlightedDTFEndCard,
  HighlightedDTFEndCardPlaceholder,
} from './end-card'
import { IndexDTFFeatureCard } from './feature-card'
import { IndexDTFFeatureIdentityCards } from './identity-card'
import type { HighlightedDTFItem } from './types'
import { toHighlightedDtf } from './utils'

export { CollateralAssetAnimationStyles } from './collateral-asset-animation-styles'
export { IndexDTFFeatureCard } from './feature-card'
export { IndexDTFFeatureCardPlaceholder } from './skeletons'

const isVisibleHighlightedDtf = (
  dtf: HighlightedDTFItem | null
): dtf is HighlightedDTFItem => {
  if (!dtf) return false
  return !isInactiveDTF(dtf.status)
}

const HighlightedDTFs = ({
  className,
  enableScrollAnimation = true,
  onScrollDistanceChange,
  scrollOffset = 0,
}: {
  className?: string
  enableScrollAnimation?: boolean
  onScrollDistanceChange?: (distance: number) => void
  scrollOffset?: number
}) => {
  const { data, isLoading } = useFeaturedDtfs()

  const highlighted = useMemo(() => {
    if (!data) return []

    return data.map(toHighlightedDtf).filter(isVisibleHighlightedDtf)
  }, [data])

  const { scrollDistance, trackRef, viewportRef } = useHighlightedScrollMetrics<
    HTMLElement,
    HTMLDivElement
  >({
    isLoading,
    itemCount: highlighted.length,
    onScrollDistanceChange,
  })

  if (!isLoading && highlighted.length === 0) {
    return null
  }

  const trackStyle = {
    transform: enableScrollAnimation
      ? `translate3d(0, -${scrollOffset}px, 0)`
      : undefined,
  } satisfies CSSProperties
  const fadeOpacity =
    enableScrollAnimation && scrollDistance > 0
      ? Math.max(
          0,
          Math.min(1, (scrollDistance - scrollOffset) / END_FADE_DISTANCE)
        )
      : 0
  const fadeStyle = {
    opacity: fadeOpacity,
  } satisfies CSSProperties

  return (
    <section
      ref={viewportRef}
      data-testid="home-highlighted"
      className={cn(
        'relative min-h-0 overflow-visible lg:overflow-hidden',
        className ?? 'mb-16'
      )}
    >
      {isLoading ? (
        <div className="h-full">
          <div
            ref={trackRef}
            style={trackStyle}
            className={FEATURE_CARD_GRID_CLASS_NAME}
          >
            <IndexDTFFeatureIdentityCards />
            <HighlightedDTFEndCardPlaceholder
              fullWidth={HIGHLIGHTED_LIMIT % 2 === 0}
            />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-secondary/0 to-secondary transition-opacity duration-200"
            style={fadeStyle}
          />
        </div>
      ) : (
        <div className="h-full">
          <CollateralAssetAnimationStyles />
          <div
            ref={trackRef}
            style={trackStyle}
            className={FEATURE_CARD_GRID_CLASS_NAME}
          >
            {highlighted.map((dtf) => (
              <IndexDTFFeatureCard
                key={`${dtf.chainId}-${dtf.address}`}
                dtf={dtf}
              />
            ))}
            <HighlightedDTFEndCard fullWidth={highlighted.length % 2 === 0} />
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-secondary/0 to-secondary transition-opacity duration-200"
            style={fadeStyle}
          />
        </div>
      )}
    </section>
  )
}

export default HighlightedDTFs
