import MaxAuctionSizeEditor from '@/components/max-auction-size-editor'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  indexDTFRebalanceControlAtom,
  isHybridDTFAtom,
} from '@/state/dtf/atoms'
import { chainIdAtom } from '@/state/atoms'
import {
  DEFAULT_MAX_AUCTION_SIZE_USD,
  maxAuctionSizesAtom,
} from '@/state/max-auction-sizes'
import {
  ExplorerDataType,
  getExplorerLink,
} from '@/utils/getExplorerLink'
import { fetchZapperTokens, isNativeToken } from '@/utils/zapper'
import {
  getStartRebalance,
  WeightRange,
} from '@reserve-protocol/dtf-rebalance-lib'
import { StartRebalanceArgsPartial as StartRebalanceArgsPartialV4 } from '@reserve-protocol/dtf-rebalance-lib/dist/4.0.0/types'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue, useSetAtom } from 'jotai'
import { AlertTriangle, ArrowUpRight } from 'lucide-react'
import { useMemo } from 'react'
import {
  areWeightsSavedAtom,
  savedWeightsAtom,
  rebalanceTokenMapAtom,
  showManageWeightsViewAtom,
  managedWeightUnitsAtom,
} from '../../atoms'
import useRebalanceParams from '../../hooks/use-rebalance-params'
import {
  BasketTable,
  CsvImport,
  useBasketSetup,
} from '@/components/index-basket-setup'
import { calculateTargetShares, prepareRebalanceData } from './utils/weight-calculation-utils'
import ManageWeightsHeader from './manage-weights-header'
import ManageWeightsHero from './manage-weights-hero'
import { FOLIO_VERSION_V5, getRebalanceTokens, getRebalanceWeights } from '../../utils/transforms'

