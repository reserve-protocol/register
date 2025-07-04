import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import { Button } from '@/components/ui/button'
import Copy from '@/components/ui/copy'
import Help from '@/components/ui/help'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import {
  formatCurrency,
  formatPercentage,
  formatTokenAmount,
  shortenAddress,
} from '@/utils'
import { ExplorerDataType, getExplorerLink } from '@/utils/getExplorerLink'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronRight,
  HandCoins,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatUnits } from 'viem'
import {
  balanceDifferenceAtom,
  cowswapOrderIdsAtom,
  cowswapOrdersAtom,
  cowswapOrdersCreatedAtAtom,
  fallbackQuotesAtom,
  mintValueAtom,
  mintValueUSDAtom,
  operationAtom,
  quotesAtom,
  redeemAssetsAtom,
  savedAmountAtom,
  selectedTokenAtom,
  successAtom,
  txHashAtom,
  universalSuccessOrdersAtom,
  userInputAtom,
} from './atom'
import CowSwapOrder from './cowswap-order'
import Details from './details'
import UniversalOrder from './universal-order'

const viewTransactionsAtom = atom<boolean>(false)

const CloseButton = () => {
  const setTxHashAtom = useSetAtom(txHashAtom)
  const setSuccess = useSetAtom(successAtom)
  const setUserInputAtom = useSetAtom(userInputAtom)
  const setRedeemAssets = useSetAtom(redeemAssetsAtom)
  const setCowswapOrderIdsAtom = useSetAtom(cowswapOrderIdsAtom)
  const setCowswapOrdersCreatedAtAtom = useSetAtom(cowswapOrdersCreatedAtAtom)
  const setCowswapOrdersAtom = useSetAtom(cowswapOrdersAtom)
  const setQuotesAtom = useSetAtom(quotesAtom)
  const setUniversalSuccessOrdersAtom = useSetAtom(universalSuccessOrdersAtom)
  const setFallbackQuotesAtom = useSetAtom(fallbackQuotesAtom)

  const handleClose = () => {
    setTxHashAtom(undefined)
    setSuccess(false)
    setUserInputAtom('')
    setRedeemAssets({})
    setQuotesAtom({})
    setCowswapOrderIdsAtom([])
    setCowswapOrdersCreatedAtAtom(undefined)
    setCowswapOrdersAtom([])
    setUniversalSuccessOrdersAtom([])
    setFallbackQuotesAtom({})
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full bg-background"
      onClick={handleClose}
    >
      <X />
    </Button>
  )
}

const SuccessHeader = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const basket = useAtomValue(indexDTFBasketAtom)
  const setViewTransactions = useSetAtom(viewTransactionsAtom)

  return (
    <div className="flex items-center justify-between">
      <Link
        to={getExplorerLink(
          indexDTF?.id || '',
          chainId,
          ExplorerDataType.TOKEN
        )}
        target="_blank"
      >
        <Button
          variant="ghost"
          size="xs"
          className="flex items-center gap-1 rounded-full bg-background h-9 pl-0.5"
          onClick={() => setViewTransactions(true)}
        >
          <div className="p-2 bg-primary rounded-full text-white">
            <Check size={16} />
          </div>
          <span className="font-light">
            {shortenAddress(indexDTF?.id || '')}
          </span>
          <ArrowUpRight size={16} className="text-muted-foreground" />
        </Button>
      </Link>
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="xs"
          className="flex items-center gap-1 rounded-full bg-background h-9"
          onClick={() => setViewTransactions(true)}
        >
          <StackTokenLogo
            tokens={(basket || []).slice(0, 5).map((token) => ({
              ...token,
              chain: indexDTF?.chainId,
            }))}
            size={16}
            overlap={4}
            reverseStack
            outsource
          />
          <span className="font-light">All Txs</span>
          <ChevronRight size={16} />
        </Button>
        <CloseButton />
      </div>
    </div>
  )
}

const DTFAmount = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const balanceDifference = useAtomValue(balanceDifferenceAtom)
  const operation = useAtomValue(operationAtom)
  const sharesRedeemed = useAtomValue(userInputAtom)
  const mintValue = useAtomValue(mintValueAtom)
  const valueMinted = (indexDTFPrice || 0) * mintValue
  const valueRedeemed = (indexDTFPrice || 0) * Number(sharesRedeemed)

  const priceImpact = balanceDifference
    ? (valueMinted * 100) / balanceDifference - 100
    : 0

  return (
    <div className="p-6 min-h-[100px] rounded-3xl bg-background -mt-14 flex flex-col gap-1.5">
      <div className="text-primary">
        {operation === 'mint' ? 'You Minted:' : 'You Redeemed:'}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-2xl">
          <div className="text-primary font-semibold">
            {operation === 'mint'
              ? formatTokenAmount(mintValue)
              : formatTokenAmount(Number(sharesRedeemed))}
          </div>
          <div>{indexDTF?.token.symbol || ''}</div>
        </div>
        <TokenLogo
          symbol={indexDTF?.token.symbol || ''}
          address={indexDTF?.id || ''}
          chain={chainId}
          size="xl"
          className="rounded-full"
        />
      </div>
      <div>
        ${formatCurrency(operation === 'mint' ? valueMinted : valueRedeemed)}{' '}
        {operation === 'mint' && (
          <span className="text-muted-foreground">
            ({formatPercentage(priceImpact)})
          </span>
        )}
      </div>
    </div>
  )
}

