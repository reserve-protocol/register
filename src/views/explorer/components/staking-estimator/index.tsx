import { Trans, t } from '@lingui/macro'
import { CellContext, Row, createColumnHelper } from '@tanstack/react-table'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import ChainLogo from 'components/icons/ChainLogo'
import { Table, TableProps } from 'components/table'
import TokenItem from 'components/token-item'
import useRTokenLogo from 'hooks/useRTokenLogo'
import useTokenList, { ListedToken } from 'hooks/useTokenList'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, Link, Text } from 'theme-ui'
import {
  formatCurrency,
  formatPercentage,
  formatUsdCurrencyCell,
  getTokenRoute,
} from 'utils'
import { ROUTES, TARGET_UNITS, supportedChainList } from 'utils/constants'
import CirclesIcon from 'components/icons/CirclesIcon'
import Ethereum from 'components/icons/logos/Ethereum'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import { borderRadius } from 'theme'
import ChainFilter from 'views/explorer/components/filters/ChainFilter'
import CalculatorIcon from 'components/icons/CalculatorIcon'

const filtersAtom = atom<{ chains: string[]; targets: string[] }>({
  chains: supportedChainList.map((chain) => chain.toString()),
  targets: [TARGET_UNITS.USD, TARGET_UNITS.ETH],
})

const renderSubComponent = ({ row }: { row: Row<ListedToken> }) => {
  return (
    <Box
      p={4}
      sx={{ border: '2px solid', borderColor: 'text', borderRadius: 10 }}
    >
      <pre style={{ fontSize: '10px' }}>
        <code>{JSON.stringify(row.original, null, 2)}</code>
      </pre>
    </Box>
  )
}

const cellShares = (data: CellContext<ListedToken, number | number[]>) => {
  const value = data.getValue()
  const sharePercents = Array.isArray(value) ? value : [value]

  const totalYield =
    (data.row.original.supply * data.row.original.basketApy) / 100
  return (
    <>
      {sharePercents.length < 1 && <Text variant="legend">-</Text>}
      <Box
        variant="layout.verticalAlign"
        sx={{
          flexWrap: 'wrap',
          gap: 2,
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        {sharePercents.map((sharePercent) => (
          <Box variant="layout.verticalAlign">
            <Text sx={{ whiteSpace: 'nowrap' }}>
              {formatPercentage(sharePercent)}
            </Text>
            {sharePercent > 0 && (
              <Text
                ml="2"
                variant="legend"
                title={`$${formatCurrency((sharePercent / 100) * totalYield)}`}
              >
                (~$
                {formatCurrency((sharePercent / 100) * totalYield, 2, {
                  notation: 'compact',
                })}
                )
              </Text>
            )}
          </Box>
        ))}
      </Box>
    </>
  )
}

const ExploreStakingEstimator = (props: Partial<TableProps>) => {
  const { list, isLoading } = useTokenList()
  const columnHelper = createColumnHelper<ListedToken>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('symbol', {
        header: t`Token`,
        cell: (data) => {
          const logo = useRTokenLogo(
            data.row.original.id,
            data.row.original.chain
          )
          return (
            <TokenItem
              symbol={data.getValue()}
              logo={logo}
              chainId={data.row.original.chain}
            />
          )
        },
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
      columnHelper.accessor((row) => parseFloat(row.distribution.holders), {
        id: 'Holders share',
        cell: cellShares,
      }),
      columnHelper.accessor((row) => parseFloat(row.distribution.stakers), {
        id: 'Stakers share',
        cell: cellShares,
      }),
      columnHelper.accessor(
        (row) =>
          row.distribution.external.map((dist) => parseFloat(dist.total)),
        {
          id: 'External shares',
          cell: cellShares,
        }
      ),
      columnHelper.accessor(
        (row) => {
          const totalYield = (row.supply * row.basketApy) / 100
          const stakerYieldPercent = parseFloat(row.distribution.stakers)
          const totalRsrStakerYield = (totalYield * stakerYieldPercent) / 100

          return totalRsrStakerYield / row.rsrStaked
        },
        {
          id: 'Est. Yield per RSR',
          cell: (data) => `$${formatCurrency(data.getValue(), 5)}`,
        }
      ),
      columnHelper.accessor(
        (row) => {
          const totalYield = (row.supply * row.basketApy) / 100
          const stakerYieldPercent = parseFloat(row.distribution.stakers)
          const totalRsrStakerYield = (totalYield * stakerYieldPercent) / 100

          return (totalRsrStakerYield / row.rsrStaked) * 100000
        },
        {
          id: 'Est. Yield per 100k RSR',
          cell: (data) => (
            <Text
              sx={{
                fontWeight: 'bold',
              }}
            >
              ${formatCurrency(data.getValue())}
            </Text>
          ),
        }
      ),
      columnHelper.accessor('id', {
        header: t`Stake`,
        cell: (data) => (
          <Link
            href={getTokenRoute(
              data.getValue(),
              data.row.original.chain,
              ROUTES.STAKING
            )}
            onClick={(e) => e.stopPropagation()}
          >
            Stake
          </Link>
        ),
      }),
    ],
    []
  )

  const handleClick = (data: any, row: any) => {
    row.toggleExpanded()
  }

  return (
    <Box my={[3, 5]} mx={[2, 4]}>
      <Box
        variant="layout.verticalAlign"
        sx={{ flexWrap: 'wrap', gap: 2 }}
        mb={5}
      >
        <CalculatorIcon fontSize={32} viewBox="0 0 12 12" />
        <Text mr="auto" as="h2" variant="title" sx={{ fontSize: 4 }}>
          <Trans>Staking Estimator</Trans>
        </Text>
      </Box>
      <Table
        data={list}
        isLoading={isLoading && !list.length}
        columns={columns}
        onRowClick={handleClick}
        sorting
        sortBy={[{ id: 'supply', desc: true }]}
        sx={{ borderRadius: '0 0 20px 20px' }}
        renderSubComponent={renderSubComponent}
        {...props}
      />
    </Box>
  )
}

export default ExploreStakingEstimator
