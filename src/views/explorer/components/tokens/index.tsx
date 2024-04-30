import { Trans, t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import ChainLogo from 'components/icons/ChainLogo'
import TransactionsIcon from 'components/icons/TransactionsIcon'
import { Table, TableProps } from 'components/table'
import TokenItem from 'components/token-item'
import useRTokenLogo from 'hooks/useRTokenLogo'
import useTokenList, { ListedToken } from 'hooks/useTokenList'
import { useMemo } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Box, Spinner, Text } from 'theme-ui'
import {
  formatCurrency,
  formatCurrencyCell,
  formatPercentage,
  formatUsdCurrencyCell,
  getTokenRoute,
} from 'utils'

const renderSubComponent = ({ row }: { row: Row<Person> }) => {
  return (
    <pre style={{ fontSize: '10px' }}>
      <code>{JSON.stringify(row.original, null, 2)}</code>
    </pre>
  )
}

const ExploreTokens = (props: Partial<TableProps>) => {
  const { list, isLoading } = useTokenList()
  const columnHelper = createColumnHelper<ListedToken>()
  const navigate = useNavigate()

  const columns = useMemo(
    () => [
      columnHelper.accessor('chain', {
        header: t`Network`,
        cell: (cell: any) => {
          return <ChainLogo chain={cell.getValue()} />
        },
      }),
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
      columnHelper.accessor('stakeUsd', {
        header: t`Staked RSR`,
        cell: (data) => `$${formatCurrency(data.getValue(), 0)}`,
      }),
      columnHelper.accessor('basketApy', {
        header: t`Basket APY`,
        cell: (data) => formatPercentage(data.getValue()),
      }),
      columnHelper.accessor('tokenApy', {
        header: t`Holders APY`,
        cell: (data) => formatPercentage(data.getValue()),
      }),
      columnHelper.accessor('stakingApy', {
        header: t`Stakers APY`,
        cell: (data) => formatPercentage(data.getValue()),
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
      columnHelper.accessor('id', {
        header: '',
        cell: ({ row }) => {
          return row.getIsExpanded() ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )
        },
      }),
    ],
    []
  )

  const handleClick = (data: any, row: any) => {
    row.toggleExpanded()
  }

  return (
    <Box mt={5} mx={[1, 4]}>
      <Box variant="layout.verticalAlign" mb={5}>
        <BasketCubeIcon fontSize={32} />
        <Text ml="2" as="h2" variant="title" sx={{ fontSize: 4 }}>
          <Trans>Featured RTokens</Trans>
        </Text>
      </Box>
      <Table
        data={list}
        columns={columns}
        onRowClick={handleClick}
        sorting
        sortBy={[{ id: 'supply', desc: true }]}
        sx={{ borderRadius: '0 0 20px 20px' }}
        compact
        renderSubComponent={renderSubComponent}
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
    </Box>
  )
}

export default ExploreTokens
