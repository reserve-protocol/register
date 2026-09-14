import { useCallback, useEffect, useRef } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { Link } from '@/components/design-system-v1/link'
import { Switch } from '@/components/design-system-v1/switch'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { AuctionsHistoryReview } from '../auctions-browse/history-review'
import {
  DATA_STATES,
  VIEWERS,
  type DataState,
  type Viewer,
} from '../auctions-current/fixtures'
import {
  currentTableRows,
  TABLE_SCENARIOS,
  type TableScenario,
  type TableRow,
} from './model'
import { CurrentRebalancesTable } from './table'
import { TablePreviewSelect } from './controls'
import { RetainedDetailPreview } from './detail'

export function CurrentTableReview() {
  const location = useLocation()
  const navigate = useNavigate()
  const root = useRef<HTMLDivElement>(null)
  const lastSelection = useRef<string | null>(null)
  const params = new URLSearchParams(location.search)
  const requestedScene =
    params.get('current') ??
    (params.has('rebalance-preview') &&
    !params.get('rebalance-preview')?.startsWith('all-')
      ? 'ready'
      : 'all')
  const validScene = Object.hasOwn(TABLE_SCENARIOS, requestedScene)
  const scene = validScene ? (requestedScene as TableScenario) : 'empty'
  const viewerKey = params.get('viewer') ?? 'launcher'
  const viewer: Viewer = Object.hasOwn(VIEWERS, viewerKey)
    ? (viewerKey as Viewer)
    : 'visitor'
  const dataKey = params.get('data') ?? 'ready'
  const data: DataState = Object.hasOwn(DATA_STATES, dataKey)
    ? (dataKey as DataState)
    : 'error'
  const network = params.get('network') !== 'wrong'
  const selection = params.get('rebalance-preview')
  const rows = currentTableRows(scene, viewer, data, network)
  const href = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(location.search)
      if (value === null) next.delete(key)
      else next.set(key, value)
      return `${location.pathname}?${next}${location.hash}`
    },
    [location.pathname, location.search, location.hash]
  )
  const hrefFor = useCallback(
    (row: TableRow) => href('rebalance-preview', row.previewId),
    [href]
  )
  useEffect(() => {
    if (selection) {
      lastSelection.current = selection
      return
    }
    const id = location.state?.currentTableReturn ?? lastSelection.current
    if (!id) return
    const link = [
      ...(root.current?.querySelectorAll<HTMLElement>('[data-table-focus]') ??
        []),
    ].find(
      (el) =>
        el.dataset.tableFocus === `details-${id}` && el.getClientRects().length
    )
    link?.focus()
    lastSelection.current = null
  }, [selection, location.state])
  const update = (key: string, value: string) =>
    navigate(href(key, value), { replace: true, preventScrollReset: true })
  if (selection)
    return (
      <RetainedDetailPreview
        row={rows.find((row) => row.previewId === selection)}
        backHref={href('rebalance-preview', null)}
      />
    )
  return (
    <div ref={root}>
      <AuctionsHistoryReview
        excludeIds={rows.map((row) => row.record.identity.id)}
        current={
          <div className="space-y-4" data-testid="current-table-review">
            <div className="flex flex-wrap items-end gap-4">
              <TablePreviewSelect
                id="current-table-scene"
                label="Current rebalance"
                value={scene}
                choices={TABLE_SCENARIOS}
                onChange={(value) => update('current', value)}
              />
              {scene !== 'all' && (
                <TablePreviewSelect
                  id="current-table-viewer"
                  label="Viewer"
                  value={viewer}
                  choices={VIEWERS}
                  onChange={(value) => update('viewer', value)}
                />
              )}
              <Link asChild treatment="return" className="min-h-11">
                <RouterLink to={`${location.pathname}#auctions-browse-review`}>
                  Current rebalance workspace
                </RouterLink>
              </Link>
            </div>
            {scene !== 'all' && (
              <details className={cn(type.supporting, 'text-muted-foreground')}>
                <summary className="min-h-11 cursor-pointer py-3">
                  Data and simulation
                </summary>
                <div className="flex flex-wrap items-end gap-4 py-3">
                  <TablePreviewSelect
                    id="current-table-data"
                    label="Data"
                    value={data}
                    choices={DATA_STATES}
                    onChange={(value) => update('data', value)}
                  />
                  <label className="flex min-h-11 items-center gap-2">
                    <Switch
                      checked={!network}
                      onCheckedChange={(value) =>
                        update('network', value ? 'wrong' : 'correct')
                      }
                    />{' '}
                    Wrong network
                  </label>
                </div>
              </details>
            )}
            <p className={cn(type.supporting, 'text-muted-foreground')}>
              Snapshot identities; illustrative metrics, assets traded and bids.
              Frozen preview, not live data.
            </p>
            <h3
              data-testid="current-table-heading"
              className={cn(type.supporting, 'text-muted-foreground')}
            >
              Current Rebalances
            </h3>
            {!validScene ? (
              <p className={cn(type.supporting, 'bg-card p-6')}>
                Lab: no proposal matches this route. No launch state is
                inferred.
              </p>
            ) : scene === 'loading' ? (
              <div role="status" className="bg-card p-6">
                <span className="sr-only">Loading</span>
                <Skeleton className="h-20 w-full" />
              </div>
            ) : rows.length ? (
              scene === 'all' ? (
                <div className="space-y-8">
                  {rows.map((row) => (
                    <section
                      key={row.previewId}
                      aria-labelledby={`${row.previewId}-heading`}
                      data-testid="current-table-example"
                      className="space-y-3"
                    >
                      <h4
                        id={`${row.previewId}-heading`}
                        className={cn(type.supporting, 'text-muted-foreground')}
                      >
                        {row.previewLabel}
                      </h4>
                      <CurrentRebalancesTable rows={[row]} hrefFor={hrefFor} />
                    </section>
                  ))}
                </div>
              ) : (
                <CurrentRebalancesTable rows={rows} hrefFor={hrefFor} />
              )
            ) : (
              <p className={cn(type.body, 'bg-card p-6 text-muted-foreground')}>
                No rebalances found
              </p>
            )}
          </div>
        }
      />
    </div>
  )
}
