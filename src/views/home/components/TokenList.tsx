import { getAddress } from '@ethersproject/address'
import { formatEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import { ContentHead } from 'components/info-box'
import { Table } from 'components/table'
import TokenItem from 'components/token-item'
import { ethers } from 'ethers'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { getRTokenLogo } from 'hooks/useRTokenLogo'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import tokenList from 'rtokens'
import {
  blockTimestampAtom,
  rpayOverviewAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { calculateApy, formatCurrencyCell, formatUsdCurrencyCell } from 'utils'
import { RSV_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import RSV from 'utils/rsv'

interface ListedToken {
  id: string
  name: string
  symbol: string
  supply: number
  holders: number
  price: number
  transactionCount: number
  cumulativeVolume: number
  targetUnits: string
  tokenApy: number
  backing: number
  backingInsurance: number
  stakingApy: number
}

const tokenKeys = [
  ...Object.keys(tokenList).map((s) => s.toLowerCase()),
  RSV_ADDRESS[CHAIN_ID].toLowerCase(),
]

const tokenListQuery = gql`
  query GetTokenListOverview($tokenIds: [String]!, $fromTime: Int!) {
    tokens(
      where: { id_in: $tokenIds }
      orderBy: totalSupply
      orderDirection: desc
    ) {
      id
      lastPriceUSD
      name
      symbol
      totalSupply
      holderCount
      transferCount
      cumulativeVolume
      rToken {
        backing
        backingInsurance
        targetUnits
        recentRate: hourlySnapshots(
          first: 1
          orderBy: timestamp
          where: { timestamp_gte: $fromTime }
          orderDirection: desc
        ) {
          rsrExchangeRate
          basketRate
          timestamp
        }
        lastRate: hourlySnapshots(
          first: 1
          orderBy: timestamp
          where: { timestamp_gte: $fromTime }
          orderDirection: asc
        ) {
          rsrExchangeRate
          basketRate
          timestamp
        }
      }
    }
  }
`

function getUnits(units: string[]): string[] {
  const set = new Set(units)

  return Array.from(set).map((unit: string) => {
    return ethers.utils.parseBytes32String(unit)
  })
}

const TokenList = (props: BoxProps) => {
  const navigate = useNavigate()
  const timestamp = useAtomValue(blockTimestampAtom)
  const rpayOverview = useAtomValue(rpayOverviewAtom)
  const fromTime = useMemo(() => {
    return timestamp - 2592000
  }, [!!timestamp])
  const { data, error } = useQuery(tokenListQuery, {
    tokenIds: tokenKeys,
    fromTime,
  })
  const rTokenPrice = useAtomValue(rTokenPriceAtom)

  const tokenList = useMemo((): ListedToken[] => {
    if (data) {
      return data.tokens.map((token: any): ListedToken => {
        let tokenApy = 0
        let stakingApy = 0

        const recentRate = token?.rToken?.recentRate[0]
        const lastRate = token?.rToken?.lastRate[0]

        if (
          recentRate &&
          lastRate &&
          recentRate.timestamp !== lastRate.timestamp
        ) {
          ;[tokenApy, stakingApy] = calculateApy(recentRate, lastRate)
        }

        const tokenData = {
          id: getAddress(token.id),
          name: token.name,
          symbol: token.symbol,
          supply: +formatEther(token.totalSupply) * +token.lastPriceUSD,
          holders: token.holderCount,
          price: token.lastPriceUSD,
          transactionCount: token.transferCount,
          cumulativeVolume:
            +formatEther(token.cumulativeVolume) * +token.lastPriceUSD,
          targetUnits: getUnits(
            token?.rToken?.targetUnits.split(',') || []
          ).join(', '),
          tokenApy: +tokenApy.toFixed(2),
          backing: token?.rToken?.backing || 100,
          backingInsurance: token?.rToken?.backingInsurance || 0,
          stakingApy: +stakingApy.toFixed(2),
        }

        // RSV Data
        if (token.id === RSV_ADDRESS[CHAIN_ID].toLowerCase()) {
          tokenData.holders += rpayOverview.holders
          tokenData.transactionCount += rpayOverview.txCount
          tokenData.cumulativeVolume += rpayOverview.volume
          tokenData.targetUnits = 'USD'
        }

        return tokenData
      })
    }

    return []
  }, [data, rTokenPrice, rpayOverview.txCount])

  const rTokenColumns = useMemo(
    () => [
      {
        Header: t`Token`,
        accessor: 'symbol',
        Cell: (data: any) => {
          const logo = getRTokenLogo(data.row.original.id)
          return <TokenItem symbol={data.cell.value} logo={logo} />
        },
      },
      { Header: t`Price`, accessor: 'price', Cell: formatUsdCurrencyCell },
      { Header: t`Mkt Cap`, accessor: 'supply', Cell: formatUsdCurrencyCell },
      { Header: t`Holders`, accessor: 'holders', Cell: formatCurrencyCell },
      {
        Header: t`Txs`,
        accessor: 'transactionCount',
        Cell: formatCurrencyCell,
      },
      {
        Header: t`Volume`,
        accessor: 'cumulativeVolume',
        Cell: formatUsdCurrencyCell,
      },
      {
        Header: t`Target(s)`,
        accessor: 'targetUnits',
        Cell: (cell: any) => {
          return (
            <Text
              sx={{
                whiteSpace: 'nowrap',
                maxWidth: '80px',
                display: 'block',
                overflow: 'auto',
              }}
            >
              {cell.value}
            </Text>
          )
        },
      },
      {
        Header: t`APY`,
        accessor: 'tokenApy',
        Cell: (cell: any) => <Text>{cell.value}%</Text>,
      },
      {
        Header: t`St APY`,
        accessor: 'stakingApy',
        Cell: (cell: any) => <Text>{cell.value}%</Text>,
      },
      {
        Header: t`Shortcuts`,
        accessor: 'id',
        Cell: (cell: any) => {
          return (
            <Flex>
              <SmallButton
                mr={2}
                px={3}
                variant="muted"
                onClick={() => navigate(`/issuance?token=${cell.value}`)}
              >
                <Trans>Mint</Trans>
              </SmallButton>
              {cell.value !== RSV.address.toLowerCase() && (
                <SmallButton
                  px={3}
                  variant="muted"
                  onClick={() => navigate(`/insurance?token=${cell.value}`)}
                >
                  <Trans>Stake</Trans>
                </SmallButton>
              )}
            </Flex>
          )
        },
      },
    ],
    []
  )
  return (
    <Box {...props}>
      <ContentHead
        pl={3}
        title={t`Compare RTokens`}
        subtitle={t`Including off-chain in-app transactions of RToken in the Reserve App.`}
      />
      <Table mt={3} columns={rTokenColumns} data={tokenList} />
    </Box>
  )
}

export default TokenList
