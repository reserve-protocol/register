import DecimalDisplay from '@/components/decimal-display'
import TokenLogo from '@/components/token-logo'
import StakeDrawer from '@/components/stake-drawer'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { ListedToken } from '@/hooks/useTokenList'
import { rsrPriceAtom, walletAtom } from '@/state/atoms'
import { Token } from '@/types'
import { formatCurrency } from '@/utils'
import {
  EarnGovernanceTokenCell,
  EarnGovernanceTokenSkeleton,
  EarnMetricCtaCell,
  EarnMetricCtaSkeleton,
} from '@/views/earn/components/earn-table-cells'
import {
  earnGovernsColumnClassName,
  earnMetricColumnClassName,
  earnTableClassName,
  earnTableRowClassName,
  earnTokenColumnClassName,
  earnTvlColumnClassName,
  earnWalletColumnClassName,
} from '@/views/earn/components/earn-table-styles'
import PositionBalance from '@/views/earn/components/position-balance'
import { Trans, useLingui } from '@lingui/react/macro'
import { createColumnHelper } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { useMemo, useState } from 'react'
import { Address } from 'viem'
import { filteredYieldDTFListAtom } from '../atoms'
import TableFilters from './table-filters'

const columnHelper = createColumnHelper<ListedToken>()

const useColumns = () => {
  const { t } = useLingui()
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const wallet = useAtomValue(walletAtom)

  return useMemo(() => {
    return [
      columnHelper.accessor('id', {
        header: t`Gov. Token`,
        meta: {
          className: earnTokenColumnClassName,
        },
        cell: (data) => (
          <EarnGovernanceTokenCell
            symbol="RSR"
            logoSrc="/svgs/rsr.svg"
            chainId={data.row.original.chain}
            secondarySymbol={data.row.original.stToken.symbol}
          />
        ),
      }),
      columnHelper.accessor('stakeUsd', {
        header: ({ column }) => (
          <SorteableButton column={column}>TVL</SorteableButton>
        ),
        meta: {
          className: earnTvlColumnClassName,
        },
        cell: (data) => (
          <div className="flex flex-col">
            <span>${formatCurrency(data.row.original.stakeUsd, 0)}</span>
            <span className="text-xs whitespace-nowrap sm:text-sm text-legend">
              <DecimalDisplay
                value={data.row.original.rsrStaked}
                decimals={2}
                compact={true}
              />{' '}
              RSR
            </span>
          </div>
        ),
      }),
      ...(wallet
        ? [
            columnHelper.accessor('rsrStaked', {
              header: t`Your stake`,
              meta: {
                className: earnWalletColumnClassName,
              },
              cell: (data) => (
                <PositionBalance
                  address={data.row.original.stToken.address as Address}
                  chain={data.row.original.chain}
                  price={rsrPrice || 0}
                  symbol={data.row.original.stToken.symbol}
                  decimals={data.row.original.stToken.decimals}
                />
              ),
            }),
          ]
        : []),
      columnHelper.accessor('symbol', {
        header: ({ column }) => (
          <SorteableButton column={column}>
            <Trans>Governs</Trans>
          </SorteableButton>
        ),
        meta: {
          className: earnGovernsColumnClassName,
        },
        cell: (data) => (
          <div className="flex items-center gap-2">
            <TokenLogo src={data.row.original.logo} />
            <span className="text-legend font-semibold">
              {data.row.original.symbol}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('stakingApy', {
        header: ({ column }) => (
          <SorteableButton column={column}>
            <Trans>Avg. 30d%</Trans>
          </SorteableButton>
        ),
        meta: {
          className: earnMetricColumnClassName,
        },
        cell: (data) => {
          return <EarnMetricCtaCell value={data.getValue()} label="APY" />
        },
      }),
    ]
  }, [rsrPrice, t, wallet])
}

const StakingPositionsSkeleton = ({
  showWalletPosition,
}: {
  showWalletPosition: boolean
}) => {
  const skeletonRows = Array.from({ length: 5 }, (_, index) => index)

  return (
    <>
      {skeletonRows.map((rowIndex) => (
        <TableRow
          key={`skeleton-${rowIndex}`}
          className="border-none hover:bg-transparent"
        >
          <TableCell>
            <EarnGovernanceTokenSkeleton symbolWidth="w-8" />
          </TableCell>

          <TableCell className="hidden min-[420px]:table-cell">
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </TableCell>

          {showWalletPosition && (
            <TableCell className="hidden lg:table-cell">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </TableCell>
          )}

          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </TableCell>

          <TableCell className="text-right">
            <EarnMetricCtaSkeleton />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

interface StakeDrawerData {
  stToken: Token
  dtf: {
    id: string
    symbol: string
    name: string
    logo?: string
  }
  chainId: number
}

const StakingPositions = () => {
  const data = useAtomValue(filteredYieldDTFListAtom)
  const wallet = useAtomValue(walletAtom)
  const columns = useColumns()
  const [currentDrawerData, setCurrentDrawerData] =
    useState<StakeDrawerData | null>(null)

  const handleRowClick = (dtf: ListedToken) => {
    // Prepare data for StakeDrawer
    const drawerData: StakeDrawerData = {
      stToken: {
        address: dtf.stToken.address,
        name: dtf.stToken.name,
        symbol: dtf.stToken.symbol,
        decimals: dtf.stToken.decimals,
      },
      dtf: {
        id: dtf.id,
        symbol: dtf.symbol,
        name: dtf.name,
        logo: dtf.logo,
      },
      chainId: dtf.chain,
    }
    setCurrentDrawerData(drawerData)
  }

  return (
    <>
      <div className="mt-4 bg-secondary p-1 rounded-4xl md:mt-10">
        <TableFilters />
        <DataTable
          columns={columns}
          data={data || []}
          onRowClick={handleRowClick}
          initialSorting={[{ id: 'stakingApy', desc: true }]}
          loading={data === undefined}
          loadingSkeleton={
            <StakingPositionsSkeleton showWalletPosition={!!wallet} />
          }
          getRowClassName={() => earnTableRowClassName}
          className={earnTableClassName}
        />
      </div>
      {currentDrawerData && (
        <StakeDrawer
          stToken={currentDrawerData.stToken}
          dtf={currentDrawerData.dtf}
          chainId={currentDrawerData.chainId}
          unstakeDelay={1209600} // 14 days in seconds
          open={!!currentDrawerData}
          onOpenChange={(open) => !open && setCurrentDrawerData(null)}
          onClose={() => setCurrentDrawerData(null)}
        />
      )}
    </>
  )
}

export default StakingPositions
