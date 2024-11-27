import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import ChainLogo from 'components/icons/ChainLogo'
import { Table, TableProps } from 'components/table'
import TokenItem from 'components/token-item'
import useRTokenLogo from 'hooks/useRTokenLogo'
import useTokenList, { ListedToken } from 'hooks/useTokenList'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Spinner, Text } from 'theme-ui'
import {
  formatCurrency,
  formatCurrencyCell,
  formatUsdCurrencyCell,
  getTokenRoute,
} from 'utils'

const ListedTokensTable = (props: Partial<TableProps>) => {
  const { list, isLoading } = useTokenList()
  const columnHelper = createColumnHelper<ListedToken>()
  const navigate = useNavigate()

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: t`Token`,
        cell: (data) => {
          const logo = useRTokenLogo(
            data.row.original.id,
            data.row.original.chain
          )
          return <TokenItem symbol={data.getValue()} logo={logo} />
        },
      }),
      columnHelper.accessor('price', {
        header: t`Price`,
        cell: formatUsdCurrencyCell,
      }),
      columnHelper.accessor('supply', {
        header: t`Mkt Cap`,
        cell: (data) => `$${formatCurrency(data.getValue(), 0)}`,
      }),
      columnHelper.accessor('transactionCount', {
        header: t`Txs`,
        cell: formatCurrencyCell,
      }),
      columnHelper.accessor('volume7d', {
        header: t`Volume (last 7d)`,
        cell: (data) => `$${formatCurrency(data.getValue(), 0)}`,
      }),
      columnHelper.accessor('targetUnits', {
        header: t`Target(s)`,
        cell: (data) => {
          return (
            <Text
              sx={{
                width: '74px',
                display: 'block',
              }}
            >
              {data.getValue()}
            </Text>
          )
        },
      }),
      columnHelper.accessor('chain', {
        header: t`Network`,
        cell: (cell: any) => {
          return <ChainLogo chain={cell.getValue()} />
        },
      }),
    ],
    []
  )

  const handleClick = (data: any) => {
    navigate(getTokenRoute(data.id, data.chain))
    mixpanel.track('Selected RToken', {
      Source: 'Comparison Table',
      RToken: data.id,
    })
  }

  return (
    <>
      <Table
        data={list}
        columns={columns}
        onRowClick={handleClick}
        sorting
        sortBy={[{ id: 'supply', desc: true }]}
        {...props}
      />
      {isLoading && (
        <Box sx={{ textAlign: 'center' }} mt={3}>
          <Spinner size={22} />
        </Box>
      )}
      {!isLoading && !list.length && (
        <Box sx={{ textAlign: 'center' }} mt={4}>
          <Text variant="legend">No RTokens listed for this chain</Text>
        </Box>
      )}
    </>
  )
}

export default ListedTokensTable
