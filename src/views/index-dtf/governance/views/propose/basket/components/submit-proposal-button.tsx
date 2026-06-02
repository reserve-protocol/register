import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { proposalDescriptionAtom, basketProposalCalldatasAtom } from '../atoms'
import { useIsProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-propose-allowed'
import { indexDTFRefreshFnAtom } from '@/views/index-dtf/index-dtf-container'
import { TransactionButtonContainer } from '@/components/ui/transaction'
import useRecentProposalReceipt from '@/views/index-dtf/governance/hooks/use-recent-proposal-receipt'

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
  const { isProposeAllowed, isLoading } = useIsProposeAllowed(govAddress)

  if (!isLoading && !isProposeAllowed) {
    return (
      <Button disabled className="w-full" variant="default">
        Not enough voting power
      </Button>
    )
  }

  return <SubmitProposalButton />
})

const SubmitProposalButton = () => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const calldatas = useAtomValue(basketProposalCalldatasAtom)
  const dtf = useAtomValue(iTokenAddressAtom)
  const govAddress = useAtomValue(tradingGovAddress)
  const refreshFn = useAtomValue(indexDTFRefreshFnAtom)
  const handleRecentProposalReceipt = useRecentProposalReceipt()

  const { writeContract, isPending, data: hash } = useWriteContract()
  const { data: receipt, isSuccess } = useWaitForTransactionReceipt({
    hash,
    chainId,
  })

  useEffect(() => {
    if (!isSuccess || !receipt || !govAddress) return

    void handleRecentProposalReceipt({
      receipt,
      governor: govAddress,
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
      const values: bigint[] = []

      for (let i = 0; i < calldatas.length; i++) {
        targets.push(dtf)
        values.push(0n)
      }

      writeContract({
        address: govAddress,
        abi: DTFIndexGovernance,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
        chainId,
      })
    }
  }

  return (
    <TransactionButtonContainer
      connectButtonClassName="w-full"
      switchChainButtonClassName="w-full"
    >
      <Button
        disabled={!isReady || isPending || !!hash || !govAddress}
        onClick={handleSubmit}
        className="w-full"
        variant="default"
      >
        {(isPending || !!hash) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!hash && 'Waiting for confirmation...'}
        {!isPending && !hash && 'Submit proposal onchain'}
      </Button>
    </TransactionButtonContainer>
  )
}

export default ProposeGatekeeper
