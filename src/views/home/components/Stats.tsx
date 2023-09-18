import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useDebounce from 'hooks/useDebounce'
import useQuery from 'hooks/useQuery'
import { useMemo } from 'react'
import { chainIdAtom, rpayTransactionsAtom } from 'state/atoms'
import RpayTxListener from 'state/rpay/RpayTxListener'

import { t, Trans } from '@lingui/macro'
import HomeStatsIcon from 'components/icons/HomeStatsIcon'
import { InfoHeading } from 'components/info-box'
import useTimeFrom from 'hooks/useTimeFrom'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { rpayOverviewAtom, rsrPriceAtom, rTokenMetricsAtom } from 'state/atoms'
import { Box, BoxProps, Divider, Flex, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { PROTOCOL_SLUG, TIME_RANGES } from 'utils/constants'
import Help from '../../../components/help'
import { formatEther } from 'viem'
import { SmallButton } from 'components/button'
import mixpanel from 'mixpanel-browser'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'

// Here you could create a main component that holds all the logic
const Main = () => {
  const dividerProps = {
    my: [2, 5],
    sx: {
      borderStyle: 'dashed',
      borderColor: ['background', 'border'],
    },
  }

  const protocolRecentTxsQuery = gql`
    query GetProtocolRecentTransactions {
      entries(orderBy: timestamp, orderDirection: desc, first: 25) {
        type
        amount
        amountUSD
        hash
        timestamp
        token {
          symbol
        }
      }
    }
  `

  const protocolMetricsQuery = gql`
    query GetProtocolMetrics($id: String!, $fromTime: Int!) {
      token(id: "0x196f4727526ea7fb1e17b2071b3d8eaa38486988") {
        lastPriceUSD
        totalSupply
        cumulativeVolume
        transferCount
      }
      protocol(id: $id) {
        totalValueLockedUSD
        totalRTokenUSD
        cumulativeVolumeUSD
        cumulativeRTokenRevenueUSD
        cumulativeRSRRevenueUSD
        rsrRevenue
        transactionCount
        rsrStaked
        rsrStakedUSD
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
  const chainId = useAtomValue(chainIdAtom)
  const fromTime = useTimeFrom(TIME_RANGES.DAY)
  const { data } = useQuery(protocolMetricsQuery, {
    id: PROTOCOL_SLUG,
    fromTime,
    chainId,
  })

  const rpayOverview = useAtomValue(rpayOverviewAtom)
  const [metrics, setMetrics] = useAtom(rTokenMetricsAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)

  useEffect(() => {
    if (data) {
      const rsvMarket =
        +formatEther(data.token?.totalSupply || '0') *
        (+data.token?.lastPriceUSD || 0)
      const rsvVolume =
        +formatEther(data.token?.cumulativeVolume || '0') *
          (+data.token?.lastPriceUSD || 0) +
        rpayOverview.volume

      const marketCapUsd = (+data.protocol?.totalRTokenUSD || 0) + rsvMarket

      setMetrics({
        totalValueLockedUSD: `$${formatCurrency(
          marketCapUsd + (+data.protocol?.rsrStakedUSD || 0)
        )}`,
        totalRTokenUSD: `$${formatCurrency(marketCapUsd)}`,
        cumulativeVolumeUSD: `$${formatCurrency(
          rsvVolume + (+data.protocol?.cumulativeVolumeUSD || 0)
        )}`,
        cumulativeRTokenRevenueUSD: `$${formatCurrency(
          +data.protocol?.cumulativeRTokenRevenueUSD || 0
        )}`,
        cumulativeStakingRevenueUSD: `$${formatCurrency(
          +data.protocol?.cumulativeRSRRevenueUSD || 0
        )}`,
        transactionCount: formatCurrency(
          rpayOverview.txCount +
            (+data.token?.transferCount || 0) +
            (+data.protocol?.transactionCount || 0)
        ),
        dailyTransactionCount: formatCurrency(
          rpayOverview.dayTxCount +
            (+data.usageMetricsDailySnapshots[0]?.dailyTransactionCount || 0)
        ),
        dailyVolume: `$${formatCurrency(
          rpayOverview.dayVolume +
            (+data.financialsDailySnapshots[0]?.dailyVolumeUSD || 0)
        )}`,
      })
    }
  }, [data, rpayOverview.txCount, rsrPrice])

  // Main token stats in the top grid
  const MainTokenStats = (props: BoxProps) => {
    return (
      <Box
        px={3}
        mt={[0, 4]}
        pb={[5, 0]}
        sx={(theme: any) => ({
          borderBottom: ['1px solid', 'none'],
          borderColor: theme.colors.border,
        })}
        {...props}
      >
        <HomeStatsIcon />
        <Flex mt={3} mb={[3, 4]} variant="layout.verticalAlign">
          <Text mr={3} variant="pageTitle">
            <Trans>RToken Stats</Trans>
          </Text>
          <Help
            content={t`These stats are across all RTokens on the Reserve Protocol listed by this dApp, including anonymized data from the Reserve Rpay app API.`}
          />
          <SmallButton
            ml="auto"
            variant="muted"
            onClick={() => {
              mixpanel.track('Visited Flipside Dashboard', {})
              window.open(
                'https://flipsidecrypto.xyz/Meir/r-tokens-overall-dashboard-Wx7xtA',
                '_blank'
              )
            }}
          >
            <Flex
              sx={{
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <Trans>View Dashboard</Trans>
              <Box mt={2} ml={1}>
                <ExternalArrowIcon />
              </Box>{' '}
            </Flex>
          </SmallButton>
        </Flex>
        <Divider {...dividerProps} />
        <Box>
          <InfoHeading
            title={t`Total RToken Market Cap`}
            subtitle={metrics.totalRTokenUSD}
            help={t`Includes market cap of all RTokens and RSV.`}
          />
          <Divider {...dividerProps} />
          <InfoHeading
            title={t`TVL in Reserve`}
            help={t`Includes RTokens, staked RSR, and RSV.`}
            subtitle={metrics.totalValueLockedUSD}
            {...dividerProps}
          />
          <Divider {...dividerProps} />
          <InfoHeading
            title={t`Cumulative - Staked RSR income`}
            subtitle={metrics.cumulativeStakingRevenueUSD}
          />
          <Divider {...dividerProps} />
          <InfoHeading
            title={t`Cumulative Tx Volume`}
            subtitle={metrics.cumulativeVolumeUSD}
          />
        </Box>
      </Box>
    )
  }
  // Table of recent transactions
  const TransactionsOverview = (props: BoxProps) => {
    const { data } = useQuery(
      protocolRecentTxsQuery,
      {},
      { refreshInterval: 10000 }
    )
    const rpayTx = useDebounce(useAtomValue(rpayTransactionsAtom), 1000)

    const txs = useMemo(() => {
      if (!data?.entries) {
        return []
      }

      const txs = [...rpayTx]

      // TODO: Parse type depending on lang
      txs.push(
        ...data.entries.map((tx: any) => ({
          ...tx,
          amount: Number(formatEther(tx.amount)),
          symbol: tx?.token?.symbol ?? '',
        }))
      )
      txs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

      return txs.slice(0, 20)
    }, [data, rpayTx])

    return (
      <>
        <RpayTxListener />
        <TransactionsTable
          compact
          bordered
          maxHeight={440}
          title={t`Transactions`}
          help={t`This includes on-chain transactions for RTokens and RSV in addition to anonymized Rpay transactions to show the full story of the Reserve ecosystem.`}
          data={txs}
          {...props}
        />
      </>
    )
  }

  // How to desplay stats that are less important
  const Stat = ({ title, value }: { title: string; value: string }) => (
    <Box mb={2}>
      <Text sx={{ whiteSpace: 'nowrap' }} variant="legend">
        {title}
      </Text>{' '}
      <Text sx={{ color: 'text' }}>{value}</Text>
    </Box>
  )

  // Additional stats shown below the main grid
  const AdditionalTokenStats = (props: BoxProps) => {
    return (
      <Flex
        pt={[5, 2]}
        px={3}
        mx={'auto'}
        sx={{
          display: 'flex',
          textAlign: 'center',
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between',
          maxWidth: '900px',
        }}
        {...props}
      >
        <Stat title={t`24h Tx Volume`} value={metrics.dailyVolume} />
        <Stat title={t`24h Txs`} value={metrics.dailyTransactionCount} />
        <Stat title={t`Cumulative Txs`} value={metrics.transactionCount} />
        <Stat
          title={t`Cumulative - RToken holder income`}
          value={metrics.cumulativeRTokenRevenueUSD}
        />
      </Flex>
    )
  }
  // Main component to export
  const Stats = (props: BoxProps) => {
    return (
      <Box>
        <Grid mb={[0, 8]} mt={2} gap={[5, 8]} columns={[1, 1, 1, 2]}>
          <MainTokenStats />
          <TransactionsOverview />
        </Grid>
        <Divider
          sx={{ display: ['none', 'block'] }}
          mx={[-1, 0]}
          mb={6}
          mt={[0, 8]}
        />
        <AdditionalTokenStats mb={[5, 6]} />
      </Box>
    )
  }

  return <Stats />
}

export default Main
