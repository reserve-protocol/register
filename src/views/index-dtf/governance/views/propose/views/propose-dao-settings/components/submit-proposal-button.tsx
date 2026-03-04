import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction'
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
import { proposalDescriptionAtom, daoSettingsProposalDataAtom } from '../atoms'
import { useIsDAOProposeAllowed } from '@/views/index-dtf/governance/hooks/use-is-dao-propose-allowed'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  const proposalData = get(daoSettingsProposalDataAtom)
  const dtf = get(iTokenAddressAtom)

  return wallet && description && proposalData?.calldatas?.length && dtf
})

const ProposeGatekeeper = memo(() => {
  const { isProposeAllowed, isLoading } = useIsDAOProposeAllowed()
  const chainId = useAtomValue(chainIdAtom)

  if (!isLoading && !isProposeAllowed) {
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
  const proposalData = useAtomValue(daoSettingsProposalDataAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const { writeContract, isPending, data } = useWriteContract()
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
    if (proposalData && description && dtf?.stToken?.governance?.id) {
      const { targets, calldatas } = proposalData
      const values: bigint[] = new Array(calldatas.length).fill(0n)

      console.log('proposal', {
        address: dtf.stToken?.governance?.id,
        abi: DTFIndexGovernance,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
        chainId,
      })

      writeContract({
        address: dtf.stToken?.governance?.id,
        abi: DTFIndexGovernance,
        functionName: 'propose',
        args: [targets, values, calldatas, description],
        chainId,
      })
    }
  }

  return (
    <TransactionButtonContainer chain={chainId}>
      <Button
        disabled={
          !isReady || isPending || !!data || !dtf?.stToken?.governance?.id
        }
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
