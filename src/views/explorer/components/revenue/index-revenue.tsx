import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { Trans, useLingui } from '@lingui/react/macro'
import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import { formatCurrency, getFolioRoute } from 'utils'
import ExplorerTable from '../kit/explorer-table'
import { TokenCell } from '../kit/token-cell'
import DistributeButton from './distribute-button'
import { type IndexDTFRevenue } from './use-index-dtf-revenue'

const NO_ROWS: IndexDTFRevenue[] = []

const DtfLink = ({ dtf, size }: { dtf: IndexDTFItem; size?: number }) => (
  <a
    href={getFolioRoute(dtf.address, dtf.chainId)}
    target="_blank"
    rel="noreferrer"
    className="min-w-0 text-foreground hover:text-primary"
  >
    <TokenCell
      symbol={dtf.symbol}
      address={dtf.address}
      chain={dtf.chainId}
      logo={dtf.brand?.icon}
      size={size}
    />
  </a>
)

const IndexRevenue = ({ data }: { data: IndexDTFRevenue[] | undefined }) => {
  const { t } = useLingui()
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'pending', desc: true },
  ])

  const columns = useMemo<ColumnDef<IndexDTFRevenue>[]>(
    () => [
      {
        id: 'dtf',
        header: 'DTF',
        accessorFn: (item) => item.dtf.symbol,
        cell: ({ row }) => <DtfLink dtf={row.original.dtf} />,
      },
      {
        id: 'pending',
        header: t`Pending fees`,
        accessorFn: (item) => item.pendingUsd,
        meta: { className: 'text-right' },
        cell: ({ row }) => `$${formatCurrency(row.original.pendingUsd)}`,
      },
      {
        id: 'action',
        header: '',
        enableSorting: false,
        meta: { className: 'w-0 text-right' },
        cell: ({ row }) => <DistributeButton dtf={row.original.dtf} />,
      },
    ],
    [t]
  )

  return (
    <ExplorerTable
      data={data ?? NO_ROWS}
      columns={columns}
      getRowId={(item) => `${item.dtf.chainId}-${item.dtf.address}`}
      sorting={sorting}
      onSortingChange={setSorting}
      isLoading={!data}
      emptyLabel={<Trans>No pending fees</Trans>}
      renderItem={(item) => (
        <div className="flex items-center gap-3">
          <DtfLink dtf={item.dtf} size={36} />
          <span className="ml-auto text-[17px] font-semibold tabular-nums text-primary">
            ${formatCurrency(item.pendingUsd)}
          </span>
          <DistributeButton dtf={item.dtf} />
        </div>
      )}
    />
  )
}

export default IndexRevenue
