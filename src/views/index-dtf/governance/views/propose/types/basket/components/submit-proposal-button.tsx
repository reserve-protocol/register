import { Button } from '@/components/ui/button'
import { atom, useAtomValue } from 'jotai'
import { proposalDescriptionAtom } from '../atoms'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useEffect } from 'react'
import DTFIndexGovernance from '@/abis/dtf-index-governance'
import { useNavigate } from 'react-router-dom'

const isProposalReady = atom((get) => {
  const wallet = get(walletAtom)
  const description = get(proposalDescriptionAtom)
  return wallet && description
})

const SubmitProposalButton = () => {
  const navigate = useNavigate()
  const chainId = useAtomValue(chainIdAtom)
  const isReady = useAtomValue(isProposalReady)
  const description = useAtomValue(proposalDescriptionAtom)
  const { writeContract, isPending, data } = useWriteContract()
  const { isSuccess } = useWaitForTransactionReceipt({
    hash: data,
  })

  useEffect(() => {
    if (isSuccess) {
      // Go back to gov list
      // TODO: Maybe add a timeout of 1m and then refetch proposal list?
      navigate('../../')
    }
  }, [isSuccess])

  const handleSubmit = () => {
    writeContract({
      address: '0x',
      abi: DTFIndexGovernance,
      functionName: 'propose',
      args: [['0x'], [0n], ['0x'], description as string],
      chainId,
    })
  }

  return (
    <Button
      disabled={!isReady}
      onClick={handleSubmit}
      className="w-full"
      variant="default"
    >
      Submit proposal onchain
    </Button>
  )
}

export default SubmitProposalButton
