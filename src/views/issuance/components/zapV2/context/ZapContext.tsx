import { useChainlinkPrice } from 'hooks/useChainlinkPrice'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
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
import useSWR from 'swr'
import { formatCurrency } from 'utils'
import { ChainId } from 'utils/chains'
import {
  Address,
  formatEther,
  formatUnits,
  parseUnits,
  zeroAddress,
} from 'viem'
import { useFeeData } from 'wagmi'
import { ZapErrorType } from '../ZapError'
import zapper, { ZapResponse, ZapResult, fetcher } from '../api'
import { SLIPPAGE_OPTIONS, zappableTokens } from '../constants'

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
  slippage: bigint
  setSlippage: (slippage: bigint) => void
  amountIn: string
  setAmountIn: (amount: string) => void
  selectedToken?: ZapToken
  setSelectedToken: (token: ZapToken) => void

  tokens: ZapToken[]
  chainId: number
  account?: Address
  onClickMax: () => void
  loadingZap: boolean
  error?: ZapErrorType
  tokenIn: ZapToken
  tokenOut: ZapToken

  amountOut?: string
  zapDustUSD?: number
  gasCost?: number
  priceImpact?: number
  spender?: Address
  zapResult?: ZapResult
}

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
  slippage: SLIPPAGE_OPTIONS[0],
  setSlippage: () => {},
  amountIn: '',
  setAmountIn: () => {},
  setSelectedToken: () => {},
  onClickMax: () => {},
  loadingZap: false,
  chainId: 0,
  tokens: [],
  tokenIn: zappableTokens[ChainId.Mainnet][0],
  tokenOut: zappableTokens[ChainId.Mainnet][0],
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
  const [slippage, setSlippage] = useState<bigint>(SLIPPAGE_OPTIONS[0])
  const [amountIn, _setAmountIn] = useState<string>('')
  const [selectedToken, setSelectedToken] = useState<ZapToken>()
  const [error, setError] = useState<ZapErrorType>()

  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom) || undefined
  const ethPrice = useAtomValue(ethPriceAtom)
  const rTokenData = useAtomValue(rTokenAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const rTokenBalance = useAtomValue(rTokenBalanceAtom)
  const balances = useAtomValue(balancesAtom)
  const { issuanceAvailable, redemptionAvailable } =
    useAtomValue(rTokenStateAtom)

  const { data: gas } = useFeeData()

  const tokens: ZapToken[] = useMemo(
    () =>
      zappableTokens[chainId].map((token) => ({
        ...token,
        balance: balances[token.address as Address]?.balance ?? '0',
      })),
    [chainId, balances]
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
  }, [tokens])

  useEffect(() => {
    setAmountIn('')
    setOpenTokenSelector(false)
  }, [setAmountIn, selectedToken, operation, zapEnabled])

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

    setAmountIn(Math.min(maxTokenIn, +(tokenIn.balance ?? '0')).toString())

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
    tokenOut.price,
    tokenIn.price,
    operation,
    issuanceAvailable,
    redemptionAvailable,
    setError,
  ])

  const endpoint = useDebounce(
    useMemo(() => {
      if (
        !account ||
        !tokenIn.address ||
        !tokenOut.address ||
        isNaN(Number(amountIn)) ||
        amountIn === '' ||
        Number(amountIn) === 0
      ) {
        return null
      }

      return zapper.zap({
        chainId,
        signer: account as Address,
        tokenIn: tokenIn.symbol === 'ETH' ? zeroAddress : tokenIn.address,
        amountIn: parseUnits(amountIn, tokenIn?.decimals).toString(),
        tokenOut: tokenOut.address,
        slippage: Number(slippage),
      })
    }, [chainId, account, tokenIn, tokenOut, amountIn, slippage]),
    500
  )

  const {
    data,
    isLoading,
    error: apiError,
  } = useSWR<ZapResponse>(endpoint, fetcher, {
    isPaused: () => openSubmitModal,
  })

  const [amountOut, zapDustUSD, gasCost, priceImpact, spender] = useMemo(() => {
    if (!data || !data.result) {
      return ['0', 0, 0, 0, undefined]
    }
    const amountOut = formatUnits(
      BigInt(data.result.amountOut),
      tokenOut.decimals
    )

    const estimatedGasCost = gas?.formatted?.gasPrice
      ? (+data.result.gas * +gas?.formatted?.gasPrice * ethPrice) / 1e9
      : 0

    return [
      amountOut,
      data.result.dustValue,
      estimatedGasCost,
      data.result.priceImpact,
      data.result.tx.to,
    ]
  }, [data, tokenOut, gas, ethPrice])

  useEffect(() => {
    if (priceImpact >= 1) {
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
    }
  }, [priceImpact, operation])

  useEffect(() => {
    if (apiError || (data && data.error)) {
      setError({
        title: 'Failed to find a route',
        message:
          (apiError?.message || data?.error || 'An unknown error occurred') +
          '. Please try again. If the problem persists, please contact support.',
        color: 'danger',
        secondaryColor: 'rgba(255, 0, 0, 0.20)',
        submitButtonTitle: 'Error occurred, try again',
      })
    }
  }, [apiError, data])

  return (
    <ZapContext.Provider
      value={{
        zapEnabled,
        setZapEnabled,
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
        tokenIn,
        tokenOut,
        error,
        amountOut,
        zapDustUSD,
        gasCost,
        priceImpact,
        spender,
        zapResult: data?.result,
      }}
    >
      {children}
    </ZapContext.Provider>
  )
}
