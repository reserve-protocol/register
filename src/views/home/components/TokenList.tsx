import { t, Trans } from '@lingui/macro'
import { ContentHead } from 'components/info-box'
import { Table } from 'components/table'
import { useMemo } from 'react'
import { Box, BoxProps, Flex } from 'theme-ui'
import tokenList from 'rtokens'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { formatEther } from '@ethersproject/units'
import { formatCurrencyCell, formatUsdCurrencyCell } from 'utils'
import { Button } from 'components'
import { useNavigate } from 'react-router-dom'
import { SmallButton } from 'components/button'
import { ROUTES } from 'utils/constants'

interface ListedToken {
  id: string
  name: string
  symbol: string
  supply: number
  holders: number
  price: number
  transactionCount: number
  cumulativeVolume: number
  targetUnit: string
  tokenApy: number
  backing: number
  backingInsurance: number
  stakingApy: number
}

const tokenKeys = Object.keys(tokenList).map((s) => s.toLowerCase())

const tokenListQuery = gql`
  query GetTokenListOverview($tokenIds: [String]!) {
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
      }
    }
  }
`

const TokenList = (props: BoxProps) => {
  const navigate = useNavigate()
  const { data } = useQuery(tokenListQuery, { tokenIds: tokenKeys })

  const tokenList = useMemo((): ListedToken[] => {
    if (data) {
      return data.tokens.map(
        (token: any): ListedToken => ({
          id: token.id,
          name: token.name,
          symbol: token.symbol,
          supply: +formatEther(token.totalSupply),
          holders: token.holderCount,
          price: token.lastPriceUSD,
          transactionCount: token.transferCount,
          cumulativeVolume: +formatEther(token.cumulativeVolume),
          targetUnit: 'USD',
          tokenApy: 0,
          backing: token?.rToken?.backing || 100,
          backingInsurance: token?.rToken.backingInsurance || 0,
          stakingApy: 0,
        })
      )
    }

    return []
  }, [data])

  const rTokenColumns = useMemo(
    () => [
      { Header: t`Token`, accessor: 'symbol' },
      { Header: t`Price`, accessor: 'price', Cell: formatUsdCurrencyCell },
      { Header: t`Mkt Cap`, accessor: 'supply', Cell: formatCurrencyCell },
      { Header: t`Holders`, accessor: 'holders' },
      { Header: t`Transactions`, accessor: 'transactionCount' },
      {
        Header: t`Volume`,
        accessor: 'cumulativeVolume',
        Cell: formatCurrencyCell,
      },
      { Header: t`Target unit(s)`, accessor: 'name' },
      { Header: t`RToken APY`, accessor: 'tokenApy' },
      { Header: t`Backing`, accessor: 'backing' },
      { Header: t`+Insurance`, accessor: 'backingInsurance' },
      { Header: t`Staking APY`, accessor: 'stakingApy' },
      {
        Header: t`Shortcuts`,
        accessor: 'id',
        Cell: (cell: any) => {
          return (
            <Flex>
              <Button
                mr={2}
                onClick={() => navigate(`/issuance?token=${cell.value}`)}
              >
                <Trans>Mint</Trans>
              </Button>
              <Button
                onClick={() => navigate(`/insurance?token=${cell.value}`)}
              >
                <Trans>Stake</Trans>
              </Button>
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
        title={t`Compare RTokens`}
        subtitle={t`Including off-chain in-app transactions of RToken in the Reserve App.`}
      />
      <Table mt={3} columns={rTokenColumns} data={tokenList} />
      <Flex sx={{ justifyContent: 'center' }}>
        <SmallButton py={2} mt={3} onClick={() => navigate(ROUTES.DEPLOY)}>
          <Trans>Deploy RToken</Trans>
        </SmallButton>
      </Flex>
    </Box>
  )
}

export default TokenList
