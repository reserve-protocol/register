import { Row } from '@tanstack/react-table'
import { Table } from 'components/table'
import { useAtomValue } from 'jotai'
import { Pool } from 'state/pools/atoms'
import { borderRadius } from 'theme'
import { Box, Card, Text } from 'theme-ui'
import { NETWORKS } from 'utils/constants'
import { filteredPoolsAtom } from 'views/earn/atoms'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'
import { ZAP_EARN_POOLS } from 'views/earn/utils/constants'
import { ZapYieldPositionProvider } from 'views/issuance/components/zapV2/context/ZapYieldPositionContext'
import PoolProjectDetails from './components/PoolProjectDetails'
import PoolTokenDetails from './components/PoolTokenDetails'
import PoolZapToEarn from './components/PoolZapToEarn'
import TableFilters from './components/TableFilters'
import useColumns from './hooks/useColumns'

const PoolDetails = ({ row }: { row: Row<Pool> }) => {
  const chainId = NETWORKS[row.original.chain.toLowerCase()]
  const pool = ZAP_EARN_POOLS[chainId][row.original.id]

  return (
    <Box sx={{ backgroundColor: 'focusedBackground' }}>
      {pool && (
        <ZapYieldPositionProvider yieldToken={pool.out} rToken={pool.rToken}>
          <PoolZapToEarn chainId={chainId} />
        </ZapYieldPositionProvider>
      )}
      <PoolTokenDetails tokens={row.original.underlyingTokens} />
      <PoolProjectDetails chain={chainId} project={row.original.project} />
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
