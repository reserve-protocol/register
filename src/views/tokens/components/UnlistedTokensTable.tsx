import { Trans, useLingui } from '@lingui/react/macro'
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
import useUnlistedTokens, { YieldDtfRow } from '../useUnlistedTokens'
import { sortByAtom } from '../atoms'
import YieldDtfFilters from './TableFilters'

const yieldDtfCountQuery = gql`
  query GetRTokenCount {
    protocol(id: "reserveprotocol-v1") {
      rTokenCount
    }
  }
`

type YieldDtfCountData = Record<
  number,
  { protocol?: { rTokenCount?: number | string } | null } | undefined
>

// Per chain: total minus the curated listed set — a missing per-chain count
// contributes 0, and the clamp keeps a stale count from going negative (A3).
export const sumUnlistedYieldDtfCount = (
  data: YieldDtfCountData | undefined,
  chains: readonly number[]
): number => {
  if (!data) return 0

  let total = 0
  for (const chain of chains) {
    const count = Number(data[chain]?.protocol?.rTokenCount)
    if (!Number.isFinite(count)) continue
    const listed = LISTED_RTOKEN_ADDRESSES[chain]?.length ?? 0
    total += Math.max(0, count - listed)
  }
  return total
}

const sortKeyMap: StringMap = {
  symbol: 'token__symbol',
  price: 'token__lastPriceUSD',
  marketCap: 'token__totalSupply',
  transactionCount: 'token__transactionCount',
  cumulativeVolume: 'token__cumulativeVolume',
  targetUnits: 'token__targetUnits',
  staked: 'token__staked',
}

const useYieldDtfCount = () => {
  const { data } = useMultichainQuery(yieldDtfCountQuery)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (data) {
      setCount(sumUnlistedYieldDtfCount(data, supportedChainList))
    }
  }, [data])

  return count
}

const UnlistedTokensTable = () => {
  const { t } = useLingui()
  const navigate = useNavigate()
  const data = useUnlistedTokens()
  const rTokenCount = useYieldDtfCount()
  const columnHelper = createColumnHelper<YieldDtfRow>()
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
    [t]
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
    <div data-testid="unlisted-tokens-table">
      <YieldDtfFilters />
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
        <span className="text-legend">
          <Trans>Total RTokens unlisted:</Trans>&nbsp;
        </span>
        <span className="ml-2 font-semibold">
          {formatCurrency(rTokenCount, 0)}
        </span>
      </div>
    </div>
  )
}

export default UnlistedTokensTable
