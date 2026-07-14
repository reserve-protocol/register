import TransactionButton from '@/components/ui/transaction-button'
import { blockTimestampAtom } from '@/state/atoms'
import { getCurrentTime } from '@/utils'
import { PROPOSAL_STATES } from '@/utils/constants'
import { canExecuteProposal } from '@/views/index-dtf/governance/utils/proposal-flow'
import { useLingui } from '@lingui/react/macro'
import { useIndexDtfExecuteProposalCall } from '@reserve-protocol/react-sdk'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { proposalDetailAtom } from '../atom'
import useRefreshProposal from '../hooks/use-refresh-proposal'

const canExecuteAtom = atom((get) => {
  const timestamp = Math.max(get(blockTimestampAtom), getCurrentTime())
  const proposal = get(proposalDetailAtom)

  return canExecuteProposal(proposal, timestamp)
})

const ProposalExecute = () => {
  const { t } = useLingui()
  const [proposal, setProposal] = useAtom(proposalDetailAtom)
  const canExecute = useAtomValue(canExecuteAtom)
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
    // Mixpanel label, keep in English
    label: 'Execute proposal',
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

  if (!canExecute) return null

  return (
    <TransactionButton
      data-testid="proposal-execute-btn"
      size="sm"
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady || status === 'success'}
      onClick={write}
      text={t`Execute proposal`}
      className="h-11 shrink-0"
      error={validationError}
      errorWithName={false}
    />
  )
}

export default ProposalExecute
