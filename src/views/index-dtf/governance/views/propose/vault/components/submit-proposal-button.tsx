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
import { proposalDescriptionAtom, vaultProposalCalldatasAtom } from '../atoms'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  const calldatas = get(vaultProposalCalldatasAtom)
  const dtf = get(iTokenAddressAtom)

  return wallet && description && calldatas?.length && dtf
})

const govAddressAtom = atom((get) => {
  const dtfData = get(indexDTFAtom)

  return dtfData?.stToken?.governance?.id
})

const SubmitProposalButton = () => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const calldatas = useAtomValue(vaultProposalCalldatasAtom)
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
    if (calldatas && description && dtf?.stToken?.governance?.id) {
      const targets: Address[] = []
      const values: bigint[] = []

      for (let i = 0; i < calldatas.length; i++) {
        targets.push(dtf.stToken.id)
        values.push(0n)
      }

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
