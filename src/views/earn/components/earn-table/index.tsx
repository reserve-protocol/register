import { Row } from '@tanstack/react-table'
import Sidebar from 'components/sidebar'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { Pool } from 'state/pools/atoms'
import { borderRadius } from 'theme'
import { Box, Card, Text } from 'theme-ui'
import { filteredPoolsAtom } from 'views/earn/atoms'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'
import TableFilters from './components/TableFilters'
import PoolProjectDetails from './components/PoolProjectDetails'
import PoolTokenDetails from './components/PoolTokenDetails'
import PoolZapToEarn from './components/PoolZapToEarn'
import useColumns from './hooks/useColumns'

const ZapSidebar = ({ onClose }: { onClose(): void }) => {
  return <Sidebar onClose={onClose}></Sidebar>
}

const PoolDetails = ({ row }: { row: Row<Pool> }) => {
  return (
    <Box sx={{ backgroundColor: 'focusedBackground' }}>
      <PoolZapToEarn pool="test" />
      <PoolTokenDetails tokens={row.original.underlyingTokens} />
      <PoolProjectDetails project={row.original.project} />
    </Box>
  )
}

const Pools = () => {
  const data = useAtomValue(filteredPoolsAtom)
  const { isLoading } = useRTokenPools()
  const columns = useColumns()

  return (
    <Box
      mt="2"
      pt="2"
      sx={{
        backgroundColor: 'backgroundNested',
        width: '100%',
        borderRadius: borderRadius.boxes,
      }}
    >
      <Table
        sorting
        sortBy={[{ id: 'apy', desc: true }]}
        isLoading={isLoading}
        compact
        columns={columns}
        onRowClick={(data, row) => row.toggleExpanded()}
        renderSubComponent={PoolDetails}
        data={data}
        sx={{
          borderRadius: '0 0 20px 20px',
          fontSize: 2,
          tr: {
            backgroundColor: 'transparent',
            td: { borderBottom: '1px solid', borderColor: 'border' },
            th: { borderBottom: '1px solid', borderColor: 'border', py: 2 },
          },
          overflow: 'auto',
        }}
      />
      {!isLoading && !data.length && (
        <Box mt={5} sx={{ textAlign: 'center' }}>
          <Text variant="legend">No yield opportunities found</Text>
        </Box>
      )}
    </Box>
  )
}

const EarnTable = () => {
  return (
    <Box variant="layout.wrapper" m="4">
      <Card p="2">
        <TableFilters />
        <Pools />
      </Card>
    </Box>
  )
}

export default EarnTable
