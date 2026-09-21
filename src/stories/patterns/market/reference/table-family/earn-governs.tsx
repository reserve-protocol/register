import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { InlineAction } from '@/components/button'
import { MarketTokenLogo as TokenLogo } from '../market-identity'
import { Skeleton } from '@/components/design-system-v1/loading'
import { Link } from '@/components/design-system-v1/link'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/design-system-v1/popover'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { EarnRow } from './earn-fixtures'

export function EarnGoverns({
  row,
  loading = false,
  align = 'start',
}: {
  row: EarnRow
  loading?: boolean
  align?: 'start' | 'end'
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const pinned = useRef(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const cancel = () => clearTimeout(timer.current)
  const enter = () => {
    cancel()
    timer.current = setTimeout(() => setOpen(true), 150)
  }
  const leave = () => {
    cancel()
    if (!pinned.current) timer.current = setTimeout(() => setOpen(false), 200)
  }
  useEffect(() => {
    const element = trigger.current
    const root = element?.closest('[data-slot="table-family-container"]')
    if (!element || !root) return cancel
    const observer = new ResizeObserver(() => {
      if (!element.getClientRects().length) {
        setOpen(false)
        cancel()
      }
    })
    observer.observe(root)
    return () => {
      observer.disconnect()
      cancel()
    }
  }, [loading, row.governs.length])
  useEffect(() => {
    if (loading) {
      cancel()
      setOpen(false)
      pinned.current = false
    }
  }, [loading])
  if (loading)
    return (
      <div className={cn('flex flex-col', align === 'end' && 'items-end')}>
        <Skeleton className="h-6 w-24" />
        {row.governs.length > 3 && (
          <div className="flex h-5 items-center">
            <Skeleton className="h-3 w-16" />
          </div>
        )}
      </div>
    )
  if (row.family === 'yield')
    return (
      <span className={cn(type.body, 'inline-flex w-fit items-center gap-2')}>
        <TokenLogo
          src={row.governs[0].logo}
          symbol={row.governs[0].symbol}
          size="md"
          alt=""
        />
        {row.governs[0].symbol}
      </span>
    )
  if (row.governs.length <= 3)
    return (
      <span className={type.body}>
        {row.governs.map((asset) => `$${asset.symbol}`).join(', ')}
      </span>
    )
  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        cancel()
        if (value) pinned.current = true
        setOpen(value)
      }}
    >
      <div
        className={cn(
          'flex min-w-0 flex-col',
          align === 'end' ? 'items-end' : 'items-start'
        )}
      >
        <span className={cn(type.body, 'block')}>${row.governs[0].symbol}</span>
        <PopoverTrigger asChild>
          <InlineAction
            ref={trigger}
            treatment="contextual"
            className={cn(type.supporting, 'text-supporting-foreground')}
            data-table-focus={`governs-${row.id}`}
            data-testid={`earn-governs-${row.id}`}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') enter()
            }}
            onPointerLeave={leave}
            onClick={(event) => event.stopPropagation()}
          >
            + {row.governs.length - 1} other{' '}
            <ChevronDown aria-hidden className="size-3.5" />
          </InlineAction>
        </PopoverTrigger>
      </div>
      <PopoverContent
        ref={content}
        className="w-72 overflow-y-auto p-4"
        align="start"
        data-testid="earn-governed-assets"
        aria-label="Governed DTFs"
        onPointerEnter={cancel}
        onPointerLeave={leave}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          if (pinned.current)
            content.current?.querySelector('a')?.focus({ preventScroll: true })
        }}
        onCloseAutoFocus={(event) => {
          if (!pinned.current) event.preventDefault()
          else if (!trigger.current?.getClientRects().length) {
            event.preventDefault()
            const root = trigger.current?.closest(
              '[data-slot="table-family-container"]'
            )
            const next = [
              ...(root?.querySelectorAll<HTMLButtonElement>(
                'button[data-table-focus]'
              ) ?? []),
            ].find(
              (element) =>
                element.dataset.tableFocus === `governs-${row.id}` &&
                element.getClientRects().length
            )
            next?.focus({ preventScroll: true })
          }
          pinned.current = false
        }}
      >
        <p className={cn(type.label, 'mb-3 text-supporting-foreground')}>
          Governed DTFs
        </p>
        <div className="space-y-3">
          {row.governs.slice(1).map((asset) => (
            <Link
              key={asset.href}
              href={asset.href}
              target="_blank"
              treatment="contextual"
              className="block whitespace-normal"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="block">${asset.symbol}</span>
              <span
                className={cn(
                  type.supporting,
                  'block text-supporting-foreground'
                )}
              >
                {asset.name}
              </span>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
