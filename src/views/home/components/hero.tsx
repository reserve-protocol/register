import { cn } from '@/lib/utils'
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
      'text-[36px] font-normal max-w-[400px] leading-[1.25] text-primary dark:text-foreground',
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
        'flex gap-1 min-w-0 overflow-hidden bg-card/20',
        'lg:overflow-visible',
        'lg:rounded-full lg:px-[64px] lg:py-6',
        'lg:border-2 lg:border-card',
        'lg:backdrop-blur-[7px]',
        'lg:shadow-[0_20px_70px_rgba(0,0,0,0.06)]'
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

  const updateScrollOffset = useCallback(() => {
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
  }, [scrollDistance])

  useEffect(() => {
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
  }, [updateScrollOffset])

  const handleScrollDistanceChange = useCallback((distance: number) => {
    setScrollDistance((currentDistance) =>
      currentDistance === distance ? currentDistance : distance
    )
  }, [])

  const stageStyle = {
    '--highlighted-scroll-distance': `${scrollDistance}px`,
  } as CSSProperties
  const isStatsHidden = scrollOffset > 8

  return (
    <div
      ref={stageRef}
      style={stageStyle}
      className="relative rounded-t-4xl h-[calc(100svh-56px+var(--highlighted-scroll-distance))] md:h-[calc(100svh-72px+var(--highlighted-scroll-distance))]"
    >
      <div className="sticky top-0 flex h-[calc(100svh-56px)] min-h-0 flex-col overflow-hidden md:h-[calc(100svh-72px)]">
        <div className="grid gap-1 min-h-0 bg-secondary rounded-t-4xl border-[4px] border-b-0 border-secondary overflow-hidden flex-1 grid-cols-[minmax(0,1fr)_minmax(420px,1fr)]">
          <div className="flex min-h-0 flex-col items-center bg-background justify-center gap-4 rounded-3xl rounded-bl-none p-4 pb-[156px]">
            <div className="flex w-full max-w-[520px] flex-col items-center">
              <DTFPackingAnimation />
              <Header className="text-center mb-3" />
              <SubHeader className="text-center" />
            </div>
          </div>
          <HighlightedDTFs
            className="min-h-0"
            onScrollDistanceChange={handleScrollDistanceChange}
            scrollOffset={scrollOffset}
          />
        </div>
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-5 z-20 flex flex-col gap-2 px-0 transition-all duration-300 ease-out lg:bottom-10 lg:flex-row lg:justify-center lg:px-6',
            isStatsHidden
              ? 'translate-y-4 opacity-0'
              : 'translate-y-0 opacity-100'
          )}
        >
          <div className="pointer-events-auto">
            <MetricsContainer />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
