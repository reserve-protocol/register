import { useAtomValue } from 'jotai'
import { filteredPoolsAtom } from '../atoms'
import PoolsTable from '@/views/earn/components/pools-table'

const DTFDefiEarn = () => {
  const data = useAtomValue(filteredPoolsAtom)
  return <PoolsTable data={data} />
}

export default DTFDefiEarn
