import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { safeParseEther } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Address, parseEventLogs } from 'viem'
import {
  useWaitForTransactionReceipt,
  useWalletClient,
  useWriteContract,
} from 'wagmi'
import { assetDistributionAtom } from '../../manual/atoms'
import { asyncSwapInputAtom, redeemAssetsAtom } from '../atom'

const SubmitRedeem = () => {
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const assetDistribution = useAtomValue(assetDistributionAtom)
  const amount = useAtomValue(asyncSwapInputAtom)
  const setRedeemAssets = useSetAtom(redeemAssetsAtom)

  const { data: walletClient } = useWalletClient()
  const {
    data,
    isPending,
    error: signError,
    writeContract,
  } = useWriteContract()

  const {
    data: receipt,
    isLoading: isReceiptLoading,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: data,
    chainId,
  })

  useEffect(() => {
    if (receipt?.status === 'success') {
      const events = parseEventLogs({
        abi: dtfIndexAbi,
        logs: receipt.logs,
        eventName: 'Transfer',
      })

      events
        .filter((event) => event.address !== indexDTF?.id)
        .forEach((event) => {
          const assetAddress = event.address as Address
          const amount = event.args.value as bigint
          setRedeemAssets((prev: Record<Address, bigint>) => ({
            ...prev,
            [assetAddress]: amount,
          }))
        })
    }
  }, [receipt])

  const handleSubmit = useCallback(async () => {
    if (!chainId || !walletClient || !account || !indexDTF || !amount) return

    try {
      const assets: Address[] = []
      const minAmounts: bigint[] = []
      const sharesToRedeem = safeParseEther(amount)

      const requiredAmounts = Object.keys(assetDistribution).reduce(
        (acc, asset) => {
          acc[asset] =
            (assetDistribution[asset] * sharesToRedeem) / safeParseEther('1')
          return acc
        },
        {} as Record<string, bigint>
      )

      for (const asset of Object.keys(requiredAmounts)) {
        assets.push(asset as Address)
        // 5% slippage
        // TODO: This is worst case scenario, but it maybe too much?
        minAmounts.push((requiredAmounts[asset] * 95n) / 100n)
      }

      const hash = writeContract({
        address: indexDTF.id,
        abi: dtfIndexAbi,
        functionName: 'redeem',
        args: [
          sharesToRedeem,
          account,
          assets as `0x${string}`[],
          minAmounts as bigint[],
        ],
      })

      console.log('Redeem transaction sent:', hash)
    } catch (error) {
      console.error('Error processing orders:', error)
    }
  }, [chainId, walletClient, account, indexDTF, amount])

  const disabled = isPending || isReceiptLoading || !amount

  return (
    <div>
      <Button
        size="lg"
        className={cn(
          'w-full rounded-xl',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleSubmit}
        disabled={disabled}
      >
        {isPending || isReceiptLoading ? (
          'Submitting...'
        ) : (
          <span className="flex items-center gap-1">
            <span className="font-bold">Redeem for underlying</span>
            <span className="font-light">- Step 1/2</span>
          </span>
        )}
      </Button>
    </div>
  )
}

export default SubmitRedeem
