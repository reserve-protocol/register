import { useEffect, useRef, useState } from 'react'
import { InlineAction } from '@/components/button'
import { Link } from '@/components/design-system-v1/link'
import { Skeleton } from '@/components/design-system-v1/loading'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/design-system-v1/popover'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import type { OwnedPosition } from './owned-fixtures'

export function OwnedGoverns({
  row,
  loading,
}: {
  row: OwnedPosition
  loading: boolean
}) {
  if (loading) return <Skeleton className="h-6 w-24 max-w-full" />
  if (!row.governs.length)
    return (
      <span className={cn(type.body, 'text-supporting-foreground')}>—</span>
    )
  return (
    <div className={cn(type.body, 'min-w-0 [overflow-wrap:anywhere]')}>
      {row.governs.slice(0, 2).map((asset, index) => (
        <span key={asset.href}>
          {index > 0 && <span aria-hidden>, </span>}
          <span className="inline-flex max-w-full items-baseline gap-2 align-baseline">
            <Link
              href={asset.href}
              target="_blank"
              treatment="contextual"
              className="min-w-0"
              aria-label={`${asset.name} (${asset.symbol}), opens in a new tab`}
              data-table-focus={`governs-${row.id}-${index}`}
            >
              {asset.symbol}
            </Link>
            {index === 1 && row.governs.length > 2 && (
              <GovernedList key={row.id} row={row} />
            )}
          </span>
        </span>
      ))}
    </div>
  )
}

function GovernedList({ row }: { row: OwnedPosition }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const pinned = useRef(false)
  const cancel = () => clearTimeout(timer.current)
  const leave = () => {
    cancel()
    if (!pinned.current) timer.current = setTimeout(() => setOpen(false), 200)
  }
  const focusKey = `governs-expand-${row.id}`

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => {
    const element = trigger.current
    const root = element?.closest('[data-slot="table-family-container"]')
    if (!open || !element || !root) return
    const observer = new ResizeObserver(() => {
      if (!element.getClientRects().length) {
        clearTimeout(timer.current)
        setOpen(false)
      }
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [open])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        cancel()
        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <InlineAction
          ref={trigger}
          treatment="contextual"
          className="text-supporting-foreground"
          aria-label={`Show all ${row.governs.length} governed DTFs`}
          data-table-focus={focusKey}
          onPointerEnter={(event) => {
            if (event.pointerType !== 'mouse') return
            cancel()
            timer.current = setTimeout(() => setOpen(true), 150)
          }}
          onPointerLeave={leave}
          onClick={(event) => {
            event.preventDefault()
            cancel()
            const next = !open || !pinned.current
            pinned.current = next
            setOpen(next)
            if (open && next)
              content.current
                ?.querySelector('a')
                ?.focus({ preventScroll: true })
          }}
        >
          +{row.governs.length - 2}
        </InlineAction>
      </PopoverTrigger>
      <PopoverContent
        ref={content}
        align="start"
        className="w-72 overflow-y-auto p-4"
        aria-label="Governed DTFs"
        data-testid="owned-governed-assets"
        onPointerEnter={cancel}
        onPointerLeave={leave}
        onFocusCapture={() => {
          pinned.current = true
          cancel()
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          if (pinned.current)
            content.current?.querySelector('a')?.focus({ preventScroll: true })
        }}
        onCloseAutoFocus={(event) => {
          const element = trigger.current
          if (!pinned.current) event.preventDefault()
          else if (!element?.getClientRects().length) {
            event.preventDefault()
            const root = element?.closest(
              '[data-slot="table-family-container"]'
            )
            const target = [
              ...(root?.querySelectorAll<HTMLElement>('[data-table-focus]') ??
                []),
            ].find(
              (candidate) =>
                candidate.dataset.tableFocus === focusKey &&
                candidate.getClientRects().length
            )
            target?.focus({ preventScroll: true })
          }
          pinned.current = false
        }}
      >
        <p className={cn(type.label, 'mb-2 text-supporting-foreground')}>
          Governed DTFs
        </p>
        <ul className="space-y-2">
          {row.governs.map((asset) => (
            <li key={asset.href}>
              <Link
                href={asset.href}
                target="_blank"
                treatment="contextual"
                className="block min-h-11 whitespace-normal py-1 [overflow-wrap:anywhere]"
                aria-label={`${asset.name} (${asset.symbol}), opens in a new tab`}
              >
                <span className="block">{asset.symbol}</span>
                <span
                  className={cn(
                    type.supporting,
                    'block text-supporting-foreground'
                  )}
                >
                  {asset.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
