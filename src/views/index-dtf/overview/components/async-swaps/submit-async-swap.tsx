import { Button } from '@/components/ui/button'
import { AsyncSwapResponse } from './types'
import { useCallback, useState } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { chainIdAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { RESERVE_API } from '@/utils/constants'
import { erc20Abi } from 'viem'
import { Address } from 'viem'

const COWSWAP_VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
const COWSWAP_SETTLEMENT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

type SubmitAsyncSwapProps = {
  data?: AsyncSwapResponse
  dtfAddress: string
  amountOut: string
  operation: string
}

const SubmitAsyncSwap = ({
  data,
  dtfAddress,
  amountOut,
  operation,
}: SubmitAsyncSwapProps) => {
  const { cowswapQuotes } = data || {}
  const [isSigning, setIsSigning] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const { address: signerAddress } = useAccount()
  const chainId = useAtomValue(chainIdAtom)
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

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
    if (!cowswapQuotes?.length || !signerAddress || !chainId) return

    setIsSigning(true)
    try {
      // 1. Sign CoWSwap quotes
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
              name: 'CoW Protocol',
              version: 'v2',
              chainId: Number(chainId),
              verifyingContract: COWSWAP_SETTLEMENT,
            },
            primaryType: 'Order',
            message: {
              ...quote.quote.quote,
              feeAmount: '0',
            },
          }

          const signature = await window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [signerAddress, JSON.stringify(typedData)],
          })

          return {
            quote: quote.quote,
            orderSigningResult: signature,
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

      console.log('Orders submitted successfully:', await response.json())
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

  return (
    <div>
      <Button
        size="lg"
        className="w-full rounded-xl"
        onClick={handleSubmit}
        disabled={!cowswapQuotes?.length || isSigning || isApproving}
      >
        {isApproving ? 'Approving...' : isSigning ? 'Signing...' : 'Submit'}
      </Button>
    </div>
  )
}

export default SubmitAsyncSwap
