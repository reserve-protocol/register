import { cn } from '@/lib/utils'
import { useIsLargeDesktop } from '@/hooks/use-media-query'
import { Play } from 'lucide-react'
import DTFPackingAnimation from './dtf-packing-animation'
import DTFExplainerButton from './dtf-explainer-button'
import HighlightedDTFs from './highlighted-dtfs'
import ProtocolMetrics from './protocol-metrics'
import { Trans } from '@lingui/react/macro'
import { useHomepageHeroScroll } from '../hooks/use-homepage-hero-scroll'

const Header = ({ className }: { className?: string }) => (
  <h1
    className={cn(
      'max-w-[400px] text-[32px] font-normal leading-[1.25] text-primary',
      'dark:text-foreground',
      'md:text-3xl md:font-medium',
      className
    )}
  >
    <Trans>Reserve lets you buy entire portfolios as a single token</Trans>
  </h1>
)

const SubHeader = ({ className }: { className?: string }) => (
  <p
    className={cn(
      'flex flex-col items-center gap-0.5 leading-[1.25] text-foreground',
      'dark:text-foreground',
      className
    )}
  >
    <span className="text-lg dark:text-legend">
      <Trans>We call these tokenized portfolios DTFs:</Trans>
    </span>
    <span className="text-lg font-medium">
      <Trans>Decentralized Token Funds</Trans>
    </span>
    <DTFExplainerButton
      className={cn(
        'mt-6 h-9 w-fit rounded-full border-0 bg-transparent px-4 py-0 text-base text-muted-foreground',
        'hover:bg-primary hover:text-background',
        'dark:bg-transparent dark:text-legend dark:hover:bg-primary dark:hover:text-white'
      )}
    >
      <Play className="mr-1 h-4 w-4 fill-current" />
      <Trans>Watch explainer</Trans>
    </DTFExplainerButton>
  </p>
)

const MetricsContainer = ({ isVisible }: { isVisible: boolean }) => {
  return (
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
}

export const DTFSubHeader = () => (
  <div className="mt-12 mb-0 text-center">
    <SubHeader className="text-5xl font-normal" />
  </div>
)

const HomepageHero = () => {
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
              'xl:pb-[184px]'
            )}
          >
            <div className="flex w-full max-w-[520px] flex-col items-center">
              <DTFPackingAnimation />
              <Header className="text-center mb-3" />
              <SubHeader className="text-center" />
            </div>
          </div>
          <HighlightedDTFs
            className="min-h-0"
            enableScrollAnimation={isWideDesktop}
            onScrollDistanceChange={handleScrollDistanceChange}
            scrollOffset={scrollOffset}
          />
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

export default HomepageHero
