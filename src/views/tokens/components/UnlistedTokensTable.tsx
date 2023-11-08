import { Trans, t } from '@lingui/macro'
import { createColumnHelper } from '@tanstack/react-table'
import { Input } from 'components'
import Help from 'components/help'
import ChainLogo from 'components/icons/ChainLogo'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import { gql } from 'graphql-request'
import { useMultichainQuery } from 'hooks/useQuery'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { rTokenListAtom } from 'state/atoms'
import { Box, Flex, Select, Text } from 'theme-ui'
import { StringMap } from 'types'
import { formatCurrency, formatUsdCurrencyCell } from 'utils'
import { _atomWithDebounce } from 'utils/atoms/atomWithDebounce'
import {
  CHAIN_TAGS,
  LISTED_RTOKEN_ADDRESSES,
  supportedChainList,
} from 'utils/constants'
import { Address, formatEther, getAddress } from 'viem'

const listedTokensAtom = atom((get) =>
  Object.keys(get(rTokenListAtom)).map((address) => address.toLowerCase())
)

const rTokenCountQuery = gql`
  query GetRTokenCount {
    protocol(id: "reserveprotocol-v1") {
      rTokenCount
    }
  }
`

const query = gql`
  query GetTokenListOverview(
    $listed: [String]!
    $limit: Int!
    $search: String!
    $by: String!
    $direction: OrderDirection!
  ) {
    rtokens(
      orderBy: $by
      orderDirection: $direction
      first: $limit
      where: {
        id_not_in: $listed
        token_: {
          or: [
            { name_contains_nocase: $search }
            { symbol_contains_nocase: $search }
          ]
        }
      }
    ) {
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

interface RTokenRow {
  id: Address
  targetUnits: string
  name: string
  symbol: string
  price: number
  transactionCount: number
  cumulativeVolume: number
  staked: number
  marketCap: number
  chain: number
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

const defaultSort = {
  id: 'token__totalSupply',
  desc: true,
}
const debouncedSearchInputAtom = _atomWithDebounce('')
const chainFilterAtom = atom(0)
const recordLimitAtom = atom(50)
const sortByAtom = atom<{ id: string; desc: boolean } | null>(defaultSort)

const tokenFilterAtom = atom((get) => {
  const listed = get(listedTokensAtom)
  const search = get(debouncedSearchInputAtom.debouncedValueAtom)
  const limit = get(recordLimitAtom)
  const chain = get(chainFilterAtom)
  const { id, desc } = get(sortByAtom) ?? defaultSort

  return {
    search,
    listed: listed.length ? listed : ['.'],
    limit,
    _chain: chain,
    by: id,
    direction: desc ? 'desc' : 'asc',
  }
})

const TokenSearchInput = () => {
  const value = useAtomValue(debouncedSearchInputAtom.currentValueAtom)
  const setValue = useSetAtom(debouncedSearchInputAtom.debouncedValueAtom)

  return (
    <Box ml={3} sx={{ width: 300 }}>
      <Text ml={2} variant="legend">
        <Trans>Search</Trans>
      </Text>
      <Input
        mt={1}
        onChange={setValue}
        value={value}
        placeholder={t`Input token name or symbol`}
      />
    </Box>
  )
}

const ChainSelectFilter = () => {
  const [value, setValue] = useAtom(chainFilterAtom)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(+e.target.value)
  }

  return (
    <Box ml={5}>
      <Text ml={2} variant="legend">
        <Trans>Network</Trans>
      </Text>
      <Select
        mt={1}
        onChange={handleChange}
        sx={{ width: 120 }}
        value={value}
        placeholder={t`Name, symbol or target`}
      >
        <option value={0}>All</option>
        {supportedChainList.map((chain) => (
          <option key={chain} value={chain}>
            {CHAIN_TAGS[chain]}
          </option>
        ))}
      </Select>
    </Box>
  )
}

const RecordLimitSelect = () => {
  const [value, setValue] = useAtom(recordLimitAtom)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(+e.target.value)
  }

  return (
    <Box ml={5}>
      <Box variant="layout.verticalAlign">
        <Text ml={2} mr={2} variant="legend">
          <Trans>Record limit</Trans>
        </Text>
        <Help content="Limit of records per chain" />
      </Box>

      <Select
        mt={1}
        onChange={handleChange}
        value={value}
        sx={{ width: 120 }}
        placeholder={t`Name, symbol or target`}
      >
        <option>10</option>
        <option>50</option>
        <option>100</option>
        <option>200</option>
        <option>500</option>
        <option>1000</option>
      </Select>
    </Box>
  )
}

const useTokens = (limit = 50) => {
  const filters = useAtomValue(tokenFilterAtom)
  const { data, error } = useMultichainQuery(query, filters)

  const [tokens, setTokens] = useState<RTokenRow[]>([])

  useEffect(() => {
    if (data) {
      const tokens: RTokenRow[] = []

      for (const chain of supportedChainList) {
        if (data[chain]) {
          tokens.push(
            ...data[chain].rtokens.map((rtoken: any) => ({
              id: getAddress(rtoken.id),
              targetUnits: rtoken.targetUnits,
              chain,
              name: rtoken.token.name,
              symbol: rtoken.token.symbol,
              price: rtoken.token.lastPriceUSD,
              transactionCount: rtoken.token.transferCount,
              cumulativeVolume:
                +formatEther(rtoken.token.cumulativeVolume) *
                +rtoken.token.lastPriceUSD,
              staked: +formatEther(rtoken.rsrStaked) * rtoken.rsrPriceUSD,
              marketCap:
                +formatEther(rtoken.token.totalSupply) *
                rtoken.token.lastPriceUSD,
            }))
          )
        }
      }

      setTokens(tokens)
    }
  }, [data])

  return tokens
}

const RTokenFilters = () => {
  return (
    <Box
      variant="layout.verticalAlign"
      sx={{ justifyContent: 'center' }}
      mb={5}
    >
      <TokenSearchInput />
      <ChainSelectFilter />
      <RecordLimitSelect />
    </Box>
  )
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
  const data = useTokens()
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
      navigate(`/overview?token=${data.id}`)
      document.getElementById('app-container')?.scrollTo(0, 0)
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
