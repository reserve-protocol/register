import { formatEther } from '@ethersproject/units'
import { t } from '@lingui/macro'
import { ContentHead, InfoHeading } from 'components/info-box'
import { gql } from 'graphql-request'
import useQuery from 'hooks/useQuery'
import { useMemo } from 'react'
import { Box, Text, Flex, Grid } from 'theme-ui'
import { formatCurrency } from 'utils'

const Stat = ({ title, value }: { title: string; value: string }) => (
  <Box mt={3} mr={3}>
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
  query GetProtocolMetrics {
    protocol(id: "0x70bDA08DBe07363968e9EE53d899dFE48560605B") {
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
    ) {
      dailyVolumeUSD
    }
    usageMetricsDailySnapshots(
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      dailyTransactionCount
    }
  }
`

const TokenStats = () => {
  const { data } = useQuery(protocolMetricsQuery)
  const metrics = useMemo(() => {
    if (data) {
      return {
        totalValueLockedUSD: `$${formatCurrency(
          +data.protocol?.totalValueLockedUSD || 0
        )}`,
        totalRTokenUSD: `$${formatCurrency(
          +data.protocol?.totalRTokenUSD || 0
        )}`,
        cumulativeVolumeUSD: `$${formatCurrency(
          +data.protocol?.cumulativeVolumeUSD || 0
        )}`,
        cumulativeRTokenRevenueUSD: `$${formatCurrency(
          +data.protocol?.cumulativeRTokenRevenueUSD || 0
        )}`,
        cumulativeInsuranceRevenueUSD: `$${formatCurrency(
          +data.protocol?.cumulativeInsuranceRevenueUSD || 0
        )}`,
        transactionCount: data.protocol?.transactionCount || 0,
        dailyTransactionCount:
          data.usageMetricsDailySnapshots[0]?.dailyTransactionCount || 0,
        dailyVolume: `$${formatCurrency(
          +data.financialsDailySnapshots[0]?.dailyVolumeUSD || 0
        )}`,
      }
    }

    return defaultProtocolMetrics
  }, [data])

  return (
    <Box>
      <ContentHead
        title={t`RToken stats`}
        subtitle={t`These stats are aggregated across all RTokens on the Reserve Protocol that are supported by this dApp. This also includes anonymized data from the Reserve App API if RTokens are supported by RPay to give insights into total currency usage.`}
      />
      <Box
        mt={5}
        pl={5}
        sx={{
          borderLeft: '1px solid',
          borderColor: 'darkBorder',
        }}
      >
        <Grid columns={2} gap={4}>
          <InfoHeading
            title={t`Total RToken Market Cap`}
            subtitle={metrics.totalRTokenUSD}
          />
          <InfoHeading
            title={t`Cumalitive - RToken holder income`}
            subtitle={metrics.cumulativeRTokenRevenueUSD}
          />
          <InfoHeading
            title={t`TVL in Reserve`}
            subtitle={metrics.totalValueLockedUSD}
          />
          <InfoHeading
            title={t`Cumalitive - Staked RSR Income`}
            subtitle={metrics.cumulativeInsuranceRevenueUSD}
          />
        </Grid>
        <Flex mt={2} sx={{ flexWrap: 'wrap' }}>
          <Stat title={t`24h Tx Vol`} value={metrics.dailyVolume} />
          <Stat
            title={t`Cumulative Tx Volume`}
            value={metrics.cumulativeVolumeUSD}
          />
          <Stat title={t`24h Txs`} value={metrics.dailyTransactionCount} />
          <Stat title={t`Cumulative Txs`} value={metrics.transactionCount} />
        </Flex>
      </Box>
    </Box>
  )
}

export default TokenStats
