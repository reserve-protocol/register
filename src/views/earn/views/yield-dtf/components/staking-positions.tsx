import DecimalDisplay from '@/components/decimal-display'
import ChainLogo from '@/components/icons/ChainLogo'
import TokenLogo from '@/components/token-logo'
import DataTable, { SorteableButton } from '@/components/ui/data-table'
import { ListedToken } from '@/hooks/useTokenList'
import { rsrPriceAtom } from '@/state/atoms'
import { Token } from '@/types'
import { formatCurrency, formatPercentage } from '@/utils'
import PositionBalance from '@/views/earn/components/position-balance'
import { createColumnHelper } from '@tanstack/react-table'
import { useAtomValue } from 'jotai'
import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Address } from 'viem'
import { filteredYieldDTFListAtom } from '../atoms'
import TableFilters from './table-filters'
import StakeDrawer from '@/components/stake-drawer'

const useColumns = () => {
  const columnHelper = createColumnHelper<ListedToken>()
  const rsrPrice = useAtomValue(rsrPriceAtom)

  return useMemo(() => {
    return [
      columnHelper.accessor('id', {
        header: 'Gov. Token',
        cell: (data) => (
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <TokenLogo src={'/svgs/rsr.svg'} size="xl" />
              <ChainLogo
                chain={data.row.original.chain}
                className="absolute -bottom-1 -right-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className=" font-semibold">RSR</span>
              <div className="flex items-center gap-1 text-xs whitespace-nowrap sm:text-sm text-legend">
                <ArrowRight size={14} className="hidden sm:block" />
                <span className="w-20 overflow-hidden text-ellipsis whitespace-nowrap sm:w-auto sm:overflow-visible sm:whitespace-normal">
                  {' '}
                  {data.row.original.stToken.symbol}
                </span>
              </div>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor('stakeUsd', {
        header: ({ column }) => (
          <SorteableButton column={column}>TVL</SorteableButton>
        ),
        meta: {
          className: 'hidden min-[420px]:table-cell',
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
      columnHelper.accessor('rsrStaked', {
        header: 'Staked',
        meta: {
          className: 'hidden lg:table-cell',
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
      columnHelper.accessor('symbol', {
        header: ({ column }) => (
          <SorteableButton column={column}>Governs</SorteableButton>
        ),
        cell: (data) => (
          <div className="flex items-center gap-1">
            <TokenLogo src={data.row.original.logo} />
            <span className="text-legend font-semibold">
              {data.row.original.symbol}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('stakingApy', {
        header: ({ column }) => (
          <SorteableButton column={column}>Avg. 30d%</SorteableButton>
        ),
        meta: {
          className: 'text-right',
        },
        cell: (data) => {
          return (
            <div className="flex items-center justify-end gap-1 text-primary font-semibold whitespace-nowrap">
              {formatPercentage(data.getValue())}{' '}
              <span className="hidden md:inline">APY</span>
              <ArrowRight size={16} strokeWidth={1.5} />
            </div>
          )
        },
      }),
    ]
  }, [rsrPrice])
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
  const columns = useColumns()
  const [currentDrawerData, setCurrentDrawerData] = useState<StakeDrawerData | null>(
    null
  )

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
      <div className="bg-secondary p-1 rounded-4xl">
        <TableFilters />
        <div className="bg-card rounded-3xl overflow-hidden sm:p-2 mt-1">
          <DataTable<ListedToken, any>
            columns={columns}
            data={data || []}
            onRowClick={handleRowClick}
            initialSorting={[{ id: 'stakingApy', desc: true }]}
          />
        </div>
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
