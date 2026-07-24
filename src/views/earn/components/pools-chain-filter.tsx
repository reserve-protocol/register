import ChainFilter from '@/components/chain-filter'
import { supportedChainList } from '@/utils/constants'
import { poolChainsFilterAtom } from '../views/defi/atoms'
import { useAtom } from 'jotai'

const PoolsChainFilter = () => {
  const [chains, setChains] = useAtom(poolChainsFilterAtom)
  // DeFi pools span the Yield/RToken supported chains (incl. Arbitrum).
  return (
    <ChainFilter
      value={chains}
      onChange={setChains}
      supportedChains={supportedChainList}
    />
  )
}

export default PoolsChainFilter
