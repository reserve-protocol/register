import Swap, {
  ArrowSeparator,
  TokenInputBox,
  TokenOutputBox,
} from '@/components/ui/swap'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import {
  indexDTFAtom,
  indexDTFBasketAtom,
  indexDTFPriceAtom,
} from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { formatEther, parseUnits } from 'viem'
import useLoadingAfterRefetch from '../../../overview/components/hooks/useLoadingAfterRefetch'
import {
  asyncSwapFetchingAtom,
  asyncSwapInputAtom,
  asyncSwapOngoingTxAtom,
  asyncSwapRefetchAtom,
  asyncSwapResponseAtom,
  bufferValueAtom,
  collateralAcquiredAtom,
  indexDTFBalanceAtom,
  isMintingAtom,
  mintValueAtom,
  mintValueUSDAtom,
  mintValueWeiAtom,
  redeemAssetsAtom,
  selectedTokenBalanceAtom,
  selectedTokenOrDefaultAtom,
  slippageAtom,
} from '../atom'
import CollateralAcquisition from '../collateral-acquisition'
import SubmitRedeem from './submit-redeem'
import TokenLogo from '@/components/token-logo'
import StackTokenLogo from '@/components/token-logo/StackTokenLogo'

const CustomInputBox = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const inputAmount = useAtomValue(asyncSwapInputAtom)
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
          <span className="text-primary font-semibold">
            {inputAmount || 10000}{' '}
          </span>
          <span>VTF</span>
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
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const [inputAmount, setInputAmount] = useAtom(asyncSwapInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const selectedTokenBalance = useAtomValue(selectedTokenBalanceAtom)
  const isMinting = useAtomValue(isMintingAtom)
  const slippage = useAtomValue(slippageAtom)
  const [ongoingTx, setOngoingTx] = useAtom(asyncSwapOngoingTxAtom)
  const setAsyncSwapRefetch = useSetAtom(asyncSwapRefetchAtom)
  const setAsyncSwapFetching = useSetAtom(asyncSwapFetchingAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const inputPrice = (indexDTFPrice || 0) * Number(inputAmount)
  const indexDTFBalance = useAtomValue(indexDTFBalanceAtom)
  const indxDTFParsedBalance = formatEther(indexDTFBalance)
  const onMax = () => setInputAmount(indxDTFParsedBalance)
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const collateralAcquired = useAtomValue(collateralAcquiredAtom)
  const orderSubmitted = !!asyncSwapResponse
  const amountOut = useAtomValue(mintValueAtom)
  const amountOutWei = useAtomValue(mintValueWeiAtom)
  const amountOutValue = useAtomValue(mintValueUSDAtom)
  const bufferValue = useAtomValue(bufferValueAtom)
  const redeemAssets = useAtomValue(redeemAssetsAtom)
  const basket = useAtomValue(indexDTFBasketAtom)

  const insufficientBalance =
    parseUnits(inputAmount, selectedToken.decimals) >
    (selectedTokenBalance?.value || 0n)

  // const { data, isLoading, isFetching, refetch, failureReason } = useAsyncSwap({
  //   dtf: indexDTF?.id,
  //   amountOut: amountOutWei.toString(),
  //   slippage: isFinite(Number(slippage)) ? Number(slippage) : 10000,
  //   disabled: insufficientBalance || ongoingTx,
  //   dtfTicker: indexDTF?.token.symbol || '',
  //   type: 'mint',
  // })

  // const { loadingAfterRefetch } = useLoadingAfterRefetch(data)

  // const valueTo = data?.result?.amountOut
  // const showTxButton = Boolean(
  //   data?.status === 'success' &&
  //     data?.result &&
  //     !insufficientBalance &&
  //     !isLoading
  // )
  // const awaitingQuote = isLoading || isFetching

  // useEffect(() => {
  //   setAsyncSwapRefetch({ fn: refetch })
  // }, [refetch, setAsyncSwapRefetch])

  // useEffect(() => {
  //   setAsyncSwapFetching(awaitingQuote)
  // }, [awaitingQuote, setAsyncSwapFetching])

  // useEffect(() => {
  //   setOngoingTx(false)
  //   setInputAmount('')
  // }, [])

  if (!indexDTF) return null

  const disableInputBox = Object.keys(redeemAssets).length > 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col">
        {disableInputBox ? (
          <CustomInputBox />
        ) : (
          <TokenInputBox
            from={{
              title: 'You Redeem:',
              price: `$${formatCurrency(inputPrice)}`,
              address: indexDTF.id,
              symbol: indexDTF.token.symbol,
              balance: `${formatCurrency(Number(indxDTFParsedBalance))}`,
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
              <span>${formatCurrency(amountOutValue)}</span>
            ) : undefined,
            value: amountOut.toString(),
            className: cn(
              'rounded-3xl border-8 border-card rounded-b-none pb-2',
              orderSubmitted && 'border-background bg-background',
              collateralAcquired && !isMinting && 'border-card bg-card'
            ),
          }}
          // loading={isLoading || loadingAfterRefetch}
        />
      </div>
      {/* {!!data && <ZapDetails data={data.result} />} */}
      <div
        className={cn(
          'flex flex-col gap-2 rounded-b-3xl p-2 pt-0',
          isMinting ? 'bg-background' : 'bg-card'
        )}
      >
        {!orderSubmitted && <SubmitRedeem />}
        {orderSubmitted && <CollateralAcquisition />}
      </div>
    </div>
  )
}

export default AsyncRedeem
