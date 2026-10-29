import { Link } from '@/components/design-system-v1/link'
import { Skeleton } from '@/components/design-system-v1/loading'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { tooltipSurfaceRecipe } from '@/components/design-system-v1/tooltip-surface'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/utils'
import { DefiValue } from './defi-cells'
import type { DefiRow } from './defi-fixtures'

type DefiYieldProps = {
  row: DefiRow
  loading: boolean
  alignEnd?: boolean
  sortField?: string
}

export function DefiYield({
  row,
  loading,
  alignEnd = true,
  sortField,
}: DefiYieldProps) {
  return (
    <div
      data-slot="defi-yield"
      className={cn(
        'flex min-w-0 flex-col',
        alignEnd && 'items-end text-right'
      )}
    >
      <DefiYieldTotal row={row} loading={loading} alignEnd={alignEnd} />
      <DefiYieldBreakdown row={row} loading={loading} sortField={sortField} />
    </div>
  )
}

export function DefiYieldTotal({
  row,
  loading,
  alignEnd = true,
}: DefiYieldProps) {
  return loading ? (
    <div className="flex h-6 items-center gap-1">
      <DefiValue row={row} field="apy" loading={loading} alignEnd={alignEnd} />
      <Skeleton className="size-3.5" />
    </div>
  ) : (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            treatment="contextual"
            external
            externalAnnouncement=" (opens in a new tab)"
            className="relative h-6 min-w-11 w-fit gap-1 after:absolute after:inset-x-0 after:top-0 after:-bottom-5"
            href={`https://defillama.com/yields/pool/${row.id}`}
            data-table-focus={`llama-${row.id}`}
          >
            <DefiValue
              row={row}
              field="apy"
              loading={false}
              alignEnd={alignEnd}
            />
            <span className="sr-only"> View analytics on DefiLlama</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={8}
          collisionPadding={8}
          className={tooltipSurfaceRecipe}
        >
          View analytics on DefiLlama
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function DefiYieldBreakdown({
  row,
  loading,
  sortField,
}: DefiYieldProps) {
  return (
    <div
      data-slot="defi-yield-breakdown"
      className={cn(
        type.supporting,
        'flex flex-wrap gap-x-1 text-supporting-foreground [@container(min-width:64rem)]:flex-nowrap'
      )}
    >
      {(['apyBase', 'apyReward'] as const).map((field, index) => (
        <span
          key={field}
          data-apy-field={field}
          className={cn(
            'inline-flex min-h-5 items-center gap-1 whitespace-nowrap',
            sortField === field && 'text-foreground'
          )}
        >
          {index === 1 && (
            <span aria-hidden className="text-supporting-foreground">
              ·
            </span>
          )}
          {field === 'apyBase' ? 'Base' : 'Rewards'}{' '}
          {loading ? (
            <Skeleton className="h-3 w-8" />
          ) : (
            <span className="tabular-nums">
              {row[field] === null ? '—' : `${formatCurrency(row[field], 1)}%`}
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
