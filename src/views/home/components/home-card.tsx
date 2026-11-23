import { Skeleton } from '@/components/ui/skeleton'
import { trackClick } from '@/hooks/useTrackPage'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FEATURE_CARD_ASSET_TICKER_CLASS_NAME as FEATURE_CARD_TICKER_CLASS_NAME,
  FEATURE_CARD_CLASS_NAME,
  FEATURE_CARD_HEADER_CLASS_NAME,
  FEATURE_CARD_MEDIA_CLASS_NAME,
} from './highlighted-dtfs/constants'

type TickerItem = { key: string; label: string; value?: string; color?: string }

const TICKER_PX_PER_SECOND = 48
const TICKER_MIN_ITEMS = 10

const CardRoot = ({
  href,
  cta,
  className,
  children,
}: {
  href?: string
  cta?: string
  className?: string
  children: React.ReactNode
}) => {
  const cls = cn(FEATURE_CARD_CLASS_NAME, 'select-none', className)
  if (!href) return <article className={cls}>{children}</article>

  const onClick = cta ? () => trackClick('home', cta) : undefined
  if (href.startsWith('/'))
    return (
      <Link to={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    )
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cls}
      onClick={onClick}
    >
      {children}
    </a>
  )
}

// Same box for skeleton and content: the content fades in while the skeleton fades out on top.
export const Reveal = ({
  ready,
  skeleton,
  children,
}: {
  ready: boolean
  skeleton: React.ReactNode
  children: React.ReactNode
}) => {
  const [overlay, setOverlay] = useState(!ready)
  useEffect(() => {
    if (!ready) {
      setOverlay(true)
      return
    }
    const timeout = window.setTimeout(() => setOverlay(false), 500)
    return () => window.clearTimeout(timeout)
  }, [ready])

  if (!ready) return <>{skeleton}</>
  return (
    <div className="relative">
      <div className="duration-500 animate-in fade-in fill-mode-both motion-reduce:animate-none">
        {children}
      </div>
      {overlay && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 duration-500 animate-out fade-out fill-mode-forwards motion-reduce:hidden"
        >
          {skeleton}
        </div>
      )}
    </div>
  )
}

const ValueSkeleton = () => (
  <div className="flex h-7 items-center">
    <Skeleton className="h-5 w-44" />
  </div>
)

const DescriptionSkeleton = () => (
  <div className="flex flex-col">
    <div className="flex h-5 items-center">
      <Skeleton className="h-3.5 w-full" />
    </div>
    <div className="flex h-5 items-center">
      <Skeleton className="h-3.5 w-2/3" />
    </div>
  </div>
)

const MediaSkeleton = () => (
  <div className="flex h-full items-end px-4 pb-3">
    <Skeleton className="h-[85%] w-full rounded-xl" />
  </div>
)

const TickerSkeleton = () => (
  <div className={FEATURE_CARD_TICKER_CLASS_NAME}>
    <div className="flex gap-3 py-1 pl-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-24" />
    </div>
  </div>
)

export const HomeCard = ({
  href,
  cta,
  icon,
  title,
  value,
  media,
  mediaClassName,
  ticker,
  description,
  className,
  revealed,
}: {
  href?: string
  cta?: string
  icon?: React.ReactNode
  title: React.ReactNode
  value?: string
  media: React.ReactNode
  mediaClassName?: string
  ticker?: React.ReactNode
  description?: React.ReactNode
  className?: string
  // Data cards: false shows skeletons at the final sizes, true crossfades the content in.
  revealed?: boolean
}) => {
  const gated = revealed !== undefined
  const gate = (node: React.ReactNode, skeleton: React.ReactNode) =>
    gated ? (
      <Reveal ready={revealed} skeleton={skeleton}>
        {node}
      </Reveal>
    ) : (
      node
    )

  return (
    <CardRoot href={href} cta={cta} className={className}>
      <div className={FEATURE_CARD_MEDIA_CLASS_NAME}>
        <div className={FEATURE_CARD_HEADER_CLASS_NAME}>
          {icon}
          <h2 className="mt-3 text-xl leading-tight">{title}</h2>
          {(value || gated) &&
            gate(
              <p className={cn('text-lg tabular-nums', gated && 'h-7')}>
                {value}
              </p>,
              <ValueSkeleton />
            )}
        </div>
        <div className={cn('relative h-[180px]', mediaClassName)}>
          {gated ? (
            <Reveal ready={revealed} skeleton={<MediaSkeleton />}>
              <div className="h-[180px]">{media}</div>
            </Reveal>
          ) : (
            media
          )}
        </div>
      </div>
      {gate(ticker, <TickerSkeleton />)}
      {(description || gated) && (
        <div
          className={cn(
            'px-4 pb-4 pt-2 text-sm text-legend',
            gated && 'min-h-[4rem]'
          )}
        >
          {gate(<p>{description}</p>, <DescriptionSkeleton />)}
        </div>
      )}
    </CardRoot>
  )
}

// The track is duplicated and loops at exactly -50%, so the seam never shows.
export const AutoTicker = ({ items }: { items: TickerItem[] }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(20)
  // Short lists repeat inside each half so the track always outruns a wide card.
  const half = Array.from(
    { length: Math.ceil(TICKER_MIN_ITEMS / items.length) },
    () => items
  ).flat()

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    setDuration(Math.max(8, track.scrollWidth / 2 / TICKER_PX_PER_SECOND))
  }, [items])

  return (
    <div className={FEATURE_CARD_TICKER_CLASS_NAME}>
      <style>{`@keyframes home-ticker { to { transform: translate3d(-50%, 0, 0); } }`}</style>
      <div className="pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent" />
      <div className="flex overflow-hidden pl-2 pr-12">
        <div
          ref={trackRef}
          className="flex w-max gap-0 motion-reduce:[animation:none!important]"
          style={{ animation: `home-ticker ${duration}s linear infinite` }}
        >
          {[...half, ...half].map((item, i) => (
            <div
              key={`${item.key}-${i}`}
              className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1"
              aria-hidden={i >= items.length || undefined}
            >
              {item.color && (
                <span
                  className="ml-1 h-2 w-2 rounded-full"
                  style={{ background: item.color }}
                  aria-hidden="true"
                />
              )}
              <span className="ml-1 text-sm text-foreground">{item.label}</span>
              {item.value && (
                <span className="text-sm text-legend">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <span
        className="absolute right-2 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-foreground lg:bg-card lg:group-hover:bg-muted"
        aria-hidden="true"
      >
        <ArrowRight size={16} />
      </span>
    </div>
  )
}