const ManageWeightsContent = () => {
  const rebalanceParams = useRebalanceParams()
  const tokenMap = useAtomValue(rebalanceTokenMapAtom)
  const chainId = useAtomValue(chainIdAtom)
  const rebalanceControl = useAtomValue(indexDTFRebalanceControlAtom)
  const isHybridDTF = useAtomValue(isHybridDTFAtom)
  const maxAuctionSizesMap = useAtomValue(maxAuctionSizesAtom)
  const setSavedWeights = useSetAtom(savedWeightsAtom)
  const setAreWeightsSaved = useSetAtom(areWeightsSavedAtom)
  const setShowView = useSetAtom(showManageWeightsViewAtom)
  const setManagedWeightUnits = useSetAtom(managedWeightUnitsAtom)
  const { basketItems, proposedUnits, validation } = useBasketSetup()

  // Get token list for MaxAuctionSizeEditor
  const tokens = useMemo(() => Object.values(tokenMap), [tokenMap])

  const { data: zapperTokens } = useQuery({
    queryKey: ['zapperTokens', chainId],
    queryFn: () => fetchZapperTokens(chainId),
    staleTime: 5 * 60_000,
  })

  const unsupportedTokens = useMemo(() => {
    if (!zapperTokens) return []
    return Object.keys(basketItems)
      .filter(
        (addr) =>
          !isNativeToken(addr, chainId) &&
          !zapperTokens.has(addr.toLowerCase())
      )
      .map((addr) => ({
        symbol: tokenMap[addr]?.symbol ?? addr.slice(0, 10),
        address: addr,
      }))
  }, [basketItems, zapperTokens, chainId, tokenMap])

  if (!rebalanceParams || !rebalanceControl) return null

  const editedRows = Object.entries(basketItems).filter(([address, item]) => {
    const proposedUnit = proposedUnits[address] || item.currentValue
    const initialProposedUnit = item.proposedValue || item.currentUnits || item.currentValue
    return proposedUnit !== initialProposedUnit
  }).length
  const totalRows = Object.keys(basketItems).length

  const handleSaveWeights = () => {
    if (!rebalanceParams || !rebalanceControl) return

    try {
      // Get tokens using version-aware helper
      const rebalanceTokens = getRebalanceTokens(
        rebalanceParams.rebalance,
        rebalanceParams.folioVersion
      )

      const targetShares = calculateTargetShares(
        rebalanceTokens,
        tokenMap,
        proposedUnits,
        basketItems,
        rebalanceParams.currentAssets,
        rebalanceParams.prices
      )

      const rebalanceData = prepareRebalanceData(
        targetShares,
        rebalanceTokens,
        tokenMap,
        basketItems,
        rebalanceParams.currentAssets,
        rebalanceParams.prices
      )

      // Max auction size per token in USD
      const maxAuctionSizes = rebalanceData.tokens.map(
        (token) =>
          maxAuctionSizesMap[token.toLowerCase()] ?? DEFAULT_MAX_AUCTION_SIZE_USD
      )

      const startRebalanceArgs = getStartRebalance(
        rebalanceParams.folioVersion,
        rebalanceParams.supply,
        rebalanceData.tokens,
        rebalanceData.assets,
        rebalanceData.decimals,
        rebalanceData.targetBasket,
        rebalanceData.prices,
        rebalanceData.error,
        maxAuctionSizes,
        rebalanceControl.weightControl,
        isHybridDTF
      )

      // Get weights - for v5 we need to extract from tokens, for v4 use weights directly
      let weights: WeightRange[]
      if (rebalanceParams.folioVersion === FOLIO_VERSION_V5) {
        // For v5, getRebalanceWeights helper extracts from rebalance, but here we need from startRebalanceArgs
        // The v5 returns tokens: TokenRebalanceParams[], so we extract weights from there
        const argsV5 = startRebalanceArgs as { tokens: Array<{ weight: WeightRange }> }
        weights = argsV5.tokens.map((t) => t.weight)
      } else {
        const argsV4 = startRebalanceArgs as StartRebalanceArgsPartialV4
        weights = argsV4.weights
      }

      // Create weights map ensuring correct token order
      const weightsMap: Record<string, WeightRange> = {}
      rebalanceTokens.forEach((tokenAddress, index) => {
        const address = tokenAddress.toLowerCase()
        weightsMap[address] = weights[index]

        // Debug logging
        console.log(`Token ${index}: ${tokenAddress}`, {
          weight: weights[index],
          proposedUnit: proposedUnits[address],
          targetShare: targetShares[index],
        })
      })

      // Validate weights distribution
      const totalWeight = weights.reduce(
        (sum: number, w: WeightRange) => sum + Number(w.spot),
        0
      )
      console.log('Total weight (should be close to 1):', totalWeight)

      setSavedWeights(weightsMap)
      setAreWeightsSaved(true)
      setManagedWeightUnits(proposedUnits)
      setShowView(false)
    } catch (error) {
      console.error('Error saving weights:', error)
    }
  }

  return (
    <div className="bg-background rounded-3xl">
      <ManageWeightsHeader />
      <ManageWeightsHero />

      <div className="p-2 space-y-2">
        <CsvImport />
        {unsupportedTokens.length > 0 && (
          <Alert
            variant="warning"
            className="rounded-xl bg-warning/10 border-warning/20"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              Tokens not available
            </AlertTitle>
            <AlertDescription>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                {unsupportedTokens.map((t) => (
                  <li key={t.address}>
                    <span className="font-medium">{t.symbol}</span>{' '}
                    <a
                      href={getExplorerLink(
                        t.address,
                        chainId,
                        ExplorerDataType.ADDRESS
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 font-mono text-xs hover:text-foreground"
                    >
                      {t.address.slice(0, 6)}...{t.address.slice(-4)}
                      <ArrowUpRight size={12} strokeWidth={1.5} />
                    </a>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <BasketTable
          mode="units"
          columns={['token', 'current', 'input', 'allocation']}
          showToggle={false}
          showAddToken={false}
          readOnly={false}
        />
        <MaxAuctionSizeEditor tokens={tokens} />
      </div>

      <div className="p-2 pt-0 border-t border-secondary">
        <Button
          className="w-full rounded-xl text-base py-6"
          onClick={handleSaveWeights}
          disabled={!validation.isValid}
        >
          Save Weights {editedRows}/{totalRows} edited
        </Button>
      </div>
    </div>
  )
}

export default ManageWeightsContent