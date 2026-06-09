import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { Trans, useLingui } from '@lingui/react/macro'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { proposalDescriptionAtom, basketProposalCalldatasAtom } from '../atoms'
import { useIsProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-propose-allowed'
import { indexDTFRefreshFnAtom } from '@/views/index-dtf/index-dtf-container'
import { TransactionButtonContainer } from '@/components/ui/transaction'
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
  const calldatas = get(basketProposalCalldatasAtom)
  const dtf = get(iTokenAddressAtom)

  return Boolean(wallet && description && calldatas?.length && dtf)
})

const tradingGovAddress = atom((get) => {
  const dtfData = get(indexDTFAtom)

  return dtfData?.tradingGovernance?.id
})

const ProposeGatekeeper = memo(() => {
  const govAddress = useAtomValue(tradingGovAddress)
  const indexDTF = useAtomValue(indexDTFAtom)
  const dtf = useAtomValue(iTokenAddressAtom)
  const calldatas = useAtomValue(basketProposalCalldatasAtom)
  const proposalType = useAtomValue(proposalTypeAtom)
  const targets = useMemo(() => {
    if (!calldatas || !dtf) return undefined

    return calldatas.map(() => dtf)
  }, [calldatas, dtf])
  const { isProposeAllowed, isLoading } = useIsProposeAllowed(govAddress)
  const { hasSelectorError, isChecking, isOptimisticEligible } =
    useProposalTypeEligibility({
      governance: indexDTF?.tradingGovernance,
      targets,
      calldatas,
    })
  const isOptimisticProposal = proposalType === 'optimistic'
  const canUseOptimisticProposal =
    isOptimisticProposal && isOptimisticEligible && !hasSelectorError

  if (isChecking) {
    return (
      <Button disabled className="w-full" variant="default">
        <Trans>Checking proposal type...</Trans>
      </Button>
    )
  }

  if (isOptimisticProposal && !canUseOptimisticProposal) {
    return null
  }

  if (isLoading && !canUseOptimisticProposal) {
    return (
      <Button disabled className="w-full" variant="default">
        <Trans>Checking voting power...</Trans>
      </Button>
    )
  }

  if (!isLoading && !isProposeAllowed && !canUseOptimisticProposal) {
    return (
      <Button disabled className="w-full" variant="default">
        <Trans>Not enough voting power</Trans>
      </Button>
    )
  }

  return <SubmitProposalButton />
})

const SubmitProposalButton = () => {
  const { t } = useLingui()
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const calldatas = useAtomValue(basketProposalCalldatasAtom)
  const proposalType = useAtomValue(proposalTypeAtom)
  const dtf = useAtomValue(iTokenAddressAtom)
  const govAddress = useAtomValue(tradingGovAddress)
  const refreshFn = useAtomValue(indexDTFRefreshFnAtom)
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
    if (!isSuccess || !receipt || receipt.status !== 'success' || !govAddress) {
      return
    }

    void handleRecentProposalReceipt({
      receipt,
      governor: govAddress,
      isOptimistic: submittedProposalType.current === 'optimistic',
      onFallback: () => {
        setTimeout(() => {
          refreshFn?.()
          navigate(`../${ROUTES.GOVERNANCE}`)
        }, 10000)
      },
    })
  }, [
    govAddress,
    handleRecentProposalReceipt,
    isSuccess,
    navigate,
    receipt,
    refreshFn,
  ])

  const handleSubmit = () => {
    if (dtf && calldatas && description && govAddress) {
      const targets: Address[] = []

      for (let i = 0; i < calldatas.length; i++) {
        targets.push(dtf)
      }
      const params = {
        chainId: chainId as SupportedChainId,
        proposal: {
          governance: govAddress,
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
    <TransactionButtonContainer
      connectButtonClassName="w-full"
      switchChainButtonClassName="w-full"
    >
      <Button
        disabled={!isReady || isPending || isSubmitted || !govAddress}
        onClick={handleSubmit}
        className="w-full"
        variant="default"
      >
        {(isPending || isSubmitted) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && t`Pending, sign in wallet...`}
        {!isPending && isSubmitted && t`Waiting for confirmation...`}
        {!isPending && !isSubmitted && t`Submit proposal onchain`}
      </Button>
    </TransactionButtonContainer>
  )
}

export default ProposeGatekeeper
