import dtfIndexAbiV4 from '@/abis/dtf-index-abi-v4'
import { Button } from '@/components/ui/button'
import {
  getOpenAuction,
  getTargetBasket,
} from '@/lib/index-rebalance-4.0.0/open-auction'
import { Rebalance as RebalanceHelperType } from '@/lib/index-rebalance-4.0.0/types'
import { indexDTFAtom, indexDTFRebalanceControlAtom } from '@/state/dtf/atoms'
import { Token } from '@/types'
import { useAtomValue } from 'jotai'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Address } from 'viem'
import { useWriteContract } from 'wagmi'
import { currentRebalanceAtom, Rebalance } from '../../../atoms'
import { rebalancePercentAtom } from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import { TokenPriceWithSnapshot } from '@/hooks/use-asset-prices-with-snapshot'

const LaunchAuctionsButton = () => {
  const dtf = useAtomValue(indexDTFAtom)
  const rebalance = useAtomValue(currentRebalanceAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const rebalancePercent = useAtomValue(rebalancePercentAtom)
  const { isReady, dtfData, initialFolio, prices } = useRebalanceParams()
  const { writeContract, isError, isPending, data } = useWriteContract()
  const [error, setError] = useState<string | null>(null)

  const isValid = isReady && rebalancePercent > 0 && rebalance && dtf

  const handleStartAuctions = () => {
    if (
      !isValid ||
      !rebalance ||
      !dtfData ||
      !rebalanceControl ||
      !initialFolio ||
      !prices
    )
      return

    try {
      const [openAuctionArgs] = getRebalanceArguments(
        rebalance.rebalance,
        dtfData.supply,
        dtfData.currentFolio,
        initialFolio,
        prices,
        rebalanceControl.weightControl,
        rebalancePercent
      )

      writeContract({
        address: dtf?.id,
        abi: dtfIndexAbiV4,
        functionName: 'openAuction',
        args: [
          openAuctionArgs.rebalanceNonce,
          openAuctionArgs.tokens as Address[],
          openAuctionArgs.newWeights as any,
          openAuctionArgs.newPrices as any,
          openAuctionArgs.newLimits as any,
        ],
      })
    } catch (e) {
      console.error('Error opening auction', e)
      setError('Error opening auctions')
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        className="mt-4 w-full"
        disabled={!isValid || isPending}
        onClick={handleStartAuctions}
      >
        {isPending ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            <span>Launching...</span>
          </>
        ) : (
          'Start auctions'
        )}
      </Button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  )
}

export default LaunchAuctionsButton

function getRebalanceArguments(
  rebalance: Rebalance,
  supply: bigint,
  currentFolio: Record<string, bigint>,
  initialFolio: Record<string, bigint>,
  prices: TokenPriceWithSnapshot,
  isTrackingDTF: boolean,
  rebalancePercent: number
) {
  // Lets start by creating a map of the basket tokens
  const tokenMap: Record<string, Token> = {}
  const tokens: string[] = []
  const decimals: bigint[] = []
  const currentPrices: number[] = []
  const snapshotPrices: number[] = []
  const priceError: number[] = []
  const initialFolioShares: bigint[] = []
  const currentFolioShares: bigint[] = []

  const rebalanceData: RebalanceHelperType = {
    // TODO: workaround, subgraph entity will include the nonce
    nonce: BigInt(rebalance.id.split('-')[1].substring(2)),
    tokens: [],
    weights: [],
    initialPrices: [],
    inRebalance: [],
    limits: {
      low: BigInt(rebalance.rebalanceLowLimit),
      spot: BigInt(rebalance.rebalanceSpotLimit),
      high: BigInt(rebalance.rebalanceHighLimit),
    },
    startedAt: BigInt(rebalance.timestamp),
    restrictedUntil: BigInt(rebalance.restrictedUntil),
    availableUntil: BigInt(rebalance.availableUntil),
    priceControl: Number(rebalance.priceControl),
  }

  rebalance.tokens.forEach((token, index) => {
    tokenMap[token.address.toLowerCase()] = token
    tokens.push(token.address.toLowerCase())
    decimals.push(BigInt(token.decimals))
    currentPrices.push(prices[token.address.toLowerCase()].currentPrice)
    snapshotPrices.push(prices[token.address.toLowerCase()].snapshotPrice)
    priceError.push(0.1)
    initialFolioShares.push(initialFolio[token.address.toLowerCase()] || 0n)
    currentFolioShares.push(currentFolio[token.address.toLowerCase()] || 0n)

    // Rebalnace data
    rebalanceData.tokens.push(token.address.toLowerCase())
    rebalanceData.weights.push({
      low: BigInt(rebalance.weightSpotLimit[index]),
      spot: BigInt(rebalance.weightSpotLimit[index]),
      high: BigInt(rebalance.weightSpotLimit[index]),
    })
    rebalanceData.initialPrices.push({
      low: BigInt(rebalance.priceLowLimit[index]),
      high: BigInt(rebalance.priceHighLimit[index]),
    })
    rebalanceData.inRebalance.push(false)
  })

  const targetBasket = getTargetBasket(
    rebalanceData.weights,
    isTrackingDTF ? currentPrices : snapshotPrices,
    decimals
  )

  return getOpenAuction(
    rebalanceData,
    supply,
    initialFolioShares,
    targetBasket,
    currentFolioShares,
    decimals,
    currentPrices,
    priceError,
    rebalancePercent / 100
  )
}
