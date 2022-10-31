import { t } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from 'components/info-box'
import { Table } from 'components/table'
import { formatEther } from 'ethers/lib/utils'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useEffect, useMemo, useState } from 'react'
import { formatUsdCurrencyCell } from 'utils'

const query = gql`
  query GetTokenListOverview {
    rtokens(orderBy: cumulativeUniqueUsers, orderDirection: desc) {
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
        totalSupply
      }
    }
  }
`

const useTokens = () => {
  const { data } = useQuery(query)
  const [tokens, setTokens] = useState([])

  useEffect(() => {
    if (data?.rtokens) {
      setTokens(
        data.rtokens.map((rtoken: any) => ({
          address: rtoken.id,
          targetUnits: rtoken.targetUnits,
          name: rtoken.token.name,
          symbol: rtoken.token.symbol,
          price: rtoken.token.lastPriceUSD,
          holders: rtoken.token.holderCount,
          insurance: +formatEther(rtoken.rsrStaked) * rtoken.rsrPriceUSD,
          marketCap:
            +formatEther(rtoken.token.totalSupply) * rtoken.token.lastPriceUSD,
        }))
      )
    }
  }, [data])

  return tokens
}

const Tokens = () => {
  const columns = useMemo(
    () => [
      {
        Header: t`Name`,
        accessor: 'name',
      },
      {
        Header: t`Price`,
        accessor: 'price',
        Cell: formatUsdCurrencyCell,
      },
      {
        Header: t`MarketCap`,
        accessor: 'marketCap',
        Cell: formatUsdCurrencyCell,
      },
      {
        Header: t`RSR Staked`,
        accessor: 'insurance',
        Cell: formatUsdCurrencyCell,
      },
      {
        Header: t`Holders`,
        accessor: 'holders',
      },
    ],
    []
  )
  const data = useTokens()

  return (
    <Container>
      <ContentHead
        title={t`Register listed RTokens`}
        subtitle={t`RTokens in this list is not an endorsement or audited by us. It’s simply RTokens that have gone through our listing process and don’t seem like clear scams.`}
        mb={5}
        ml={3}
      />
      <Table pagination={{ pageSize: 5 }} columns={columns} data={data} />
    </Container>
  )
}

export default Tokens
