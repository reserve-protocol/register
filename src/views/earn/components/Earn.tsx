import YieldIcon from 'components/icons/YieldIcon'
import { Table } from 'components/table'
import { Box, Text } from 'theme-ui'
import useEarnTableColumns, {
  columnVisibility,
} from '../hooks/useEarnTableColumns'
import useRTokenPools from '../hooks/useRTokenPools'
import TableFilters from './TableFilters'

const Earn = () => {
  const { data, isLoading } = useRTokenPools()
  const columns = useEarnTableColumns()

  return (
    <Box variant="layout.wrapper" p={[1, 4]} py={[1, 7]}>
      <Box variant="layout.verticalAlign" mb={7}>
        <YieldIcon fontSize={60} />
        <Box ml="2">
          <Text mb={1} variant="sectionTitle">
            RToken yield opportunities
          </Text>
          <Text variant="legend">
            DeFi yield opportunities for RTokens in Convex, Curve, Yearn & Beefy
          </Text>
        </Box>
        <TableFilters />
      </Box>

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
