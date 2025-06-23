import TransactionButton from '@/components/old/button/TransactionButton'
import { getCurrentTime } from '@/utils'
import { t } from '@lingui/macro'
import dtfIndexGovernanceAbi from 'abis/dtf-index-governance'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { proposalDetailAtom, proposalTxArgsAtom } from '../atom'
import { proposalRefreshFnAtom } from '../updater'

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
  const refreshFn = useAtomValue(proposalRefreshFnAtom)
  const [isProcessing, setIsProcessing] = useState(false)

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
      setIsProcessing(true)
      const timer = setTimeout(() => {
        refreshFn?.()
        setIsProcessing(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [status])

  if (!deadline || deadline > 0) return null

  return (
    <TransactionButton
      small
      loading={isProcessing || isMining || isLoading}
      mining={isMining}
      disabled={!isReady || !canExecute || status === 'success'}
      onClick={write}
      text={isProcessing ? 'Processing...' : t`Execute proposal`}
      sx={{ height: '44px' }}
      error={validationError}
      errorWithName={false}
    />
  )
}

export default ProposalExecute
