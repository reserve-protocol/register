import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'
import {
  ArrowSeparator,
  TokenInputBox,
  TokenOutputBox,
} from '@/components/ui/swap'
import { cn } from '@/lib/utils'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrencyCompact } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { formatEther } from 'viem'
import {
  asyncSwapResponseAtom,
  collateralAcquiredAtom,
  indexDTFBalanceAtom,
  isMintingAtom,
  redeemAssetsAtom,
  selectedTokenAtom,
  userInputAtom,
} from '../atom'
import CollateralAcquisition from '../collateral-acquisition'
import { useQuotesForRedeem } from '../hooks/useQuote'
import SubmitRedeem from './submit-redeem'
import SubmitRedeemOrders from './submit-redeem-orders'

const CustomInputBox = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const inputAmount = useAtomValue(userInputAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  if (!indexDTF) return null

  return (
    <div className="flex flex-col gap-4 p-4 rounded-3xl border-8 border-background bg-background">
      <TokenLogo
        address={indexDTF.id}
        symbol={indexDTF.token.symbol}
        size="xl"
      />
      <div className="flex flex-col gap-1">
        <span className="text-primary">You Redeemed:</span>
        <span className="text-3xl">
          <span className="text-primary font-semibold">{inputAmount} </span>
          <span>{indexDTF.token.symbol}</span>
        </span>
        <span>for {basket?.length} underlying collateral tokens</span>
      </div>
      <div className="h-[1px] w-full bg-border" />
      <div className="flex justify-start">
        <StackTokenLogo
          tokens={(basket || []).slice(0, 20)}
          size={24}
          reverseStack
        />
      </div>
    </div>
  )
}

const AsyncRedeem = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [inputAmount, setInputAmount] = useAtom(userInputAtom)
  const selectedToken = useAtomValue(selectedTokenAtom)
  const isMinting = useAtomValue(isMintingAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const inputPrice = (indexDTFPrice || 0) * Number(inputAmount)
  const indexDTFBalance = useAtomValue(indexDTFBalanceAtom)
  const indxDTFParsedBalance = formatEther(indexDTFBalance)
  const onMax = () => setInputAmount(indxDTFParsedBalance)
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const collateralAcquired = useAtomValue(collateralAcquiredAtom)
  const orderSubmitted = !!asyncSwapResponse
  const amountOut = inputPrice
  const amountOutValue = inputPrice
  const redeemAssets = useAtomValue(redeemAssetsAtom)

  const { isLoading, isFetching } = useQuotesForRedeem()

  const awaitingQuote = isLoading || isFetching

  if (!indexDTF) return null

  const assetsRedeemed = useMemo(
    () => Object.keys(redeemAssets).length > 0,
    [redeemAssets]
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col">
        {assetsRedeemed ? (
          <CustomInputBox />
        ) : (
          <TokenInputBox
            from={{
              title: 'You Redeem:',
              price: `$${formatCurrencyCompact(inputPrice)}`,
              address: indexDTF.id,
              symbol: indexDTF.token.symbol,
              balance: `${formatCurrencyCompact(Number(indxDTFParsedBalance))}`,
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
        )}
        <ArrowSeparator
          className={cn(
            'h-10 px-[8px] w-max mx-auto border-secondary border-4 -mt-[18px] -mb-[18px] z-20 text-foreground rounded-full bg-card hover:bg-card',
            orderSubmitted && 'bg-background'
          )}
        />
        <TokenOutputBox
          to={{
            title: 'Estimated Out:',
            address: selectedToken.address,
            symbol: selectedToken.symbol,
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
      </div>
      <div
        className={cn(
          'flex flex-col gap-2 rounded-b-3xl p-2 pt-0',
          isMinting ? 'bg-background' : 'bg-card'
        )}
      >
        {!assetsRedeemed && <SubmitRedeem />}
        {assetsRedeemed && !orderSubmitted && (
          <SubmitRedeemOrders loadingQuote={awaitingQuote} />
        )}
        {orderSubmitted && <CollateralAcquisition />}
      </div>
    </div>
  )
}

export default AsyncRedeem
