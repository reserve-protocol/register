import { indexDTFAtom } from '@/state/dtf/atoms'
import { walletAtom } from '@/state/atoms'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { Address, parseEventLogs, zeroAddress } from 'viem'
import { usePublicClient } from 'wagmi'
import dtfIndexAbi from '@/abis/dtf-index-abi'

export const useGetMintTx = () => {
  const [mintTxHash, setMintTxHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const indexDTF = useAtomValue(indexDTFAtom)
  const walletAddress = useAtomValue(walletAtom)
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!indexDTF?.id || !walletAddress || !publicClient) {
      return
    }

    setIsLoading(true)

    const checkForMintEvents = async () => {
      try {
        // Get the latest block number
        const latestBlock = await publicClient.getBlockNumber()

        // Look back 100 blocks for Transfer events
        const fromBlock = latestBlock - 100n

        const logs = await publicClient.getLogs({
          address: indexDTF.id as Address,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { type: 'address', name: 'from', indexed: true },
              { type: 'address', name: 'to', indexed: true },
              { type: 'uint256', name: 'value', indexed: false },
            ],
          },
          fromBlock,
          toBlock: latestBlock,
        })

        // Filter for Transfer events from zero address to connected wallet
        const mintEvents = logs.filter((log) => {
          const parsedLog = parseEventLogs({
            abi: dtfIndexAbi,
            logs: [log],
            eventName: 'Transfer',
          })[0]

          return (
            parsedLog &&
            parsedLog.args.from === zeroAddress &&
            parsedLog.args.to === walletAddress &&
            parsedLog.args.value > 0n
          )
        })

        if (mintEvents.length > 0) {
          // Get the most recent mint event
          const latestMintEvent = mintEvents[mintEvents.length - 1]
          setMintTxHash(latestMintEvent.transactionHash)
        }
      } catch (error) {
        console.error('Error checking for mint events:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Check immediately
    checkForMintEvents()

    // Set up polling every 5 seconds
    const interval = setInterval(checkForMintEvents, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [indexDTF?.id, walletAddress, publicClient])

  return {
    mintTxHash,
    isLoading,
  }
}
