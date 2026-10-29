import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@/components/design-system-v1/link'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/design-system-v1/popover'
import { LifecycleStatusPill } from '@/components/lifecycle-status'
import { Skeleton } from '@/components/design-system-v1/loading'
import { MetricValue } from '@/components/metric'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { getFolioRoute } from '@/utils'
import { IdentityCell } from './cells'
import { finiteValue, type DiscoverRow } from './discover-fixtures'
import { DiscoverAssetStrip } from './discover-asset-strip'
import { MarketTokenStackTrigger as TokenStackTrigger } from '../market-identity'

export function DiscoverIdentity({
  row,
  loading = false,
}: {
  row: DiscoverRow
  loading?: boolean
}) {
  if (loading)
    return <IdentityCell name="" symbol="" chain={row.chainId} loading />
  return (
    <div className="min-w-0 space-y-2">
      <Link
        asChild
        treatment="contextual"
        className="block hover:no-underline"
        data-table-focus={`name-${row.address}`}
      >
        <RouterLink
          to={getFolioRoute(row.address, row.chainId)}
          onClick={(event) => event.stopPropagation()}
        >
          <IdentityCell
            name={row.name}
            symbol={row.symbol}
            chain={row.chainId}
            address={row.address}
            src={row.brand.icon}
            supporting={
              <span className="block whitespace-normal break-words">
                ${row.symbol} <span aria-hidden="true">·</span>{' '}
                {row.brand.tags.length ? row.brand.tags.join(', ') : 'No tags'}
              </span>
            }
          />
        </RouterLink>
      </Link>
      {row.status !== 'active' && (
        <LifecycleStatusPill role="closed">Inactive</LifecycleStatusPill>
      )}
    </div>
  )
}

export function DiscoverMoney({
  value,
  compact = false,
  loading = false,
  precision,
  textRole = 'body',
}: {
  value: number | null
  compact?: boolean
  loading?: boolean
  precision?: number
  textRole?: 'body' | 'supporting'
}) {
  const amount = finiteValue(value)
  if (loading)
    return (
      <Skeleton
        className={cn(
          'ml-auto w-20',
          textRole === 'supporting' ? 'h-5' : 'h-6'
        )}
      />
    )
  const text =
    amount === null
      ? '—'
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: compact ? 'compact' : 'standard',
          minimumFractionDigits: precision ?? (amount === 0 ? 2 : 0),
          maximumFractionDigits: precision ?? (compact && amount !== 0 ? 1 : 5),
        }).format(amount)
  return (
    <MetricValue
      align="end"
      className={cn(
        type[textRole],
        'block whitespace-nowrap',
        amount === null && 'text-supporting-foreground'
      )}
    >
      {text}
    </MetricValue>
  )
}

export function DiscoverBasket({
  row,
  loading = false,
}: {
  row: DiscoverRow
  loading?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const pinned = useRef(false)
  const restoreFocus = useRef(false)
  const content = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => {
    pinned.current = false
    setOpen(false)
  }
  const leave = (target: EventTarget | null) => {
    if (pinned.current) return
    if (
      target instanceof Node &&
      (content.current?.contains(target) || trigger.current?.contains(target))
    )
      return
    setOpen(false)
  }
  useEffect(() => {
    if (!open) return
    const container = trigger.current?.closest(
      '[data-slot="table-family-container"]'
    )
    if (!container) return
    const observer = new ResizeObserver(() => {
      if (!trigger.current?.getClientRects().length) {
        pinned.current = false
        setOpen(false)
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [open])
  if (loading) return <Skeleton className="h-6 w-28" />
  if (!row.basket.length)
    return (
      <span
        className={cn(type.body, 'text-supporting-foreground')}
        aria-label="No data"
      >
        —
      </span>
    )
  const tokens = row.basket
    .slice(0, 4)
    .map((token) => ({ ...token, chain: row.chainId }))
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
    >
      <PopoverTrigger asChild>
        <TokenStackTrigger
          ref={trigger}
          tokens={tokens}
          remainingCount={row.basket.length - tokens.length}
          className="group-hover/discover-row:bg-foreground/5 group-focus-within/discover-row:bg-foreground/5 hover:!bg-muted focus-visible:!bg-muted active:!bg-border/70 data-[state=open]:bg-muted"
          data-table-focus={`basket-${row.address}`}
          aria-label="Basket"
          aria-description={row.name}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'mouse') return
            if (pinned.current) return
            restoreFocus.current = false
            setPaused(false)
            setOpen(true)
          }}
          onPointerLeave={(event) => leave(event.relatedTarget)}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            if (pinned.current) return close()
            pinned.current = true
            restoreFocus.current = true
            setPaused(true)
            setOpen(true)
            content.current
              ?.querySelector<HTMLElement>('[data-slot="asset-strip-viewport"]')
              ?.focus()
          }}
        />
      </PopoverTrigger>
      <PopoverContent
        ref={content}
        aria-label="Collateral:"
        className="w-[300px] overflow-visible rounded-full border-border bg-card p-0 before:absolute before:inset-x-0 before:h-2 data-[side=bottom]:before:bottom-full data-[side=top]:before:top-full"
        align="start"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={(event) => leave(event.relatedTarget)}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          if (pinned.current)
            content.current
              ?.querySelector<HTMLElement>('[data-slot="asset-strip-viewport"]')
              ?.focus()
        }}
        onClick={(event) => event.stopPropagation()}
        onInteractOutside={(event) => {
          if (!trigger.current?.contains(event.target as Node))
            restoreFocus.current = false
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          if (!restoreFocus.current) return
          if (trigger.current?.getClientRects().length) {
            trigger.current.focus({ preventScroll: true })
            return
          }
          const container = trigger.current?.closest(
            '[data-slot="table-family-container"]'
          )
          const next = [
            ...(container?.querySelectorAll<HTMLButtonElement>(
              '[data-table-focus]'
            ) ?? []),
          ].find(
            (element) =>
              element.dataset.tableFocus === `basket-${row.address}` &&
              element.getClientRects().length
          )
          next?.focus({ preventScroll: true })
        }}
      >
        <DiscoverAssetStrip assets={row.basket} paused={paused} open={open} />
      </PopoverContent>
    </Popover>
  )
}
