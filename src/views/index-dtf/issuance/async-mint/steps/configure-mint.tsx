import TokenLogo from '@/components/token-logo'
import TokenLogoWithChain from '@/components/token-logo/TokenLogoWithChain'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { NumericalInput } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TransactionButtonContainer } from '@/components/ui/transaction-button'
import { useERC20Balances } from '@/hooks/useERC20Balance'
import { cn } from '@/lib/utils'
import { balancesAtom, chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFBasketPricesAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency, formatTokenAmount, safeParseEther } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  Info,
  ListChecks,
  Minus,
  Pencil,
  Plus,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Address, formatUnits } from 'viem'
import {
  ASYNC_MINT_BUFFER,
  collateralSelectionInitializedAtom,
  customCollateralAmountsAtom,
  folioDetailsAtom,
  inputTokenAtom,
  mintAmountAtom,
  mintSharesAtom,
  mintStrategyAtom,
  selectedCollateralsAtom,
  slippageAtom,
  tokenPricesAtom,
  useWalletCollateralAtom,
  wizardStepAtom,
} from '../atoms'
import { calculateCollateralAllocation, calculateMaxMintAmount } from '../utils'

const NATIVE_TOKEN_ADDRESS =
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as Address

const WRAPPED_NATIVE_SYMBOLS = new Set(['WETH', 'WBETH'])
const MIN_DISPLAYABLE_USD_SHORTFALL = 0.005
const MAX_MINT_INPUT_DECIMALS = 2
const COLLATERAL_DUST_USD_THRESHOLD = 0.01
// Temporary QA bypass: allow oversized amounts through quote fetching while
// keeping execution blocked later in the flow.
const ALLOW_OVERSIZED_ASYNC_MINT_QUOTES = true
type AsyncOperation = 'mint' | 'redeem'
type MaxChangeStatus = {
  direction: 'up' | 'down'
  label: string
}

const getStatusLabel = (explanation?: string, fromWallet?: bigint) => {
  if (!fromWallet || fromWallet === 0n) return ''
  if (explanation === 'Token at its maximum weight') return 'Capped at'
  if (explanation === 'Using your full balance') return 'Using full balance'
  return ''
}

const formatTokenBalance = (value: bigint, decimals: number) =>
  formatTokenAmount(Number(formatUnits(value, decimals)))

const formatMaxMintInputAmount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return ''

  const factor = 10 ** MAX_MINT_INPUT_DECIMALS
  const roundedDown = Math.floor(value * factor) / factor

  return roundedDown.toFixed(MAX_MINT_INPUT_DECIMALS).replace(/\.?0+$/, '')
}

const calculateMintSharesForUsd = (
  amount: number,
  dtfPrice?: number | null
) => {
  if (!dtfPrice || !amount || !isFinite(amount) || amount <= 0) return 0n
  return safeParseEther(
    ((amount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)).toFixed(18)
  )
}

