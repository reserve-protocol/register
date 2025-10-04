import { useAtomValue } from 'jotai'
import { filteredPoolsAtom } from '../atoms'
import PoolsTable from './pools-table'

const Pools = () => {
  const data = useAtomValue(filteredPoolsAtom)
  return <PoolsTable data={data} />
}

const Earn = () => <Pools />

export default Earn