const USDCAmount = () => {
  const inputAmount = useAtomValue(userInputAtom)
  const operation = useAtomValue(operationAtom)
  const balanceDifference = useAtomValue(balanceDifferenceAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const valueRedeemed = (indexDTFPrice || 0) * Number(inputAmount)
  const priceImpact = valueRedeemed
    ? (balanceDifference * 100) / valueRedeemed - 100
    : 0

  return (
    <div className="p-6 min-h-[100px] rounded-3xl bg-background flex flex-col gap-2">
      <div className="text-primary">
        {operation === 'mint' ? 'You Used:' : 'You Received:'}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-2xl">
          <div className="text-primary font-semibold">
            {formatCurrency(balanceDifference)}
          </div>
          <div>USDC</div>
        </div>
        {operation === 'mint' && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground line-through text-base">
              {formatCurrency(Number(inputAmount))} USDC
            </span>
            <TokenLogo symbol={'USDC'} size="xl" className="rounded-full" />
          </div>
        )}
      </div>
      <div>
        <span>${formatCurrency(balanceDifference)}</span>
        {operation === 'mint' && (
          <span className="text-muted-foreground line-through ml-1">
            ${formatCurrency(Number(inputAmount))}
          </span>
        )}
        {operation === 'redeem' && (
          <span className="text-muted-foreground ml-1">
            ({priceImpact > 0 ? '+' : ''}
            {formatPercentage(priceImpact)})
          </span>
        )}
      </div>
      {operation === 'mint' && (
        <div>
          <BufferInfo />
          <Details />
        </div>
      )}
    </div>
  )
}

const BufferInfo = () => {
  const savedAmount = useAtomValue(savedAmountAtom)

  return (
    <div className="flex items-center gap-1 justify-between px-4 py-3 bg-muted rounded-full -mx-4 mt-2">
      <div className="flex items-center gap-1">
        <HandCoins size={16} strokeWidth={1.5} />
        <div className="pl-1">You Saved:</div>
        <Help
          content={'Buffer'}
          size={16}
          className="text-muted-foreground"
        />{' '}
      </div>
      <div className="flex items-center gap-1 text-primary">
        <TokenLogo symbol={'USDC'} size="sm" className="rounded-full" />$
        {formatCurrency(savedAmount)}
      </div>
    </div>
  )
}

const MainTransaction = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const txHash = useAtomValue(txHashAtom)
  const operation = useAtomValue(operationAtom)

  return (
    <div className="flex items-center justify-between gap-2 bg-background rounded-3xl p-4">
      <div className="flex items-center gap-2">
        <TokenLogo
          address={indexDTF?.id}
          symbol={indexDTF?.token.symbol}
          size="xl"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {operation === 'mint'
              ? `${indexDTF?.token.symbol} Minted`
              : `${indexDTF?.token.symbol} Redeemed`}
          </span>
          <div className="text-sm text-muted-foreground">
            {shortenAddress(indexDTF?.id || '')}
          </div>
        </div>
      </div>
      <div className="text-sm font-light flex items-center gap-1 text-primary">
        <div className="flex items-center justify-center p-1.5 bg-muted dark:bg-white/5 rounded-full text-gray-700">
          <Copy value={txHash || ''} />
        </div>
        <Link
          to={getExplorerLink(
            txHash || '',
            indexDTF?.chainId || 1,
            ExplorerDataType.TRANSACTION
          )}
          target="_blank"
          className="p-1 bg-muted dark:bg-white/5 rounded-full text-gray-700"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  )
}

const Transactions = () => {
  const setViewTransactions = useSetAtom(viewTransactionsAtom)
  const cowswapOrders = useAtomValue(cowswapOrdersAtom)
  const universalSuccessOrders = useAtomValue(universalSuccessOrdersAtom)

  return (
    <div className="bg-secondary rounded-3xl h-[444px] p-1">
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background"
          onClick={() => setViewTransactions(false)}
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="text-primary font-semibold text-xl">
          All Transactions
        </div>
        <CloseButton />
      </div>
      <div className="flex flex-col gap-1">
        <MainTransaction />
        <div className="flex flex-col gap-1 bg-background rounded-3xl px-4 py-2">
          {cowswapOrders.map(({ orderId }) => (
            <CowSwapOrder key={orderId} orderId={orderId} />
          ))}
          {universalSuccessOrders.map((order) => (
            <UniversalOrder key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  )
}

const Success = () => {
  const [viewTransactions, setViewTransactions] = useAtom(viewTransactionsAtom)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (viewTransactions) {
    return <Transactions />
  }

  return (
    <div className="bg-secondary rounded-3xl relative">
      {showConfetti && (
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            backgroundImage: 'url("https://storage.reserve.org/success.gif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.8,
            width: '170%',
            height: '170%',
            top: '-40%',
            left: '-35%',
            position: 'absolute',
          }}
        />
      )}
      <div className="relative z-10">
        <div className="bg-[url('https://storage.reserve.org/tree.png')] bg-cover bg-center bg-no-repeat min-h-[140px] rounded-t-3xl p-6">
          <SuccessHeader />
        </div>
        <div className="flex flex-col gap-1 p-1">
          <DTFAmount />
          <USDCAmount />
        </div>
      </div>
    </div>
  )
}

export default Success
