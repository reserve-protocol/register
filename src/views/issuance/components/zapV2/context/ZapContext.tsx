import { useChainlinkPrice } from 'hooks/useChainlinkPrice'
import useDebounce from 'hooks/useDebounce'
import { useAtomValue } from 'jotai'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  balancesAtom,
  chainIdAtom,
  ethPriceAtom,
  gasFeeAtom,
  rTokenAtom,
  rTokenBalanceAtom,
  rTokenPriceAtom,
  walletAtom,
} from 'state/atoms'
import useSWR from 'swr'
import { ChainId } from 'utils/chains'
import { Address, formatEther, parseUnits, zeroAddress } from 'viem'
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
  maxAmountIn: string
  loadingZap: boolean
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
  maxAmountIn: '0',
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
  const [operation, setOperation] = useState<IssuanceOperation>('mint')
  const [openSettings, setOpenSettings] = useState<boolean>(false)
  const [openTokenSelector, setOpenTokenSelector] = useState<boolean>(false)
  const [openSubmitModal, setOpenSubmitModal] = useState<boolean>(false)
  const [collectDust, setCollectDust] = useState<boolean>(true)
  const [slippage, setSlippage] = useState<bigint>(SLIPPAGE_OPTIONS[0])
  const [amountIn, setAmountIn] = useState<string>('')
  const [selectedToken, setSelectedToken] = useState<ZapToken>()

  const chainId = useAtomValue(chainIdAtom)
  const account = useAtomValue(walletAtom) || undefined
  const fee = useAtomValue(gasFeeAtom)
  const ethPrice = useAtomValue(ethPriceAtom)
  const rTokenData = useAtomValue(rTokenAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const rTokenBalance = useAtomValue(rTokenBalanceAtom)
  const balances = useAtomValue(balancesAtom)

  const tokens: ZapToken[] = useMemo(
    () =>
      zappableTokens[chainId].map((token) => ({
        ...token,
        balance: balances[token.address as Address]?.balance ?? '0',
      })),
    [chainId]
  )
  const tokenPrice = useChainlinkPrice(
    chainId,
    selectedToken?.address as Address
  )

  useEffect(() => {
    if (!selectedToken) setSelectedToken(tokens[0])
  }, [tokens])

  useEffect(() => {
    setAmountIn('')
  }, [setAmountIn, selectedToken, operation])

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
      balance: selectedToken?.balance,
    }),
    [selectedToken, tokenPrice]
  )

  const [tokenIn, tokenOut] = useMemo(
    () => (operation === 'mint' ? [token, rToken] : [rToken, token]),
    [rToken, token, operation]
  )

  const maxAmountIn = useMemo(() => tokenIn.balance ?? '0', [tokenIn.balance])

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
    1000
  )

  const { data, isLoading, error } = useSWR<ZapResponse>(endpoint, fetcher, {
    isPaused: () => !endpoint || openSubmitModal,
  })

  const [amountOut, zapDustUSD, gasCost, priceImpact, spender] = useMemo(() => {
    if (!data || !data.result) {
      return ['0', 0, 0, 0, undefined]
    }
    const amountOut = formatEther(BigInt(data.result.amountOut))
    const estimatedGasCost = fee
      ? Number(formatEther(BigInt(data.result.gas) * fee)) * ethPrice
      : 0
    return [
      amountOut,
      data.result.dustValue,
      estimatedGasCost,
      data.result.priceImpact,
      data.result.tx.to,
    ]
  }, [data])

  return (
    <ZapContext.Provider
      value={{
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
        maxAmountIn,
        loadingZap: isLoading,
        tokenIn,
        tokenOut,
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
