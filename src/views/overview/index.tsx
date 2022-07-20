import { formatEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import { Button, Container } from 'components'
import { ContentHead } from 'components/info-box'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { rsrPriceAtom, rTokenAtom, rTokenPriceAtom } from 'state/atoms'
import { Box, Divider, Grid } from 'theme-ui'
import { TokenStats } from 'types'
import { formatCurrency } from 'utils'
import About from './components/About'
import AssetOverview from './components/AssetOverview'
import HistoricalData from './components/HistoricalData'
import RecentProtocolTransactions from './components/RecentProtocolTransactions'
import RecentTokenTransactions from './components/RecentTokenTransactions'
import TokenOverview from './components/TokenOverview'
import TokenUsage from './components/TokenUsage'

const dividerProps = { my: 5, mx: -5 }
const gridProps = { columns: [1, 1, 1, 2], gap: 6 }

const rTokenMetricsQuery = gql`
  query GetProtocolMetrics($id: String!) {
    rtoken(id: $id) {
      insurance
      token {
        totalSupply
        transferCount
        cumulativeVolume
      }
    }
  }
`

const defaultStats = {
  insurance: 0,
  insuranceUsd: '$0',
  supply: 0,
  supplyUsd: '$0',
  cumulativeVolume: 0,
  cumulativeVolumeUsd: '$0',
  transferCount: 0,
}

const useTokenStats = (rTokenId: string): TokenStats => {
  const { data } = useQuery(rTokenMetricsQuery, {
    id: rTokenId,
  })
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)

  return useMemo(() => {
    if (data && data.rtoken) {
      const insurance = +formatEther(data?.rtoken.insurance)
      const supply = +formatEther(data?.rtoken.token.totalSupply)
      const cumulativeVolume = +formatEther(data?.rtoken.token.cumulativeVolume)

      const metrics = {
        insurance,
        supply,
        cumulativeVolume,
        transferCount: +data?.rtoken.token.transferCount,
        insuranceUsd: `$${formatCurrency(insurance * rsrPrice)}`,
        supplyUsd: `$${formatCurrency(supply * rTokenPrice)}`,
        cumulativeVolumeUsd: `$${formatCurrency(
          cumulativeVolume * rTokenPrice
        )}`,
      }

      return metrics
    }

    return defaultStats
  }, [data, rsrPrice, rTokenPrice])
}

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = () => {
  const rToken = useAtomValue(rTokenAtom)
  const rTokenMetrics = useTokenStats(rToken?.address.toLowerCase() ?? '')

  return (
    <Container>
      <TokenOverview metrics={rTokenMetrics} />
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <TokenUsage metrics={rTokenMetrics} />
        <RecentTokenTransactions />
      </Grid>
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <About />
        <AssetOverview />
      </Grid>
      <Divider {...dividerProps} />
      <Box>
        <Button px={3}>
          <Trans>Constitution</Trans>
        </Button>
      </Box>
      <Divider {...dividerProps} />
      <ContentHead
        title={t`Live & Historical data`}
        pl={3}
        mb={4}
        subtitle={
          !!rToken?.isRSV
            ? t`Including off-chain in-app transactions of RSV in the Reserve App.`
            : undefined
        }
      />
      <Grid {...gridProps} mb={3}>
        <HistoricalData />
        <RecentProtocolTransactions />
      </Grid>
    </Container>
  )
}

export default Overview
