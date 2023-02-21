import { useSetAtom } from 'jotai'
import { addTransactionAtom } from 'state/atoms'
import useProposalTx from './useProposalTx'

const useProposal = () => {
  const tx = useProposalTx()
  const addTransaction = useSetAtom(addTransactionAtom)

  const handlePropose = () => {}

  return { fee: 0, propose: handlePropose, isValid: !!tx }
}

export default useProposal
