import { useIsLargeDesktop } from '@/hooks/use-media-query'
import { cn } from '@/lib/utils'
import {
  END_FADE_DISTANCE,
  FEATURE_CARD_GRID_CLASS_NAME,
} from '@/views/home/components/highlighted-dtfs/constants'
import ProtocolMetrics from '@/views/home/components/protocol-metrics'
import { useHighlightedScrollMetrics } from '@/views/home/hooks/use-highlighted-dtf-animation'
import { useHomepageHeroScroll } from '@/views/home/hooks/use-homepage-hero-scroll'
import { Children, type CSSProperties } from 'react'

// Same frame, stats pill and sticky card track as views/home/components/homepage-hero.tsx.
const MetricsContainer = ({ isVisible }: { isVisible: boolean }) => (
  <div
    className={cn(
      'relative flex w-full min-w-0 gap-1 overflow-hidden rounded-none border-t-2 border-transparent px-6 py-4',
      'lg:w-auto lg:overflow-visible lg:rounded-full lg:border-2 lg:px-16 lg:py-6'
    )}
  >
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] backdrop-blur-[7px]',
        isVisible
          ? 'opacity-100 transition-none'
          : 'opacity-0 transition-opacity duration-300 ease-out'
      )}
    />
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] border-t-2 border-card bg-card/20 shadow-[0_-20px_70px_rgba(0,0,0,0.1)] transition-opacity duration-300 ease-out',
        'lg:border-2 lg:shadow-[0_20px_70px_rgba(0,0,0,0.1)]',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    />
    <div
      className={cn(
        'relative z-10 w-full min-w-0 transition-opacity duration-300 ease-out lg:w-auto',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <ProtocolMetrics />
    </div>
  </div>
)

const CardTrack = ({
  children,
  enableScrollAnimation,
  onScrollDistanceChange,
  scrollOffset,
}: {
  children: React.ReactNode
  enableScrollAnimation: boolean
  onScrollDistanceChange: (distance: number) => void
  scrollOffset: number
}) => {
  const { scrollDistance, trackRef, viewportRef } = useHighlightedScrollMetrics<
    HTMLElement,
    HTMLDivElement
  >({
    isLoading: false,
    itemCount: Children.count(children),
    onScrollDistanceChange,
  })
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

  return (
    <section
      ref={viewportRef}
      className="relative min-h-0 overflow-visible lg:overflow-hidden"
    >
      <div className="h-full">
        <div
          ref={trackRef}
          style={trackStyle}
          className={FEATURE_CARD_GRID_CLASS_NAME}
        >
          {children}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-secondary/0 to-secondary transition-opacity duration-200"
          style={{ opacity: fadeOpacity }}
        />
      </div>
    </section>
  )
}

const GridStage = ({
  left,
  cards,
  leftClassName,
}: {
  left: React.ReactNode
  cards: React.ReactNode
  leftClassName?: string
}) => {
  const isWideDesktop = useIsLargeDesktop()
  const {
    handleScrollDistanceChange,
    isStatsHidden,
    scrollOffset,
    stageRef,
    stageStyle,
  } = useHomepageHeroScroll(isWideDesktop)

  return (
    <div
      ref={stageRef}
      style={stageStyle}
      className={cn(
        'relative h-auto rounded-4xl',
        'lg:mx-2',
        'xl:h-[calc(100svh-72px+var(--highlighted-scroll-distance))]',
        '2xl:mx-0'
      )}
    >
      <div
        className={cn(
          'flex min-h-0 flex-col overflow-visible',
          'xl:sticky xl:top-0 xl:h-[calc(100svh-72px)] xl:overflow-hidden'
        )}
      >
        <div
          className={cn(
            'grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-1 overflow-hidden border-[4px] border-secondary bg-secondary',
            'lg:rounded-4xl',
            'xl:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)] xl:grid-rows-1'
          )}
        >
          <div
            className={cn(
              'flex min-h-0 flex-col items-center justify-center gap-4 rounded-3xl rounded-t-none bg-background p-4 pb-10',
              'lg:rounded-3xl lg:rounded-b-3xl lg:pb-[132px]',
              'xl:pb-[184px]',
              leftClassName
            )}
          >
            {left}
          </div>
          <CardTrack
            enableScrollAnimation={isWideDesktop}
            onScrollDistanceChange={handleScrollDistanceChange}
            scrollOffset={scrollOffset}
          >
            {cards}
          </CardTrack>
        </div>
        <div
          className={cn(
            'pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col gap-2 transition-transform duration-300 ease-out',
            'lg:bottom-10 lg:items-center lg:px-6',
            'xl:absolute xl:inset-x-0 xl:flex-row xl:justify-center',
            isStatsHidden ? 'translate-y-4' : 'translate-y-0'
          )}
        >
          <div
            className={cn(
              'min-w-0 lg:w-auto',
              isStatsHidden ? 'pointer-events-none' : 'pointer-events-auto'
            )}
          >
            <MetricsContainer isVisible={!isStatsHidden} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GridStage
