import Swap from '@/components/ui/swap'
import useAsyncSwap from '@/hooks/useAsyncSwap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import { cn } from '@/lib/utils'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { parseUnits } from 'viem'
import useLoadingAfterRefetch from '../../../overview/components/hooks/useLoadingAfterRefetch'
import {
  asyncSwapFetchingAtom,
  asyncSwapInputAtom,
  asyncSwapOngoingTxAtom,
  asyncSwapRefetchAtom,
  asyncSwapResponseAtom,
  bufferValueAtom,
  collateralAcquiredAtom,
  currentAsyncSwapTabAtom,
  isMintingAtom,
  mintValueAtom,
  mintValueUSDAtom,
  mintValueWeiAtom,
  selectedTokenBalanceAtom,
  selectedTokenOrDefaultAtom,
  slippageAtom,
} from '../atom'
import CollateralAcquisition from '../collateral-acquisition'
import SubmitAsyncSwap from '../submit-async-swap'

const AsyncMint = () => {
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
  const setCurrentTab = useSetAtom(currentAsyncSwapTabAtom)
  const selectedTokenPrice = useChainlinkPrice(chainId, selectedToken.address)
  const inputPrice = (selectedTokenPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(selectedTokenBalance?.balance || '0')
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const collateralAcquired = useAtomValue(collateralAcquiredAtom)
  const orderSubmitted = !!asyncSwapResponse
  const amountOut = useAtomValue(mintValueAtom)
  const amountOutWei = useAtomValue(mintValueWeiAtom)
  const amountOutValue = useAtomValue(mintValueUSDAtom)
  const bufferValue = useAtomValue(bufferValueAtom)

  const insufficientBalance =
    parseUnits(inputAmount, selectedToken.decimals) >
    (selectedTokenBalance?.value || 0n)

  const { data, isLoading, isFetching, refetch, failureReason } = useAsyncSwap({
    dtf: indexDTF?.id,
    amountOut: amountOutWei.toString(),
    slippage: isFinite(Number(slippage)) ? Number(slippage) : 10000,
    disabled: insufficientBalance || ongoingTx,
    dtfTicker: indexDTF?.token.symbol || '',
    type: 'mint',
  })

  const { loadingAfterRefetch } = useLoadingAfterRefetch(data)

  const priceFrom = 0

  // const valueTo = data?.result?.amountOut
  // const showTxButton = Boolean(
  //   data?.status === 'success' &&
  //     data?.result &&
  //     !insufficientBalance &&
  //     !isLoading
  // )
  const awaitingQuote = isLoading || isFetching

  const changeTab = () => {
    setCurrentTab((prev) => (prev === 'mint' ? 'redeem' : 'mint'))
    setInputAmount('')
  }

  useEffect(() => {
    setAsyncSwapRefetch({ fn: refetch })
  }, [refetch, setAsyncSwapRefetch])

  useEffect(() => {
    setAsyncSwapFetching(awaitingQuote)
  }, [awaitingQuote, setAsyncSwapFetching])

  useEffect(() => {
    setOngoingTx(false)
    setInputAmount('')
  }, [])

  const onSuccess = useCallback(() => {
    setInputAmount('')
  }, [])

  if (!indexDTF) return null

  return (
    <div className="flex flex-col h-full">
      <Swap
        from={{
          price: `$${formatCurrency(priceFrom ?? inputPrice)}`,
          address: selectedToken.address,
          symbol: selectedToken.symbol,
          balance: `${formatCurrency(Number(selectedTokenBalance?.balance || '0'))}`,
          value: inputAmount,
          onChange: setInputAmount,
          onMax,
        }}
        to={{
          address: indexDTF.id,
          symbol: indexDTF.token.symbol,
          price: amountOutValue ? (
            <span>${formatCurrency(amountOutValue)}</span>
          ) : undefined,
          value: amountOut.toString(),
        }}
        loading={isLoading || loadingAfterRefetch}
        disabled={orderSubmitted}
        classNameInput={cn(
          'rounded-3xl border-8 border-card',
          orderSubmitted && 'border-background bg-background'
        )}
        classNameOutput={cn(
          'rounded-3xl border-8 border-card rounded-b-none pb-2',
          orderSubmitted && 'border-background bg-background',
          collateralAcquired && !isMinting && 'border-card bg-card'
        )}
        classNameSeparator={cn(
          'h-10 px-[8px] w-max mx-auto border-secondary border-4 -mt-[18px] -mb-[18px] z-20 text-foreground rounded-full bg-card hover:bg-card',
          orderSubmitted && 'bg-background'
        )}
      />
      {/* {!!data && <ZapDetails data={data.result} />} */}
      <div
        className={cn(
          'flex flex-col gap-2 rounded-b-3xl p-2 pt-0',
          isMinting ? 'bg-background' : 'bg-card'
        )}
      >
        {!orderSubmitted && (
          <SubmitAsyncSwap
            data={data}
            loadingQuote={awaitingQuote}
            dtfAddress={indexDTF.id}
            amountOut={amountOutWei.toString()}
            operation="mint"
          />
        )}
        {orderSubmitted && <CollateralAcquisition />}
      </div>
    </div>
  )
}

export default AsyncMint
