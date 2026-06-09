import TransactionButton from '@/components/ui/transaction-button'
import { PROPOSAL_STATES } from '@/utils/constants'
import { t } from '@lingui/macro'
import { useIndexDtfCancelProposalCall } from '@reserve-protocol/react-sdk'
import Timelock from 'abis/Timelock'
import useContractWrite from 'hooks/useContractWrite'
import useWatchTransaction from 'hooks/useWatchTransaction'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { walletAtom } from 'state/atoms'
import { keccak256, toBytes } from 'viem'
import { useReadContract } from 'wagmi'
import { proposalDetailAtom } from '../atom'
import useRefreshProposal from '../hooks/use-refresh-proposal'

const ProposalCancel = () => {
  const account = useAtomValue(walletAtom)
  const [proposal, setProposal] = useAtom(proposalDetailAtom)
  const refreshProposal = useRefreshProposal()
  const timelockAddress = proposal?.timelock

  const { data: canCancel } = useReadContract({
    address: timelockAddress,
    abi: Timelock,
    functionName: 'hasRole',
    args: account ? [keccak256(toBytes('CANCELLER_ROLE')), account] : undefined,
    chainId: proposal?.chainId,
    query: {
      enabled: !!timelockAddress && !!account && !!proposal?.chainId,
    },
  })

  const call = useIndexDtfCancelProposalCall(
    proposal && canCancel
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

  const { write, isLoading, hash, isReady } = useContractWrite(
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

  const { isMining, status } = useWatchTransaction({
    hash,
    label: 'Proposal canceled',
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
              state: PROPOSAL_STATES.CANCELED,
            },
            state: PROPOSAL_STATES.CANCELED,
            cancellationTime: Math.floor(Date.now() / 1000).toString(),
          }
          : undefined
      )
    }
  }, [refreshProposal, setProposal, status])

  if (!canCancel) return null

  return (
    <TransactionButton
      variant="destructive"
      size="sm"
      loading={isMining || isLoading}
      mining={isMining}
      disabled={!isReady || !canCancel || status === 'success'}
      onClick={write}
      text={t`Cancel proposal`}
      className={`h-11 bg-transparent border ${account ? 'border-destructive text-destructive hover:text-destructive-foreground disabled:border-border disabled:text-muted-foreground' : 'border-primary'
        }`}
    />
  )
}

export default ProposalCancel
