import { useAtomValue } from 'jotai'
import { useWriteContract } from 'wagmi'
import { hasAssetsAllowanceAtom } from '../atoms'
import { Button } from '@/components/ui/button'

const ConfirmManualDeployButton = () => {
  const { writeContract } = useWriteContract()
  const hasAssetsAllowance = useAtomValue(hasAssetsAllowanceAtom)

  const handleDeploy = () => {
    // writeContract({
    //   abi: dtfIndexDeployerAbi,
    //   address: INDEX_DEPLOYER_ADDRESS[chainId],
    //   functionName: 'deployFolio',
    //   args: [
    //     {
    //       name: 'test',
    //       symbol: 'test',
    //       assets: ['0x', '0x'],
    //       amounts: [0n, 0n],
    //       initialShares: 0n,
    //     },
    //     {
    //       tradeDelay: 0n,
    //       auctionLength: 0n,
    //       feeRecipients: [{ recipient: '0x', portion: 0n }],
    //       folioFee: 0n,
    //     },
    //     '0xOWNER',
    //     ['0x'], // proposers
    //     ['0x'], // price curators
    //   ],
    // })
  }

  return (
    <Button
      disabled={!hasAssetsAllowance}
      className="rounded-xl w-full py-7 text-base"
    >
      Deploy
    </Button>
  )
}

export default ConfirmManualDeployButton
