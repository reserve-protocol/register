import dtfIndexAbi from '@/abis/dtf-index-abi'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { safeParseEther } from '@/utils'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Address, parseEventLogs } from 'viem'
import { useSendCalls, useWaitForCallsStatus, useWalletClient } from 'wagmi'
import {
  txHashAtom,
  redeemAssetsAtom,
  userInputAtom,
  insufficientBalanceAtom,
} from '../atom'
import { useFolioDetails } from '../hooks/useFolioDetails'

const SubmitRedeem = () => {
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const inputAmount = useAtomValue(userInputAtom)
  const insufficientBalance = useAtomValue(insufficientBalanceAtom)
  const setRedeemAssets = useSetAtom(redeemAssetsAtom)
  const setRedeemTxHash = useSetAtom(txHashAtom)

  const sharesToRedeem = safeParseEther(inputAmount)
  const { data: walletClient } = useWalletClient()
  const { data: folioDetails } = useFolioDetails({ shares: sharesToRedeem })

  const { data, sendCalls, isPending } = useSendCalls()

  const { data: callsStatus, isLoading: isReceiptLoading } =
    useWaitForCallsStatus({
      id: data?.id || '',
    })

  useEffect(() => {
    if (callsStatus?.status === 'success') {
      const receipt = callsStatus.receipts?.[0]

      setRedeemTxHash(receipt?.transactionHash || 'tx-hash-not-found')

      const events = parseEventLogs({
        abi: dtfIndexAbi,
        logs: receipt?.logs as any,
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
  }, [callsStatus])

  const handleSubmit = useCallback(() => {
    if (
      !chainId ||
      !walletClient ||
      !account ||
      !indexDTF ||
      !inputAmount ||
      !folioDetails
    )
      return

    try {
      sendCalls({
        calls: [
          {
            to: indexDTF.id,
            abi: dtfIndexAbi,
            functionName: 'redeem',
            args: [
              sharesToRedeem,
              account,
              folioDetails.assets ?? [],
              folioDetails.redeemValues.map((e) => (e * 95n) / 100n),
            ],
          },
        ],
      })
    } catch (error) {
      console.error('Error processing orders:', error)
    }
  }, [chainId, walletClient, account, indexDTF, inputAmount, folioDetails])

  const disabled =
    isPending || isReceiptLoading || !inputAmount || insufficientBalance

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
        {insufficientBalance ? (
          'Insufficient Balance'
        ) : isPending || isReceiptLoading ? (
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
