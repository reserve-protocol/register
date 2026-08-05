import SectionAnchor from '@/components/section-anchor'
import { Card } from '@/components/ui/card'
import DataTable from '@/components/ui/data-table'
import { cn } from '@/lib/utils'
import {
  indexDTFAtom,
  indexDTFPriceAtom,
  indexDTFTransactionsAtom,
} from '@/state/dtf/atoms'
import { Trans } from '@lingui/react/macro'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import IndexTransactionTable from '../index-transaction-table'
import { columns } from './columns'
import { hasUniV4PoolSwaps } from './constants'
import { mergeTransactionRows } from './swap-transactions'
import useUniV4PoolSwaps from './use-uni-v4-pool-swaps'

// Swaps are merged in memory only — indexDTFTransactionsAtom also feeds the
// 24h volume and fee stats and must stay mint/redeem only.
const SwapsTransactionTable = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const transactions = useAtomValue(indexDTFTransactionsAtom)
  const price = useAtomValue(indexDTFPriceAtom)
  const { data: swaps } = useUniV4PoolSwaps(dtf?.id, dtf?.chainId)

  const rows = useMemo(
    () => mergeTransactionRows(transactions ?? [], swaps ?? [], price ?? 0),
    [transactions, swaps, price]
  )

  return (
    <Card
      className="group/section overflow-hidden pb-2 pt-5 sm:pb-3 sm:pt-6"
      id="transactions"
    >
      <div className="flex items-center gap-1 px-5 sm:px-6">
        <h2 className="text-2xl font-light">
          <Trans>Transactions</Trans>
        </h2>
        <SectionAnchor id="transactions" />
      </div>
      <div className="mt-2 overflow-x-auto">
        <DataTable
          columns={columns}
          data={rows}
          pagination
          className={cn(
            '[&_table]:bg-card [&_table]:text-sm [&_table]:md:text-sm',
            '[&_thead_tr]:h-9 [&_thead_tr]:border-none',
            '[&_tbody_tr]:border-none [&_tbody_tr:hover]:bg-secondary/40',
            '[&_td]:py-3 [&_th]:py-1.5 [&_th]:text-legend'
          )}
        />
      </div>
    </Card>
  )
}

// Drop-in for IndexTransactionTable: DTFs with a Uniswap v4 pool also list
// 3rd-party pool swaps (Buy/Sell); every other DTF keeps the existing table.
const IndexTransactionTableWithSwaps = () => {
  const dtf = useAtomValue(indexDTFAtom)

  if (!dtf || !hasUniV4PoolSwaps(dtf.id, dtf.chainId)) {
    return <IndexTransactionTable />
  }

  return <SwapsTransactionTable />
}

export default IndexTransactionTableWithSwaps
