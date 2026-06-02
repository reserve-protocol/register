import TransactionButton from '@/components/ui/transaction-button'
import { getCurrentTime } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { t } from '@lingui/macro'
import { useIndexDtfExecuteProposalCall } from '@reserve-protocol/react-sdk'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { proposalDetailAtom } from '../atom'
import useRefreshProposal from '../hooks/use-refresh-proposal'

const canExecuteAtom = atom((get) => {
  const timestamp = getCurrentTime()
  const proposal = get(proposalDetailAtom)

  return proposal?.executionETA && proposal.executionETA <= timestamp
})

const ProposalExecute = () => {
  const [proposal, setProposal] = useAtom(proposalDetailAtom)
  const canExecute = useAtomValue(canExecuteAtom)
  const deadline = proposal?.votingState.deadline
  const refreshProposal = useRefreshProposal()
  const call = useIndexDtfExecuteProposalCall(
    proposal && canExecute
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
        value: call.value,
        args: call.contract.args,
      }
      : undefined
  )

  const { data, isMining, status } = useWatchTransaction({
    hash,
    label: t`Execute proposal`,
  })

  useEffect(() => {
    if (status === 'success') {
      refreshProposal()
      setProposal((prev) =>
        prev
          ? {
            ...prev,
            votingState: {
              ...prev.votingState,
              state: PROPOSAL_STATES.EXECUTED,
              deadline: null,
            },
            state: PROPOSAL_STATES.EXECUTED,
            executionTime: Math.floor(Date.now() / 1000).toString(),
            executionBlock: data?.blockNumber.toString(),
            executionTxnHash: hash,
          }
          : undefined
      )
    }
  }, [data, hash, refreshProposal, setProposal, status])

  if (!deadline || deadline > 0) return null

  return (
    <TransactionButton
      size="sm"
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady || !canExecute || status === 'success'}
      onClick={write}
      text={t`Execute proposal`}
      className="h-11"
      error={validationError}
      errorWithName={false}
    />
  )
}

export default ProposalExecute
