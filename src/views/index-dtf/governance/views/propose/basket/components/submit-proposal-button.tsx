import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { memo, useEffect } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { proposalDescriptionAtom, basketProposalCalldatasAtom } from '../atoms'
import { useIsProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-propose-allowed'
import { TransactionButtonContainer } from '@/components/ui/transaction'

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
  const { isProposeAllowed, isLoading } = useIsProposeAllowed()

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

  const { writeContract, isPending, data, error } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  useEffect(() => {
    if (isSuccess) {
      toast.success('Proposal created', {
        description: 'It may take a moment to appear in the list',
      })
      navigate(`../${ROUTES.GOVERNANCE}`)
    }
  }, [isSuccess])

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
        disabled={!isReady || isPending || !!data || !govAddress}
        onClick={handleSubmit}
        className="w-full"
        variant="default"
      >
        {(isPending || !!data) && (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        )}
        {isPending && 'Pending, sign in wallet...'}
        {!isPending && !!data && 'Waiting for confirmation...'}
        {!isPending && !data && 'Submit proposal onchain'}
      </Button>
    </TransactionButtonContainer>
  )
}

export default ProposeGatekeeper
