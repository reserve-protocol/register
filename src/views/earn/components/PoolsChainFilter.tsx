import ChainFilter from 'components/filters/chain/ChainFilter'
import { useAtom } from 'jotai'
import { poolChainsFilterAtom } from '../atoms'

const PoolsChainFilter = () => {
  const [chains, setChains] = useAtom(poolChainsFilterAtom)

  return <ChainFilter chains={chains} onChange={setChains} />
}

export default PoolsChainFilter
