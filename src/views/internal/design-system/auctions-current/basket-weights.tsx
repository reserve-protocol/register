import type { Dispatch } from 'react'
import { Trans } from '@lingui/react/macro'
import { Button } from '@/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { AssetName, AssetStackSummary } from './assets'
import { UNIT_PRICES, type DataState, type SourceRecord } from './fixtures'
import { CurrentValue } from './facts'
import type { WorkspaceEvent, WorkspaceState } from './model'
import { allocations } from './weights-model'

export function BasketWeights({
  record,
  state,
  dispatch,
  editable,
  disabled,
  data,
}: {
  record: SourceRecord
  state: WorkspaceState
  dispatch: Dispatch<WorkspaceEvent>
  editable: boolean
  disabled: boolean
  data: DataState
}) {
  const shares = state.weights ? allocations(state.weights, UNIT_PRICES) : []
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h5 className={type.itemTitle}>
          {state.weights ? <Trans>Target basket</Trans> : 'Basket'}
        </h5>
        {editable && (
          <Button
            tone="secondary"
            data-testid="current-edit"
            disabled={disabled}
            onClick={() => dispatch({ type: 'edit' })}
          >
            {state.weights ? (
              'Manage Weights'
            ) : (
              <Trans>Confirm target weights</Trans>
            )}
          </Button>
        )}
      </div>
      {state.weights && (
        <p className={cn(type.supporting, 'text-muted-foreground')}>
          <Trans>
            Saved in this tab for launch. Reloading discards these edits.
          </Trans>
        </p>
      )}
      {state.weights ? (
        <Table aria-label="Weights saved" className="table-fixed">
          <TableHeader className="[&_tr]:border-0">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="h-auto w-[44%] p-0 pb-2 [@container(min-width:32rem)]:w-[38%]">
                Asset
              </TableHead>
              <TableHead className="h-auto w-[30%] p-0 pb-2 text-right [@container(min-width:32rem)]:w-[32%]">
                New units
              </TableHead>
              <TableHead className="h-auto w-[26%] p-0 pb-2 text-right [@container(min-width:32rem)]:w-[30%]">
                % of Basket
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {record.tokens.map((token, index) => (
              <TableRow
                key={token.address}
                data-testid={`current-saved-weight-${index}`}
                className="border-0 hover:bg-transparent"
              >
                <TableCell className="py-2 pl-0 pr-2">
                  <AssetName token={token} chainId={record.chainId} />
                </TableCell>
                <TableCell
                  className={cn(
                    type.body,
                    'break-all px-0 py-2 text-right tabular-nums'
                  )}
                >
                  {state.weights![index]}
                </TableCell>
                <TableCell
                  className={cn(
                    type.body,
                    'py-2 pl-2 pr-0 text-right tabular-nums [&>div]:max-w-full'
                  )}
                >
                  <CurrentValue data={data}>{shares[index]}</CurrentValue>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <AssetStackSummary tokens={record.tokens} chainId={record.chainId} />
      )}
    </div>
  )
}
