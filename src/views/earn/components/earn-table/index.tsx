import { Box, Card } from 'theme-ui'
import useRTokenPools from 'views/earn/hooks/useRTokenPools'
import TableFilters from '../TableFilters'
import PoolsTable from '../PoolsTable'
import { filteredPoolsAtom } from 'views/earn/atoms'
import { useAtomValue } from 'jotai'

const Pools = () => {
  const data = useAtomValue(filteredPoolsAtom)
  return <PoolsTable data={data} />
}

const EarnTable = () => {
  const { isLoading } = useRTokenPools()

  return (
    <Box variant="layout.wrapper">
      <Card p="2">
        <TableFilters />
        <Pools />
      </Card>
    </Box>
  )
}

export default EarnTable
