import ChainFilter from 'components/filters/chain/ChainFilter'
import { atom, useAtom } from 'jotai'
import { supportedChainList } from 'utils/constants'

export const chainsFilterAtom = atom(
  supportedChainList.map((chain) => chain.toString())
)

const CompareFilters = () => {
  const [chains, setChains] = useAtom(chainsFilterAtom)

  return <ChainFilter chains={chains} onChange={setChains} />
}

export default CompareFilters
