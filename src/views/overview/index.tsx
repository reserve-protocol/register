import { Container } from 'components'
import useTokenStats from 'hooks/useTokenStats'
import { useAtomValue } from 'jotai'
import { rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import { Divider, Grid } from 'theme-ui'
import About from './components/About'
import AssetOverview from './components/AssetOverview'
import External from './components/External'
import HistoricalData from './components/HistoricalData'
import RecentTransactions from './components/RecentTransactions'
import RevenueSplitOverview from './components/RevenueSplitOverview'
import TokenOverview from './components/TokenOverview'
import TokenUsage from './components/TokenUsage'

const dividerProps = { my: [4, 8], mx: [-1, -3], sx: { borderColor: 'border' } }
const gridProps = { columns: [1, 1, 1, 2], gap: [5, 5, 5, 4] }

/**
 * RToken Overview
 * Displays an overview of the RToken Market and transactions stadistics
 *
 * @returns React.Component
 */
const Overview = () => {
  const rTokenAddress = useAtomValue(selectedRTokenAtom)
  const rToken = useAtomValue(rTokenAtom)

  const rTokenMetrics = useTokenStats(
    rTokenAddress?.toLowerCase() ?? '',
    !!rToken && !rToken.main
  )

  return (
    <Container>
      <TokenOverview mt={[3, 6]} ml={3} metrics={rTokenMetrics} />
      <Divider {...dividerProps} />
      <TokenUsage ml={3} metrics={rTokenMetrics} />
      <Divider {...dividerProps} />
      <About mt={6} px={3} />
      <Divider mt={4} sx={{ border: 'none' }} />
      <External />
      <Divider {...dividerProps} />
      <Grid {...gridProps}>
        <AssetOverview />
        <RevenueSplitOverview />
      </Grid>
      <Divider {...dividerProps} mt={[0, 0, 0, 5]} />
      <Grid {...gridProps}>
        <HistoricalData />
        <RecentTransactions />
      </Grid>
    </Container>
  )
}

export default Overview
