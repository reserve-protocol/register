import { Button } from '@/components/ui/button'
import {
  indexDTFRebalanceControlAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import { getProposalTitle } from '@/utils'
import {
  getStartRebalance,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, PencilRuler } from 'lucide-react'
import { useEffect } from 'react'
import { Address, formatUnits, parseUnits } from 'viem'
import { currentRebalanceAtom } from '../../../atoms'
import {
  areWeightsFinalizedAtom,
  finalizedWeightsAtom,
  finalizeProposedBasketAtom,
  finalizeProposedUnitsAtom,
  IndexAssetShares,
  PRICE_VOLATILITY,
  rebalanceTokenMapAtom,
  showFinalizeWeightsViewAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import FinalizeWeightsCsvSetup from './finalize-weights-csv-setup'
import FinalizeWeightsTable from './finalize-weights-table'

const FinalizeWeightsView = () => {
  const [showView, setShowView] = useAtom(showFinalizeWeightsViewAtom)
  const rebalanceParams = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const currentRebalance = useAtomValue(currentRebalanceAtom)
  const [proposedUnits, setProposedUnits] = useAtom(finalizeProposedUnitsAtom)
  const [proposedBasket, setProposedBasket] = useAtom(
    finalizeProposedBasketAtom
  )
  const setFinalizedWeights = useSetAtom(finalizedWeightsAtom)
  const setAreWeightsFinalized = useSetAtom(areWeightsFinalizedAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)

  // Initialize proposed basket from rebalance targets
  useEffect(() => {
    if (rebalanceParams && !proposedBasket) {
      const basket: Record<string, IndexAssetShares> = {}
      const initialUnits: Record<string, string> = {}

      rebalanceParams.rebalance.tokens.forEach((tokenAddress) => {
        const token = tokenMap[tokenAddress.toLowerCase()]
        const currentFolio =
          rebalanceParams.currentFolio[tokenAddress.toLowerCase()]
        const targetWeight =
          rebalanceParams.initialWeights[tokenAddress.toLowerCase()]

        if (token && targetWeight) {
          // Calculate current units from folio
          const currentUnits = formatUnits(currentFolio || 0n, token.decimals)

          basket[tokenAddress.toLowerCase()] = {
            token,
            currentShares: formatUnits(targetWeight.spot, 16), // Convert to percentage
            currentUnits,
          }

          // Initialize proposed units if not set
          if (!proposedUnits[tokenAddress.toLowerCase()]) {
            // Calculate target units based on target weight and DTF supply
            const targetUnits = calculateTargetUnits(
              targetWeight.spot,
              token,
              rebalanceParams.prices[tokenAddress.toLowerCase()].currentPrice,
              rebalanceParams.supply,
              rebalanceParams.prices
            )
            initialUnits[tokenAddress.toLowerCase()] = targetUnits
          }
        }
      })

      setProposedBasket(basket)
      if (Object.keys(proposedUnits).length === 0) {
        setProposedUnits(initialUnits)
      }
    }
  }, [
    rebalanceParams,
    tokenMap,
    proposedBasket,
    proposedUnits,
    setProposedBasket,
    setProposedUnits,
  ])

  const handleFinalize = () => {
    if (!proposedBasket || !rebalanceParams || !rebalanceControl) return

    try {
      // Prepare data for getStartRebalance
      const tokens: Address[] = []
      const decimals: bigint[] = []
      const targetBasket: bigint[] = []
      const prices: number[] = []
      const error: number[] = []
      const folio: bigint[] = []

      // Use the token order from rebalance params
      rebalanceParams.rebalance.tokens.forEach((tokenAddress) => {
        const token = tokenMap[tokenAddress.toLowerCase()]
        const d = token.decimals || 18

        tokens.push(tokenAddress as Address)
        decimals.push(BigInt(d))

        // Parse the proposed units to get target basket
        try {
          targetBasket.push(
            parseUnits(proposedUnits[tokenAddress.toLowerCase()] || '0', d)
          )
        } catch {
          targetBasket.push(0n)
        }

        // Current folio
        folio.push(
          rebalanceParams.currentFolio[tokenAddress.toLowerCase()] || 0n
        )

        // Prices
        prices.push(
          rebalanceParams.prices[tokenAddress.toLowerCase()]?.currentPrice || 0
        )

        // Use medium volatility
        error.push(PRICE_VOLATILITY.MEDIUM)
      })

      // Call getStartRebalance to get proper WeightRange objects
      const { weights } = getStartRebalance(
        rebalanceParams.supply,
        tokens,
        folio,
        decimals,
        targetBasket,
        prices,
        error,
        rebalanceControl.weightControl,
        isHybridDTF
      )

      // Store weights as a mapping
      const weightsMap = tokens.reduce(
        (acc, address, index) => {
          acc[address.toLowerCase()] = weights[index]
          return acc
        },
        {} as Record<string, WeightRange>
      )

      setFinalizedWeights(weightsMap)
      setAreWeightsFinalized(true)
      setShowView(false)
    } catch (error) {
      console.error('Error finalizing weights:', error)
    }
  }

  const isValidConfiguration = Object.values(proposedUnits).every((unit) => {
    const num = Number(unit)
    return unit && !isNaN(num) && num > 0
  })

  if (!showView || !proposedBasket) return null

  const rebalanceTitle = currentRebalance?.proposal?.description || 'Rebalance'

  return (
    <div className="bg-background rounded-3xl">
      <Header />
      <Hero />

      <div className="p-4 md:p-6 space-y-4">
        {/* CSV Upload */}
        <FinalizeWeightsCsvSetup />

        {/* Basket Configuration Table */}
        <FinalizeWeightsTable
          assets={Object.values(proposedBasket)}
          proposedUnits={proposedUnits}
          onUnitsChange={(address, value) => {
            setProposedUnits((prev) => ({
              ...prev,
              [address.toLowerCase()]: value,
            }))
          }}
        />
      </div>

      <div className="p-4 md:p-6 border-t border-secondary">
        <Button
          className="w-full"
          onClick={handleFinalize}
          disabled={!isValidConfiguration}
        >
          Finalize Weights
        </Button>
      </div>
    </div>
  )
}

function Header() {
  const rebalance = useAtomValue(currentRebalanceAtom)
  const setShowView = useSetAtom(showFinalizeWeightsViewAtom)

  return (
    <div className="flex items-center gap-2 p-6 border-b">
      <Button
        variant="muted"
        onClick={() => setShowView(false)}
        size="icon-rounded"
      >
        <ArrowLeft />
      </Button>
      <span className="text-legend">
        {getProposalTitle(rebalance?.proposal.description || '...')}
      </span>
      <span className="font-semibold">/</span>
      <span className="font-semibold">Finalize Basket Weights</span>
    </div>
  )
}

function Hero() {
  const finalizedWeights = useAtomValue(finalizedWeightsAtom)

  if (finalizedWeights) return null

  return (
    <div className="flex flex-col gap-1 p-6 text-center items-center">
      <div className="p-2 rounded-full border border-primary text-primary">
        <PencilRuler className="w-4 h-4" />
      </div>
      <h1 className="text-xl font-semibold text-primary mt-1">
        Finalize weights before proceeding
      </h1>
      <p className="text-legend">
        You need to confirm desired weights before running rebalance auctions.
      </p>
    </div>
  )
}

// Helper function to calculate target units
function calculateTargetUnits(
  targetWeight: bigint,
  token: { decimals: number },
  tokenPrice: number,
  supply: bigint,
  allPrices: Record<string, { currentPrice: number }>
): string {
  // Calculate total value of DTF
  // Assuming DTF price is $1 for simplicity, but could be calculated from basket
  const dtfTotalValue = Number(formatUnits(supply, 18)) // Assuming DTF has 18 decimals

  // Calculate target value for this token
  const weightPercent = Number(formatUnits(targetWeight, 16)) / 100
  const tokenTargetValue = dtfTotalValue * weightPercent

  // Calculate units needed
  const units = tokenTargetValue / tokenPrice

  // Format with appropriate decimals
  return units.toFixed(Math.min(token.decimals, 6))
}

export default FinalizeWeightsView
