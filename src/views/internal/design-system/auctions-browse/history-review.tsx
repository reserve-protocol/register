import { useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Link } from '@/components/design-system-v1/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { Switch } from '@/components/design-system-v1/switch'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { v1SemanticRoles as roles } from '@/components/design-system-v1/semantic-roles'
import { cn } from '@/lib/utils'
import {
  HISTORY_STATES,
  historicalRebalances,
  type HistoryState,
  type HistoricalRebalance,
} from './history-model'
import { HistoricalRebalancesTable } from './history-table'
import { CurrentRebalanceReview } from '../auctions-current/review'

export function AuctionsHistoryReview() {
  const [preview, setPreview] = useState<{
    state: HistoryState
    content: HistoryState
  }>({ state: 'default', content: 'default' })
  const [constrained, setConstrained] = useState(false)
  const [results, setResults] = useState<HistoricalRebalance[]>([])
  const historyHeading = useRef<HTMLHeadingElement>(null)
  const loading = preview.state === 'loading'
  const rows = [
    ...results,
    ...historicalRebalances(loading ? preview.content : preview.state).filter(
      (row) => !results.some((result) => result.identity.id === row.identity.id)
    ),
  ]
  return (
    <section
      id="auctions-browse-review"
      data-testid="auctions-history-review"
      aria-labelledby="auctions-history-title"
      className="scroll-mt-36 space-y-4"
    >
      <div>
        <h3 id="auctions-history-title" className={type.panelTitle}>
          Auctions
        </h3>
        <p
          className={cn(
            type.supporting,
            'mt-1 max-w-3xl text-muted-foreground'
          )}
        >
          Current rebalance workspace and historical table review. Lab-only
          composition; no production changes.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="space-y-2">
          <label
            htmlFor="history-preview-state"
            className={cn(type.supporting, 'text-muted-foreground')}
          >
            Historical preview
          </label>
          <Select
            value={preview.state}
            onValueChange={(value) =>
              setPreview((previous) => ({
                state: value as HistoryState,
                content:
                  value !== 'loading' && value !== 'empty'
                    ? (value as HistoryState)
                    : previous.content,
              }))
            }
          >
            <SelectTrigger
              id="history-preview-state"
              data-testid="history-preview-state"
              className="w-64 max-w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(HISTORY_STATES).map(([value, label]) => (
                <SelectItem
                  key={value}
                  value={value}
                  data-testid={`history-state-${value}`}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label
          className={cn(
            type.supporting,
            'flex min-h-11 cursor-pointer items-center gap-2'
          )}
        >
          <Switch
            data-testid="history-constrain"
            checked={constrained}
            onCheckedChange={setConstrained}
          />
          Constrained column · 390px
        </label>
      </div>
      <CurrentRebalanceReview
        constrained={constrained}
        onArchive={(row) => {
          setResults((previous) => [
            row,
            ...previous.filter(
              (result) => result.identity.id !== row.identity.id
            ),
          ])
          requestAnimationFrame(() => historyHeading.current?.focus())
        }}
      />
      <h3
        ref={historyHeading}
        tabIndex={-1}
        className={cn(
          type.supporting,
          'pt-4 text-muted-foreground outline-none'
        )}
      >
        Historical Rebalances
      </h3>
      <p
        data-testid="history-fixture-note"
        className={cn(type.supporting, 'max-w-3xl text-muted-foreground')}
      >
        CMC20 snapshot names, dates and destinations; illustrative outcomes and
        metrics. Newest first. Frozen preview, not live data.
      </p>
      <div
        data-testid="history-container"
        className={cn(
          'w-full min-w-0',
          roles.surface.content,
          constrained && 'max-w-[390px]'
        )}
      >
        {rows.length ? (
          <HistoricalRebalancesTable rows={rows} loading={loading} />
        ) : (
          <p
            data-testid="history-empty"
            className={cn(type.body, 'px-6 py-6 text-muted-foreground')}
          >
            No rebalances found
          </p>
        )}
      </div>
      <RouterLink
        to="#auctions-records-review"
        data-testid="history-earlier-review"
        className={cn(
          type.supporting,
          'inline-block text-muted-foreground underline underline-offset-2',
          roles.focus.visibleOnContent
        )}
      >
        Earlier rebalance record exploration
      </RouterLink>
      <div>
        <Link
          href="/bsc/index-dtf/0x2f8a339b5889ffac4c5a956787cda593b3c36867/auctions/legacy"
          treatment="standalone"
        >
          View older auctions
        </Link>
      </div>
    </section>
  )
}
