import dtfIndexAbi from '@/abis/dtf-index-abi'
import dtfIndexAbiV2 from '@/abis/dtf-index-abi-v2'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { useERC20Balances } from '@/hooks/useERC20Balance'
import { notifyError } from '@/hooks/useNotification'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFPriceAtom, indexDTFVersionAtom } from '@/state/dtf/atoms'
import { useAtomValue, useSetAtom } from 'jotai'
import { Loader } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Address, encodeFunctionData, erc20Abi, parseEther } from 'viem'
import { useSendCalls } from 'wagmi'
import { useFolioDetails } from '../../async-swaps/hooks/useFolioDetails'
import { sendCallsWithRetry } from '../../async-swaps/hooks/utils'
import { ASYNC_MINT_BUFFER, actualMintedSharesAtom, mintAmountAtom, mintTxHashAtom, wizardStepAtom } from '../atoms'

const MintExecute = () => {
  const account = useAtomValue(walletAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const chainId = useAtomValue(chainIdAtom)
  const indexDTFVersion = useAtomValue(indexDTFVersionAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const mintAmount = useAtomValue(mintAmountAtom)
  const setMintTxHash = useSetAtom(mintTxHashAtom)
  const setActualMintedShares = useSetAtom(actualMintedSharesAtom)
  const setStep = useSetAtom(wizardStepAtom)

  const [isMinting, setIsMinting] = useState(false)

  // Calculate mint value with buffer
  const parsedAmount = Number(mintAmount) || 0
  const safeDtfPrice = dtfPrice && dtfPrice > 0 ? dtfPrice : 0
  const mintValue = safeDtfPrice > 0
    ? (parsedAmount / safeDtfPrice) * (1 - ASYNC_MINT_BUFFER)
    : 0
  const folioAmount = parseEther(
    Math.max(mintValue, 0.000001).toFixed(18)
  )

  const { data: folioDetails } = useFolioDetails({ shares: safeDtfPrice > 0 ? folioAmount : undefined })
  const { sendCallsAsync } = useSendCalls()

  const { data: balanceData, isFetching: isFetchingBalanceData } =
    useERC20Balances(
      folioDetails?.assets.map((address) => ({
        address,
        chainId,
      })) || []
    )

  const maxMintableAmount = useMemo(() => {
    if (!folioDetails?.mintValues || !balanceData || !balanceData.length) {
      return 0n
    }

    const mintableAmounts = folioDetails.mintValues.map((mintValue, index) => {
      if (mintValue === 0n) return 0n
      const balance = balanceData[index] as bigint
      return (balance * folioAmount) / mintValue
    })

    const participating = mintableAmounts.filter((_, i) => folioDetails.mintValues[i] > 0n)
    return participating.length > 0
      ? participating.reduce((min, amount) => (amount < min ? amount : min))
      : 0n
  }, [folioDetails?.mintValues, balanceData, folioAmount])

  const handleMint = async () => {
    if (!account || !folioDetails || !indexDTF || maxMintableAmount === 0n) return

    setIsMinting(true)

    try {
      // WHY: Scale approvals from folioAmount to maxMintableAmount + 1% buffer
      // mintValues are proportional to folioAmount, but we mint maxMintableAmount
      const approvalCalls = folioDetails.assets.map((asset, i) => {
        const scaledAmount = folioAmount > 0n
          ? (folioDetails.mintValues[i] * maxMintableAmount) / folioAmount
          : folioDetails.mintValues[i]
        return {
          to: asset as Address,
          value: 0n,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [indexDTF.id, (scaledAmount * 101n) / 100n],
          }),
        }
      })

      const mintCall = {
        to: indexDTF.id as Address,
        value: 0n,
        data:
          indexDTFVersion === '2.0.0'
            ? encodeFunctionData({
                abi: dtfIndexAbiV2,
                functionName: 'mint',
                args: [maxMintableAmount, account, (maxMintableAmount * 99n) / 100n],
              })
            : encodeFunctionData({
                abi: dtfIndexAbi,
                functionName: 'mint',
                args: [maxMintableAmount, account, (maxMintableAmount * 99n) / 100n],
              }),
      }

      const result = await sendCallsWithRetry(
        sendCallsAsync,
        chainId,
        [...approvalCalls, mintCall],
        account as Address
      )

      setActualMintedShares(maxMintableAmount)
      // WHY: wallet_sendCalls returns a bundle ID, not a tx hash.
      // Store it — success-header validates format before linking to explorer.
      setMintTxHash(result?.id)
      setStep('success')
    } catch (error) {
      console.error('Mint execution failed:', error)
      if (error instanceof Error && error.message !== 'USER_CANCELLED_TX') {
        notifyError('Mint failed', 'Transaction failed. Please try again.')
      }
    } finally {
      setIsMinting(false)
    }
  }

  if (!indexDTF) return null

  if (isMinting) {
    return (
      <div className="relative rounded-[20px] p-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_5s_infinite] bg-[length:200%_100%]">
        <div className="flex gap-2 items-center justify-between p-4 bg-card rounded-[20px] shadow-md">
          <div className="flex gap-2 items-center text-primary">
            <TokenLogo
              address={indexDTF.id}
              symbol={indexDTF.token.symbol}
              height={29}
              width={29}
            />
            <div className="font-semibold">Confirm Mint</div>
          </div>
          <div className="border border-primary/40 rounded-full p-1.5 text-primary">
            <Loader
              size={16}
              strokeWidth={1.5}
              className="animate-spin-slow"
            />
          </div>
        </div>
      </div>
    )
  }

  const canMint = maxMintableAmount > 0n && !isFetchingBalanceData

  return (
    <TransactionButtonContainer chain={chainId}>
      <Button
        size="lg"
        className="w-full h-[49px] rounded-[12px]"
        onClick={handleMint}
        disabled={!canMint}
      >
        <span className="flex items-center gap-1">
          <span className="font-bold">Approve & Mint</span>
          <span className="font-light opacity-80">- Step 2/2</span>
        </span>
      </Button>
    </TransactionButtonContainer>
  )
}

export default MintExecute
