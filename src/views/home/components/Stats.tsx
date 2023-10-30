import TransactionsTable from 'components/transactions/table'
import { gql } from 'graphql-request'
import useDebounce from 'hooks/useDebounce'
import useQuery, { useMultichainQuery } from 'hooks/useQuery'
import { useMemo } from 'react'
import { rpayTransactionsAtom } from 'state/atoms'
import RpayTxListener from 'state/rpay/RpayTxListener'

import { t, Trans } from '@lingui/macro'
import { SmallButton } from 'components/button'
import ExternalArrowIcon from 'components/icons/ExternalArrowIcon'
import HomeStatsIcon from 'components/icons/HomeStatsIcon'
import { InfoHeading } from 'components/info-box'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { Box, BoxProps, Divider, Flex, Grid, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { formatEther } from 'viem'
import Help from '../../../components/help'
import { aggregatedProtocolMetricsAtom } from '../atoms/metricsAtom'
import useProtocolStats from '../hooks/useProtocolStats'
import { supportedChainList } from 'utils/constants'
import { RSVOverview } from 'utils/rsv'

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

const dividerProps = {
  my: [2, 5],
  sx: {
    borderStyle: 'dashed',
    borderColor: 'border',
    display: ['none', 'block'],
  },
}

const Stat = ({ title, value }: { title: string; value: string }) => (
  <Box mb={2}>
    <Text sx={{ whiteSpace: 'nowrap' }} variant="legend">
      {title}
    </Text>{' '}
    <Text sx={{ color: 'text' }}>{value}</Text>
  </Box>
)

const MainTokenStats = (props: BoxProps) => {
  const metrics = useAtomValue(aggregatedProtocolMetricsAtom)

  return (
    <Box
      px={3}
      mt={4}
      pb={[3, 0]}
      sx={(theme: any) => ({
        borderBottom: ['1px solid', 'none'],
        borderColor: theme.colors.border,
      })}
      {...props}
    >
      <HomeStatsIcon />
      <Flex
        sx={{
          display: 'flex',
          flexDirection: ['column', 'row'],
          justifyContent: 'space-between',
          alignItems: 'end',
        }}
        mt={3}
        mb={[3, 4]}
      >
        <Flex mb={[3, 0]} mr={'auto'} variant="layout.verticalAlign">
          <Text mr={3} variant="pageTitle">
            <Trans>RToken Stats</Trans>
          </Text>
          <Help
            content={t`These stats are across all RTokens on the Reserve Protocol listed by this dApp, including anonymized data from the Reserve Rpay app API.`}
          />
        </Flex>
        <SmallButton
          variant="transparent"
          sx={{ height: 'wrap' }}
          mr={['auto', 0]}
          onClick={() => {
            mixpanel.track('Visited Flipside Dashboard', {})
            window.open(
              'https://dune.com/reserve-protocol/reserve-protocol-overview',
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
            <Flex ml={2}>
              <ExternalArrowIcon />
            </Flex>
          </Flex>
        </SmallButton>
      </Flex>
      <Divider {...dividerProps} />
      <Flex
        sx={{
          flexDirection: ['row', 'column'],
          justifyContent: 'start',
          overflowX: ['auto', 'visible'],
          whiteSpace: ['nowrap', 'normal'],
        }}
        pb={4}
      >
        <InfoHeading
          title={t`Total RToken Market Cap`}
          subtitle={`$${formatCurrency(metrics.totalRTokenMarketUsd, 0)}`}
          help={t`Includes market cap of all RTokens and RSV.`}
        />
        <Divider {...dividerProps} />
        <InfoHeading
          title={t`TVL in Reserve`}
          help={t`Includes RTokens, staked RSR, and RSV.`}
          subtitle={`$${formatCurrency(metrics.tvl, 0)}`}
        />
        <Divider {...dividerProps} />
        <InfoHeading
          title={t`Cumulative - Staked RSR income`}
          subtitle={`$${formatCurrency(metrics.stakersRevenue, 0)}`}
        />
        <Divider {...dividerProps} />
        <InfoHeading
          title={t`Cumulative Tx Volume`}
          subtitle={`$${formatCurrency(
            metrics.volume + RSVOverview.volume,
            0
          )}`}
        />
      </Flex>
    </Box>
  )
}

const AdditionalTokenStats = (props: BoxProps) => {
  const metrics = useAtomValue(aggregatedProtocolMetricsAtom)

  return (
    <Flex
      pt={[5, 2]}
      px={3}
      mx={'auto'}
      sx={{
        display: ['none', 'flex'],
        textAlign: 'center',
        flexDirection: ['column', 'row'],
        justifyContent: 'space-between',
        maxWidth: '900px',
      }}
      {...props}
    >
      <Stat
        title={t`24h Tx Volume`}
        value={`$${formatCurrency(metrics.dailyVolume, 0)}`}
      />
      <Stat
        title={t`24h Txs`}
        value={metrics.dailyTransactionCount.toString()}
      />
      <Stat
        title={t`Cumulative Txs`}
        value={formatCurrency(
          metrics.transactionCount + RSVOverview.txCount,
          0
        )}
      />
      <Stat
        title={t`Cumulative - RToken holder income`}
        value={`$${formatCurrency(metrics.holdersRevenue, 0)}`}
      />
    </Flex>
  )
}

// Table of recent transactions
const TransactionsOverview = (props: BoxProps) => {
  const { data } = useMultichainQuery(
    protocolRecentTxsQuery,
    {},
    { refreshInterval: 60000 }
  )
  const rpayTx = useDebounce(useAtomValue(rpayTransactionsAtom), 1000)

  const txs = useMemo(() => {
    if (!data) {
      return []
    }

    const txs = [...rpayTx]

    for (const chain of supportedChainList) {
      txs.push(
        ...data[chain].entries.map((tx: any) => ({
          ...tx,
          amount: Number(formatEther(tx.amount)),
          symbol: tx?.token?.symbol ?? '',
          chain,
        }))
      )
    }

    txs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp))

    return txs.slice(0, 50)
  }, [data, rpayTx])

  return (
    <>
      <RpayTxListener />
      <TransactionsTable
        multichain
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

const ProtocolStats = () => {
  useProtocolStats()

  return (
    <>
      <Grid mb={[0, 8]} mt={2} gap={[5, 8]} columns={[1, 1, 1, 2]}>
        <MainTokenStats />
        <TransactionsOverview sx={{ display: ['none', 'block'] }} />
      </Grid>
      <Divider
        sx={{ display: ['none', 'block'] }}
        mx={[-1, 0]}
        mb={6}
        mt={[0, 8]}
      />
      <AdditionalTokenStats mb={[5, 6]} />
    </>
  )
}

export default ProtocolStats
