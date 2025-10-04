import { useAtomValue } from 'jotai'
import { filteredPoolsAtom } from '../atoms'
import PoolsTable from './pools-table'

const Earn = () => {
  const data = useAtomValue(filteredPoolsAtom)
  return <PoolsTable data={data} />
}

export default Earn
