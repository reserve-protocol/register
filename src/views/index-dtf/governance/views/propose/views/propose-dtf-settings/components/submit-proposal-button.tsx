import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, iTokenAddressAtom } from '@/state/dtf/atoms'
import { ROUTES } from '@/utils/constants'
import { atom, useAtomValue } from 'jotai'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Address } from 'viem'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import {
  dtfSettingsProposalDataAtom,
  proposalDescriptionAtom,
} from '../atoms'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  const proposalData = get(dtfSettingsProposalDataAtom)
  const dtf = get(iTokenAddressAtom)

  return wallet && description && proposalData?.calldatas?.length && dtf
})

const SubmitProposalButton = () => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const proposalData = useAtomValue(dtfSettingsProposalDataAtom)
  const dtf = useAtomValue(indexDTFAtom)
  const { writeContract, isPending, data } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  useEffect(() => {
    if (isSuccess) {
      // Give some time for the proposal to be created on the subgraph
      setTimeout(() => {
        navigate(`../${ROUTES.GOVERNANCE}`)
      }, 10000) // TODO: who knows if this works well!!! they can just refresh the page
    }
  }, [isSuccess])

  const handleSubmit = () => {
    if (proposalData && description && dtf?.ownerGovernance?.id) {
      const values: bigint[] = new Array(proposalData.calldatas.length).fill(0n)

      writeContract({
        address: dtf.ownerGovernance?.id,
        abi: DTFIndexGovernance,
        functionName: 'propose',
        args: [proposalData.targets, values, proposalData.calldatas, description],
        chainId,
      })
    }
  }

  return (
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
  )
}

export default SubmitProposalButton
