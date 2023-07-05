import { t } from '@lingui/macro'
import mixpanel from 'mixpanel-browser'
import { Table, TableProps } from 'components/table'
import TokenItem from 'components/token-item'
import { getRTokenLogo } from 'hooks/useRTokenLogo'
import useTokenList from 'hooks/useTokenList'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text } from 'theme-ui'
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
    mixpanel.track('Selected RToken', {
      Source: 'Comparison Table',
      RToken: data.id,
    })
    navigate(`/overview?token=${data.id}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Table
      data={tokenList}
      columns={columns}
      onRowClick={handleClick}
      sorting
      sortBy={[{ id: 'supply', desc: true }]}
      {...props}
    />
  )
}

export default ListedTokensTable
