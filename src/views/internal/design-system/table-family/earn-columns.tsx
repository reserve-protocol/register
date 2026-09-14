import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { CircleHelp } from 'lucide-react'
import { IconButton } from '@/components/icon-button'
import { InlineAction } from '@/components/button'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import {
  EarnIdentity,
  EarnPair,
  EarnRate,
  EarnWalletSummary,
} from './earn-cells'
import { EarnGoverns } from './earn-governs'
import type { EarnFamily, EarnRow, EarnState } from './earn-fixtures'
import { Sort } from './table'

const desktop =
  'hidden px-3 py-6 text-right [@container(min-width:64rem)]:table-cell'
const label = (text: string) => (
  <span className={cn(type.supporting, 'text-supporting-foreground')}>
    {text}
  </span>
)
const fact = (text: string, children: ReactNode) => (
  <div className="flex min-w-0 flex-col gap-1">
    {label(text)}
    {children}
  </div>
)

export function earnColumns({
  state,
  family,
  wallet,
  onOpen,
  onHelp,
}: {
  state: EarnState
  family: EarnFamily
  wallet: boolean
  onOpen: (row: EarnRow, trigger: HTMLElement) => void
  onHelp: () => void
}): ColumnDef<EarnRow>[] {
  const loading = state === 'loading'
  const walletLoading = loading || state === 'wallet-loading'
  const identity = (row: EarnRow) => (
    <EarnIdentity row={row} loading={loading} onOpen={onOpen} />
  )
  const tvl = (row: EarnRow, align: 'start' | 'end' = 'start') => (
    <EarnPair
      primary={row.tvl}
      supporting={row.amount}
      loading={loading}
      align={align}
    />
  )
  const holding = (row: EarnRow) => (
    <EarnPair
      primary={row.holding}
      muteZero
      align="end"
      supporting={row.holdingAmount}
      loading={walletLoading}
    />
  )
  const rate = (row: EarnRow) => (
    <div className="flex items-center justify-end gap-1">
      <EarnRate row={row} loading={loading} />
      {row.family === 'index' && loading && (
        <span aria-hidden className="size-8 shrink-0" />
      )}
      {row.family === 'index' && !loading && (
        <IconButton
          size="compact"
          tone="quiet"
          label="How is this rate calculated?"
          data-table-focus={`rate-help-${row.id}`}
          icon={<CircleHelp />}
          onClick={(event) => {
            event.stopPropagation()
            onHelp()
          }}
        />
      )}
    </div>
  )
  return [
    {
      id: 'identity',
      accessorFn: (row) => row.symbol,
      header: ({ column }) =>
        family === 'index' ? (
          <div className="[&_button]:ml-0">
            <Sort column={column} label="Gov. Token" id="identity" />
          </div>
        ) : (
          label('Gov. Token')
        ),
      meta: {
        className: cn(
          desktop,
          'pl-6 text-left',
          wallet ? 'w-[26%]' : 'w-[30%]'
        ),
      },
      cell: ({ row }) => identity(row.original),
    },
    {
      id: 'governs',
      accessorFn: (row) => row.governs[0]?.symbol,
      header: ({ column }) =>
        family === 'yield' ? (
          <div className="[&_button]:ml-0">
            <Sort column={column} label="Governs" id="governs" />
          </div>
        ) : (
          label('Governs')
        ),
      meta: { className: cn(desktop, 'text-left') },
      cell: ({ row }) => <EarnGoverns row={row.original} loading={loading} />,
    },
    {
      id: 'tvl',
      accessorFn: (row) => row.tvl?.order,
      sortUndefined: 'last',
      header: ({ column }) => <Sort column={column} label="TVL" id="tvl" />,
      meta: { className: cn(desktop, 'w-[18%]') },
      cell: ({ row }) => tvl(row.original, 'end'),
    },
    ...(wallet
      ? [
          {
            id: 'holding',
            header: () =>
              label(family === 'index' ? 'Your lock' : 'Your stake'),
            meta: { className: cn(desktop, 'w-[18%]') },
            cell: ({ row }) => holding(row.original),
          } satisfies ColumnDef<EarnRow>,
        ]
      : []),
    {
      id: 'rate',
      accessorFn: (row) => row.rate?.order,
      sortUndefined: 'last',
      header: ({ column }) => (
        <Sort column={column} label="Avg. 30d%" id="rate" />
      ),
      meta: { className: cn(desktop, 'w-[18%] pr-6') },
      cell: ({ row }) => rate(row.original),
    },
    {
      id: 'record',
      header: () => null,
      meta: {
        className: 'relative px-6 py-6 [@container(min-width:64rem)]:hidden',
      },
      cell: ({ row: { original: row } }) => (
        <>
          <div className="space-y-4" data-testid={`earn-record-${row.id}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 [&>button]:w-full [&_[data-slot=entity-identity-supporting]]:whitespace-normal [&_[data-slot=entity-identity-supporting]]:[overflow-wrap:anywhere]">
                {identity(row)}
              </div>
              <div
                className="flex shrink-0 flex-col gap-1 text-right"
                data-slot="earn-rate-fact"
              >
                <div className="flex h-5 items-center justify-end gap-1">
                  {label('Avg. 30d%')}
                  {row.family === 'index' && !loading ? (
                    <InlineAction
                      treatment="contextual"
                      aria-label="How is this rate calculated?"
                      data-table-focus={`rate-help-${row.id}`}
                      className="size-5 text-supporting-foreground before:-inset-3 hover:text-foreground hover:no-underline"
                      onClick={(event) => {
                        event.stopPropagation()
                        onHelp()
                      }}
                    >
                      <CircleHelp
                        aria-hidden
                        className="size-4"
                        strokeWidth={1.5}
                      />
                    </InlineAction>
                  ) : row.family === 'index' ? (
                    <span aria-hidden className="size-5 shrink-0" />
                  ) : null}
                </div>
                <EarnRate row={row} loading={loading} />
              </div>
            </div>
            <div
              className="grid grid-cols-2 gap-6"
              data-slot="earn-opportunity-facts"
            >
              {fact('Governs', <EarnGoverns row={row} loading={loading} />)}
              <div className="min-w-0 text-right [&>div]:items-end">
                {fact('TVL', tvl(row, 'end'))}
              </div>
            </div>
            {wallet && (walletLoading || row.hasHolding !== false) && (
              <EarnWalletSummary row={row} loading={walletLoading} />
            )}
          </div>
          <div
            aria-hidden
            data-slot="row-seam"
            className="absolute bottom-0 left-6 right-0 border-b border-border"
          />
        </>
      ),
    },
  ]
}
