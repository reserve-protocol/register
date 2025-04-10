import TransactionButton from '@/components/old/button/TransactionButton'
import { t } from '@lingui/macro'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtomValue } from 'jotai'
import { proposalDetailAtom, proposalTxArgsAtom } from '../atom'
import dtfIndexGovernance from '@/abis/dtf-index-governance'

const ProposalQueue = () => {
  const governor = useAtomValue(proposalDetailAtom)?.governor
  const txArgs = useAtomValue(proposalTxArgsAtom)

  const { write, isLoading, hash, isReady, validationError } = useContractWrite(
    {
      abi: dtfIndexGovernance,
      address: governor,
      functionName: 'queue',
      args: txArgs,
    }
  )
  const { isMining } = useWatchTransaction({
    hash,
    label: 'Queue proposal',
  })

  if (validationError) {
    console.error('[QUEUE ERROR]', validationError)
  }

  return (
    <TransactionButton
      fullWidth
      loading={isMining || isLoading}
      mining={isMining}
      ml="auto"
      disabled={!isReady}
      onClick={write}
      text={t`Queue proposal`}
    />
  )
}

export default ProposalQueue
