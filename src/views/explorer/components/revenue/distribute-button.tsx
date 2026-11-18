import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import { type IndexDTFItem } from '@/hooks/useIndexDTFList'
import { useWalletModal } from '@/hooks/use-wallet-modal'
import { useLingui } from '@lingui/react/macro'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'

// One CTA for every wallet state: the click connects, switches chain or sends, so a row never swaps its button.
const DistributeButton = ({ dtf }: { dtf: IndexDTFItem }) => {
  const { t } = useLingui()
  const { address, chainId: walletChain } = useAccount()
  const { openConnectModal } = useWalletModal()
  const { switchChainAsync } = useSwitchChain()
  const { data: hash, writeContract, isPending } = useWriteContract()
  const { data: receipt, isLoading } = useWaitForTransactionReceipt({
    hash,
    chainId: dtf.chainId,
  })
  const [isSwitching, setSwitching] = useState(false)

  const handleDistribute = async () => {
    if (!address) {
      openConnectModal()
      return
    }

    if (walletChain !== dtf.chainId) {
      setSwitching(true)
      try {
        await switchChainAsync({ chainId: dtf.chainId })
      } catch (error) {
        console.error('distributeFees: chain switch failed', error)
        return
      } finally {
        setSwitching(false)
      }
    }

    writeContract({
      abi: dtfIndexAbi,
      address: dtf.address,
      functionName: 'distributeFees',
      chainId: dtf.chainId,
    })
  }

  const isSuccess = receipt?.status === 'success'
  const isBusy = isSwitching || isPending || isLoading

  return (
    <Button
      variant="accent"
      className="h-11 shrink-0 rounded-full font-semibold sm:h-9"
      onClick={handleDistribute}
      disabled={isBusy || isSuccess}
      data-testid="explorer-distribute"
    >
      {isBusy && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
      {isSuccess ? t`Distributed` : t`Distribute`}
    </Button>
  )
}

export default DistributeButton
