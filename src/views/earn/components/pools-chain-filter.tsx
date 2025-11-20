import ChainFilter from '@/components/chain-filter'
import { poolChainsFilterAtom } from '../views/defi/atoms'

const PoolsChainFilter = () => {
  return <ChainFilter atom={poolChainsFilterAtom} />
}

export default PoolsChainFilter
