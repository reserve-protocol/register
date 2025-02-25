import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'

const useChainId = () => {
  const chainId = useAtomValue(chainIdAtom)
  return chainId
}

export default useChainId
