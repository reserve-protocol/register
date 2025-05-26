import {
  ArrowSeparator,
  TokenInputBox,
  TokenOutputBox,
} from '@/components/ui/swap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrencyCompact } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import {
  asyncSwapResponseAtom,
  collateralAcquiredAtom,
  isMintingAtom,
  mintValueAtom,
  mintValueUSDAtom,
  selectedTokenAtom,
  selectedTokenBalanceAtom,
  userInputAtom,
} from '../atom'
import CollateralAcquisition from '../collateral-acquisition'
import { useQuotesForMint } from '../hooks/useQuote'
import SubmitMint from './submit-mint-orders'

const AsyncMint = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const [inputAmount, setInputAmount] = useAtom(userInputAtom)
  const selectedToken = useAtomValue(selectedTokenAtom)
  const selectedTokenBalance = useAtomValue(selectedTokenBalanceAtom)
  const isMinting = useAtomValue(isMintingAtom)
  const selectedTokenPrice = useChainlinkPrice(chainId, selectedToken.address)
  const inputValueUSD = (selectedTokenPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(selectedTokenBalance?.balance || '0')
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const collateralAcquired = useAtomValue(collateralAcquiredAtom)
  const orderSubmitted = !!asyncSwapResponse
  const amountOut = useAtomValue(mintValueAtom)
  const amountOutValue = useAtomValue(mintValueUSDAtom)

  const { isLoading, isFetching } = useQuotesForMint()

  const awaitingQuote = isLoading || isFetching

  if (!indexDTF) return null

  return (
    <div className="flex flex-col h-full">
      <TokenInputBox
        from={{
          price: `$${formatCurrencyCompact(inputValueUSD)}`,
          address: selectedToken.address,
          symbol: selectedToken.symbol,
          balance: `${formatCurrencyCompact(
            Number(selectedTokenBalance?.balance || '0')
          )}`,
          value: inputAmount,
          onChange: setInputAmount,
          onMax,
          disabled: orderSubmitted,
          className: cn(
            'rounded-3xl border-8 border-card',
            orderSubmitted && 'border-background bg-background'
          ),
        }}
      />
      <ArrowSeparator
        className={cn(
          'h-10 px-[8px] w-max mx-auto border-secondary border-4 -mt-[18px] -mb-[18px] z-20 text-foreground rounded-full bg-card hover:bg-card',
          orderSubmitted && 'bg-background'
        )}
      />
      <TokenOutputBox
        to={{
          address: indexDTF.id,
          symbol: indexDTF.token.symbol,
          price: amountOutValue ? (
            <span>${formatCurrencyCompact(amountOutValue)}</span>
          ) : undefined,
          value: amountOut.toString(),
          className: cn(
            'rounded-3xl border-8 border-card rounded-b-none pb-2',
            orderSubmitted && 'border-background bg-background',
            collateralAcquired && !isMinting && 'border-card bg-card'
          ),
        }}
        loading={isLoading}
      />
      <div
        className={cn(
          'flex flex-col gap-2 rounded-b-3xl p-2 pt-0',
          isMinting ? 'bg-background' : 'bg-card'
        )}
      >
        {!orderSubmitted && <SubmitMint loadingQuote={awaitingQuote} />}
        {orderSubmitted && <CollateralAcquisition />}
      </div>
    </div>
  )
}

export default AsyncMint
