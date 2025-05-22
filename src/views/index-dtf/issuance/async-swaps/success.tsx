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
import { formatCurrency, formatTokenAmount, shortenAddress } from '@/utils'
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
import { formatEther, formatUnits } from 'viem'
import {
  asyncSwapInputAtom,
  asyncSwapOrderIdAtom,
  asyncSwapResponseAtom,
  bufferValueAtom,
  mintTxHashAtom,
  mintValueUSDAtom,
} from './atom'

const viewTransactionsAtom = atom<boolean>(false)

const CloseButton = () => {
  const setMintTxHash = useSetAtom(mintTxHashAtom)
  const setAsyncSwapResponse = useSetAtom(asyncSwapResponseAtom)
  const setAsyncSwapOrderId = useSetAtom(asyncSwapOrderIdAtom)
  const setAsyncSwapInput = useSetAtom(asyncSwapInputAtom)

  const handleClose = () => {
    setMintTxHash(undefined)
    setAsyncSwapResponse(undefined)
    setAsyncSwapOrderId(undefined)
    setAsyncSwapInput('')
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
            tokens={(basket || []).slice(0, 5)}
            size={16}
            overlap={4}
            reverseStack
          />
          <span className="font-light">All Txs</span>
          <ChevronRight size={16} />
        </Button>
        <CloseButton />
      </div>
    </div>
  )
}

const MintedAmount = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const inputAmountUSD = useAtomValue(mintValueUSDAtom)
  const orders = useAtomValue(asyncSwapResponseAtom)

  const sharesMinted = Number(formatEther(BigInt(orders?.amountOut || 0)))
  const valueMinted = (indexDTFPrice || 0) * sharesMinted
  const priceImpact = inputAmountUSD
    ? ((valueMinted * 100) / inputAmountUSD - 100).toFixed(2)
    : 0

  return (
    <div className="p-6 min-h-[100px] rounded-3xl bg-background -mt-14 flex flex-col gap-1.5">
      <div className="text-primary">You Minted:</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-2xl">
          <div className="text-primary font-semibold">
            {formatTokenAmount(sharesMinted)}
          </div>
          <div>VTF</div>
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
        ${formatCurrency(valueMinted)}{' '}
        <span className="text-muted-foreground">({priceImpact}%)</span>
      </div>
    </div>
  )
}

const UsedAmount = () => {
  const inputAmount = useAtomValue(asyncSwapInputAtom)
  const inputAmountUSD = useAtomValue(mintValueUSDAtom)

  return (
    <div className="p-6 min-h-[100px] rounded-3xl bg-background flex flex-col gap-2">
      <div className="text-primary">You Used:</div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-2xl">
          <div className="text-primary font-semibold">
            {formatCurrency(inputAmountUSD)}
          </div>
          <div>USDC</div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground line-through text-base">
            {formatCurrency(Number(inputAmount))} USDC
          </span>
          <TokenLogo symbol={'USDC'} size="xl" className="rounded-full" />
        </div>
      </div>
      <div>
        ${formatCurrency(inputAmountUSD)}{' '}
        <span className="text-muted-foreground line-through">
          ${formatCurrency(Number(inputAmount))}
        </span>
      </div>
      <BufferInfo />
    </div>
  )
}

const BufferInfo = () => {
  const buffer = useAtomValue(bufferValueAtom)

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
        {formatCurrency(buffer)}
      </div>
    </div>
  )
}

const Transactions = () => {
  const setViewTransactions = useSetAtom(viewTransactionsAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFBasket = useAtomValue(indexDTFBasketAtom)
  const mintTxHash = useAtomValue(mintTxHashAtom)
  const orders = useAtomValue(asyncSwapResponseAtom)

  const { cowswapOrders = [] } = orders || {}

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
        <div className="flex items-center justify-between gap-2 bg-background rounded-3xl p-4">
          <div className="flex items-center gap-2">
            <TokenLogo
              address={indexDTF?.id}
              symbol={indexDTF?.token.symbol}
              size="xl"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {indexDTF?.token.symbol} Minted
              </span>
              <div className="text-sm text-muted-foreground">
                {shortenAddress(indexDTF?.id || '')}
              </div>
            </div>
          </div>
          <div className="text-sm font-light flex items-center gap-1 text-primary">
            <div className="flex items-center justify-center p-1.5 bg-muted dark:bg-white/5 rounded-full text-gray-700">
              <Copy value={mintTxHash || ''} />
            </div>
            <Link
              to={getExplorerLink(
                mintTxHash || '',
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
        <div className="flex flex-col gap-1 bg-background rounded-3xl px-4 py-2">
          {cowswapOrders.map(({ orderId, ...quote }) => (
            <div
              className="flex items-center justify-between gap-2 border-b border-border py-4 last:border-b-0"
              key={quote.buyToken}
            >
              <div className="flex items-center gap-2">
                <TokenLogo
                  address={quote.buyToken}
                  symbol={
                    indexDTFBasket?.find(
                      (token) => token.address === quote.buyToken
                    )?.symbol || ''
                  }
                  size="xl"
                />
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">
                    -
                    {formatCurrency(
                      Number(formatUnits(BigInt(quote.sellAmount), 6))
                    )}{' '}
                    USDC
                  </div>
                  <div className="text-sm text-primary">
                    +
                    {formatTokenAmount(
                      Number(
                        formatUnits(
                          BigInt(quote.buyAmount),
                          indexDTFBasket?.find(
                            (token) => token.address === quote.buyToken
                          )?.decimals || 18
                        )
                      )
                    )}{' '}
                    {indexDTFBasket?.find(
                      (token) => token.address === quote.buyToken
                    )?.symbol || ''}
                  </div>
                </div>
              </div>
              <div className="text-sm font-light flex items-center gap-2 text-primary">
                <Check size={16} className="text-primary" />
                Order Filled
                <Link
                  to={`https://explorer.cow.fi/base/orders/${orderId}`}
                  target="_blank"
                  className="p-1 bg-muted dark:bg-white/5 rounded-full text-gray-700 ml-1"
                >
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
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
          <MintedAmount />
          <UsedAmount />
        </div>
      </div>
    </div>
  )
}

export default Success
