import { formatEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import { Button, Container } from 'components'
import CopyValue from 'components/button/CopyValue'
import { ContentHead } from 'components/info-box'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useEffect } from 'react'
import { rsrPriceAtom, rTokenAtom, rTokenPriceAtom } from 'state/atoms'
import { tokenMetricsAtom } from 'state/metrics/atoms'
import { Box, Divider, Grid, Text } from 'theme-ui'
import { TokenStats } from 'types'
import { formatCurrency, shortenAddress } from 'utils'
import { TIME_RANGES } from 'utils/constants'
import About from './components/About'
import AssetOverview from './components/AssetOverview'
import HistoricalData from './components/HistoricalData'
import RecentProtocolTransactions from './components/RecentProtocolTransactions'
import RecentRSVTransactions from './components/RecentRSVTransactions'
import RecentTokenTransactions from './components/RecentTokenTransactions'
import TokenOverview from './components/TokenOverview'
import TokenUsage from './components/TokenUsage'

const dividerProps = { my: 7, mx: [-4, -7], sx: { borderColor: 'darkBorder' } }
const gridProps = { columns: [1, 1, 1, 2], gap: 6 }

const rTokenMetricsQuery = gql`
  query GetProtocolMetrics($id: String!, $fromTime: Int!) {
    rtoken(id: $id) {
      insurance
    }
    token(id: $id) {
      totalSupply
      transferCount
      cumulativeVolume
      dailyTokenSnapshot(
        orderBy: timestamp
        orderDirection: desc
        first: 1
        where: { timestamp_gte: $fromTime }
      ) {
        dailyVolume
        dailyEventCount
      }
    }
  }
`

const useTokenStats = (rTokenId: string): TokenStats => {
  const [stats, setStats] = useAtom(tokenMetricsAtom)
  const fromTime = useTimeFrom(TIME_RANGES.DAY)

  const { data } = useQuery(
    rTokenMetricsQuery,
    {
      id: rTokenId,
      fromTime,
    },
    { refreshInterval: 5000 }
  )
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
      <Grid {...gridProps} ml={[0, 5]} gap={0}>
        <Box>
          <TokenOverview ml={[5, 0]} metrics={rTokenMetrics} />
          <TokenUsage ml={[5, 0]} mt={7} metrics={rTokenMetrics} />
        </Box>
        {rToken?.isRSV ? (
          <RecentRSVTransactions />
        ) : (
          <RecentTokenTransactions mt={[7, 7, 7, 0]} />
        )}
      </Grid>
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <About ml={5} />
        <AssetOverview />
      </Grid>
      <Divider
        {...dividerProps}
        sx={{ borderColor: 'darkBorder', display: ['none', 'block'] }}
      />
      <Box
        variant="layout.verticalAlign"
        sx={{ display: ['none', 'flex'], flexWrap: 'wrap' }}
        ml={5}
      >
        <Button variant="muted" px={5} mr={3}>
          <Trans>Constitution</Trans>
        </Button>
        <Button variant="muted" px={5}>
          <Trans>Governance</Trans>
        </Button>
        {!!rToken?.address && (
          <>
            <Text ml="auto">{shortenAddress(rToken.address)}</Text>
            <CopyValue ml={3} value={rToken.address} />
          </>
        )}
      </Box>
      <Divider {...dividerProps} />
      <ContentHead
        title={t`Live & Historical data`}
        ml={5}
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
