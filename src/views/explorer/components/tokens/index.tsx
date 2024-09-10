import { Trans, t } from '@lingui/macro'
import { Row, createColumnHelper } from '@tanstack/react-table'
import BasketCubeIcon from 'components/icons/BasketCubeIcon'
import ChainLogo from 'components/icons/ChainLogo'
import { Table, TableProps } from 'components/table'
import TokenItem from 'components/token-item'
import useRTokenLogo from 'hooks/useRTokenLogo'
import useTokenList, { ListedToken } from 'hooks/useTokenList'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Box, Text } from 'theme-ui'
import { formatCurrency, formatPercentage, formatUsdCurrencyCell } from 'utils'
import { TARGET_UNITS, supportedChainList } from 'utils/constants'
import ChainFilter from '../filters/ChainFilter'
import CirclesIcon from 'components/icons/CirclesIcon'
import Ethereum from 'components/icons/logos/Ethereum'
import EarnNavIcon from 'components/icons/EarnNavIcon'
import { borderRadius } from 'theme'

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
    <Box
      sx={{ borderRadius: borderRadius.inputs, background: 'inputBackground' }}
      variant="layout.verticalAlign"
      ml={2}
      mr={1}
      p={'2px'}
    >
      {options.map(({ text, icon }, index) => (
        <Box
          key={text}
          role="button"
          sx={{
            cursor: 'pointer',
            backgroundColor:
              index === selected ? 'backgroundNested' : 'transparent',
            width: ['40px', 'auto'],
            height: '32px',
            borderRadius: borderRadius.inner,
            justifyContent: 'center',
          }}
          variant="layout.verticalAlign"
          py={1}
          px={2}
          onClick={() => handleSelect(index)}
        >
          {icon}{' '}
          <Text ml="2" sx={{ display: ['none', 'block'] }}>
            {text}
          </Text>
        </Box>
      ))}
    </Box>
  )
}

const Filters = () => {
  const [filters, setFilters] = useAtom(filtersAtom)

  const handleChange = (key: string, selected: string[]) => {
    setFilters((prev) => ({ ...prev, [key]: selected }))
  }

  return (
    <Box variant="layout.verticalAlign" ml="1" sx={{ alignItems: 'flex-end' }}>
      <ChainFilter
        selected={filters.chains}
        onChange={(selected) => handleChange('chains', selected)}
        mr={3}
      />
      <TargetFilter />
    </Box>
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
      // columnHelper.accessor('id', {
      //   header: '',
      //   cell: ({ row }) => {
      //     return row.getIsExpanded() ? (
      //       <ChevronUp size={16} />
      //     ) : (
      //       <ChevronDown size={16} />
      //     )
      //   },
      // }),
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
        <BasketCubeIcon fontSize={32} />
        <Text mr="auto" as="h2" variant="title" sx={{ fontSize: 4 }}>
          <Trans>Featured RTokens</Trans>
        </Text>
        <Filters />
      </Box>
      <Table
        data={list}
        isLoading={isLoading && !list.length}
        columns={columns}
        onRowClick={handleClick}
        sorting
        sortBy={[{ id: 'supply', desc: true }]}
        sx={{ borderRadius: '0 0 20px 20px' }}
        compact
        renderSubComponent={renderSubComponent}
        {...props}
      />
    </Box>
  )
}

export default ExploreTokens
