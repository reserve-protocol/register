import { t } from '@lingui/macro'
import { Container } from 'components'
import { ContentHead } from 'components/info-box'
import useTokenStats from 'hooks/useTokenStats'
import { useAtomValue } from 'jotai/utils'
import { rTokenAtom } from 'state/atoms'
import { Box, Divider, Grid } from 'theme-ui'
import About from './components/About'
import AssetOverview from './components/AssetOverview'
import External from './components/External'
import HistoricalData from './components/HistoricalData'
import RecentProtocolTransactions from './components/RecentProtocolTransactions'
import RecentRSVTransactions from './components/RecentRSVTransactions'
import RecentTokenTransactions from './components/RecentTokenTransactions'
import TokenOverview from './components/TokenOverview'
import TokenUsage from './components/TokenUsage'

const dividerProps = { my: 5, mx: [-4, -5], sx: { borderColor: 'darkBorder' } }
const gridProps = { columns: [1, 1, 1, 2], gap: [5, 5, 5, 4] }

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = () => {
  const rToken = useAtomValue(rTokenAtom)
  const rTokenMetrics = useTokenStats(
    rToken?.address.toLowerCase() ?? '',
    rToken?.isRSV
  )

  return (
    <Container>
      <Grid {...gridProps} ml={[0, 0, 0, 3]} gap={0}>
        <Box>
          <TokenOverview ml={[3, 3, 3, 0]} metrics={rTokenMetrics} />
          <TokenUsage ml={[3, 3, 3, 0]} mt={5} metrics={rTokenMetrics} />
        </Box>
        {rToken?.isRSV ? (
          <RecentRSVTransactions mt={[5, 5, 5, 0]} />
        ) : (
          <RecentTokenTransactions mt={[5, 5, 5, 0]} />
        )}
      </Grid>
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <About ml={3} />
        <AssetOverview />
      </Grid>
      <Divider
        {...dividerProps}
        sx={{ borderColor: 'darkBorder', display: ['none', 'block'] }}
      />
      <External />
      <Divider {...dividerProps} />
      <ContentHead
        title={t`Live & Historical data`}
        ml={4}
        mb={4}
        subtitle={
          !!rToken?.isRSV
            ? t`Including off-chain in-app transactions of RSV in the Reserve App.`
            : undefined
        }
      />
      <Grid {...gridProps}>
        <HistoricalData />
        <RecentProtocolTransactions />
      </Grid>
    </Container>
  )
}

export default Overview
