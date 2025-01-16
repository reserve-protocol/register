import { Trans } from '@lingui/macro'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Table } from '@/components/old/table'
import { Box, Text } from 'theme-ui'
import useTransactionColumns from './useTransactionColumns'
import useTransactionData from './useTransactionData'
import TransactionFilters from './Filters'
import { useCallback, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { sortByAtom } from './atoms'
import { TransactionRecord } from '@/types'
import { formatEther } from 'viem'

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

  useEffect(() => {
    if (data) {
      const result = data.reduce((acc: any, item: any) => {
        if (+item.timestamp > 1731562865) {
          const amount = Number(formatEther(item.amount))
          const amountUSD = Number(item.amountUSD)
          const date = new Date(item.timestamp * 1000)
          const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

          if (item.type === 'MINT') {
            acc[formattedDate] = acc[formattedDate] || {
              mint: 0,
              mintUSD: 0,
              redeem: 0,
              redeemUSD: 0,
            }
            acc[formattedDate].mint += amount
            acc[formattedDate].mintUSD += amountUSD
          } else if (item.type === 'REDEEM') {
            acc[formattedDate] = acc[formattedDate] || {
              mint: 0,
              mintUSD: 0,
              redeem: 0,
              redeemUSD: 0,
            }
            acc[formattedDate].redeem += amount
            acc[formattedDate].redeemUSD += amountUSD
          }
        }
        return acc
      }, {})

      const csvRows = [
        ['Date', 'Mint', 'Mint USD', 'Redeem', 'Redeem USD'],
        ...Object.entries(result).map(([date, values]: any) => [
          date,
          values.mint,
          values.mintUSD,
          values.redeem,
          values.redeemUSD,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n')

      console.log(csvRows)
    }
  }, [data])
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
