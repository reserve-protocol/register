import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { formReadyForSubmitAtom } from '../atoms'
import { SubmitHandler, useFormContext } from 'react-hook-form'
import { DeployInputs } from '../form-fields'
import { useWriteContract } from 'wagmi'
import dtfIndexDeployerAbi from '@/abis/dtf-index-deployer-abi'
import { INDEX_DEPLOYER_ADDRESS } from '@/utils/addresses'
import { chainIdAtom } from '@/state/atoms'

const SubmitButton = () => {
  const chainId = useAtomValue(chainIdAtom)
  const { writeContract } = useWriteContract()
  const { handleSubmit } = useFormContext<DeployInputs>()
  const formReadyForSubmit = useAtomValue(formReadyForSubmitAtom)

  const processForm: SubmitHandler<DeployInputs> = (data) => {
    console.log(data)

    writeContract({
      abi: dtfIndexDeployerAbi,
      address: INDEX_DEPLOYER_ADDRESS[chainId],
      functionName: 'deployFolio',
      args: [
        {
          name: 'test',
          symbol: 'test',
          assets: ['0x', '0x'],
          amounts: [0n, 0n],
          initialShares: 0n,
        },
        {
          tradeDelay: 0n,
          auctionLength: 0n,
          feeRecipients: [{ recipient: '0x', portion: 0n }],
          folioFee: 0n,
        },
        '0xOWNER',
        ['0x'], // proposers
        ['0x'], // price curators
      ],
    })
  }

  const submitForm = () => {
    handleSubmit(processForm)()
  }

  return (
    <Button
      className="w-full"
      disabled={!formReadyForSubmit}
      onClick={submitForm}
    >
      Deploy
    </Button>
  )
}

export default SubmitButton
