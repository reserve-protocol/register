import ChainFilter from '@/components/chain-filter'
import { poolChainsFilterAtom } from '../views/defi/atoms'
import { useAtom } from 'jotai'

const PoolsChainFilter = () => {
  const [chains, setChains] = useAtom(poolChainsFilterAtom)
  return <ChainFilter value={chains} onChange={setChains} />
}

export default PoolsChainFilter
