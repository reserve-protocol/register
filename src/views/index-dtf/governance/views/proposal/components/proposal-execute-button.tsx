import TransactionButton from '@/components/ui/transaction-button'
import { getCurrentTime } from '@/utils'
import { t } from '@lingui/macro'
import dtfIndexGovernanceAbi from 'abis/dtf-index-governance'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { proposalDetailAtom, proposalTxArgsAtom } from '../atom'
import { optimisticExecuteActionAtom } from '../optimistic-actions'

const canExecuteAtom = atom((get) => {
  const timestamp = getCurrentTime()
  const proposal = get(proposalDetailAtom)

  return proposal?.executionETA && proposal.executionETA <= timestamp
})

const ProposalExecute = () => {
  const proposal = useAtomValue(proposalDetailAtom)
  const canExecute = useAtomValue(canExecuteAtom)
  const deadline = proposal?.votingState.deadline
  const governor = proposal?.governor
  const txArgs = useAtomValue(proposalTxArgsAtom)
  const optimisticExecute = useSetAtom(optimisticExecuteActionAtom)

  const { write, isLoading, hash, isReady, validationError } = useContractWrite(
    {
      abi: dtfIndexGovernanceAbi,
      address: governor && canExecute ? governor : undefined,
      functionName: 'execute',
      value: 0n,
      args: txArgs,
    }
  )

  const { isMining, status } = useWatchTransaction({
    hash,
    label: t`Execute proposal`,
  })

  useEffect(() => {
    if (status === 'success') {
      optimisticExecute()
    }
  }, [status])

  if (!deadline || deadline > 0) return null

  return (
    <TransactionButton
      size="sm"
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady || !canExecute || status === 'success'}
      onClick={write}
      text={t`Execute proposal`}
      className="h-[44px]"
      error={validationError}
      errorWithName={false}
    />
  )
}

export default ProposalExecute
