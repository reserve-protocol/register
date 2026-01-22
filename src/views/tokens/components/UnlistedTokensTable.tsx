import { t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import ChainLogo from 'components/icons/ChainLogo'
import { Table } from '@/components/ui/legacy-table'
import TokenItem from 'components/token-item'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/use-query'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
            <div className="min-w-[150px]">
              <TokenItem
                symbol={data.getValue()}
                logo={'/svgs/defaultLogo.svg'}
              />
            </div>
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
        header: t`Volume (all time)`,
        cell: formatUsdCurrencyCell,
      }),
      columnHelper.accessor('targetUnits', {
        header: t`Target(s)`,
        cell: (data) => {
          return (
            <span className="w-[74px] block">
              {data.getValue()}
            </span>
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
      <div className="flex mt-4 justify-center">
        <span className="text-legend">Total RTokens unlisted: </span>
        <span className="ml-2 font-semibold">
          {formatCurrency(rTokenCount, 0)}
        </span>
      </div>
    </>
  )
}

export default UnlistedTokensTable
