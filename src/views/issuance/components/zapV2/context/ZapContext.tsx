import { Token } from '@reserve-protocol/token-zapper'
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
  rTokenAtom,
  rTokenBalanceAtom,
  rTokenPriceAtom,
} from 'state/atoms'
import { zappableTokens } from '../../zap/state/zapper'

export type IssuanceOperation = 'mint' | 'redeem'

type ZapContextType = {
  operation: IssuanceOperation
  setOperation: (operation: IssuanceOperation) => void
  openSettings: boolean
  setOpenSettings: (open: boolean) => void
  openTokenSelector: boolean
  setOpenTokenSelector: (open: boolean) => void
  collectDust: boolean
  setCollectDust: (collect: boolean) => void
  slippage: bigint
  setSlippage: (slippage: bigint) => void
  amountIn: string
  setAmountIn: (amount: string) => void
  selectedToken?: Token
  setSelectedToken: (token: Token) => void
  maxAmountIn: string
  amountOut: string
  zapDustUSD: string
  loadingZap: boolean
  chainId: number
  tokens: Token[]
  rTokenSymbol?: string
  rTokenBalance?: string
  rTokenPrice?: number
}

export const SLIPPAGE_OPTIONS = [100000n, 250000n, 500000n]

const ZapContext = createContext<ZapContextType>({
  operation: 'mint',
  setOperation: () => {},
  openSettings: false,
  setOpenSettings: () => {},
  openTokenSelector: false,
  setOpenTokenSelector: () => {},
  collectDust: true,
  setCollectDust: () => {},
  slippage: SLIPPAGE_OPTIONS[0],
  setSlippage: () => {},
  amountIn: '',
  setAmountIn: () => {},
  setSelectedToken: () => {},
  maxAmountIn: '0',
  amountOut: '0',
  zapDustUSD: '0',
  loadingZap: false,
  chainId: 0,
  tokens: [],
})

export const useZap = () => {
  return useContext(ZapContext)
}

export const ZapProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [operation, setOperation] = useState<IssuanceOperation>('mint')
  const [openSettings, setOpenSettings] = useState<boolean>(false)
  const [openTokenSelector, setOpenTokenSelector] = useState<boolean>(false)
  const [collectDust, setCollectDust] = useState<boolean>(true)
  const [slippage, setSlippage] = useState<bigint>(SLIPPAGE_OPTIONS[0])
  const [amountIn, setAmountIn] = useState<string>('')
  const [selectedToken, setSelectedToken] = useState<Token>()

  const chainId = useAtomValue(chainIdAtom)
  const rToken = useAtomValue(rTokenAtom)
  const rTokenPrice = useAtomValue(rTokenPriceAtom)
  const rTokenBalance = useAtomValue(rTokenBalanceAtom)
  const balances = useAtomValue(balancesAtom)
  const tokens = useAtomValue(zappableTokens)

  useEffect(() => setSelectedToken(tokens[0]), [tokens])

  const maxAmountIn = useMemo(() => {
    const tokenAddress = selectedToken?.address?.toString()
    if (!selectedToken || !tokenAddress) {
      return '0'
    }
    const fr = balances[tokenAddress as any]?.balance ?? '0'
    return selectedToken.from(fr).format()
  }, [selectedToken, balances])

  const amountOut = useMemo(() => {
    return '0'
  }, [])

  const zapDustUSD = useMemo(() => {
    return '0'
  }, [])

  const loadingZap = useMemo(() => {
    return false
  }, [])

  return (
    <ZapContext.Provider
      value={{
        operation,
        setOperation,
        openSettings,
        setOpenSettings,
        openTokenSelector,
        setOpenTokenSelector,
        collectDust,
        setCollectDust,
        slippage,
        setSlippage,
        amountIn,
        setAmountIn,
        selectedToken,
        setSelectedToken,
        maxAmountIn,
        amountOut,
        zapDustUSD,
        loadingZap,
        chainId,
        tokens,
        rTokenSymbol: rToken?.symbol,
        rTokenBalance: rTokenBalance?.balance,
        rTokenPrice,
      }}
    >
      {children}
    </ZapContext.Provider>
  )
}
