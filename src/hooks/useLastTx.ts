import { currentTxAtom } from './../state/atoms'
import { useAtomValue } from 'jotai/utils'

// Get last N transactions
const useLastTx = (n: number) => {
  const currentTx = useAtomValue(currentTxAtom)
  return currentTx.slice(-n)
}

export default useLastTx
