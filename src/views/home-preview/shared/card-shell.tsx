import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ChainId } from '@/utils/chains'
import { EUSD_ADDRESS } from '@/utils/addresses'
import { getTokenRoute } from '@/utils'
import {
  FEATURE_CARD_ASSET_TICKER_CLASS_NAME,
  FEATURE_CARD_CLASS_NAME,
  FEATURE_CARD_HEADER_CLASS_NAME,
  FEATURE_CARD_MEDIA_CLASS_NAME,
} from '@/views/home/components/highlighted-dtfs/constants'
import { ArrowRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// Card shell and tickers without chart code, so loading states can render the same frame cheaply.
export const EUSD_ROUTE = getTokenRoute(
  EUSD_ADDRESS[ChainId.Mainnet],
  ChainId.Mainnet
)

type TickerItem = { key: string; label: string; value?: string; color?: string }

// Mirrors FeatureCardAssetTicker: scrolls on hover on desktop, always on touch screens.
export const HomeTicker = ({ items }: { items: TickerItem[] }) => (
  <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
    <div
      className={cn(
        'pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent opacity-100 transition-opacity duration-150',
        'lg:opacity-65 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'
      )}
    />
    <div className="flex overflow-hidden pl-2 pr-12">
      <div
        className={cn(
          'flex w-max gap-0 motion-reduce:animate-none',
          '[animation:collateral-assets-scroll_18s_linear_infinite]',
          'lg:[animation:none] lg:group-hover:[animation:collateral-assets-scroll_18s_linear_infinite]'
        )}
      >
        {[...items, ...items].map((item, i) => (
          <div
            key={`${item.key}-${i}`}
            className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1"
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
      className={cn(
        'absolute right-2 top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 shrink-0 items-center justify-center rounded-full bg-muted text-foreground opacity-100 transition-colors duration-150',
        'lg:bg-card lg:opacity-0 lg:group-hover:bg-muted lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'
      )}
      aria-hidden="true"
    >
      <ArrowRight size={16} />
    </span>
  </div>
)

const CardRoot = ({
  href,
  external,
  className,
  children,
}: {
  href?: string
  external?: boolean
  className?: string
  children: React.ReactNode
}) => {
  const cls = cn(FEATURE_CARD_CLASS_NAME, 'select-none', className)
  if (!href) return <article className={cls}>{children}</article>
  if (external || href.startsWith('mailto:'))
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel="noreferrer"
        className={cls}
      >
        {children}
      </a>
    )
  return (
    <Link to={href} className={cls}>
      {children}
    </Link>
  )
}

// Swaps a skeleton for real content in place: same box, content fades in while the skeleton fades out on top.
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
    const t = window.setTimeout(() => setOverlay(false), 500)
    return () => window.clearTimeout(t)
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

export const HomeCard = ({
  href,
  external,
  icon,
  title,
  value,
  note,
  media,
  mediaClassName,
  ticker,
  tickerSlot,
  description,
  action,
  className,
  loading = false,
  revealed,
}: {
  href?: string
  external?: boolean
  icon?: React.ReactNode
  title: string
  value?: string
  note?: string
  media: React.ReactNode
  mediaClassName?: string
  ticker?: TickerItem[]
  tickerSlot?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
  loading?: boolean
  // Data cards: false shows skeletons at the final sizes, true crossfades the content in.
  revealed?: boolean
}) => {
  const ready = revealed ?? !loading
  const gated = revealed !== undefined || loading
  const gate = (node: React.ReactNode, skeleton: React.ReactNode) =>
    gated ? (
      <Reveal ready={ready} skeleton={skeleton}>
        {node}
      </Reveal>
    ) : (
      node
    )

  return (
    <CardRoot href={href} external={external} className={className}>
      <div className={FEATURE_CARD_MEDIA_CLASS_NAME}>
        <div className={FEATURE_CARD_HEADER_CLASS_NAME}>
          {icon}
          <h2 className="mt-3 text-xl leading-tight">{title}</h2>
          {(value || gated) &&
            gate(
              <p
                className={cn(
                  'flex flex-wrap items-baseline gap-x-3 text-lg',
                  gated && 'h-7'
                )}
              >
                <span className="tabular-nums">{value}</span>
                {note && (
                  <span
                    className={cn(
                      'tabular-nums',
                      /^[+-]/.test(note) ? 'text-success' : 'text-legend'
                    )}
                  >
                    {note}
                  </span>
                )}
              </p>,
              <ValueSkeleton />
            )}
        </div>
        <div className={cn('relative h-[180px]', mediaClassName)}>
          {gated ? (
            <Reveal ready={ready} skeleton={<MediaSkeleton />}>
              <div className="h-[180px]">{media}</div>
            </Reveal>
          ) : (
            media
          )}
        </div>
      </div>
      {gate(
        tickerSlot ?? (ticker && <HomeTicker items={ticker} />),
        <TickerSkeleton />
      )}
      {(description || action || gated) && (
        <div
          className={cn(
            'flex flex-col gap-2 px-4 pb-4 pt-2 text-sm',
            gated && 'min-h-[4rem]'
          )}
        >
          {gate(
            <>
              {description && <p className="text-legend">{description}</p>}
              {action}
            </>,
            <DescriptionSkeleton />
          )}
        </div>
      )}
    </CardRoot>
  )
}

const TICKER_PX_PER_SECOND = 48

// Always moving at one shared speed: duration follows the measured width of each list.
export const AutoTicker = ({ items }: { items: TickerItem[] }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(20)

  useLayoutEffect(() => {
    const el = trackRef.current
    if (!el) return
    setDuration(Math.max(8, el.scrollWidth / 2 / TICKER_PX_PER_SECOND))
  }, [items])

  return (
    <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
      <div className="pointer-events-none absolute inset-y-0 -right-px z-10 w-20 bg-gradient-to-l from-card via-card to-transparent" />
      <div className="flex overflow-hidden pl-2 pr-12">
        <div
          ref={trackRef}
          className="flex w-max gap-0 motion-reduce:[animation:none!important]"
          style={{
            animation: `collateral-assets-scroll ${duration}s linear infinite`,
          }}
        >
          {[...items, ...items].map((item, i) => (
            <div
              key={`${item.key}-${i}`}
              className="flex shrink-0 items-center gap-1 rounded-full px-1.5 py-1"
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

export const TickerSkeleton = () => (
  <div className={FEATURE_CARD_ASSET_TICKER_CLASS_NAME}>
    <div className="flex gap-3 py-1 pl-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-5 w-24" />
    </div>
  </div>
)
