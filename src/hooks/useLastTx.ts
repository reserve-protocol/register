import { currentTxAtom } from './../state/atoms'
import { useAtomValue } from 'jotai'

// Get last N transactions
const useLastTx = (n: number) => {
  const currentTx = useAtomValue(currentTxAtom)
  return n ? currentTx.slice(-n) : []
}

export default useLastTx
