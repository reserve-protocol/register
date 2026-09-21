import { type Table } from '@tanstack/react-table'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Check,
} from 'lucide-react'
import { InlineAction } from '@/components/button'
import { IconButton } from '@/components/icon-button'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from '@/components/design-system-v1/menu'

export const positionSortOptions = [
  ['balance', 'Balance'],
  ['value', 'Value'],
  ['performance', 'Performance (7D)'],
  ['pnl', 'Unrealized P/L'],
  ['cost', 'Avg Cost'],
  ['cap', 'Market Cap'],
] as const

export function SortMenu<T>({
  table,
  options = positionSortOptions,
  className = 'px-6 pb-2 [@container(min-width:64rem)]:hidden',
  iconOnly = false,
}: {
  table: Table<T>
  options?: readonly (readonly [string, string])[]
  className?: string
  iconOnly?: boolean
}) {
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const container = trigger.current?.closest(
      '[data-slot="table-family-container"]'
    )
    if (!container) return
    const observer = new ResizeObserver(() => {
      if (!trigger.current?.getClientRects().length) setOpen(false)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])
  const current = table.getState().sorting[0] ?? { id: 'value', desc: true }
  const label = options.find(([id]) => id === current?.id)?.[1]
  const descending = current?.desc ?? true
  const triggerProps = {
    ref: trigger,
    'data-table-focus': 'sort',
    'data-testid': 'table-sort-menu',
    'aria-description': descending ? 'descending' : 'ascending',
  }
  return (
    <div className={className}>
      <Menu open={open} onOpenChange={setOpen}>
        <MenuTrigger asChild>
          {iconOnly ? (
            <IconButton
              {...triggerProps}
              size="default"
              tone="quiet"
              label={`Sort by: ${label}`}
              icon={
                descending ? (
                  <ArrowDownWideNarrow aria-hidden />
                ) : (
                  <ArrowUpNarrowWide aria-hidden />
                )
              }
            />
          ) : (
            <InlineAction {...triggerProps}>
              Sort by: {label}
              {descending ? (
                <ArrowDown aria-hidden className="ml-1 size-3.5" />
              ) : (
                <ArrowUp aria-hidden className="ml-1 size-3.5" />
              )}
            </InlineAction>
          )}
        </MenuTrigger>
        <MenuContent
          align={iconOnly ? 'end' : 'start'}
          data-testid="table-sort-options"
          onCloseAutoFocus={(event) => {
            if (trigger.current?.getClientRects().length) return
            event.preventDefault()
            trigger.current
              ?.closest('[data-slot="table-family-container"]')
              ?.querySelector<HTMLElement>(
                '[data-table-focus="sort"][aria-description]:not([data-testid="table-sort-menu"])'
              )
              ?.focus({ preventScroll: true })
          }}
        >
          <div role="group" aria-label="Sort by">
            {options.map(([id, name]) => (
              <MenuItem
                key={id}
                data-testid={`table-sort-field-${id}`}
                role="menuitemradio"
                aria-checked={current.id === id}
                trailingVisual={current?.id === id ? <Check /> : undefined}
                onSelect={() => table.setSorting([{ id, desc: descending }])}
              >
                {name}
              </MenuItem>
            ))}
          </div>
          <MenuSeparator />
          <div role="group" aria-label="Sort direction">
            {(['asc', 'desc'] as const).map((direction) => (
              <MenuItem
                key={direction}
                data-testid={`table-sort-direction-${direction}`}
                role="menuitemradio"
                aria-checked={descending === (direction === 'desc')}
                trailingVisual={
                  descending === (direction === 'desc') ? <Check /> : undefined
                }
                onSelect={() =>
                  table.setSorting([
                    { id: current.id, desc: direction === 'desc' },
                  ])
                }
              >
                {direction === 'asc' ? 'Ascending' : 'Descending'}
              </MenuItem>
            ))}
          </div>
        </MenuContent>
      </Menu>
    </div>
  )
}
