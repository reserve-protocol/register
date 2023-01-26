import { useSetAtom } from 'jotai'
import { addTransactionAtom } from 'state/atoms'

const useProposal = () => {
  const addTransaction = useSetAtom(addTransactionAtom)

  const handlePropose = () => {}

  return { fee: 0, propose: handlePropose, isValid: true }
}

export default useProposal
