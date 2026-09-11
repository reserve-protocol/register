import { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/design-system-v1/select'
import { Switch } from '@/components/design-system-v1/switch'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { previewDiscover, type DiscoverState } from './discover-fixtures'
import { DiscoverTable } from './discover-table'
import { DiscoverSpecimens } from './discover-specimens'
import type { DiscoverCardLayout } from './discover-card-chart'

const conditions: Record<DiscoverState, string> = {
  default: 'Default',
  loading: 'Loading',
  missing: 'Zero / unavailable',
  long: 'Long content',
  inactive: 'Including inactive',
  'short-basket': 'Short basket',
}

export function DiscoverReview() {
  const [state, setState] = useState<DiscoverState>('default')
  const [constrained, setConstrained] = useState(false)
  const [cardLayout, setCardLayout] = useState<DiscoverCardLayout>('compact')
  const rows = useMemo(() => previewDiscover(state), [state])
  return (
    <section
      id="discover-family-review"
      data-testid="discover-review"
      className="scroll-mt-40 space-y-6"
    >
      <div className="space-y-1">
        <h2 className={type.sectionTitle}>Discover browsing rows</h2>
        <p
          className={cn(
            type.supporting,
            'max-w-3xl text-supporting-foreground'
          )}
        >
          New cell candidates for classifications, held-token baskets and
          compact performance trends. Frozen sample, not live market data or a
          complete Discover page. Narrow widths use the existing card family's
          chart and scrolling ticker with V1 foundation alignment.
        </p>
      </div>
      <DiscoverSpecimens />
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="space-y-2">
          <p className={type.supporting}>Preview conditions</p>
          <Select
            value={state}
            onValueChange={(value) => setState(value as DiscoverState)}
          >
            <SelectTrigger
              size="compact"
              className="w-56"
              aria-label="Discover preview state"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(conditions).map(([value, label]) => (
                <SelectItem key={value} value={value}>
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
          <Switch checked={constrained} onCheckedChange={setConstrained} />
          Constrained Discover column
        </label>
        <div className="space-y-2">
          <p className={type.supporting}>Narrow card preview</p>
          <Select
            value={cardLayout}
            onValueChange={(value) =>
              setCardLayout(value as DiscoverCardLayout)
            }
          >
            <SelectTrigger
              size="compact"
              className="w-56"
              aria-label="Discover card layout"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact chart</SelectItem>
              <SelectItem value="full">Full chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className={cn(type.supporting, 'text-supporting-foreground')}>
        Five active DTFs from a recorded snapshot. Links open the real DTF
        overview; desktop basket controls open local details. Cards retain the
        app's scrolling ticker. Both chart previews use the same 30-day data.
        Search, filters and pagination remain outside this sample. Preview
        conditions include synthetic pressure data.
      </p>
      <div
        data-testid="discover-composition"
        className={cn('min-w-0', constrained && 'max-w-[390px]')}
      >
        <DiscoverTable
          rows={rows}
          loading={state === 'loading'}
          cardLayout={cardLayout}
        />
      </div>
    </section>
  )
}
