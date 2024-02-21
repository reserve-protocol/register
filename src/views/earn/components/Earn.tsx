import YieldIcon from 'components/icons/YieldIcon'
import { useAtomValue } from 'jotai'
import { Box, Grid, Text } from 'theme-ui'
import { filteredPoolsAtom } from '../atoms'
import PoolsTable from './PoolsTable'
import TableFilters from './TableFilters'

const EarnHeader = () => (
  <Grid columns={[1, '40px 1fr', 'auto 1fr 1fr']} mb={[5, 7]}>
    <Box variant="layout.verticalAlign" sx={{ display: ['none', 'flex'] }}>
      <YieldIcon fontSize={60} />
    </Box>
    <Box ml={[3, 3, 0]}>
      <Text mb={[0, 1]} sx={{ fontSize: [3, 4] }} variant="strong">
        RToken yield opportunities
      </Text>
      <Text variant="legend" sx={{ fontSize: [1, 2] }}>
        DeFi yield opportunities for RTokens in Convex, Curve & Yearn.
      </Text>
    </Box>
    <TableFilters />
  </Grid>
)

const Pools = () => {
  const data = useAtomValue(filteredPoolsAtom)
  return <PoolsTable data={data} />
}

const Earn = () => (
  <Box variant="layout.wrapper" p={[1, 4]} py={[4, 7]}>
    <EarnHeader />
    <Pools />
  </Box>
)

export default Earn
