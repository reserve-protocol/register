import dtfIndexAbi from '@/abis/dtf-index-abi'
import TokenLogo from '@/components/token-logo'
import { Button } from '@/components/ui/button'
import { walletAtom } from '@/state/atoms'
import { wagmiConfig } from '@/state/chain'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Loader } from 'lucide-react'
import { useCallback } from 'react'
import { erc20Abi } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'
import { asyncSwapResponseAtom, isMintingAtom, mintTxHashAtom } from './atom'

const MintButton = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const orders = useAtomValue(asyncSwapResponseAtom)
  const [isMinting, setIsMinting] = useAtom(isMintingAtom)
  const setMintTxHash = useSetAtom(mintTxHashAtom)
  const { data: walletClient } = useWalletClient({ config: wagmiConfig })
  const publicClient = usePublicClient({ config: wagmiConfig })
  const account = useAtomValue(walletAtom)

  const handleMint = useCallback(async () => {
    if (
      !indexDTF ||
      !walletClient ||
      !publicClient ||
      !orders?.cowswapOrders?.length ||
      !account
    )
      return

    setIsMinting(true)
    try {
      // Approve each token with a 10% buffer
      for (const order of orders.cowswapOrders) {
        const buyAmount = BigInt(order.quote.buyAmount)
        const amountWithBuffer = (buyAmount * 150n) / 100n // 50% buffer

        // Check current allowance
        const currentAllowance = await publicClient.readContract({
          address: order.quote.buyToken,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [account, indexDTF.id],
        })

        // Only approve if current allowance is insufficient
        if (currentAllowance < amountWithBuffer) {
          // Simulate approval
          const { request } = await publicClient.simulateContract({
            address: order.quote.buyToken,
            abi: erc20Abi,
            functionName: 'approve',
            args: [indexDTF.id, amountWithBuffer],
            account,
          })

          // Send approval
          const hash = await walletClient.writeContract(request)
          const receipt = await publicClient.waitForTransactionReceipt({ hash })

          // Verify the approval was successful
          if (receipt.status !== 'success') {
            throw new Error('Approval transaction failed')
          }

          // Double check the new allowance
          const newAllowance = await publicClient.readContract({
            address: order.quote.buyToken,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [account, indexDTF.id],
          })

          if (newAllowance < amountWithBuffer) {
            throw new Error('Approval amount is still insufficient')
          }
        }
      }

      // Perform minting
      const shares = BigInt(orders.amountOut)

      const { request } = await publicClient.simulateContract({
        address: indexDTF.id,
        abi: dtfIndexAbi,
        functionName: 'mint',
        args: [shares, account],
        account,
      })

      const hash = await walletClient.writeContract(request)
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      setMintTxHash(receipt.transactionHash)
    } catch (error) {
      console.error('Error during mint process:', error)
    } finally {
      setIsMinting(false)
    }
  }, [indexDTF, walletClient, publicClient, orders, setMintTxHash, account])

  if (!indexDTF) return null

  if (isMinting) {
    return (
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_5s_infinite] bg-[length:200%_100%]">
        <div className="flex gap-2 items-center justify-between p-4 bg-card rounded-2xl shadow-md">
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
            <Loader size={16} strokeWidth={1.5} className="animate-spin-slow" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button size="lg" className="w-full rounded-xl" onClick={handleMint}>
      <span className="flex items-center gap-1">
        <span className="font-bold">Approve & Mint</span>
        <span className="font-light">- Step 2/2</span>
      </span>
    </Button>
  )
}

export default MintButton
