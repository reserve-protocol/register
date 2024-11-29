import { Trans } from '@lingui/macro'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Table } from '@/components/old/table'
import { Box, Text } from 'theme-ui'
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
    <Box mt={[3, 5]} mx={[2, 4]}>
      <Box
        variant="layout.verticalAlign"
        sx={{ flexWrap: 'wrap', gap: 2 }}
        pl={2}
        mb={5}
      >
        <TransactionsIcon fontSize={32} />
        <Text mr="auto" as="h2" variant="title" sx={{ fontSize: 4 }}>
          <Trans>Transactions</Trans>
        </Text>
        <TransactionFilters />
      </Box>
      <Table
        sorting
        sortBy={[{ id: 'timestamp', desc: true }]}
        onSort={handleSort}
        data={data}
        pagination={{ pageSize: 10 }}
        columns={columns}
        sx={{ borderRadius: '0 0 20px 20px' }}
        isLoading={!data.length}
        compact
      />
    </Box>
  )
}

export default ExploreTransactions
