import dtfIndexGovernance from '@/abis/dtf-index-governance'
import TransactionButton from '@/components/ui/transaction-button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { t } from '@lingui/macro'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { proposalDetailAtom, proposalTxArgsAtom } from '../atom'
import { optimisticQueueActionAtom } from '../optimistic-actions'

const executionDelayAtom = atom((get) => {
  const proposal = get(proposalDetailAtom)
  const indexDTF = get(indexDTFAtom)
  const governor = proposal?.governor
  if (governor === indexDTF?.stToken?.governance?.id) {
    return indexDTF?.ownerGovernance?.timelock.executionDelay
  }
  if (governor === indexDTF?.tradingGovernance?.id) {
    return indexDTF?.tradingGovernance?.timelock.executionDelay
  }
  return indexDTF?.ownerGovernance?.timelock.executionDelay
})

const ProposalQueue = () => {
  const executionDelay = useAtomValue(executionDelayAtom)
  const proposal = useAtomValue(proposalDetailAtom)
  const optimisticQueue = useSetAtom(optimisticQueueActionAtom)
  const governor = proposal?.governor
  const txArgs = useAtomValue(proposalTxArgsAtom)

  const { write, isLoading, hash, isReady, validationError } = useContractWrite(
    {
      abi: dtfIndexGovernance,
      address: governor,
      functionName: 'queue',
      args: txArgs,
    }
  )
  const { data, isMining, status } = useWatchTransaction({
    hash,
    label: 'Queue proposal',
  })

  useEffect(() => {
    if (data && status === 'success') {
      optimisticQueue({
        executionDelay: executionDelay || 0,
        blockNumber: data.blockNumber,
      })
    }
  }, [data, status])

  if (validationError) {
    console.error('[QUEUE ERROR]', validationError)
  }

  return (
    <TransactionButton
      className="w-full ml-auto"
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady}
      onClick={write}
      text={t`Queue proposal`}
    />
  )
}

export default ProposalQueue
