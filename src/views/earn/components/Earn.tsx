import YieldIcon from 'components/icons/YieldIcon'
import { Table } from 'components/table'
import { Box, Grid, Text } from 'theme-ui'
import useEarnTableColumns, {
  columnVisibility,
} from '../hooks/useEarnTableColumns'
import useRTokenPools from '../hooks/useRTokenPools'
import TableFilters from './TableFilters'
import { useAtomValue } from 'jotai'
import { filteredPoolsAtom } from '../atoms'

const Earn = () => {
  const { isLoading } = useRTokenPools()
  const data = useAtomValue(filteredPoolsAtom)
  const columns = useEarnTableColumns()

  return (
    <Box variant="layout.wrapper" p={[1, 4]} py={[4, 7]}>
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

      <Table
        sorting
        sortBy={[{ id: 'apy', desc: true }]}
        isLoading={isLoading}
        compact
        columns={columns}
        data={data}
        columnVisibility={columnVisibility}
      />
    </Box>
  )
}

export default Earn
