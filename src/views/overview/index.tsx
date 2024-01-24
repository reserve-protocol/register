import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { useEffect } from 'react'
import { rTokenAtom, selectedRTokenAtom } from 'state/atoms'
import { Box } from 'theme-ui'
import Hero from './components/Hero'

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

  useEffect(() => {
    mixpanel.track('Visted RToken Overview', {
      RToken: rToken?.address.toLowerCase() ?? '',
    })
  }, [])

  return (
    <Box>
      <Hero />
      {/* <TokenOverview mt={[3, 6]} ml={3} metrics={rTokenMetrics} />
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
      </Grid> */}
    </Box>
  )
}

export default Overview
