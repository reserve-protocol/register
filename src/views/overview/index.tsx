import { formatEther } from '@ethersproject/units'
import { t, Trans } from '@lingui/macro'
import { Button, Container } from 'components'
import { ContentHead } from 'components/info-box'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import { useEffect } from 'react'
import { Copy } from 'react-feather'
import {
  blockTimestampAtom,
  rsrPriceAtom,
  rTokenAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { tokenMetricsAtom } from 'state/metrics/atoms'
import { Box, Divider, Grid, IconButton, Text } from 'theme-ui'
import { TokenStats } from 'types'
import { formatCurrency, shortenAddress } from 'utils'
import About from './components/About'
import AssetOverview from './components/AssetOverview'
import HistoricalData from './components/HistoricalData'
import RecentProtocolTransactions from './components/RecentProtocolTransactions'
import RecentTokenTransactions from './components/RecentTokenTransactions'
import TokenOverview from './components/TokenOverview'
import TokenUsage from './components/TokenUsage'

const dividerProps = { my: 7, mx: -7, sx: { borderColor: 'darkBorder' } }
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
      <Grid {...gridProps} ml={5} gap={0}>
        <Box>
          <TokenOverview metrics={rTokenMetrics} />
          <TokenUsage mt={7} metrics={rTokenMetrics} />
        </Box>
        <RecentTokenTransactions mt={7} />
      </Grid>
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <About ml={5} />
        <AssetOverview />
      </Grid>
      <Divider {...dividerProps} />
      <Box variant="layout.verticalAlign" ml={5}>
        <Button variant="muted" px={5} mr={3}>
          <Trans>Constitution</Trans>
        </Button>
        <Button variant="muted" px={5}>
          <Trans>Governance</Trans>
        </Button>
        {!!rToken?.address && (
          <>
            <Text ml="auto">{shortenAddress(rToken.address)}</Text>
            <IconButton
              ml={2}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigator.clipboard.writeText(rToken.address)}
            >
              <Copy color="#666666" size={14} />
            </IconButton>
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
