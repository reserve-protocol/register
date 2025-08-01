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
import { getCurrentBasket } from '@/lib/index-rebalance/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { ArrowLeft, PencilRuler } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Address, formatUnits, parseUnits } from 'viem'
import { currentRebalanceAtom } from '../../../atoms'
import {
  areWeightsFinalizedAtom,
  finalizedWeightsAtom,
  PRICE_VOLATILITY,
  rebalanceTokenMapAtom,
  showFinalizeWeightsViewAtom,
} from '../atoms'
import useRebalanceParams from '../hooks/use-rebalance-params'
import {
  BasketSetupProvider,
  CsvImport,
  BasketTable,
  BasketItem,
  useBasketSetup,
} from '@/components/index-basket-setup'

const FinalizeWeightsContent = () => {
  const rebalanceParams = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const setFinalizedWeights = useSetAtom(finalizedWeightsAtom)
  const setAreWeightsFinalized = useSetAtom(areWeightsFinalizedAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const setShowView = useSetAtom(showFinalizeWeightsViewAtom)
  const { basketItems, proposedUnits, validation } = useBasketSetup()

  // Convert rebalance data to basket setup format
  const initialBasket = useMemo(() => {
    if (!rebalanceParams) return undefined

    const basket: Record<string, BasketItem> = {}

    // First, calculate the actual current share percentages from current folio
    const currentShares: Record<string, string> = {}
    const addresses: string[] = []
    const bals: bigint[] = []
    const decimals: bigint[] = []
    const prices: number[] = []

    rebalanceParams.rebalance.tokens.forEach((tokenAddress) => {
      const token = tokenMap[tokenAddress.toLowerCase()]
      const currentFolio = rebalanceParams.currentFolio[tokenAddress.toLowerCase()]
      
      if (token && currentFolio !== undefined) {
        addresses.push(tokenAddress.toLowerCase())
        bals.push(currentFolio)
        decimals.push(BigInt(token.decimals))
        prices.push(rebalanceParams.prices[tokenAddress.toLowerCase()]?.currentPrice || 0)
      }
    })

    // Calculate current share percentages
    try {
      const shares = getCurrentBasket(bals, decimals, prices)
      addresses.forEach((address, index) => {
        currentShares[address] = formatUnits(shares[index], 16)
      })
    } catch (e) {
      console.error('Error calculating current shares:', e)
    }

    // Now build the basket items
    rebalanceParams.rebalance.tokens.forEach((tokenAddress) => {
      const token = tokenMap[tokenAddress.toLowerCase()]
      const currentFolio = rebalanceParams.currentFolio[tokenAddress.toLowerCase()]

      if (token) {
        const currentUnits = formatUnits(currentFolio || 0n, token.decimals)
        const currentSharePercent = currentShares[tokenAddress.toLowerCase()] || '0'
        
        basket[tokenAddress.toLowerCase()] = {
          token,
          currentValue: currentUnits, // For units mode, this is the current units
          currentShares: currentSharePercent, // Actual current share percentage
          currentUnits: currentUnits, // Also store in currentUnits for clarity
        }
      }
    })

    return basket
  }, [rebalanceParams, tokenMap])

  const priceMap = useMemo(() => {
    if (!rebalanceParams) return {}
    
    const prices: Record<string, number> = {}
    Object.entries(rebalanceParams.prices).forEach(([address, priceData]) => {
      prices[address] = priceData.currentPrice
    })
    return prices
  }, [rebalanceParams])

  const handleFinalize = () => {
    if (!rebalanceParams || !rebalanceControl || !validation.isValid) return

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

  return (
    <div className="bg-background rounded-3xl">
      <Header />
      <Hero />

      <div className="p-4 md:p-6 space-y-4">
        <CsvImport />
        <BasketTable
          mode="units"
          columns={['token', 'current', 'input', 'allocation']}
          showToggle={false}
          showAddToken={false}
          readOnly={false}
        />
      </div>

      <div className="p-4 md:p-6 border-t border-secondary">
        <Button
          className="w-full"
          onClick={handleFinalize}
          disabled={!validation.isValid}
        >
          Finalize Weights
        </Button>
      </div>
    </div>
  )
}

const FinalizeWeightsView = () => {
  const [showView] = useAtom(showFinalizeWeightsViewAtom)
  const rebalanceParams = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)

  if (!showView || !rebalanceParams) return null

  // Convert rebalance data to basket setup format
  const initialBasket: Record<string, BasketItem> = {}
  const priceMap: Record<string, number> = {}

  // First, calculate the actual current share percentages from current folio
  const currentShares: Record<string, string> = {}
  const addresses: string[] = []
  const bals: bigint[] = []
  const decimals: bigint[] = []
  const prices: number[] = []

  rebalanceParams.rebalance.tokens.forEach((tokenAddress) => {
    const token = tokenMap[tokenAddress.toLowerCase()]
    const currentFolio = rebalanceParams.currentFolio[tokenAddress.toLowerCase()]
    
    if (token && currentFolio !== undefined) {
      addresses.push(tokenAddress.toLowerCase())
      bals.push(currentFolio)
      decimals.push(BigInt(token.decimals))
      prices.push(rebalanceParams.prices[tokenAddress.toLowerCase()]?.currentPrice || 0)
    }
  })

  // Calculate current share percentages
  try {
    const shares = getCurrentBasket(bals, decimals, prices)
    addresses.forEach((address, index) => {
      currentShares[address] = formatUnits(shares[index], 16)
    })
  } catch (e) {
    console.error('Error calculating current shares:', e)
  }

  // Now build the basket items
  rebalanceParams.rebalance.tokens.forEach((tokenAddress) => {
    const token = tokenMap[tokenAddress.toLowerCase()]
    const currentFolio = rebalanceParams.currentFolio[tokenAddress.toLowerCase()]

    if (token) {
      const currentUnits = formatUnits(currentFolio || 0n, token.decimals)
      const currentSharePercent = currentShares[tokenAddress.toLowerCase()] || '0'
      
      initialBasket[tokenAddress.toLowerCase()] = {
        token,
        currentValue: currentUnits,
        currentShares: currentSharePercent,
        currentUnits: currentUnits,
      }
      
      priceMap[tokenAddress.toLowerCase()] = rebalanceParams.prices[tokenAddress.toLowerCase()]?.currentPrice || 0
    }
  })

  return (
    <BasketSetupProvider
      config={{
        mode: 'units',
        initialBasket,
        priceMap,
      }}
    >
      <FinalizeWeightsContent />
    </BasketSetupProvider>
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
