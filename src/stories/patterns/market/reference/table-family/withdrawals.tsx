import { createContext, useContext, useRef, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { Button, InlineAction } from '@/components/button'
import {
  EntityIdentity,
  MarketChainBadgedLogo as ChainBadgedLogo,
} from '../market-identity'
import { WithdrawalProgress } from './progress'
import { Link } from '@/components/design-system-v1/link'
import { Skeleton, Spinner } from '@/components/design-system-v1/loading'
import { v1SemanticRoles } from '@/components/design-system-v1/semantic-roles'
import { v1Typography as type } from '@/components/design-system-v1/typography'
import { cn } from '@/lib/utils'
import { getTokenRoute } from '@/utils'
import { NumericCell, IdentityCell, Fact } from './cells'
import { type WithdrawalFixture } from './fixtures'
import {
  desktopCell,
  mobileCell,
  FamilyHeader,
  FamilyTable,
  ExpandRows,
} from './table'

export type WithdrawalPreview = 'idle' | 'processing' | 'withdrawn'
interface PreviewContext {
  loading: boolean
  states: Record<string, WithdrawalPreview>
  onWithdraw: (row: WithdrawalFixture) => void
  onSource: (row: WithdrawalFixture) => void
}
const Preview = createContext<PreviewContext | null>(null)
const usePreview = () => {
  const preview = useContext(Preview)
  if (!preview)
    throw new Error('Withdrawal cells need their lab preview provider')
  return preview
}

const Source = ({
  row,
  mobile = false,
}: {
  row: WithdrawalFixture
  mobile?: boolean
}) => {
  const { loading, onSource } = usePreview()
  if (loading) return <Skeleton className="h-5 w-16" />
  return row.source === 'stakedRSR' ? (
    <Link
      data-table-focus={`source-${row.id}`}
      href={getTokenRoute(
        '0xA0d69E286B938e21CBf7E51D71F6A4c8918f482F',
        1,
        'staking'
      )}
      external
      externalAnnouncement=" (opens in a new tab)"
      treatment="contextual"
      className={mobile ? type.supporting : undefined}
    >
      {row.sourceLabel}
    </Link>
  ) : (
    <InlineAction
      data-table-focus={`source-${row.id}`}
      treatment="contextual"
      className={mobile ? type.supporting : undefined}
      data-testid={`source-${row.id}${mobile ? '-mobile' : ''}`}
      onClick={() => onSource(row)}
    >
      {row.sourceLabel}
      <ChevronRight
        aria-hidden="true"
        className="size-3.5 shrink-0"
        strokeWidth={1.5}
      />
    </InlineAction>
  )
}

const Withdrawal = ({
  row,
  mobile = false,
}: {
  row: WithdrawalFixture
  mobile?: boolean
}) => {
  const { loading, states, onWithdraw } = usePreview()
  const region = useRef<HTMLDivElement>(null)
  const state = states[row.id] ?? 'idle'
  return (
    <div
      ref={region}
      data-testid={`withdrawal-${row.id}${mobile ? '-mobile' : ''}`}
      data-table-focus={`withdrawal-${row.id}`}
      aria-live="polite"
      aria-atomic="true"
      tabIndex={-1}
      className={cn(
        'inline-flex min-h-8 items-center justify-end focus-visible:outline-none',
        v1SemanticRoles.focus.visibleInset
      )}
    >
      {loading ? (
        <Skeleton className="h-5 w-28" />
      ) : state === 'processing' ? (
        <span
          className={cn(
            type.body,
            'inline-flex items-center gap-2 whitespace-nowrap text-supporting-foreground'
          )}
        >
          <Spinner />
          Withdrawing…
        </span>
      ) : state === 'withdrawn' || row.remaining > 0 ? (
        <WithdrawalProgress row={row} state={state} showAvailabilityLabel />
      ) : (
        <Button
          data-testid={`withdraw-${row.id}${mobile ? '-mobile' : ''}`}
          data-table-focus={`withdraw-${row.id}`}
          tone="secondary"
          size="compact"
          onClick={(event) => {
            if (event.detail === 0)
              region.current?.focus({ preventScroll: true })
            onWithdraw(row)
          }}
        >
          Withdraw
        </Button>
      )}
    </div>
  )
}

const Token = ({ row }: { row: WithdrawalFixture }) => {
  const { loading } = usePreview()
  return (
    <IdentityCell
      name={row.symbol}
      {...row}
      nameLeading="default"
      supporting={null}
      loading={loading}
    />
  )
}
const Value = ({
  row,
  id,
}: {
  row: WithdrawalFixture
  id: 'balance' | 'value'
}) => {
  const { loading } = usePreview()
  return <NumericCell value={row[id]} loading={loading} />
}

const MobileRecord = ({ row }: { row: WithdrawalFixture }) => {
  const { loading } = usePreview()
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {loading ? (
          <Token row={row} />
        ) : (
          <EntityIdentity
            name={row.symbol}
            mark={
              <ChainBadgedLogo
                symbol={row.symbol}
                chain={row.chain}
                size="xl"
              />
            }
            supporting={<Source row={row} mobile />}
          />
        )}
        <Withdrawal row={row} mobile />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        <Fact label="Balance">
          <NumericCell
            loading={loading}
            value={
              row.balance && {
                ...row.balance,
                text: `${row.balance.text} ${row.symbol}`,
              }
            }
          />
        </Fact>
        <Fact label="Value">
          <Value row={row} id="value" />
        </Fact>
      </div>
      <span
        data-slot="row-seam"
        className="absolute -bottom-6 -right-6 left-0 border-b border-border"
      />
    </div>
  )
}

