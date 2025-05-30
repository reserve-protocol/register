import dtfIndexGovernance from '@/abis/dtf-index-governance'
import TransactionButton from '@/components/old/button/TransactionButton'
import { t } from '@lingui/macro'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { proposalDetailAtom, proposalTxArgsAtom } from '../atom'
import { proposalRefreshFnAtom } from '../updater'

const ProposalQueue = () => {
  const governor = useAtomValue(proposalDetailAtom)?.governor
  const txArgs = useAtomValue(proposalTxArgsAtom)
  const refreshFn = useAtomValue(proposalRefreshFnAtom)
  const [isProcessing, setIsProcessing] = useState(false)

  const { write, isLoading, hash, isReady, validationError } = useContractWrite(
    {
      abi: dtfIndexGovernance,
      address: governor,
      functionName: 'queue',
      args: txArgs,
    }
  )
  const { isMining, status } = useWatchTransaction({
    hash,
    label: 'Queue proposal',
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

  if (validationError) {
    console.error('[QUEUE ERROR]', validationError)
  }

  return (
    <TransactionButton
      fullWidth
      loading={isProcessing || isMining || isLoading}
      mining={isMining}
      ml="auto"
      disabled={!isReady || status === 'success'}
      onClick={write}
      text={isProcessing ? 'Processing...' : t`Queue proposal`}
    />
  )
}

export default ProposalQueue
