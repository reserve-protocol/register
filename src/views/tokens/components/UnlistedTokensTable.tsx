import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import ChainLogo from 'components/icons/ChainLogo'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Flex, Text } from 'theme-ui'
import { StringMap } from 'types'
import { formatCurrency, formatUsdCurrencyCell, getTokenRoute } from 'utils'
import { LISTED_RTOKEN_ADDRESSES, supportedChainList } from 'utils/constants'
import useUnlistedTokens, { RTokenRow } from '../useUnlistedTokens'
import { sortByAtom } from '../atoms'
import RTokenFilters from './TableFilters'

const rTokenCountQuery = gql`
  query GetRTokenCount {
    protocol(id: "reserveprotocol-v1") {
      rTokenCount
    }
  }
`

const sortKeyMap: StringMap = {
  symbol: 'token__symbol',
  price: 'token__lastPriceUSD',
  marketCap: 'token__totalSupply',
  transactionCount: 'token__transactionCount',
  cumulativeVolume: 'token__cumulativeVolume',
  targetUnits: 'token__targetUnits',
  staked: 'token__staked',
}

const useRTokenCount = () => {
  const { data } = useMultichainQuery(rTokenCountQuery)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (data) {
      let total = 0

      for (const chain of supportedChainList) {
        total +=
          Number(data[chain].protocol.rTokenCount) -
          LISTED_RTOKEN_ADDRESSES[chain].length
      }

      setCount(total)
    }
  }, [data])

  return count
}

const UnlistedTokensTable = () => {
  const navigate = useNavigate()
  const data = useUnlistedTokens()
  const rTokenCount = useRTokenCount()
  const columnHelper = createColumnHelper<RTokenRow>()
  const setSorting = useSetAtom(sortByAtom)

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: t`Token`,
        cell: (data) => {
          return (
            <Box sx={{ minWidth: 150 }}>
              <TokenItem
                symbol={data.getValue()}
                logo={'/svgs/defaultLogo.svg'}
              />
            </Box>
          )
        },
      }),
      columnHelper.accessor('price', {
        header: t`Price`,
        cell: formatUsdCurrencyCell,
      }),
      columnHelper.accessor('marketCap', {
        header: t`Mkt Cap`,
        cell: formatUsdCurrencyCell,
      }),
      columnHelper.accessor('transactionCount', {
        header: t`Txs`,
      }),
      columnHelper.accessor('cumulativeVolume', {
        header: t`Volume`,
        cell: formatUsdCurrencyCell,
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
      columnHelper.accessor('staked', {
        header: t`Staked`,
        cell: formatUsdCurrencyCell,
      }),
      columnHelper.accessor('chain', {
        header: t`Network`,
        cell: (data) => {
          return <ChainLogo chain={data.getValue()} />
        },
      }),
    ],
    []
  )

  const handleClick = useCallback(
    (data: any) => {
      navigate(getTokenRoute(data.id, data.chain))
    },
    [navigate]
  )

  const handleSort = useCallback((getSortState: any) => {
    const [sorting] = getSortState()

    if (sortKeyMap[sorting?.id]) {
      setSorting({ id: sortKeyMap[sorting?.id], desc: sorting.desc })
    }
  }, [])

  return (
    <>
      <RTokenFilters />
      <Table
        pagination
        onRowClick={handleClick}
        sorting
        sortBy={[{ id: 'marketCap', desc: true }]}
        onSort={handleSort}
        columns={columns}
        data={data}
      />
      <Flex mt={3} sx={{ justifyContent: 'center' }}>
        <Text variant="legend">Total RTokens unlisted: </Text>
        <Text ml={2} variant="strong">
          {formatCurrency(rTokenCount, 0)}
        </Text>
      </Flex>
    </>
  )
}

export default UnlistedTokensTable
