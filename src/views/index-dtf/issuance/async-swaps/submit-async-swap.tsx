import { Button } from '@/components/ui/button'
import { chainIdAtom, walletAtom } from '@/state/atoms'
import { RESERVE_API } from '@/utils/constants'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { Address, erc20Abi } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { asyncSwapOrderIdAtom } from './atom'
import { AsyncSwapResponse } from './types'
import { cn } from '@/lib/utils'

const COWSWAP_VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
const COWSWAP_SETTLEMENT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

type SubmitAsyncSwapProps = {
  data?: AsyncSwapResponse
  dtfAddress: string
  amountOut: string
  operation: string
  loadingQuote?: boolean
}

const SubmitAsyncSwap = ({
  data,
  dtfAddress,
  amountOut,
  operation,
  loadingQuote,
}: SubmitAsyncSwapProps) => {
  const { cowswapQuotes } = data || {}
  const [isSigning, setIsSigning] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const { address: signerAddress } = useAccount()
  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom)
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const setAsyncSwapOrderId = useSetAtom(asyncSwapOrderIdAtom)

  const approveVaultRelayer = useCallback(async () => {
    if (!signerAddress || !publicClient || !walletClient) return

    try {
      setIsApproving(true)

      // Check current allowance
      const allowance = await publicClient.readContract({
        address: USDC_ADDRESS as Address,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [signerAddress, COWSWAP_VAULT_RELAYER as Address],
      })

      if (allowance > 0n) {
        console.log('CoWSwap VaultRelayer already approved for USDC')
        return true
      }

      // Simulate approval
      const { request } = await publicClient.simulateContract({
        account: signerAddress,
        address: USDC_ADDRESS as Address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [
          COWSWAP_VAULT_RELAYER as Address,
          BigInt(2) ** BigInt(256) - BigInt(1),
        ],
      })

      // Send approval transaction
      const hash = await walletClient.writeContract(request)
      console.log('VaultRelayer approval transaction sent:', hash)

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log('VaultRelayer approval completed:', receipt.status)

      return receipt.status === 'success'
    } catch (error) {
      console.error('Error approving VaultRelayer:', error)
      return false
    } finally {
      setIsApproving(false)
    }
  }, [signerAddress, publicClient, walletClient])

  const handleSubmit = useCallback(async () => {
    if (
      !cowswapQuotes?.length ||
      !signerAddress ||
      !chainId ||
      !walletClient ||
      !account
    )
      return

    setIsSigning(true)
    try {
      const signedCowswapOrders = await Promise.all(
        cowswapQuotes.map(async (quote) => {
          const typedData = {
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' },
              ],
              Order: [
                { name: 'sellToken', type: 'address' },
                { name: 'buyToken', type: 'address' },
                { name: 'receiver', type: 'address' },
                { name: 'sellAmount', type: 'uint256' },
                { name: 'buyAmount', type: 'uint256' },
                { name: 'validTo', type: 'uint32' },
                { name: 'appData', type: 'bytes32' },
                { name: 'feeAmount', type: 'uint256' },
                { name: 'kind', type: 'string' },
                { name: 'partiallyFillable', type: 'bool' },
                { name: 'sellTokenBalance', type: 'string' },
                { name: 'buyTokenBalance', type: 'string' },
              ],
            },
            domain: {
              name: 'Gnosis Protocol',
              version: 'v2',
              chainId: BigInt(chainId),
              verifyingContract: COWSWAP_SETTLEMENT,
            },
            primaryType: 'Order',
            message: {
              ...quote.quote.quote,
              sellAmount: BigInt(quote.quote.quote.sellAmount),
              buyAmount: BigInt(quote.quote.quote.buyAmount),
              feeAmount: 0n,
            },
          } as const

          const signature = await walletClient.signTypedData({
            account,
            domain: typedData.domain,
            types: typedData.types,
            primaryType: typedData.primaryType,
            message: typedData.message,
          })

          return {
            quote: quote.quote,
            orderSigningResult: {
              signature,
              signingScheme: 'eip712',
            },
          }
        })
      )

      // 2. Approve Vault Relayer
      const approved = await approveVaultRelayer()
      if (!approved) {
        throw new Error('Failed to approve Vault Relayer')
      }

      // 3. Prepare signed orders for API submission
      const signedOrders = {
        universalOrders: [], // Empty for now as per requirements
        cowswapOrders: signedCowswapOrders,
      }

      // 4. Submit signed orders to API
      const response = await fetch(`${RESERVE_API}async-swap/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dtf: dtfAddress,
          chainId,
          amountOut,
          operation,
          signer: signerAddress,
          signedOrders,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAsyncSwapOrderId(data.swapOrderId)
      console.log('swapOrderId', data.swapOrderId)

      console.log('Orders submitted successfully:', data)
    } catch (error) {
      console.error('Error processing orders:', error)
    } finally {
      setIsSigning(false)
    }
  }, [
    cowswapQuotes,
    signerAddress,
    chainId,
    dtfAddress,
    amountOut,
    operation,
    approveVaultRelayer,
  ])

  const isDisabled =
    !cowswapQuotes?.length || isSigning || isApproving || loadingQuote

  return (
    <div>
      <Button
        size="lg"
        className={cn(
          'w-full rounded-xl',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        {isApproving ? (
          'Approving...'
        ) : isSigning ? (
          'Signing...'
        ) : loadingQuote ? (
          'Awaiting Quote'
        ) : (
          <span className="flex items-center gap-1">
            <span className="font-bold">Start Mint</span>
            <span className="font-light">- Step 1/2</span>
          </span>
        )}
      </Button>
    </div>
  )
}

export default SubmitAsyncSwap
