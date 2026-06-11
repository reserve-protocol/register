import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/hooks/use-media-query'
import { Play } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import DTFPackingAnimation from './dtf-packing-animation'
import DTFExplainerButton from './dtf-explainer-button'
import HighlightedDTFs from './highlighted-dtfs'
import ProtocolMetrics from './protocol-metrics'

const Header = ({ className }: { className?: string }) => (
  <h1
    className={cn(
      'text-[32px] font-normal max-w-[400px] leading-[1.25] text-primary dark:text-foreground md:text-[36px]',
      className
    )}
  >
    Reserve lets you buy entire portfolios as a single token
  </h1>
)

const SubHeader = ({ className }: { className?: string }) => (
  <p
    className={cn(
      'leading-[1.25] flex flex-col items-center gap-1 text-foreground dark:text-foreground',
      className
    )}
  >
    <span className="text-xl">We call these tokenized portfolios DTFs:</span>
    <span className="text-xl font-medium">Decentralized Token Folios</span>
    <DTFExplainerButton className="mt-6 h-9 w-fit rounded-full border-0 bg-transparent px-4 py-0 text-base text-primary hover:bg-primary hover:text-background dark:bg-transparent dark:text-primary dark:hover:bg-card dark:hover:text-primary/80">
      <Play className="mr-1 h-4 w-4 fill-current" />
      Watch explainer
    </DTFExplainerButton>
  </p>
)

const MetricsContainer = () => {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 gap-1 overflow-hidden rounded-full border-2 border-card bg-card/20 px-6 py-4 backdrop-blur-[7px] shadow-[0_20px_70px_rgba(0,0,0,0.06)]',
        'lg:w-auto lg:overflow-visible lg:px-[64px] lg:py-6'
      )}
    >
      <ProtocolMetrics />
    </div>
  )
}

export const DTFSubHeader = () => (
  <div className="mt-12 mb-0 text-center">
    <SubHeader className="text-5xl font-normal" />
  </div>
)

const Hero = () => {
  const stageRef = useRef<HTMLDivElement>(null)
  const [scrollDistance, setScrollDistance] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [mobileScrollOffset, setMobileScrollOffset] = useState(0)
  const isDesktop = useIsDesktop()

  const updateScrollOffset = useCallback(() => {
    if (!isDesktop) {
      setScrollOffset(0)
      return
    }

    const scroller = document.getElementById('app-container')
    const stage = stageRef.current
    if (!scroller || !stage) return

    const scrollerTop = scroller.getBoundingClientRect().top
    const stageTop = stage.getBoundingClientRect().top
    const progress = scrollerTop - stageTop
    const nextOffset = Math.max(0, Math.min(scrollDistance, progress))

    setScrollOffset((currentOffset) =>
      currentOffset === nextOffset ? currentOffset : nextOffset
    )
  }, [isDesktop, scrollDistance])

  useEffect(() => {
    if (!isDesktop) {
      setScrollOffset(0)
      return
    }

    const scroller = document.getElementById('app-container')
    if (!scroller) return

    let rafId = 0
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(rafId)
      rafId = window.requestAnimationFrame(updateScrollOffset)
    }

    scheduleUpdate()
    scroller.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.cancelAnimationFrame(rafId)
      scroller.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [isDesktop, updateScrollOffset])

  useEffect(() => {
    if (isDesktop) {
      setMobileScrollOffset(0)
      return
    }

    const scroller = document.getElementById('app-container')
    if (!scroller) return

    let rafId = 0
    const update = () => {
      window.cancelAnimationFrame(rafId)
      rafId = window.requestAnimationFrame(() => {
        setMobileScrollOffset(scroller.scrollTop)
      })
    }

    update()
    scroller.addEventListener('scroll', update, { passive: true })

    return () => {
      window.cancelAnimationFrame(rafId)
      scroller.removeEventListener('scroll', update)
    }
  }, [isDesktop])

  const handleScrollDistanceChange = useCallback((distance: number) => {
    setScrollDistance((currentDistance) =>
      currentDistance === distance ? currentDistance : distance
    )
  }, [])

  const stageStyle = {
    '--highlighted-scroll-distance': `${scrollDistance}px`,
  } as CSSProperties
  const isStatsHidden = isDesktop ? scrollOffset > 8 : mobileScrollOffset > 8

  return (
    <div
      ref={stageRef}
      style={stageStyle}
      className="relative h-auto rounded-t-4xl lg:h-[calc(100svh-72px+var(--highlighted-scroll-distance))]"
    >
      <div className="flex min-h-0 flex-col overflow-visible lg:sticky lg:top-0 lg:h-[calc(100svh-72px)] lg:overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-1 overflow-hidden lg:rounded-t-4xl border-[4px] border-b-0 border-secondary bg-secondary lg:grid-cols-[minmax(0,1fr)_minmax(420px,1fr)] lg:grid-rows-1">
          <div className="flex min-h-0 flex-col items-center p-4 pb-10 justify-center gap-4 rounded-3xl rounded-t-none lg:rounded-3xl lg:rounded-b-none bg-background lg:rounded-b-3xl lg:rounded-bl-none lg:pb-[156px]">
            <div className="flex w-full max-w-[520px] flex-col items-center">
              <DTFPackingAnimation />
              <Header className="text-center mb-3" />
              <SubHeader className="text-center" />
            </div>
          </div>
          <HighlightedDTFs
            className="min-h-0"
            enableScrollAnimation={isDesktop}
            onScrollDistanceChange={handleScrollDistanceChange}
            scrollOffset={scrollOffset}
          />
        </div>
        <div
          className={cn(
            'pointer-events-none fixed inset-x-1 bottom-1 z-20 flex flex-col gap-2 transition-all duration-300 ease-out lg:absolute lg:inset-x-0 lg:bottom-10 lg:flex-row lg:justify-center lg:px-6',
            isStatsHidden
              ? 'translate-y-4 opacity-0'
              : 'translate-y-0 opacity-100'
          )}
        >
          <div className="pointer-events-auto min-w-0 lg:w-auto">
            <MetricsContainer />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
