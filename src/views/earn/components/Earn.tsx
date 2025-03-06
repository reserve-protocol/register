import YieldIcon from 'components/icons/YieldIcon'
import { useAtomValue } from 'jotai'
import { Box, Grid, Text } from 'theme-ui'
import { filteredPoolsAtom } from '../atoms'
import PoolsTable from './PoolsTable'
import TableFilters from './TableFilters'

const EarnHeader = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: ['column', 'column', 'row'],
      justifyContent: ['start', 'start', 'space-between'],
      gap: [4, 4, 0],
    }}
    mb={[5, 7]}
  >
    <Box
      variant="layout.verticalAlign"
      sx={{ display: ['none', 'flex'], gap: 1 }}
    >
      <YieldIcon fontSize={60} />
      <Box>
        <Text mb={[0, 1]} sx={{ fontSize: [3, 4] }} variant="strong">
          DTF yield opportunities
        </Text>
        <Text variant="legend" sx={{ fontSize: [1, 2] }}>
          Yield opportunities for DTFs across the DeFi landscape.
        </Text>
      </Box>
    </Box>

    <TableFilters />
  </Box>
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
