import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { formatEther } from 'ethers/lib/utils'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { rpayOverviewAtom } from 'state/atoms'
import { Box, BoxProps, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { DEPLOYER_ADDRESS } from 'utils/addresses'
import { CHAIN_ID } from 'utils/chains'
import { TIME_RANGES } from 'utils/constants'

const Stat = ({ title, value }: { title: string; value: string }) => (
  <Box mb={2}>
    <Text sx={{ whiteSpace: 'nowrap' }} variant="legend">
      {title}
    </Text>{' '}
    <Text sx={{ color: 'boldText' }}>{value}</Text>
  </Box>
)

export const defaultProtocolMetrics = {
  totalValueLockedUSD: '$0',
  totalRTokenUSD: '$0',
  cumulativeVolumeUSD: '$0',
  cumulativeRTokenRevenueUSD: '$0',
  cumulativeInsuranceRevenueUSD: '$0',
  transactionCount: '0',
  dailyTransactionCount: '0',
  dailyVolume: '$0',
}

const protocolMetricsQuery = gql`
  query GetProtocolMetrics($id: String!, $fromTime: Int!) {
    token(id: "0x196f4727526ea7fb1e17b2071b3d8eaa38486988") {
      lastPriceUSD
      totalSupply
    }
    protocol(id: $id) {
      totalValueLockedUSD
      totalRTokenUSD
      cumulativeVolumeUSD
      cumulativeRTokenRevenueUSD
      cumulativeInsuranceRevenueUSD
      transactionCount
    }
    financialsDailySnapshots(
      orderBy: timestamp
      orderDirection: desc
      fist: 1
      where: { timestamp_gte: $fromTime }
    ) {
      dailyVolumeUSD
    }
    usageMetricsDailySnapshots(
      orderBy: timestamp
      orderDirection: desc
      first: 1
      where: { timestamp_gte: $fromTime }
    ) {
      dailyTransactionCount
    }
  }
`

const TokenStats = (props: BoxProps) => {
  const fromTime = useTimeFrom(TIME_RANGES.DAY)
  const { data } = useQuery(
    protocolMetricsQuery,
    {
      id: DEPLOYER_ADDRESS[CHAIN_ID],
      fromTime,
    },
    { refreshInterval: 5000 }
  )
  const rpayOverview = useAtomValue(rpayOverviewAtom)

  const metrics = useMemo(() => {
    if (data) {
      const rsvMarket =
        +formatEther(data.token?.totalSupply || '0') *
        (+data.token?.lastPriceUSD || 0)

      return {
        totalValueLockedUSD: `$${formatCurrency(
          (+data.protocol?.totalValueLockedUSD || 0) + rsvMarket
        )}`,
        totalRTokenUSD: `$${formatCurrency(
          (+data.protocol?.totalRTokenUSD || 0) + rsvMarket
        )}`,
        cumulativeVolumeUSD: `$${formatCurrency(
          rpayOverview.volume + (+data.protocol?.cumulativeVolumeUSD || 0)
        )}`,
        cumulativeRTokenRevenueUSD: `$${formatCurrency(
          +data.protocol?.cumulativeRTokenRevenueUSD || 0
        )}`,
        cumulativeInsuranceRevenueUSD: `$${formatCurrency(
          +data.protocol?.cumulativeInsuranceRevenueUSD || 0
        )}`,
        transactionCount: formatCurrency(
          rpayOverview.txCount + (data.protocol?.transactionCount || 0)
        ),
        dailyTransactionCount: formatCurrency(
          +data.usageMetricsDailySnapshots[0]?.dailyTransactionCount || 0
        ),
        dailyVolume: `$${formatCurrency(
          +data.financialsDailySnapshots[0]?.dailyVolumeUSD || 0
        )}`,
      }
    }

    return defaultProtocolMetrics
  }, [data, rpayOverview.txCount])

  return (
    <Box pl={3} {...props}>
      <ContentHead
        mr={5}
        sx={{ maxWidth: 600 }}
        title={t`RToken stats`}
        subtitle={t`These stats are aggregated across all RTokens on the Reserve Protocol that are supported by this dApp. This also includes anonymized data from the Reserve app API if RTokens are supported by RPay to give insights into total currency usage.`}
      />
      <Box mt={6}>
        <Grid columns={[1, 'max-content max-content']} gap={5}>
          <Box>
            <InfoHeading
              title={t`Total RToken Market Cap`}
              subtitle={metrics.totalRTokenUSD}
              help={t`Includes market cap of all RTokens and RSV.`}
              mb={4}
            />
            <InfoHeading
              title={t`TVL in Reserve`}
              help={t`Includes RTokens, staked RSR, and RSV.`}
              subtitle={metrics.totalValueLockedUSD}
            />
          </Box>
          <Box>
            <InfoHeading
              title={t`Cumulative - RToken holder income`}
              subtitle={metrics.cumulativeRTokenRevenueUSD}
              mb={4}
            />
            <InfoHeading
              title={t`Cumulative - Staked RSR income`}
              subtitle={metrics.cumulativeInsuranceRevenueUSD}
            />
          </Box>
        </Grid>
        <Box mt={6}>
          <Stat title={t`24h Tx Volume`} value={metrics.dailyVolume} />
          <Stat
            title={t`Cumulative Tx Volume`}
            value={metrics.cumulativeVolumeUSD}
          />
          <Stat title={t`24h Txs`} value={metrics.dailyTransactionCount} />
          <Stat title={t`Cumulative Txs`} value={metrics.transactionCount} />
        </Box>
      </Box>
    </Box>
  )
}

export default TokenStats
