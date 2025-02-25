import { useChainlinkPrice } from 'hooks/useChainlinkPrice'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import mixpanel from 'mixpanel-browser/src/loaders/loader-module-core'
import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  balancesAtom,
  chainIdAtom,
  ethPriceAtom,
  rTokenAtom,
  rTokenBalanceAtom,
  rTokenPriceAtom,
  rTokenStateAtom,
  walletAtom,
} from 'state/atoms'
import { isRTokenMintEnabled } from 'state/geolocation/atoms'
import useSWR from 'swr'
import { Link, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import { CHAIN_TAGS, REGISTER_BUGS } from 'utils/constants'
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem'
import { useFeeData } from 'wagmi'
import { ZapErrorType } from '../ZapError'
import zapper, { ZapResponse, ZapResult, fetcher } from '../api'
import {
  PRICE_IMPACT_THRESHOLD,
  SLIPPAGE_OPTIONS,
  zappableTokens,
} from '../constants'

export type IssuanceOperation = 'mint' | 'redeem'

export type ZapToken = {
  address: Address
  symbol: string
  name: string
  decimals: number
  targetUnit: string
  price?: number
  balance?: string
}

type ZapContextType = {
  zapEnabled: boolean
  setZapEnabled: (enabled: boolean) => void
  operation: IssuanceOperation
  setOperation: (operation: IssuanceOperation) => void
  openSettings: boolean
  setOpenSettings: (open: boolean) => void
  openTokenSelector: boolean
  setOpenTokenSelector: (open: boolean) => void
  openSubmitModal: boolean
  setOpenSubmitModal: (open: boolean) => void
  collectDust: boolean
  setCollectDust: (collect: boolean) => void
  onlyMint: boolean
  setOnlyMint: (onlyMint: boolean) => void
  slippage: bigint
  setSlippage: (slippage: bigint) => void
  amountIn: string
  setAmountIn: (amount: string) => void
  selectedToken?: ZapToken
  setSelectedToken: (token: ZapToken) => void
  endpoint?: string | null
  resetZap: () => void

  tokens: ZapToken[]
  chainId: number
  account?: Address
  onClickMax: () => void
  loadingZap: boolean
  validatingZap: boolean
  error?: ZapErrorType
  tokenIn: ZapToken
  tokenOut: ZapToken

  amountOut?: string
  zapDustUSD?: number
  gasCost?: number
  priceImpact?: number
  spender?: Address
  zapResult?: ZapResult

  refreshInterval: number
  refreshQuote: () => void
  isExpensiveZap: boolean
  showEliteProgramModal: boolean
  setShowEliteProgramModal: (show: boolean) => void
}

const REFRESH_INTERVAL = 24000 // 24 seconds
const EXPENSIVE_ZAP_THRESHOLD = 25_000

const ZapContext = createContext<ZapContextType>({
  zapEnabled: true,
  setZapEnabled: () => {},
  operation: 'mint',
  setOperation: () => {},
  openSettings: false,
  setOpenSettings: () => {},
  openTokenSelector: false,
  setOpenTokenSelector: () => {},
  openSubmitModal: false,
  setOpenSubmitModal: () => {},
  collectDust: true,
  setCollectDust: () => {},
  onlyMint: false,
  setOnlyMint: () => {},
  slippage: SLIPPAGE_OPTIONS[0],
  setSlippage: () => {},
  amountIn: '',
  setAmountIn: () => {},
  setSelectedToken: () => {},
  onClickMax: () => {},
  loadingZap: false,
  validatingZap: false,
  chainId: 0,
  tokens: [],
  tokenIn: zappableTokens[ChainId.Mainnet][0],
  tokenOut: zappableTokens[ChainId.Mainnet][0],
  resetZap: () => {},
  refreshInterval: REFRESH_INTERVAL,
  refreshQuote: () => {},
  isExpensiveZap: false,
  showEliteProgramModal: false,
  setShowEliteProgramModal: () => {},
})

export const useZap = () => {
  return useContext(ZapContext)
}

export const ZapProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [zapEnabled, setZapEnabled] = useState(true)
  const [operation, setOperation] = useState<IssuanceOperation>('mint')
  const [openSettings, setOpenSettings] = useState<boolean>(false)
  const [openTokenSelector, setOpenTokenSelector] = useState<boolean>(false)
  const [openSubmitModal, setOpenSubmitModal] = useState<boolean>(false)
  const [collectDust, setCollectDust] = useState<boolean>(true)
  const [onlyMint, setOnlyMint] = useState<boolean>(false)
  const [slippage, setSlippage] = useState<bigint>(SLIPPAGE_OPTIONS[1])
  const [amountIn, _setAmountIn] = useState<string>('')
  const [selectedToken, setSelectedToken] = useState<ZapToken>()
  const [error, setError] = useState<ZapErrorType>()
  const [retries, setRetries] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom) || undefined
  const ethPrice = useAtomValue(ethPriceAtom)
  const rTokenData = useAtomValue(rTokenAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const rTokenBalance = useAtomValue(rTokenBalanceAtom)
  const balances = useAtomValue(balancesAtom)
  const { issuanceAvailable, redemptionAvailable } =
    useAtomValue(rTokenStateAtom)
  const isEnabled = useAtomValue(isRTokenMintEnabled)
  const [showEliteProgramModal, setShowEliteProgramModal] = useState(false)

  const { data: gas } = useFeeData()

  const tokens: ZapToken[] = useMemo(
    () =>
      (zappableTokens[chainId] || [])
        .map((token) => ({
          ...token,
          balance: balances[token.address as Address]?.balance ?? '0',
        }))
        .filter((token) => operation === 'mint' || token.symbol !== 'ETH'),
    [chainId, balances, operation]
  )
  const tokenPrice = useChainlinkPrice(
    chainId,
    selectedToken?.address as Address
  )

  const setAmountIn = useCallback(
    (amount: string) => {
      setError(undefined)
      _setAmountIn(amount)
    },
    [_setAmountIn]
  )

  useEffect(() => {
    if (!selectedToken) setSelectedToken(tokens[0])
    if (operation === 'redeem' && selectedToken?.symbol === 'ETH') {
      setSelectedToken(tokens[0])
    }
  }, [operation, selectedToken, tokens])

  const resetZap = useCallback(() => {
    setAmountIn('')
    setOpenTokenSelector(false)
    setShowEliteProgramModal(false)
  }, [setAmountIn, setOpenTokenSelector, setShowEliteProgramModal])

  useEffect(() => {
    resetZap()
  }, [resetZap, selectedToken, operation, zapEnabled])

  const rToken: ZapToken = useMemo(
    () => ({
      address: rTokenData?.address as Address,
      symbol: rTokenData?.symbol as string,
      name: rTokenData?.name as string,
      decimals: rTokenData?.decimals as number,
      targetUnit: rTokenData?.targetUnits as string,
      price: rTokenPrice,
      balance: rTokenBalance?.balance,
    }),
    [rTokenData, rTokenPrice, rTokenBalance]
  )

  const token = useMemo(
    () => ({
      address: selectedToken?.address as Address,
      symbol: selectedToken?.symbol as string,
      name: selectedToken?.name as string,
      decimals: selectedToken?.decimals as number,
      targetUnit: selectedToken?.targetUnit as string,
      price: tokenPrice,
      balance: balances[selectedToken?.address as Address]?.balance ?? '0',
    }),
    [selectedToken, tokenPrice, balances]
  )

  const [tokenIn, tokenOut] = useMemo(
    () => (operation === 'mint' ? [token, rToken] : [rToken, token]),
    [rToken, token, operation]
  )

  const onClickMax = useCallback(() => {
    let maxTokenIn = +(tokenIn.balance ?? '0')

    if (operation === 'mint') {
      const maxAmount = (tokenOut.price || 0) * (issuanceAvailable || 0)
      maxTokenIn = maxAmount / (tokenIn.price || 1) || maxTokenIn
    } else {
      maxTokenIn = redemptionAvailable || maxTokenIn
    }

    const newAmount =
      maxTokenIn > +(tokenIn.balance ?? '0')
        ? (tokenIn.balance ?? '0')
        : maxTokenIn.toString()

    setAmountIn(newAmount)

    if (+(tokenIn.balance ?? '0') > maxTokenIn) {
      const op = operation === 'mint' ? 'Mint' : 'Redeem'
      const max = operation === 'mint' ? issuanceAvailable : redemptionAvailable
      setError({
        title: `${op} amount above Global Max ${op}`,
        message: `Sorry, your request exceeds the Global Max ${op} limit. The Global Max ${op} is set at ${formatCurrency(
          max,
          5
        )} ${rToken?.symbol}. You can only zap a maximum of ${formatCurrency(
          maxTokenIn,
          5
        )} ${tokenIn.symbol}.`,
        color: 'warning',
        secondaryColor: 'rgba(255, 138, 0, 0.20)',
      })
    }
  }, [
    tokenIn.balance,
    tokenIn.price,
    tokenIn.symbol,
    operation,
    setAmountIn,
    tokenOut.price,
    issuanceAvailable,
    redemptionAvailable,
    rToken?.symbol,
  ])

  const endpoint = useDebounce(
    useMemo(() => {
      if (
        !account ||
        !tokenIn.address ||
        !tokenOut.address ||
        isNaN(Number(amountIn)) ||
        amountIn === '' ||
        Number(amountIn) === 0 ||
        isEnabled.loading ||
        !isEnabled.value
      ) {
        return null
      }

      return zapper.zap({
        chainId,
        tokenIn: tokenIn.symbol === 'ETH' ? zeroAddress : tokenIn.address,
        tokenOut: tokenOut.symbol === 'ETH' ? zeroAddress : tokenOut.address,
        amountIn: parseUnits(amountIn, tokenIn?.decimals).toString(),
        slippage: Number(slippage),
        signer: account as Address,
        trade: !onlyMint,
      })
    }, [chainId, account, tokenIn, tokenOut, amountIn, slippage, onlyMint]),
    500
  )

  const {
    data,
    isLoading,
    isValidating,
    error: apiError,
    mutate: refetch,
  } = useSWR<ZapResponse>(endpoint, fetcher, {
    onSuccess(data, _, __) {
      // if data.error exists, it means the zap failed.
      if (data.error && retries < 10 && !isRetrying) {
        setIsRetrying(true)
        setTimeout(() => {
          setRetries((r) => r + 1)
          refetch()
          setIsRetrying(false)
        }, 500)
      } else {
        setRetries(0)
        setIsRetrying(false)
      }
    },
    onErrorRetry: (_, __, ___, revalidate, { retryCount }) => {
      // Only retry up to 10 times.
      if (retryCount >= 10) return

      // Retry after 5 seconds.
      setTimeout(() => revalidate({ retryCount }), 500)
    },
    refreshInterval: openSubmitModal ? 0 : REFRESH_INTERVAL,
  })

  const [amountOut, priceImpact, zapDustUSD, gasCost, spender] = useMemo(() => {
    if (!data || !data.result) {
      return ['0', 0, 0, 0, undefined]
    }

    const _amountIn = formatUnits(
      BigInt(data.result.amountIn),
      tokenIn.decimals
    )

    const _amountOut = formatUnits(
      BigInt(data.result.amountOut),
      tokenOut.decimals
    )

    const estimatedGasCost = gas?.formatted?.gasPrice
      ? (+(data.result.gas ?? 0) * +gas?.formatted?.gasPrice * ethPrice) / 1e9
      : 0

    const inputPriceValue = (tokenIn?.price || 0) * Number(_amountIn) || 1
    const outputPriceValue = (tokenOut?.price || 0) * Number(_amountOut)
    const _priceImpact =
      tokenIn?.price && tokenOut?.price
        ? ((inputPriceValue -
            (outputPriceValue + (data.result.dustValue ?? 0))) /
            inputPriceValue) *
          100
        : 0

    return [
      _amountOut,
      Math.max(0, _priceImpact),
      data.result.dustValue ?? 0,
      estimatedGasCost,
      data.result.approvalAddress,
    ]
  }, [
    data,
    tokenIn.decimals,
    tokenIn?.price,
    tokenOut.decimals,
    tokenOut?.price,
    gas?.formatted?.gasPrice,
    ethPrice,
  ])

  useEffect(() => {
    if (endpoint) {
      mixpanel.track('api_request', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: 'request',
        payload: {
          operation: operation,
          rtoken: rToken.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
          amountin: amountIn,
          slippage: slippage,
          tokenin: tokenIn.symbol,
          tokenout: tokenOut.symbol,
          endpoint: endpoint,
        },
      })
    }
  }, [
    operation,
    endpoint,
    rToken,
    chainId,
    account,
    amountIn,
    slippage,
    tokenIn,
    tokenOut,
  ])

  useEffect(() => {
    if (apiError || (data && data.error)) {
      setError({
        title: 'Failed to find a route',
        message: (
          <Text>
            {(apiError?.message || data?.error || 'An unknown error occurred') +
              '. Please try again. If the problem persists, please '}{' '}
            <Link target="_blank" href={REGISTER_BUGS}>
              contact support.
            </Link>
          </Text>
        ),
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
        submitButtonTitle: 'Error occurred, try again',
        disableSubmit: true,
      })

      setOpenSubmitModal(false)

      mixpanel.track('api_error', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: apiError?.message ? 'connection_error' : 'response_error',
        payload: {
          operation: operation,
          rtoken: rToken.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
          error: apiError?.message || data?.error,
          endpoint: endpoint,
        },
      })
    } else if (data?.result && data.result.insufficientFunds) {
      setError({
        title: 'Insufficient funds',
        message:
          'You do not have enough funds to complete this transaction. Please try again with a smaller amount.',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
        disableSubmit: true,
      })
    } else if (priceImpact >= PRICE_IMPACT_THRESHOLD) {
      setError({
        title: 'Warning: High price impact',
        message:
          'The price impact of this transaction is too high. Please consider using a smaller amount or a different token.',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
        submitButtonTitle: `Zap ${
          operation === 'mint' ? 'Mint' : 'Redeem'
        } Anyway`,
      })
    } else {
      setError(undefined)
    }
  }, [
    apiError,
    data,
    operation,
    setError,
    priceImpact,
    endpoint,
    refetch,
    retries,
    setRetries,
    setOpenSubmitModal,
    isRetrying,
    setIsRetrying,
    rToken,
    chainId,
    account,
  ])

  const _setZapEnabled = useCallback(
    (value: boolean) => {
      setZapEnabled(value)
      mixpanel.track('user_action', {
        page: 'rtoken_details',
        section: 'issuance',
        product: 'zap',
        action: value ? 'toggle_to_zap' : 'toggle_to_manual',
        payload: {
          rtoken: rToken.symbol,
          chain: CHAIN_TAGS[chainId],
          user: {
            wallet: account,
          },
        },
      })
    },
    [setZapEnabled, rToken, chainId, account]
  )

  const refreshQuote = useCallback(() => {
    refetch()
    mixpanel.track('api_request', {
      page: 'rtoken_details',
      section: 'issuance',
      product: 'zap',
      action: 'refresh_quote',
      payload: {
        operation: operation,
        rtoken: rToken.symbol,
        chain: CHAIN_TAGS[chainId],
        user: {
          wallet: account,
        },
        amountin: amountIn,
        slippage: slippage,
        tokenin: tokenIn.symbol,
        tokenout: tokenOut.symbol,
        endpoint: endpoint,
      },
    })
  }, [
    refetch,
    operation,
    rToken,
    chainId,
    account,
    amountIn,
    slippage,
    tokenIn,
    tokenOut,
    endpoint,
  ])

  const isExpensiveZap = useMemo(
    () => +amountIn * (tokenIn?.price || 0) > EXPENSIVE_ZAP_THRESHOLD,
    [amountIn, tokenIn?.price]
  )

  return (
    <ZapContext.Provider
      value={{
        zapEnabled,
        setZapEnabled: _setZapEnabled,
        operation,
        setOperation,
        openSettings,
        setOpenSettings,
        openTokenSelector,
        setOpenTokenSelector,
        openSubmitModal,
        setOpenSubmitModal,
        collectDust,
        setCollectDust,
        onlyMint,
        setOnlyMint,
        slippage,
        setSlippage,
        amountIn,
        setAmountIn,
        selectedToken,
        setSelectedToken,
        chainId,
        account,
        tokens,
        onClickMax,
        loadingZap: isLoading,
        validatingZap: isValidating,
        tokenIn,
        tokenOut,
        error,
        amountOut,
        zapDustUSD,
        gasCost,
        priceImpact,
        spender,
        zapResult: data?.result,
        endpoint,
        resetZap,
        refreshQuote,
        refreshInterval: REFRESH_INTERVAL,
        isExpensiveZap,
        showEliteProgramModal,
        setShowEliteProgramModal,
      }}
    >
      {children}
    </ZapContext.Provider>
  )
}
