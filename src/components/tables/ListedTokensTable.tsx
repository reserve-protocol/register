import { t } from '@lingui/macro'
import { Table, TableProps } from 'components/table'
import TokenItem from 'components/token-item'
import { getRTokenLogo } from 'hooks/useRTokenLogo'
import useTokenList from 'hooks/useTokenList'
import mixpanel from 'mixpanel-browser'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Spinner, Text } from 'theme-ui'
import {
  formatCurrency,
  formatCurrencyCell,
  formatUsdCurrencyCell,
} from 'utils'

const ListedTokensTable = (
  props: Partial<TableProps<{ [key: string]: any }>>
) => {
  const tokenList = useTokenList()
  const navigate = useNavigate()

  // TODO: Calculate APY from basket (need theGraph)
  const columns = useMemo(
    () => [
      {
        Header: t`Token`,
        accessor: 'symbol',
        Cell: (data: any) => {
          const logo = getRTokenLogo(data.row.original.id)

          return <TokenItem symbol={data.cell.value} logo={logo} />
        },
      },
      { Header: t`Price`, accessor: 'price', Cell: formatUsdCurrencyCell },
      {
        Header: t`Mkt Cap`,
        accessor: 'supply',
        Cell: ({ cell }: { cell: any }) => `$${formatCurrency(+cell.value, 0)}`,
      },
      {
        Header: t`Txs`,
        accessor: 'transactionCount',
        Cell: formatCurrencyCell,
      },
      {
        Header: t`Volume`,
        accessor: 'cumulativeVolume',
        Cell: ({ cell }: { cell: any }) => `$${formatCurrency(+cell.value, 0)}`,
      },
      {
        Header: t`Target(s)`,
        accessor: 'targetUnits',
        Cell: (cell: any) => {
          return (
            <Text
              sx={{
                width: '74px',
                display: 'block',
              }}
            >
              {cell.value}
            </Text>
          )
        },
      },
      // {
      //   Header: t`APY`,
      //   accessor: 'tokenApy',
      //   Cell: (cell: any) => <Text>{cell.value}%</Text>,
      // },
      // {
      //   Header: t`St APY`,
      //   accessor: 'stakingApy',
      //   Cell: (cell: any) => <Text>{cell.value}%</Text>,
      // },
    ],
    []
  )

  const handleClick = (data: any) => {
    navigate(`/overview?token=${data.id}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
    mixpanel.track('Selected RToken', {
      Source: 'Comparison Table',
      RToken: data.id,
    })
  }

  return (
    <>
      <Table
        data={tokenList}
        columns={columns}
        onRowClick={handleClick}
        sorting
        sortBy={[{ id: 'supply', desc: true }]}
        {...props}
      />
      {!tokenList?.length && (
        <Box sx={{ textAlign: 'center' }} mt={3}>
          <Spinner size={22} />
        </Box>
      )}
    </>
  )
}

export default ListedTokensTable