const columns: ColumnDef<WithdrawalFixture>[] = [
  {
    id: 'mobile',
    enableSorting: false,
    header: () => null,
    meta: { className: mobileCell },
    cell: ({ row }) => <MobileRecord row={row.original} />,
  },
  {
    id: 'token',
    header: 'Token',
    enableSorting: false,
    meta: { className: cn(desktopCell, 'pl-6 text-left') },
    cell: ({ row }) => <Token row={row.original} />,
  },
  {
    id: 'source',
    header: 'Source',
    enableSorting: false,
    meta: { className: cn(desktopCell, 'text-left') },
    cell: ({ row }) => <Source row={row.original} />,
  },
  ...(['balance', 'value'] as const).map((id) => ({
    id,
    accessorFn: (row: WithdrawalFixture) => row[id]?.order,
    sortingFn: 'basic' as const,
    header: id === 'balance' ? 'Balance' : 'Value',
    meta: { className: desktopCell },
    cell: ({ row }: { row: { original: WithdrawalFixture } }) => (
      <Value row={row.original} id={id} />
    ),
  })),
  {
    id: 'withdrawal',
    header: 'Withdrawal',
    enableSorting: false,
    meta: { className: cn(desktopCell, 'w-60 pr-6') },
    cell: ({ row }) => <Withdrawal row={row.original} />,
  },
]

export function Withdrawals({
  rows,
  ...preview
}: PreviewContext & { rows: WithdrawalFixture[] }) {
  const [expanded, setExpanded] = useState(false)
  if (!rows.length) return null
  return (
    <Preview.Provider value={preview}>
      <section
        data-testid="table-family-withdrawals"
        className="min-w-0 bg-card [@container(min-width:64rem)]:pb-2"
        aria-busy={preview.loading || undefined}
      >
        <FamilyHeader
          title="Pending Withdrawals"
          subtitle="Unstaking and unlock cooldown periods."
        />
        <FamilyTable
          label="Pending Withdrawals"
          columns={columns}
          data={rows}
          rowLimit={expanded ? undefined : 5}
        >
          {rows.length > 5 && !preview.loading && (
            <ExpandRows
              expanded={expanded}
              total={rows.length}
              onToggle={() => setExpanded(!expanded)}
            />
          )}
        </FamilyTable>
      </section>
    </Preview.Provider>
  )
}
