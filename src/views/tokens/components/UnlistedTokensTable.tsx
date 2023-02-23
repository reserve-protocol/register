import { Table } from 'components/table'
import { Box, Text } from 'theme-ui'
import { formatEther, getAddress } from 'ethers/lib/utils'
import useQuery from 'hooks/useQuery'
import { useEffect, useMemo, useState } from 'react'
import { formatUsdCurrencyCell } from 'utils'
import { gql } from 'graphql-request'
import { useNavigate } from 'react-router-dom'
import { t } from '@lingui/macro'
import TokenItem from 'components/token-item'

const query = gql`
  query GetTokenListOverview {
    rtokens(orderBy: cumulativeUniqueUsers, orderDirection: desc) {
      id
      cumulativeUniqueUsers
      targetUnits
      rsrStaked
      rsrPriceUSD
      token {
        name
        symbol
        lastPriceUSD
        holderCount
        transferCount
        totalSupply
        cumulativeVolume
      }
    }
  }
`

const useTokens = () => {
  const { data } = useQuery(query)
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    if (data?.rtokens) {
      setTokens(
        data.rtokens.map((rtoken: any) => ({
          id: getAddress(rtoken.id),
          targetUnits: rtoken.targetUnits,
          name: rtoken.token.name,
          symbol: rtoken.token.symbol,
          price: rtoken.token.lastPriceUSD,
          holders: rtoken.token.holderCount,
          transactionCount: rtoken.token.transferCount,
          cumulativeVolume:
            +formatEther(rtoken.token.cumulativeVolume) *
            +rtoken.token.lastPriceUSD,
          staked: +formatEther(rtoken.rsrStaked) * rtoken.rsrPriceUSD,
          marketCap:
            +formatEther(rtoken.token.totalSupply) * rtoken.token.lastPriceUSD,
        }))
      )
    }
  }, [data])

  return tokens
}

const UnlistedTokensTable = () => {
  const navigate = useNavigate()
  const data = useTokens()

  const columns = useMemo(
    () => [
      {
        Header: t`Name`,
        accessor: 'name',
        Cell: (data: any) => {
          return (
            <Box sx={{ minWidth: 150 }}>
              <TokenItem symbol={data.cell.value} logo={'/svgs/default.svg'} />
            </Box>
          )
        },
      },
      {
        Header: t`Price`,
        accessor: 'price',
        Cell: formatUsdCurrencyCell,
      },
      {
        Header: t`Mkt Cap`,
        accessor: 'marketCap',
        Cell: formatUsdCurrencyCell,
      },
      {
        Header: t`Holders`,
        accessor: 'holders',
      },
      {
        Header: t`Txs`,
        accessor: 'transactionCount',
      },
      {
        Header: t`Volume`,
        accessor: 'cumulativeVolume',
        Cell: formatUsdCurrencyCell,
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
      {
        Header: t`Staked`,
        accessor: 'staked',
        Cell: formatUsdCurrencyCell,
      },
    ],
    []
  )

  const handleClick = (data: any) => {
    navigate(`/overview?token=${data.id}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <Table
      pagination={{ pageSize: 10 }}
      onRowClick={handleClick}
      columns={columns}
      data={data}
    />
  )
}

export default UnlistedTokensTable
