import { formatEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import { Button, Container } from 'components'
import { ContentHead } from 'components/info-box'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useEffect } from 'react'
import {
  blockTimestampAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { tokenMetricsAtom } from 'state/metrics/atoms'
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

const dividerProps = { my: 6, sx: { borderColor: 'darkBorder' } }
const gridProps = { columns: [1, 1, 1, 2], gap: 6 }

const rTokenMetricsQuery = gql`
  query GetProtocolMetrics($id: String!, $from: String!, $to: String!) {
    rtoken(id: $id) {
      insurance
    }
    token(id: $id) {
      totalSupply
      transferCount
      cumulativeVolume
      dailyTokenSnapshot(orderBy: timestamp, orderDirection: desc, first: 1) {
        dailyVolume
        dailyEventCount
      }
    }
  }
`

const useTokenStats = (rTokenId: string): TokenStats => {
  const currentTime = useAtomValue(blockTimestampAtom)
  const [stats, setStats] = useAtom(tokenMetricsAtom)
  const { data } = useQuery(rTokenMetricsQuery, {
    id: rTokenId,
    from: (currentTime - 24 * 60 * 60).toString(),
    to: currentTime.toString(),
  })
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)

  useEffect(() => {
    if (data?.rtoken && data?.token) {
      const insurance = +formatEther(data?.rtoken.insurance)
      const supply = +formatEther(data?.token.totalSupply)
      const cumulativeVolume = +formatEther(data?.token.cumulativeVolume)
      const dailyVolume = +formatEther(
        data?.token.dailyTokenSnapshot[0]?.dailyVolume ?? '0'
      )

      setStats({
        insurance,
        supply,
        cumulativeVolume,
        transferCount: +data?.token.transferCount,
        dailyTransferCount:
          +data?.token.dailyTokenSnapshot[0]?.dailyEventCount || 0,
        dailyVolume: `$${formatCurrency(dailyVolume)}`,
        insuranceUsd: `$${formatCurrency(insurance * rsrPrice)}`,
        supplyUsd: `$${formatCurrency(supply * rTokenPrice)}`,
        cumulativeVolumeUsd: `$${formatCurrency(
          cumulativeVolume * rTokenPrice
        )}`,
      })
    }
  }, [JSON.stringify(data), rTokenPrice])

  return stats
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
