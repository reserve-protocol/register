import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import {
  folioVersionAtom,
  indexDTFAtom,
  iTokenAddressAtom,
} from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { Trans, useLingui } from '@lingui/react/macro'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  proposalDescriptionAtom,
  basketProposalCalldatasAtom,
  proposedIndexBasketAtom,
} from '../atoms'
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
  useIndexDtfIdentity,
  useIndexDtfTradeAllowlist,
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

// Folio 6.0 startRebalance reverts for any rebalance token missing from an enforced trade allowlist.
const useTokensOutsideTradeAllowlist = () => {
  const versionState = useAtomValue(folioVersionAtom)
  const basket = useAtomValue(proposedIndexBasketAtom)
  const identity = useIndexDtfIdentity()
  const isV6 = versionState.status === 'ready' && versionState.major === 6
  const { data: allowlist, isLoading, isError } = useIndexDtfTradeAllowlist(
    isV6 && identity.address ? identity : undefined
  )

  return useMemo(() => {
    if (!isV6) return { isLoading: false, isError: false, symbols: [] }
    if (isError) return { isLoading: false, isError: true, symbols: [] }
    if (!allowlist || !basket) return { isLoading, isError: false, symbols: [] }
    if (!allowlist.enabled) return { isLoading: false, isError: false, symbols: [] }

    const allowed = new Set(allowlist.tokens.map((t) => t.toLowerCase()))
    return {
      isLoading: false,
      isError: false,
      symbols: Object.values(basket)
        .filter(({ token }) => !allowed.has(token.address.toLowerCase()))
        .map(({ token }) => token.symbol),
    }
  }, [isV6, allowlist, basket, isLoading, isError])
}

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
  const outsideAllowlist = useTokensOutsideTradeAllowlist()

  if (outsideAllowlist.isLoading) {
    return (
      <Button disabled className="w-full" variant="default">
        <Trans>Checking trade allowlist...</Trans>
      </Button>
    )
  }

  if (outsideAllowlist.isError) {
    return (
      <Button
        disabled
        className="w-full h-auto min-h-10 whitespace-normal"
        variant="default"
        data-testid="basket-propose-allowlist-unavailable"
      >
        <Trans>Couldn't read this DTF's trade allowlist. Try again later.</Trans>
      </Button>
    )
  }

  if (outsideAllowlist.symbols.length) {
    const symbols = outsideAllowlist.symbols.join(', ')
    return (
      <Button
        disabled
        className="w-full h-auto min-h-10 whitespace-normal"
        variant="default"
        data-testid="basket-propose-not-allowlisted"
      >
        <Trans>Not in this DTF's trade allowlist: {symbols}</Trans>
      </Button>
    )
  }
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
        data-testid="basket-propose-submit"
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
