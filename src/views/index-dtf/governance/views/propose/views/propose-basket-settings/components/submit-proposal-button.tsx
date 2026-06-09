import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  proposalDescriptionAtom,
  basketSettingsProposalDataAtom,
} from '../atoms'
import { useIsProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-propose-allowed'
import useRecentProposalReceipt from '@/views/index-dtf/governance/hooks/use-recent-proposal-receipt'
import {
  proposalTypeAtom,
  useProposalTypeEligibility,
} from '@/views/index-dtf/governance/views/propose/shared'
import {
  prepareIndexDtfSubmitOptimisticProposal,
  prepareIndexDtfSubmitProposal,
  type SupportedChainId,
} from '@reserve-protocol/react-sdk'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  const proposalData = get(basketSettingsProposalDataAtom)
  const dtf = get(iTokenAddressAtom)

  return wallet && description && proposalData?.calldatas?.length && dtf
})

const ProposeGatekeeper = memo(() => {
  const dtf = useAtomValue(indexDTFAtom)
  const proposalData = useAtomValue(basketSettingsProposalDataAtom)
  const proposalType = useAtomValue(proposalTypeAtom)
  const { isProposeAllowed, isLoading } = useIsProposeAllowed(
    dtf?.tradingGovernance?.id
  )
  const chainId = useAtomValue(chainIdAtom)
  const {
    hasSelectorError,
    isChecking,
    isOptimisticEligible,
  } = useProposalTypeEligibility({
    governance: dtf?.tradingGovernance,
    targets: proposalData?.targets,
    calldatas: proposalData?.calldatas,
  })
  const isOptimisticProposal = proposalType === 'optimistic'
  const canUseOptimisticProposal =
    isOptimisticProposal && isOptimisticEligible && !hasSelectorError

  if (isChecking) {
    return (
      <TransactionButtonContainer chain={chainId}>
        <Button disabled className="w-full" variant="default">
          Checking proposal type...
        </Button>
      </TransactionButtonContainer>
    )
  }

  if (isOptimisticProposal && !canUseOptimisticProposal) {
    return null
  }

  if (isLoading && !canUseOptimisticProposal) {
    return (
      <TransactionButtonContainer chain={chainId}>
        <Button disabled className="w-full" variant="default">
          Checking voting power...
        </Button>
      </TransactionButtonContainer>
    )
  }

  if (
    !isLoading &&
    !isProposeAllowed &&
    !canUseOptimisticProposal
  ) {
    return (
      <TransactionButtonContainer chain={chainId}>
        <Button disabled className="w-full" variant="default">
          Not enough voting power
        </Button>
      </TransactionButtonContainer>
    )
  }

  return <SubmitProposalButton />
})

const SubmitProposalButton = () => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const proposalData = useAtomValue(basketSettingsProposalDataAtom)
  const proposalType = useAtomValue(proposalTypeAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const submittedProposalType = useRef(proposalType)
  const handleRecentProposalReceipt = useRecentProposalReceipt()
  const { writeContract, isPending, data: hash } = useWriteContract()
  const {
    data: receipt,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })
  const isConfirming = !!hash && !receipt && !receiptError
  const isSubmitted = isConfirming || receipt?.status === 'success'

  useEffect(() => {
    if (
      !isSuccess ||
      !receipt ||
      receipt.status !== 'success' ||
      !dtf?.tradingGovernance?.id
    ) {
      return
    }

    void handleRecentProposalReceipt({
      receipt,
      governor: dtf.tradingGovernance.id,
      isOptimistic: submittedProposalType.current === 'optimistic',
      onFallback: () => {
        setTimeout(() => {
          navigate(`../${ROUTES.GOVERNANCE}`)
        }, 10000)
      },
    })
  }, [
    dtf?.tradingGovernance?.id,
    handleRecentProposalReceipt,
    isSuccess,
    navigate,
    receipt,
  ])

  const handleSubmit = () => {
    if (proposalData && description && dtf?.tradingGovernance?.id) {
      const { targets, calldatas } = proposalData
      const params = {
        chainId: chainId as SupportedChainId,
        proposal: {
          governance: dtf.tradingGovernance.id,
          targets,
          calldatas,
          description,
        },
      }
      submittedProposalType.current = proposalType

      if (proposalType === 'optimistic') {
        const call = prepareIndexDtfSubmitOptimisticProposal(params)
        writeContract({
          ...call.contract,
          chainId: call.chainId,
        })
        return
      }

      const call = prepareIndexDtfSubmitProposal(params)
      writeContract({
        ...call.contract,
        chainId: call.chainId,
      })
    }
  }

  return (
    <TransactionButtonContainer chain={chainId}>
      <Button
        disabled={
          !isReady || isPending || isSubmitted || !dtf?.tradingGovernance?.id
        }
        onClick={handleSubmit}
        className="w-full"
        variant="default"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && isSubmitted && 'Waiting for confirmation...'}
        {!isPending && !isSubmitted && 'Submit proposal onchain'}
      </Button>
    </TransactionButtonContainer>
  )
}

export default ProposeGatekeeper
