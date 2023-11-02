import { Table } from 'components/table'
import { Box, Text } from 'theme-ui'
import useQuery from 'hooks/useQuery'
import { useEffect, useMemo, useState } from 'react'
import { formatUsdCurrencyCell } from 'utils'
import { gql } from 'graphql-request'
import { useNavigate } from 'react-router-dom'
import { t } from '@lingui/macro'
import TokenItem from 'components/token-item'
import { Address, formatEther, getAddress } from 'viem'
import { rTokenListAtom } from 'state/atoms'
import { atom, useAtom, useAtomValue } from 'jotai'
import { Input } from 'components'
import { createColumnHelper } from '@tanstack/react-table'

const listedTokensAtom = atom((get) =>
  Object.keys(get(rTokenListAtom)).map((address) => address.toLowerCase())
)

const query = gql`
  query GetTokenListOverview($listed: [String]!, $skip: Int!) {
    rtokens(
      orderBy: cumulativeUniqueUsers
      orderDirection: desc
      first: 10
      skip: $skip
      where: { id_not_in: $listed }
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
}

const searchInputAtom = atom('')

const TokenSearchInput = () => {
  const [value, setValue] = useAtom(searchInputAtom)

  return (
    <Box mb={5} ml={3}>
      <Text ml={2} variant="legend">
        Search
      </Text>
      <Input
        mt={1}
        variant="smallInput"
        onChange={setValue}
        value={value}
        placeholder={t`Name, symbol or target`}
      />
    </Box>
  )
}

const useTokens = () => {
  const listed = useAtomValue(listedTokensAtom)
  const { data, error } = useQuery(query, {
    listed: listed.length ? listed : ['.'],
    skip: 0,
  })

  console.log('error', error)
  const [tokens, setTokens] = useState<RTokenRow[]>([])

  useEffect(() => {
    if (data?.rtokens) {
      setTokens(
        data.rtokens.map((rtoken: any) => ({
          id: getAddress(rtoken.id),
          targetUnits: rtoken.targetUnits,
          name: rtoken.token.name,
          symbol: rtoken.token.symbol,
          price: rtoken.token.lastPriceUSD,
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
  const columnHelper = createColumnHelper<RTokenRow>()

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
    ],
    []
  )

  const handleClick = (data: any) => {
    navigate(`/overview?token=${data.id}`)
    document.getElementById('app-container')?.scrollTo(0, 0)
  }

  return (
    <>
      <Box variant="layout.verticalAlign">
        <TokenSearchInput />
      </Box>
      <Table
        // pagination={{ pageSize: 10 }}
        onRowClick={handleClick}
        sorting
        columns={columns}
        data={data}
      />
    </>
  )
}

export default UnlistedTokensTable
