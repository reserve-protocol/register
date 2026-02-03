import { Trans } from '@lingui/macro'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Table } from '@/components/ui/legacy-table'
import useTransactionColumns from './useTransactionColumns'
import useTransactionData from './useTransactionData'
import TransactionFilters from './Filters'
import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { sortByAtom } from './atoms'

const sortKeyMap: Record<string, string> = {
  token_symbol: 'token__symbol',
  type: 'type',
  amount: 'amount',
  amountUSD: 'amountUSD',
  timestamp: 'timestamp',
  from_id: 'from__id',
}

const ExploreTransactions = () => {
  const data = useTransactionData()
  const columns = useTransactionColumns()
  const setSorting = useSetAtom(sortByAtom)

  const handleSort = useCallback((getSortState: any) => {
    const [sorting] = getSortState()

    if (sortKeyMap[sorting?.id]) {
      setSorting({ id: sortKeyMap[sorting?.id], desc: sorting.desc })
    }
  }, [])

  return (
    <div className="mt-4 md:mt-8 mx-2 md:mx-6">
      <div className="flex items-center flex-wrap gap-2 pl-5 mb-8">
        <TransactionsIcon fontSize={32} />
        <h2 className="mr-auto text-xl font-medium">
          <Trans>Transactions</Trans>
        </h2>
        <TransactionFilters />
      </div>
      <Table
        sorting
        sortBy={[{ id: 'timestamp', desc: true }]}
        className="border-2 pt-0 border-secondary"
        onSort={handleSort}
        data={data}
        pagination={{ pageSize: 10 }}
        columns={columns}
        isLoading={!data.length}
      />
    </div>
  )
}

export default ExploreTransactions