const ConfigureMint = () => {
  const setStep = useSetAtom(wizardStepAtom)
  const setStrategy = useSetAtom(mintStrategyAtom)
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const basketPrices = useAtomValue(indexDTFBasketPricesAtom)
  const inputToken = useAtomValue(inputTokenAtom)
  const balances = useAtomValue(balancesAtom)
  const tokenPrices = useAtomValue(tokenPricesAtom)
  const folioDetails = useAtomValue(folioDetailsAtom)
  const slippage = useAtomValue(slippageAtom)
  const mintShares = useAtomValue(mintSharesAtom)
  const [mintAmount, setMintAmount] = useAtom(mintAmountAtom)
  const [selected, setSelected] = useAtom(selectedCollateralsAtom)
  const [customAmounts, setCustomAmounts] = useAtom(customCollateralAmountsAtom)
  const [selectionInitialized, setSelectionInitialized] = useAtom(
    collateralSelectionInitializedAtom
  )
  const [showConstraintInfo, setShowConstraintInfo] = useState(false)
  const [useWalletCollateral, setUseWalletCollateral] = useAtom(
    useWalletCollateralAtom
  )
  const [isMaxAmountMode, setIsMaxAmountMode] = useState(false)
  const [maxChangeStatus, setMaxChangeStatus] =
    useState<MaxChangeStatus | null>(null)
  const [operation, setOperation] = useState<AsyncOperation>('mint')

  const { data: basketBalanceData, isLoading: isBasketBalanceLoading } =
    useERC20Balances(
      (basket || []).map((token) => ({
        address: token.address,
        chainId,
      }))
    )

  const inputBalance = balances[inputToken.address]
  const inputBalanceValue = inputBalance?.value ?? 0n
  const inputBalanceAmount = inputBalance
    ? Number(formatUnits(inputBalanceValue, inputToken.decimals))
    : 0

  const decimalsMap = useMemo(() => {
    const map: Record<Address, number> = {}
    if (basket) {
      for (const token of basket) {
        map[token.address.toLowerCase() as Address] = token.decimals
      }
    }
    return map
  }, [basket])

  const heldCollateralTokens = useMemo(() => {
    if (!basket) return []

    return basket.filter((token) => {
      if (token.address.toLowerCase() === inputToken.address.toLowerCase()) {
        return false
      }

      const tokenIndex = basket.findIndex(
        (item) => item.address.toLowerCase() === token.address.toLowerCase()
      )
      const balance =
        (basketBalanceData as bigint[] | undefined)?.[tokenIndex] ?? 0n
      const normalized = token.address.toLowerCase() as Address
      const price = tokenPrices[normalized] ?? basketPrices[normalized] ?? 0
      const balanceUsd = Number(formatUnits(balance, token.decimals)) * price

      return balanceUsd >= COLLATERAL_DUST_USD_THRESHOLD
    })
  }, [basket, basketBalanceData, basketPrices, inputToken.address, tokenPrices])

  const basketWalletBalances = useMemo(() => {
    const result: Record<Address, bigint> = {}
    if (!basket || !basketBalanceData) return result

    basket.forEach((token, index) => {
      result[token.address.toLowerCase() as Address] =
        (basketBalanceData as bigint[])?.[index] ?? 0n
    })

    return result
  }, [basket, basketBalanceData])

  const tokenPricesForMax = useMemo(() => {
    const result: Record<Address, number> = {}
    if (!basket) return result

    for (const token of basket) {
      const normalized = token.address.toLowerCase() as Address
      result[normalized] =
        tokenPrices[normalized] ?? basketPrices[normalized] ?? 0
    }

    return result
  }, [basket, basketPrices, tokenPrices])

  useEffect(() => {
    if (!basket || !basketBalanceData || selectionInitialized) return

    setSelected(new Set<Address>())
    setSelectionInitialized(true)
  }, [
    basket,
    basketBalanceData,
    selectionInitialized,
    setSelected,
    setSelectionInitialized,
  ])

  useEffect(() => {
    if (useWalletCollateral) return

    setSelected(new Set<Address>())
    setCustomAmounts({})
    setStrategy('single')
  }, [setCustomAmounts, setSelected, setStrategy, useWalletCollateral])

  useEffect(() => {
    setStrategy(useWalletCollateral && selected.size > 0 ? 'partial' : 'single')
  }, [selected.size, setStrategy, useWalletCollateral])

  const parsedAmount = Number(mintAmount) || 0
  const folioReferenceAmount =
    folioDetails && dtfPrice
      ? Number(formatUnits(folioDetails.shares, 18)) * dtfPrice
      : parsedAmount
  const customCollateralAmounts = useMemo(() => {
    const result: Record<Address, bigint> = {}
    for (const [address, value] of Object.entries(customAmounts)) {
      const normalized = address.toLowerCase() as Address
      if (!value) continue
      result[normalized] = safeParseEther(value, decimalsMap[normalized] ?? 18)
    }
    return result
  }, [customAmounts, decimalsMap])
  const activeSelectedCollaterals = useMemo(
    () => (useWalletCollateral ? selected : new Set<Address>()),
    [selected, useWalletCollateral]
  )
  const activeCustomCollateralAmounts = useMemo(
    () => (useWalletCollateral ? customCollateralAmounts : {}),
    [customCollateralAmounts, useWalletCollateral]
  )
  const heldCollateralSelection = useMemo(
    () =>
      new Set<Address>(
        heldCollateralTokens.map(
          (token) => token.address.toLowerCase() as Address
        )
      ),
    [heldCollateralTokens]
  )
  const maxMintAmount = useMemo(
    () =>
      calculateMaxMintAmount({
        inputTokenBalance: inputBalanceAmount,
        walletBalances: basketWalletBalances,
        tokenPrices: tokenPricesForMax,
        tokenDecimals: decimalsMap,
        selectedCollaterals: activeSelectedCollaterals,
        customCollateralAmounts: activeCustomCollateralAmounts,
        strategy:
          useWalletCollateral && activeSelectedCollaterals.size > 0
            ? 'partial'
            : 'single',
        inputTokenAddress: inputToken.address as Address,
        assets: folioDetails?.assets,
        mintValues: folioDetails?.mintValues,
        referenceAmount: folioReferenceAmount,
      }),
    [
      inputBalanceAmount,
      basketWalletBalances,
      tokenPricesForMax,
      decimalsMap,
      activeSelectedCollaterals,
      activeCustomCollateralAmounts,
      useWalletCollateral,
      inputToken.address,
      folioDetails,
      folioReferenceAmount,
    ]
  )

  const allocation = useMemo(() => {
    if (!folioDetails || mintShares === 0n) return {}
    const mintValues =
      folioDetails.shares === mintShares
        ? folioDetails.mintValues
        : folioDetails.mintValues.map(
            (value) => (value * mintShares) / folioDetails.shares
          )

    return calculateCollateralAllocation({
      mintShares,
      assets: folioDetails.assets,
      mintValues,
      balances: basketWalletBalances,
      prices: tokenPricesForMax,
      decimals: decimalsMap,
      selectedCollaterals: activeSelectedCollaterals,
      customCollateralAmounts: activeCustomCollateralAmounts,
      strategy:
        useWalletCollateral && activeSelectedCollaterals.size > 0
          ? 'partial'
          : 'single',
      inputToken,
    })
  }, [
    folioDetails,
    mintShares,
    basketWalletBalances,
    tokenPricesForMax,
    decimalsMap,
    activeSelectedCollaterals,
    activeCustomCollateralAmounts,
    useWalletCollateral,
    inputToken,
  ])

  const walletCollateralPreview = useMemo(() => {
    if (!folioDetails || heldCollateralSelection.size === 0) {
      return { maxUsableUsd: 0, inputReductionUsd: 0 }
    }

    const getMintValuesForShares = (shares: bigint) => {
      if (shares === 0n) return undefined
      return folioDetails.shares === shares
        ? folioDetails.mintValues
        : folioDetails.mintValues.map(
            (value) => (value * shares) / folioDetails.shares
          )
    }

    const getUsableUsdForShares = (shares: bigint) => {
      const mintValues = getMintValuesForShares(shares)
      if (!mintValues) return 0

      return heldCollateralTokens.reduce((sum, token) => {
        const normalized = token.address.toLowerCase() as Address
        const assetIndex = folioDetails.assets.findIndex(
          (asset) => asset.toLowerCase() === normalized
        )
        if (assetIndex === -1) return sum

        const balance = basketWalletBalances[normalized] ?? 0n
        const requiredAmount = mintValues[assetIndex] ?? 0n
        const usableAmount = balance < requiredAmount ? balance : requiredAmount
        const price = tokenPricesForMax[normalized] ?? 0

        return sum + Number(formatUnits(usableAmount, token.decimals)) * price
      }, 0)
    }

    if (parsedAmount > 0 && mintShares > 0n) {
      const mintValues = getMintValuesForShares(mintShares)
      if (!mintValues) return { maxUsableUsd: 0, inputReductionUsd: 0 }

      const singleAllocation = calculateCollateralAllocation({
        mintShares,
        assets: folioDetails.assets,
        mintValues,
        balances: basketWalletBalances,
        prices: tokenPricesForMax,
        decimals: decimalsMap,
        selectedCollaterals: new Set<Address>(),
        customCollateralAmounts: {},
        strategy: 'single',
        inputToken,
      })
      const withWalletAllocation = calculateCollateralAllocation({
        mintShares,
        assets: folioDetails.assets,
        mintValues,
        balances: basketWalletBalances,
        prices: tokenPricesForMax,
        decimals: decimalsMap,
        selectedCollaterals: heldCollateralSelection,
        customCollateralAmounts: {},
        strategy: 'partial',
        inputToken,
      })

      const singleSwapUsd = Object.values(singleAllocation).reduce(
        (sum, item) => sum + item.usdValue,
        0
      )
      const withWalletSwapUsd = Object.values(withWalletAllocation).reduce(
        (sum, item) => sum + item.usdValue,
        0
      )
      const inputReductionUsd = Math.max(singleSwapUsd - withWalletSwapUsd, 0)

      return {
        maxUsableUsd: getUsableUsdForShares(mintShares),
        inputReductionUsd,
      }
    }

    const previewMaxMintAmount = calculateMaxMintAmount({
      inputTokenBalance: inputBalanceAmount,
      walletBalances: basketWalletBalances,
      tokenPrices: tokenPricesForMax,
      tokenDecimals: decimalsMap,
      selectedCollaterals: heldCollateralSelection,
      customCollateralAmounts: {},
      strategy: 'partial',
      inputTokenAddress: inputToken.address as Address,
      assets: folioDetails.assets,
      mintValues: folioDetails.mintValues,
      referenceAmount: folioReferenceAmount,
    })
    const previewMintShares = calculateMintSharesForUsd(
      previewMaxMintAmount,
      dtfPrice
    )

    return {
      maxUsableUsd: getUsableUsdForShares(previewMintShares),
      inputReductionUsd: 0,
    }
  }, [
    basketWalletBalances,
    decimalsMap,
    dtfPrice,
    folioDetails,
    folioReferenceAmount,
    heldCollateralSelection,
    heldCollateralTokens,
    inputBalanceAmount,
    inputToken,
    mintShares,
    parsedAmount,
    tokenPricesForMax,
  ])

  const exceedsBalance = parsedAmount > maxMintAmount
  const isValidAmount = parsedAmount >= 1
  const totalSwapUsd = useMemo(
    () =>
      Object.values(allocation).reduce((sum, item) => sum + item.usdValue, 0),
    [allocation]
  )
  const walletCollateralUsd = useMemo(
    () =>
      Object.entries(allocation).reduce((sum, [address, alloc]) => {
        if (alloc.fromWallet === 0n) return sum
        const token = basket?.find(
          (item) => item.address.toLowerCase() === address.toLowerCase()
        )
        if (!token) return sum
        const price = tokenPricesForMax[address.toLowerCase() as Address] ?? 0
        return (
          sum + Number(formatUnits(alloc.fromWallet, token.decimals)) * price
        )
      }, 0),
    [allocation, basket, tokenPricesForMax]
  )
  const inputUsedUsd = Math.max(parsedAmount - walletCollateralUsd, 0)
  const inputShortfall = Math.max(inputUsedUsd - inputBalanceAmount, 0)
  const hasInputShortfall = inputShortfall >= MIN_DISPLAYABLE_USD_SHORTFALL
  const showMaxExceeded = exceedsBalance && !isMaxAmountMode
  const showInputShortfall =
    hasInputShortfall && !isMaxAmountMode && !showMaxExceeded
  const showAmountError = showInputShortfall || showMaxExceeded
  const canUpdateToLatestMax =
    showInputShortfall && maxMintAmount > 0 && parsedAmount > maxMintAmount
  const isTotalUsdInputMode = useWalletCollateral
  const inputSourceTokens = useMemo(() => {
    if (!isTotalUsdInputMode || !basket) return [inputToken]

    const walletSources = basket.filter((token) => {
      const normalized = token.address.toLowerCase() as Address
      const alloc = allocation[token.address] ?? allocation[normalized]

      return selected.has(normalized) || (alloc?.fromWallet ?? 0n) > 0n
    })

    return [inputToken, ...walletSources]
  }, [allocation, basket, inputToken, isTotalUsdInputMode, selected])
  const visibleInputSourceTokens = inputSourceTokens.slice(0, 3)
  const hiddenInputSourceTokenCount = Math.max(inputSourceTokens.length - 3, 0)
  const slippagePct = Number(slippage) / 10000
  const bufferReturn = inputUsedUsd * (ASYNC_MINT_BUFFER + slippagePct)
  const dtfAmount = dtfPrice
    ? (parsedAmount / dtfPrice) * (1 - ASYNC_MINT_BUFFER)
    : 0
  const dtfValue = dtfPrice ? dtfAmount * dtfPrice : 0
  const spreadPct =
    parsedAmount > 0 ? ((parsedAmount - dtfValue) / parsedAmount) * 100 : 0
  const mintFee = indexDTF?.mintingFee
    ? (indexDTF.mintingFee * 100).toFixed(2)
    : '0'

  const hasWrappedNativeBasketToken = basket?.some((token) =>
    WRAPPED_NATIVE_SYMBOLS.has(token.symbol.toUpperCase())
  )
  const nativeBalance = balances[NATIVE_TOKEN_ADDRESS]?.value ?? 0n
  const similarHeld = hasWrappedNativeBasketToken && nativeBalance > 0n
  const similarTokens = similarHeld ? ['ETH'] : []
  const requiredWrapped = hasWrappedNativeBasketToken
    ? basket
        ?.filter((token) =>
          WRAPPED_NATIVE_SYMBOLS.has(token.symbol.toUpperCase())
        )
        .map((token) => token.symbol)
    : []
  const collateralPreviewTokens = heldCollateralTokens.slice(0, 4)
  const hiddenCollateralPreviewCount = Math.max(
    heldCollateralTokens.length - collateralPreviewTokens.length,
    0
  )

  useEffect(() => {
    if (!isMaxAmountMode || maxMintAmount <= 0) return

    const nextAmount = formatMaxMintInputAmount(maxMintAmount)
    if (mintAmount !== nextAmount) {
      setMintAmount(nextAmount)
    }
  }, [isMaxAmountMode, maxMintAmount, mintAmount, setMintAmount])

  useEffect(() => {
    if (!maxChangeStatus) return

    const timeout = window.setTimeout(() => setMaxChangeStatus(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [maxChangeStatus])

  const handleMintAmountChange = (value: string) => {
    setIsMaxAmountMode(false)
    setMaxChangeStatus(null)
    setMintAmount(value)
  }

  const handleMax = () => {
    setIsMaxAmountMode(true)
    setMintAmount(formatMaxMintInputAmount(maxMintAmount))
  }

  const handleUpdateToLatestMax = () => {
    setIsMaxAmountMode(true)
    setMintAmount(formatMaxMintInputAmount(maxMintAmount))
  }

  const getCollateralMaxUsableUsd = (
    token: (typeof heldCollateralTokens)[number]
  ) => {
    return getCollateralPreview(token).maxUsableUsd
  }

  const getCollateralPreview = (
    token: (typeof heldCollateralTokens)[number],
    enabled = true
  ) => {
    const normalized = token.address.toLowerCase() as Address
    const previewSelected = new Set(activeSelectedCollaterals)

    if (enabled) previewSelected.add(normalized)
    else previewSelected.delete(normalized)

    const previewMaxMintAmount =
      isMaxAmountMode && folioDetails
        ? calculateMaxMintAmount({
            inputTokenBalance: inputBalanceAmount,
            walletBalances: basketWalletBalances,
            tokenPrices: tokenPricesForMax,
            tokenDecimals: decimalsMap,
            selectedCollaterals: previewSelected,
            customCollateralAmounts: activeCustomCollateralAmounts,
            strategy: previewSelected.size > 0 ? 'partial' : 'single',
            inputTokenAddress: inputToken.address as Address,
            assets: folioDetails.assets,
            mintValues: folioDetails.mintValues,
            referenceAmount: folioReferenceAmount,
          })
        : parsedAmount
    const previewMintShares =
      isMaxAmountMode && folioDetails
        ? calculateMintSharesForUsd(previewMaxMintAmount, dtfPrice)
        : mintShares
    const previewMintValues =
      folioDetails && previewMintShares > 0n
        ? folioDetails.shares === previewMintShares
          ? folioDetails.mintValues
          : folioDetails.mintValues.map(
              (value) => (value * previewMintShares) / folioDetails.shares
            )
        : undefined
    const tokenIndex = folioDetails?.assets.findIndex(
      (asset) => asset.toLowerCase() === normalized
    )
    const balance = basketWalletBalances[normalized] ?? 0n
    const requiredAmount =
      tokenIndex !== undefined && tokenIndex >= 0 && previewMintValues
        ? (previewMintValues[tokenIndex] ?? 0n)
        : 0n
    const maxUsableAmount = balance < requiredAmount ? balance : requiredAmount

    return {
      maxUsableAmount,
      maxUsableUsd:
        Number(formatUnits(maxUsableAmount, token.decimals)) *
        (tokenPricesForMax[normalized] ?? 0),
    }
  }

  const showMaxInputChange = (
    direction: MaxChangeStatus['direction'],
    value: number,
    label: string
  ) => {
    if (!isMaxAmountMode || value <= 0) return

    setMaxChangeStatus({
      direction,
      label: `${direction === 'up' ? '+' : '-'}$${formatCurrency(value)} ${label}`,
    })
  }

  const handleWalletCollateralToggle = (enabled: boolean) => {
    setUseWalletCollateral(enabled)

    if (enabled) {
      const addedUsd = heldCollateralTokens.reduce(
        (sum, token) => sum + getCollateralMaxUsableUsd(token),
        0
      )
      showMaxInputChange('up', addedUsd, 'collateral')
      setSelected(
        new Set(
          heldCollateralTokens.map(
            (token) => token.address.toLowerCase() as Address
          )
        )
      )
      return
    }

    const removedUsd = heldCollateralTokens.reduce(
      (sum, token) => sum + getCollateralMaxUsableUsd(token),
      0
    )
    showMaxInputChange('down', removedUsd, 'collateral')
    setSelected(new Set<Address>())
    setCustomAmounts({})
  }

  const setCollateralEnabled = (
    address: Address,
    enabled: boolean,
    change?: { symbol: string; value: number }
  ) => {
    const normalized = address.toLowerCase() as Address
    if (change) {
      showMaxInputChange(enabled ? 'up' : 'down', change.value, change.symbol)
    }

    setSelected((prev) => {
      const next = new Set(prev)
      if (enabled) next.add(normalized)
      else next.delete(normalized)
      return next
    })
    if (!enabled) {
      setCustomAmounts((prev) => {
        const next = { ...prev }
        delete next[normalized]
        return next
      })
    }
  }

  const clearCustomAmount = (address: Address) => {
    const normalized = address.toLowerCase() as Address
    setCustomAmounts((prev) => {
      const next = { ...prev }
      delete next[normalized]
      return next
    })
  }

  const setCustomAmount = (address: Address, value: string) => {
    const normalized = address.toLowerCase() as Address
    setCustomAmounts((prev) => ({ ...prev, [normalized]: value }))
    setSelected((prev) => new Set(prev).add(normalized))
  }

  const handleContinue = () => {
    if (!useWalletCollateral) {
      setSelected(new Set<Address>())
      setCustomAmounts({})
      setStrategy('single')
    } else {
      setStrategy(selected.size > 0 ? 'partial' : 'single')
    }
    setStep('quote-summary')
  }

  const renderCollateralRow = (
    token: (typeof heldCollateralTokens)[number]
  ) => {
    const normalized = token.address.toLowerCase() as Address
    const balance = basketWalletBalances[normalized] ?? 0n
    const alloc = allocation[token.address] ?? allocation[normalized]
    const usedAmount = alloc?.fromWallet ?? 0n
    const requiredAmount = alloc ? alloc.fromWallet + alloc.fromSwap : 0n
    const checked = selected.has(normalized) || selected.has(token.address)
    const preview = checked
      ? {
          maxUsableAmount: balance < requiredAmount ? balance : requiredAmount,
          maxUsableUsd: getCollateralMaxUsableUsd(token),
        }
      : getCollateralPreview(token, true)
    const maxUsableAmount = preview.maxUsableAmount
    const maxUsableInput = formatUnits(maxUsableAmount, token.decimals)
    const usedUsd =
      Number(formatUnits(usedAmount, token.decimals)) *
      (tokenPricesForMax[normalized] ?? 0)
    const maxUsableUsd = preview.maxUsableUsd
    const isCustom = customAmounts[normalized] !== undefined
    const customInputValue = customAmounts[normalized] ?? ''
    const customAmountExceedsMax =
      isCustom &&
      customInputValue !== '' &&
      safeParseEther(customInputValue, token.decimals) > maxUsableAmount
    const status = isCustom
      ? ''
      : getStatusLabel(alloc?.explanation, usedAmount)
    const usedAmountText = `${formatTokenBalance(usedAmount, token.decimals)} ${token.symbol}`
    const walletBalanceText = `${formatTokenBalance(balance, token.decimals)} ${token.symbol}`
    const weightPct =
      parsedAmount > 0 ? Math.min((usedUsd / parsedAmount) * 100, 100) : 0
    const weightText = Number.isInteger(weightPct)
      ? weightPct.toFixed(0)
      : weightPct.toFixed(2)
    const statusTooltip =
      alloc?.explanation === 'Token at its maximum weight'
        ? `${token.symbol} is ${weightText}% of this ${indexDTF?.token.symbol}, so we can use up to $${formatCurrency(usedUsd)} (${usedAmountText}) of your ${walletBalanceText} for this mint.`
        : alloc?.explanation === 'Using your full balance'
          ? `You hold ${walletBalanceText}, which is within this token's basket weight, so we're using all of it.`
          : ''

    return (
      <div
        key={token.address}
        className={cn(
          '-mx-2 rounded-[18px] border px-4 py-3 transition-colors cursor-pointer',
          checked && isCustom && 'pb-4',
          checked
            ? 'border-primary/35 bg-primary/5 hover:border-primary/50'
            : 'border-border/70 bg-background hover:border-primary/30 hover:bg-muted/30'
        )}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          const target = event.target
          if (
            target instanceof HTMLElement &&
            target.closest('button, input, [role="checkbox"]')
          ) {
            return
          }

          setCollateralEnabled(normalized, !checked, {
            symbol: token.symbol,
            value: maxUsableUsd,
          })
        }}
        onKeyDown={(event) => {
          const target = event.target
          if (
            target instanceof HTMLElement &&
            target.closest('button, input, [role="checkbox"]')
          ) {
            return
          }

          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          setCollateralEnabled(normalized, !checked, {
            symbol: token.symbol,
            value: maxUsableUsd,
          })
        }}
      >
        <div className="flex items-center gap-4">
          <TokenLogoWithChain
            address={token.address}
            symbol={token.symbol}
            chain={chainId}
            size="xl"
          />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-base truncate">
              {token.name || token.symbol}
            </div>
            <div className="text-sm text-muted-foreground font-light truncate">
              {token.symbol} · Wallet{' '}
              {formatTokenBalance(balance, token.decimals)}
            </div>
          </div>
          <div className="text-right min-w-[156px]">
            <div className="text-base font-medium">
              ${formatCurrency(checked ? usedUsd : maxUsableUsd)}
            </div>
            <div className="flex h-5 items-center justify-end gap-1.5 text-sm text-muted-foreground font-light">
              {checked ? (
                <>
                  {status && <span>{status}</span>}
                  {status !== 'Using full balance' && (
                    <span>{usedAmountText}</span>
                  )}
                  {statusTooltip && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                            onClick={(event) => event.stopPropagation()}
                            aria-label={`${status} explanation`}
                          >
                            <Info size={13} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[320px]">
                          {statusTooltip}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <button
                    type="button"
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full transition-colors',
                      isCustom
                        ? 'text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    onClick={(event) => {
                      event.stopPropagation()
                      !isCustom && setCustomAmount(normalized, maxUsableInput)
                    }}
                    aria-label={`Edit ${token.symbol} amount used`}
                  >
                    <Pencil size={13} />
                  </button>
                </>
              ) : (
                <span>
                  {parsedAmount > 0
                    ? `${formatTokenBalance(maxUsableAmount, token.decimals)} ${token.symbol}`
                    : 'Set mint amount'}
                </span>
              )}
            </div>
          </div>
          <div
            className="flex items-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <Checkbox
              className="h-5 w-5 rounded-md border-muted-foreground/35 data-[state=checked]:border-primary"
              checked={checked}
              onCheckedChange={(enabled) =>
                setCollateralEnabled(normalized, enabled === true, {
                  symbol: token.symbol,
                  value: maxUsableUsd,
                })
              }
            />
          </div>
        </div>
        {checked && isCustom && (
          <div
            className="mt-3 ml-14 rounded-xl border border-border/70 bg-background px-3 py-2.5 focus-within:ring-1 focus-within:ring-ring"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <NumericalInput
                variant="transparent"
                value={customInputValue}
                onChange={(value) => setCustomAmount(normalized, value)}
                placeholder="0"
                className={cn(
                  'pl-2 text-base w-full placeholder:text-muted-foreground/50',
                  customAmountExceedsMax && 'text-destructive'
                )}
              />
              <span className="text-sm text-muted-foreground">
                {token.symbol}
              </span>
              <button
                type="button"
                className="text-sm font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5 whitespace-nowrap"
                onClick={(event) => {
                  event.stopPropagation()
                  clearCustomAmount(normalized)
                }}
              >
                Use max {formatTokenBalance(maxUsableAmount, token.decimals)}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!basket || !indexDTF) {
    return (
      <div className="grid w-full gap-0.5 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
        <Skeleton className="h-[640px] rounded-3xl" />
        <Skeleton className="h-[420px] rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full lg:min-h-[calc(100vh-100px)]">
      <div
        className={cn(
          'grid w-full gap-0.5 lg:min-h-[calc(100vh-108px)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:grid-rows-[auto_1fr] lg:items-stretch'
        )}
      >
        <div className="min-w-0 lg:contents">
          <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4 lg:col-start-1 lg:row-start-1">
            <Tabs
              value={operation}
              onValueChange={(value) => setOperation(value as AsyncOperation)}
            >
              <TabsList className="h-9 px-0.5">
                <TabsTrigger
                  value="mint"
                  className="flex items-center gap-1.5 px-3 data-[state=active]:text-primary"
                >
                  Mint
                </TabsTrigger>
                <TabsTrigger
                  value="redeem"
                  className="flex items-center gap-1.5 px-3 data-[state=active]:text-primary"
                >
                  Redeem
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {operation === 'redeem' ? (
            <div className="bg-background rounded-[20px] p-6 min-h-[420px] flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <TokenLogo
                    address={indexDTF.id}
                    symbol={indexDTF.token.symbol}
                    chain={chainId}
                    size="lg"
                  />
                  <span className="text-xl font-semibold text-primary">
                    Redeem {indexDTF.token.symbol}
                  </span>
                </div>
                <p className="text-base font-light text-muted-foreground max-w-[520px]">
                  Async redeem support is not available in this flow yet.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full h-[49px] rounded-[12px]"
                disabled
              >
                Redeem coming soon
              </Button>
            </div>
          ) : (
            <>
              <div className="min-w-0 flex flex-col gap-0.5 lg:col-start-1 lg:row-start-2 lg:h-full">
                <div className="bg-card rounded-2xl p-2">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-base">Mint Input</h3>
                      <p className="text-sm text-muted-foreground font-light">
                        {isTotalUsdInputMode
                          ? 'Enter total USD to mint. Max accounts for sources and basket weights.'
                          : `Enter the amount of ${inputToken.symbol} you want to mint with.`}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'rounded-xl border border-border/70 bg-muted px-4 py-3 focus-within:ring-1 focus-within:ring-ring',
                      showAmountError && 'rounded-b-none'
                    )}
                  >
                    <div className="text-sm text-muted-foreground mb-3">
                      You provide
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex h-8 min-w-0 items-start">
                          {isTotalUsdInputMode && mintAmount && (
                            <span
                              className={cn(
                                'text-[32px] font-light leading-8 text-muted-foreground',
                                exceedsBalance && 'text-destructive'
                              )}
                            >
                              $
                            </span>
                          )}
                          <NumericalInput
                            variant="transparent"
                            value={mintAmount}
                            onChange={handleMintAmountChange}
                            placeholder={isTotalUsdInputMode ? '$0.00' : '0.00'}
                            className={cn(
                              'h-8 w-full text-[32px] font-light leading-8 text-primary placeholder:text-muted-foreground/50',
                              exceedsBalance && 'text-destructive'
                            )}
                          />
                        </div>
                        <div className="mt-2 text-sm font-light text-muted-foreground">
                          {useWalletCollateral && walletCollateralUsd > 0
                            ? `$${formatCurrency(inputUsedUsd)} ${inputToken.symbol} + $${formatCurrency(walletCollateralUsd)} Collateral`
                            : `$${formatCurrency(parsedAmount)}`}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {isTotalUsdInputMode ? (
                          <div className="flex h-9 max-w-[260px] items-center justify-end overflow-hidden pl-4">
                            {visibleInputSourceTokens.map((token, index) => (
                              <span
                                key={token.address}
                                className={cn(
                                  'flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-background',
                                  index > 0 && '-ml-4'
                                )}
                              >
                                <TokenLogo
                                  address={token.address}
                                  symbol={token.symbol}
                                  chain={chainId}
                                  size="xl"
                                />
                              </span>
                            ))}
                            {hiddenInputSourceTokenCount > 0 && (
                              <span className="flex size-9 -ml-4 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-background text-xs font-medium">
                                +{hiddenInputSourceTokenCount}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex h-8 items-center gap-2">
                            <TokenLogo
                              address={inputToken.address}
                              symbol={inputToken.symbol}
                              chain={chainId}
                              size="xl"
                            />
                            <span className="text-[32px] font-light leading-8 text-muted-foreground">
                              {inputToken.symbol}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'flex items-center gap-1 text-sm font-light whitespace-nowrap transition-colors',
                              maxChangeStatus?.direction === 'up' &&
                                'text-primary',
                              maxChangeStatus?.direction === 'down' &&
                                'text-destructive',
                              !maxChangeStatus && 'text-muted-foreground'
                            )}
                          >
                            {maxChangeStatus ? (
                              <>
                                {maxChangeStatus.direction === 'up' ? (
                                  <ArrowUp size={13} />
                                ) : (
                                  <ArrowDown size={13} />
                                )}
                                {maxChangeStatus.label}
                              </>
                            ) : (
                              <>
                                Up to{' '}
                                {isTotalUsdInputMode
                                  ? `$${formatCurrency(maxMintAmount)}`
                                  : `${formatCurrency(maxMintAmount)} ${inputToken.symbol}`}
                              </>
                            )}
                          </span>
                          <button
                            className={cn(
                              'flex items-center gap-1 text-sm font-medium rounded-full px-2 py-0.5 transition-colors',
                              isMaxAmountMode
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-primary/10 text-primary'
                            )}
                            onClick={handleMax}
                          >
                            {isMaxAmountMode && <Check size={13} />}
                            Max
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {showInputShortfall && (
                    <div className="rounded-b-xl bg-destructive/10 text-destructive text-sm py-3 px-4 flex items-start justify-between gap-3">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">
                          Estimate moved since this amount was entered
                        </div>
                        <div className="mt-0.5 text-destructive/80">
                          Your selected collateral now leaves a $
                          {formatCurrency(inputShortfall)} {inputToken.symbol}{' '}
                          gap. Update to the latest max, add more{' '}
                          {inputToken.symbol}, or enter a smaller amount before
                          minting.
                          {ALLOW_OVERSIZED_ASYNC_MINT_QUOTES &&
                            ' Quotes are still enabled for testing.'}
                        </div>
                      </div>
                      {canUpdateToLatestMax && (
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          className="shrink-0 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={handleUpdateToLatestMax}
                        >
                          Update max
                        </Button>
                      )}
                    </div>
                  )}

                  {showMaxExceeded && (
                    <div className="rounded-b-xl bg-destructive/10 text-destructive text-sm py-3 px-4 flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">
                          Amount is above your current max
                        </div>
                        {ALLOW_OVERSIZED_ASYNC_MINT_QUOTES && (
                          <div className="mt-0.5 text-destructive/80">
                            You can still get a quote for testing, but will need
                            enough {inputToken.symbol} before minting.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-2xl p-2 flex flex-col gap-5 lg:flex-1">
                  <div className="rounded-xl border border-border/70 bg-transparent px-4 py-3">
                    <div className="text-sm text-muted-foreground mb-3">
                      Estimated receive
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-[32px] font-light text-primary leading-8 cursor-help">
                                ~{formatTokenAmount(dtfAmount)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Estimated based on DTF price. Final amount
                              adjusts after fetching swap quotes.
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="text-sm text-muted-foreground font-light mt-2 whitespace-nowrap">
                          ~${formatCurrency(dtfValue)}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end">
                        <div className="flex items-center gap-2">
                          <TokenLogo
                            address={indexDTF.id}
                            symbol={indexDTF.token.symbol}
                            chain={chainId}
                            size="xl"
                          />
                          <span className="text-[32px] font-light text-muted-foreground leading-8">
                            {indexDTF.token.symbol}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 px-4 text-sm">
                    {/* Price impact intentionally omitted here — at the
                        configure step we don't have CoWSwap quotes yet, so any
                        impact number would be misleading. It's shown for real
                        in quote-summary after the iteration runs. */}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Max slippage
                      </span>
                      <span className="font-medium">
                        {(Number(slippage) / 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Minting fee</span>
                      <span className="font-medium">{mintFee}%</span>
                    </div>
                  </div>

                  {inputUsedUsd > 0 && (
                    <div className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground font-light flex gap-2">
                      <Info size={16} className="mt-0.5 shrink-0" />
                      <span>
                        A buffer only applies to the {inputToken.symbol}{' '}
                        portion. Up to ${formatCurrency(bufferReturn)} may be
                        returned.
                      </span>
                    </div>
                  )}

                  <div className="lg:mt-auto">
                    <TransactionButtonContainer chain={chainId}>
                      <Button
                        size="lg"
                        className="w-full h-[49px] rounded-[12px]"
                        disabled={
                          !isValidAmount ||
                          (!ALLOW_OVERSIZED_ASYNC_MINT_QUOTES &&
                            (exceedsBalance || showInputShortfall))
                        }
                        onClick={handleContinue}
                      >
                        <span className="font-bold">Get Quote</span>
                      </Button>
                    </TransactionButtonContainer>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-2xl p-2 lg:col-start-2 lg:row-start-2 lg:flex lg:h-full lg:flex-col">
                {useWalletCollateral ? (
                  <>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-base">Input sources</h3>
                        <p className="text-sm text-muted-foreground font-light">
                          Collateral is used first. {inputToken.symbol} covers
                          the remainder.
                        </p>
                      </div>
                    </div>

                    <ScrollArea className="h-[min(560px,calc(100vh-340px))] min-h-[300px] lg:h-auto lg:min-h-0 lg:flex-1">
                      <div className="flex flex-col gap-1 px-2">
                        <div className="grid grid-cols-[minmax(0,1fr)_156px_20px] items-center gap-4 px-2 pt-4 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          <span>Sources</span>
                          <span className="col-span-2 text-right">Amount</span>
                        </div>
                        <div className="px-2 py-3 flex items-center gap-4">
                          <TokenLogoWithChain
                            address={inputToken.address}
                            symbol={inputToken.symbol}
                            chain={chainId}
                            size="xl"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-base">
                                {inputToken.symbol}
                              </span>
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                Always included
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground font-light">
                              Wallet{' '}
                              {formatTokenBalance(
                                inputBalanceValue,
                                inputToken.decimals
                              )}
                            </span>
                          </div>
                          <div className="min-w-[192px] text-right shrink-0">
                            <div className="text-base font-medium">
                              ${formatCurrency(inputUsedUsd)}
                            </div>
                            <div className="text-sm text-muted-foreground font-light">
                              Remainder + buffer
                            </div>
                          </div>
                        </div>

                        {isBasketBalanceLoading ? (
                          <>
                            {[0, 1, 2].map((item) => (
                              <Skeleton
                                key={item}
                                className="h-[76px] rounded-[18px]"
                              />
                            ))}
                          </>
                        ) : heldCollateralTokens.length === 0 ? (
                          <div className="rounded-[18px] bg-secondary/40 p-4 text-sm text-muted-foreground font-light">
                            {similarHeld ? (
                              <span>
                                You hold similar tokens (
                                {similarTokens.join(', ')}) but this DTF
                                requires their wrapped versions (
                                {requiredWrapped?.join(', ')}).
                              </span>
                            ) : (
                              <span>
                                You don&apos;t hold any of this DTF&apos;s
                                basket tokens
                              </span>
                            )}
                          </div>
                        ) : (
                          heldCollateralTokens.map(renderCollateralRow)
                        )}
                      </div>
                    </ScrollArea>

                    <Collapsible
                      open={showConstraintInfo}
                      onOpenChange={setShowConstraintInfo}
                    >
                      <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Why can&apos;t I mint more?
                        </span>
                        {showConstraintInfo ? (
                          <Minus size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground font-light">
                        Collateral tokens can only be used up to their weight in
                        the DTF. The rest of the mint depends on your{' '}
                        {inputToken.symbol} balance.
                      </CollapsibleContent>
                    </Collapsible>
                  </>
                ) : (
                  <div className="flex h-full min-h-[360px] flex-col gap-2">
                    {!isBasketBalanceLoading &&
                      heldCollateralTokens.length > 0 && (
                        <div className="flex min-h-[320px] flex-1 flex-col rounded-2xl border border-border/70">
                          <div className="flex flex-1 items-center justify-center px-4 py-10">
                            <div className="flex max-w-[300px] flex-col items-center text-center">
                              <div className="mb-4 flex h-12 items-center justify-center">
                                {collateralPreviewTokens.map((token, index) => (
                                  <div
                                    key={token.address}
                                    className={cn(
                                      'rounded-full border-2 border-background bg-background shadow-sm',
                                      index > 0 && '-ml-2'
                                    )}
                                  >
                                    <TokenLogo
                                      address={token.address}
                                      symbol={token.symbol}
                                      chain={chainId}
                                      size="lg"
                                    />
                                  </div>
                                ))}
                                {hiddenCollateralPreviewCount > 0 && (
                                  <div className="-ml-2 flex h-10 min-w-10 items-center justify-center rounded-full border-2 border-background bg-muted px-2 text-xs font-medium text-muted-foreground">
                                    +{hiddenCollateralPreviewCount}
                                  </div>
                                )}
                              </div>
                              <div className="text-base font-medium">
                                Include wallet collateral
                              </div>
                              <p className="mt-1 text-sm font-light text-muted-foreground">
                                {parsedAmount > 0 ? (
                                  <>
                                    You can use about $
                                    {formatCurrency(
                                      walletCollateralPreview.maxUsableUsd
                                    )}{' '}
                                    from your wallet and need about $
                                    {formatCurrency(
                                      walletCollateralPreview.inputReductionUsd
                                    )}{' '}
                                    less {inputToken.symbol}.
                                  </>
                                ) : (
                                  <>
                                    You have up to $
                                    {formatCurrency(
                                      walletCollateralPreview.maxUsableUsd
                                    )}{' '}
                                    of basket assets available if you mint your
                                    max amount.
                                  </>
                                )}
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                className="mt-4 h-8 rounded-full px-4"
                                onClick={() =>
                                  handleWalletCollateralToggle(true)
                                }
                              >
                                Enable
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                    <div
                      className={cn(
                        'flex min-h-[320px] flex-1 flex-col rounded-2xl',
                        !isBasketBalanceLoading &&
                          heldCollateralTokens.length > 0 &&
                          'border border-border/70'
                      )}
                    >
                      <div className="flex flex-1 items-center justify-center px-4 py-10">
                        <div className="flex max-w-[300px] flex-col items-center text-center">
                          <div className="mb-4 flex size-12 items-center justify-center text-muted-foreground">
                            <ListChecks size={24} strokeWidth={1.5} />
                          </div>
                          <div className="text-base font-medium text-foreground">
                            Collateral orders
                          </div>
                          <p className="mt-1 text-sm font-light text-muted-foreground">
                            Orders will appear here while the mint is ongoing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigureMint
