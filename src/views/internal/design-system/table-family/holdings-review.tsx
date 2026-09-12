import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Tabs, TabsContent } from '@/components/design-system-v1/tabs'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import BridgeInfoDialog from '@/views/index-dtf/overview/components/basket-overview/bridge-info-dialog'
import { cn } from '@/lib/utils'
import {
  HOLDINGS,
  BRIDGES,
  previewHoldings,
  type Holding,
  type HoldingsState,
  type HoldingsTab,
} from './holdings-fixtures'
import { HoldingsControls, type HoldingsWidth } from './holdings-controls'
import { HoldingsSpecimens } from './holdings-specimens'
import { HoldingsTable } from './holdings-table'
import { HoldingsTabs } from './holdings-tabs'

export function HoldingsReview() {
  const [dataset, setDataset] = useState<'cmc20' | 'photon'>('cmc20')
  const [state, setState] = useState<HoldingsState>('default')
  const [tab, setTab] = useState<HoldingsTab>('exposure')
  const [width, setWidth] = useState<HoldingsWidth>('full')
  const composition = useRef<HTMLDivElement>(null)
  const pendingTabFocus = useRef<string | null>(null)
  const panelId = useId()
  useLayoutEffect(() => {
    const key = pendingTabFocus.current
    pendingTabFocus.current = null
    if (!key) return
    const target = [
      ...(composition.current?.querySelectorAll<HTMLElement>(
        '[data-table-focus]'
      ) ?? []),
    ].find(
      (element) =>
        element.dataset.tableFocus === key && element.getClientRects().length
    )
    target?.focus({ preventScroll: true })
  }, [tab])
  const [bridge, setBridge] = useState<{
    row: Holding
    trigger: HTMLButtonElement
    container: Element | null
  } | null>(null)
  const openBridge = useCallback(
    (row: Holding, trigger: HTMLButtonElement) =>
      setBridge({
        row,
        trigger,
        container: trigger.closest('[data-slot="table-family-container"]'),
      }),
    []
  )
  const rows = useMemo(
    () => previewHoldings(HOLDINGS[dataset], state),
    [dataset, state]
  )
  return (
    <section
      id="holdings-family-review"
      data-testid="holdings-review"
      className="scroll-mt-40 space-y-6"
    >
      <div className="space-y-1">
        <h2 className={type.sectionTitle}>Exposure and Collateral</h2>
        <p
          className={cn(
            type.supporting,
            'max-w-3xl text-supporting-foreground'
          )}
        >
          The next table-family candidate: underlying exposure versus tokens
          held in the basket. Snapshot-based fixtures, not live holdings.
          Preview performance is fixed to 7d; production follows the chart’s
          selected period.
        </p>
      </div>
      <HoldingsSpecimens onBridge={openBridge} />
      <HoldingsControls
        dataset={dataset}
        onDataset={(value) => {
          setDataset(value)
          setTab('exposure')
        }}
        state={state}
        onState={setState}
        width={width}
        onWidth={setWidth}
      />
      {width === 'overview' && (
        <p
          className={cn(
            type.supporting,
            'max-w-3xl text-supporting-foreground'
          )}
        >
          Overview estimate: 836px card in a 1400px page shell, allowing for the
          72px navigation rail, 480px trading/about column and existing 12px
          frame spacing. Final page layout remains a separate review.
        </p>
      )}
      <p
        className={cn(type.supporting, 'max-w-3xl text-supporting-foreground')}
      >
        Bridge details open the existing product dialog as a reference only; its
        design is not part of this review. No wallet or transaction actions.
        Long content, newly added and missing-value conditions are synthetic
        pressure cases.
      </p>
      {state === 'empty' && (
        <p role="status" className={type.supporting}>
          Empty fixture: no holdings rows. Production empty-state presentation
          remains unresolved; this note is lab guidance, not product copy.
        </p>
      )}
      <div
        ref={composition}
        data-testid="holdings-composition"
        className={cn(
          'min-w-0 bg-card [container-type:inline-size]',
          width === 'mobile' && 'max-w-[390px]',
          width === 'overview' && 'max-w-[836px]'
        )}
      >
        <Tabs
          value={tab}
          onValueChange={(value) => {
            pendingTabFocus.current = `holdings-tab-${value}`
            setTab(value as HoldingsTab)
          }}
        >
          <TabsContent
            value={tab}
            id={panelId}
            aria-labelledby={undefined}
            aria-label={`${tab === 'exposure' ? 'Exposure' : 'Collateral'} holdings`}
          >
            {rows.length > 0 ? (
              <HoldingsTable
                key={`${dataset}-${tab}`}
                rows={rows}
                tab={tab}
                state={state}
                onBridge={openBridge}
                panelId={panelId}
              />
            ) : (
              <div className="p-6">
                <div className="hidden [@container(min-width:48rem)]:block">
                  <HoldingsTabs panelId={panelId} />
                </div>
                <div className="[@container(min-width:48rem)]:hidden">
                  <HoldingsTabs panelId={panelId} size="default" width="full" />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {bridge && (
        <BridgeInfoDialog
          open
          setOpen={(open) => {
            if (open) return
            const trigger = bridge.trigger
            setBridge(null)
            requestAnimationFrame(() => {
              const key = trigger.dataset.tableFocus
              const root = bridge.container
              const target = trigger.getClientRects().length
                ? trigger
                : [
                    ...(root?.querySelectorAll<HTMLButtonElement>(
                      'button[data-table-focus]'
                    ) ?? []),
                  ].find(
                    (el) =>
                      el.dataset.tableFocus === key &&
                      el.getClientRects().length
                  )
              const fallback = [
                ...(root?.querySelectorAll<HTMLElement>(
                  '[data-table-focus="sort"]'
                ) ?? []),
              ].find((el) => el.getClientRects().length)
              const destination = target ?? fallback
              destination?.focus({ preventScroll: true })
            })
          }}
          bridgeInfo={{
            native: bridge.row.native,
            bridge: BRIDGES[bridge.row.bridgeId!],
            mapping: { symbol: bridge.row.symbol },
          }}
          tokenAddress={bridge.row.address}
          tokenSymbol={bridge.row.symbol}
          tokenName={bridge.row.name}
          chainId={56}
        />
      )}
    </section>
  )
}
