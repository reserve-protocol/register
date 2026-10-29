import { useEffect, useId, useMemo, useState } from 'react'
import DataTable from '@/components/ui/data-table'
import { TabsContent } from '@/components/design-system-v1/tabs'
import { Button } from '@/components/button'
import {
  InlineMessage,
  InlineMessageActions,
  InlineMessageDescription,
  InlineMessageTitle,
} from '@/components/design-system-v1/inline-message'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { holdingsColumns } from './holdings-columns'
import {
  holdingsSortOptions,
  type Holding,
  type HoldingsState,
  type HoldingsTab,
} from './holdings-fixtures'
import type { BridgeHandler } from './holdings-cells'
import { SortMenu } from './sort-menu'
import { useProjectionFocus } from './use-projection-focus'
import { HoldingsTabs } from './holdings-tabs'

export function HoldingsTable({
  rows,
  tab,
  state,
  onBridge,
}: {
  rows: Holding[]
  tab: HoldingsTab
  state: HoldingsState
  onBridge: BridgeHandler
}) {
  const panelId = useId()
  const root = useProjectionFocus()
  const [narrow, setNarrow] = useState(false)
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    if (!root.current) return
    const observer = new ResizeObserver(([entry]) => {
      const isNarrow = entry.contentRect.width < 768
      const focusedRow = document.activeElement?.closest('tbody tr')
      const rows = [...(root.current?.querySelectorAll('tbody tr') ?? [])]
      if (isNarrow && focusedRow && rows.indexOf(focusedRow) >= 10)
        setExpanded(true)
      setNarrow(isNarrow)
    })
    observer.observe(root.current)
    return () => observer.disconnect()
  }, [root])
  const columns = useMemo(
    () =>
      holdingsColumns(
        tab,
        state,
        onBridge,
        <HoldingsTabs panelId={panelId} projection="desktop" />
      ),
    [tab, state, onBridge, panelId]
  )
  return (
    <TabsContent
      value={tab}
      id={panelId}
      aria-labelledby={`${panelId}-${narrow ? 'mobile' : 'desktop'}-${tab}`}
      ref={root}
      data-slot="table-family-container"
      className="min-w-0 pt-[var(--screen-content-inset,theme(spacing.6))] [container-type:inline-size]"
    >
      <DataTable
        ariaLabel={`${tab === 'exposure' ? 'Exposure' : 'Collateral'} holdings`}
        // Every DTF has a basket, so no rows means its data failed to load.
        noResults={
          <InlineMessage tone="warning" className="text-left">
            <InlineMessageTitle>Holdings unavailable</InlineMessageTitle>
            <InlineMessageDescription>
              Basket data could not be loaded. Try again in a moment.
            </InlineMessageDescription>
            <InlineMessageActions>
              <Button tone="secondary" size="compact">
                Try again
              </Button>
            </InlineMessageActions>
          </InlineMessage>
        }
        noResultsClassName="h-auto px-[var(--screen-content-inset,theme(spacing.6))] py-4"
        columns={columns}
        data={rows}
        expandable={false}
        initialSorting={[{ id: 'weight', desc: true }]}
        rowLimit={narrow && !expanded ? 10 : undefined}
        renderToolbar={(table) => (
          <div
            data-slot="holdings-toolbar"
            className="flex items-center gap-2 px-[var(--screen-content-inset,theme(spacing.6))] [@container(min-width:48rem)]:hidden"
          >
            <div className="min-w-0 flex-1">
              <HoldingsTabs
                panelId={panelId}
                projection="mobile"
                size="default"
                width="full"
              />
            </div>
            <SortMenu
              table={table}
              options={holdingsSortOptions}
              iconOnly
              className="flex shrink-0 justify-end"
            />
          </div>
        )}
        className="[@container(min-width:48rem)]:pb-3 [&_table]:table-fixed [&_thead]:hidden [@container(min-width:48rem)]:[&_thead]:table-header-group [&_thead_tr]:h-auto [&_thead_tr]:border-b-0 [&_th]:h-auto [&_th]:pb-4 [&_th]:pt-0 [&_tr:last-child_[data-slot=row-seam]]:hidden"
        getRowClassName={() =>
          'border-b-0 [&:not(:first-child)]:!border-t-0 hover:bg-transparent'
        }
      />
      {narrow && rows.length > 10 && (
        <div className="flex justify-center px-[var(--screen-content-inset,theme(spacing.6))] pb-[var(--screen-content-inset,theme(spacing.6))] pt-2">
          <Button
            size="compact"
            tone="quiet"
            data-testid="holdings-expand"
            onClick={() => setExpanded((value) => !value)}
            trailingIcon={expanded ? <ChevronUp /> : <ChevronDown />}
          >
            {expanded
              ? 'View less'
              : `View all ${rows.length} ${tab === 'exposure' ? 'assets' : 'tokens'}`}
          </Button>
        </div>
      )}
    </TabsContent>
  )
}
