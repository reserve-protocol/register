import TransactionButton from '@/components/ui/transaction-button'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { PROPOSAL_STATES } from '@/utils/constants'
import { useLingui } from '@lingui/react/macro'
import { useIndexDtfQueueProposalCall } from '@reserve-protocol/react-sdk'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { proposalDetailAtom } from '../atom'
import useRefreshProposal from '../hooks/use-refresh-proposal'

const executionDelayAtom = atom((get) => {
  const proposal = get(proposalDetailAtom)
  const indexDTF = get(indexDTFAtom)
  const governor = proposal?.governor
  if (governor === indexDTF?.stToken?.governance?.id) {
    return indexDTF?.stToken?.governance?.timelock.executionDelay
  }
  if (governor === indexDTF?.tradingGovernance?.id) {
    return indexDTF?.tradingGovernance?.timelock.executionDelay
  }
  return indexDTF?.ownerGovernance?.timelock.executionDelay
})

const ProposalQueue = () => {
  const { t } = useLingui()
  const executionDelay = useAtomValue(executionDelayAtom)
  const [proposal, setProposal] = useAtom(proposalDetailAtom)
  const refreshProposal = useRefreshProposal()
  const call = useIndexDtfQueueProposalCall(
    proposal
      ? {
          chainId: proposal.chainId,
          proposal: {
            governance: proposal.governor,
            timelock: proposal.timelock,
            timelockId: proposal.timelockId,
            targets: proposal.targets,
            calldatas: proposal.calldatas,
            description: proposal.description,
          },
        }
      : undefined
  )

  const { write, isLoading, hash, isReady, validationError } = useContractWrite(
    call
      ? {
          abi: call.contract.abi,
          address: call.contract.address,
          chainId: call.chainId,
          functionName: call.contract.functionName,
          args: call.contract.args,
        }
      : undefined
  )
  const { data, isMining, status } = useWatchTransaction({
    hash,
    // Mixpanel label, keep in English
    label: 'Queue proposal',
  })

  useEffect(() => {
    if (data && status === 'success') {
      refreshProposal()
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
              queueTxnHash: hash,
              executionETA: Math.floor(
                Date.now() / 1000 + (executionDelay || 0)
              ),
            }
          : undefined
      )
    }
  }, [data, refreshProposal, setProposal, status, executionDelay])

  return (
    <TransactionButton
      className="w-full ml-auto"
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady}
      onClick={write}
      text={t`Queue proposal`}
      error={validationError}
      errorWithName={false}
    />
  )
}

export default ProposalQueue
