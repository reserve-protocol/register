import dtfIndexGovernance from '@/abis/dtf-index-governance'
import TransactionButton from '@/components/old/button/TransactionButton'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import { t } from '@lingui/macro'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { proposalDetailAtom, proposalTxArgsAtom } from '../atom'

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
  const [proposal, setProposal] = useAtom(proposalDetailAtom)
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
      setProposal((prev) =>
        prev
          ? {
              ...prev,
              votingState: {
                ...prev.votingState,
                state: PROPOSAL_STATES.QUEUED,
                deadline: executionDelay || 0,
              },
              state: PROPOSAL_STATES.QUEUED,
              queueTime: Math.floor(Date.now() / 1000).toString(),
              queueBlock: Number(data.blockNumber),
              executionETA: Math.floor(
                Date.now() / 1000 + (executionDelay || 0)
              ),
            }
          : undefined
      )
    }
  }, [data, status])

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
