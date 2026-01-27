import { Table, TableProps } from '@/components/ui/legacy-table'
import { cn } from '@/lib/utils'
import { Trans, t } from '@lingui/macro'
import { Row, createColumnHelper } from '@tanstack/react-table'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import ChainLogo from 'components/icons/ChainLogo'
import CirclesIcon from 'components/icons/CirclesIcon'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import Ethereum from 'components/icons/logos/Ethereum'
import TokenItem from 'components/token-item'
import useRTokenLogo from 'hooks/useRTokenLogo'
import useTokenList, { ListedToken } from 'hooks/useTokenList'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { formatCurrency, formatPercentage, formatUsdCurrencyCell } from 'utils'
import { TARGET_UNITS, supportedChainList } from 'utils/constants'
import ChainFilter from '../filters/ChainFilter'

const filtersAtom = atom<{ chains: string[]; targets: string[] }>({
  chains: supportedChainList.map((chain) => chain.toString()),
  targets: [TARGET_UNITS.USD, TARGET_UNITS.ETH],
})

const renderSubComponent = ({ row }: { row: Row<ListedToken> }) => {
  return (
    <div className="p-6 border-2 border-foreground rounded-[10px]">
      <pre style={{ fontSize: '10px' }}>
        <code>{JSON.stringify(row.original, null, 2)}</code>
      </pre>
    </div>
  )
}

const TargetFilter = () => {
  const [selected, setSelected] = useState(0)
  const setFilters = useSetAtom(filtersAtom)

  const options = useMemo(
    () => [
      {
        text: 'All',
        icon: <CirclesIcon />,
        filter: [TARGET_UNITS.ETH, TARGET_UNITS.USD],
      },
      {
        text: 'USD',
        filter: [TARGET_UNITS.USD],
        icon: <EarnNavIcon />,
      },
      {
        text: 'ETH',
        icon: <Ethereum />,
        filter: [TARGET_UNITS.ETH],
      },
    ],
    []
  )

  const handleSelect = (option: number) => {
    setSelected(option)
    setFilters((prev) => ({ ...prev, targets: options[option]?.filter ?? [] }))
  }

  return (
    <div className="flex items-center rounded-lg bg-input ml-2 mr-1 p-[2px]">
      {options.map(({ text, icon }, index) => (
        <div
          key={text}
          role="button"
          className={cn(
            'flex items-center justify-center cursor-pointer w-10 md:w-auto h-8 rounded-md py-1 px-2',
            index === selected ? 'bg-background' : 'bg-transparent'
          )}
          onClick={() => handleSelect(index)}
        >
          {icon}{' '}
          <span className="ml-2 hidden md:block">{text}</span>
        </div>
      ))}
    </div>
  )
}

const Filters = () => {
  const [filters, setFilters] = useAtom(filtersAtom)

  const handleChange = (key: string, selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  return (
    <div className="flex items-center ml-1">
      <ChainFilter
        selected={filters.chains}
        onChange={(selected) => handleChange('chains', selected)}
        className="mr-4"
      />
      <TargetFilter />
    </div>
  )
}

const useData = () => {
  const { list, isLoading } = useTokenList()
  const filters = useAtomValue(filtersAtom)

  return useMemo(() => {
    let data: ListedToken[] = []

    if (list?.length) {
      data = list.filter((token) => {
        return (
          (!filters.chains.length ||
            filters.chains.includes(token.chain.toString())) &&
          (!filters.targets.length ||
            !!filters.targets.find((t) => token.targetUnits.includes(t)))
        )
      })
    }

    return { list: data, isLoading }
  }, [list, filters])
}

const ExploreTokens = (props: Partial<TableProps>) => {
  const { list, isLoading } = useData()
  const columnHelper = createColumnHelper<ListedToken>()

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
          return <span className="w-[74px] block">{data.getValue()}</span>
        },
      }),
    ],
    []
  )

  const handleClick = (data: any, row: any) => {
    row.toggleExpanded()
  }

  return (
    <div className="my-4 md:my-8 mx-2 md:mx-6">
      <div className="flex items-center flex-wrap gap-2 mb-8">
        <BasketCubeIcon fontSize={32} />
        <h2 className="mr-auto text-xl font-medium">
          <Trans>Featured RTokens</Trans>
        </h2>
        <Filters />
      </div>
      <Table
        data={list}
        isLoading={isLoading && !list.length}
        columns={columns}
        onRowClick={handleClick}
        sorting
        sortBy={[{ id: 'supply', desc: true }]}
        renderSubComponent={renderSubComponent}
        {...props}
      />
    </div>
  )
}

export default ExploreTokens
