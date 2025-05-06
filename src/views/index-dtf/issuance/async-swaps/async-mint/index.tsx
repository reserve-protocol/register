import Swap from '@/components/ui/swap'
import useAsyncSwap from '@/hooks/useAsyncSwap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { parseEther, parseUnits } from 'viem'
import useLoadingAfterRefetch from '../../../overview/components/hooks/useLoadingAfterRefetch'
import {
  asyncSwapFetchingAtom,
  asyncSwapInputAtom,
  asyncSwapOngoingTxAtom,
  asyncSwapRefetchAtom,
  asyncSwapResponseAtom,
  currentAsyncSwapTabAtom,
  selectedTokenBalanceAtom,
  selectedTokenOrDefaultAtom,
  slippageAtom,
} from '../atom'
import CollateralAcquisition from '../collateral-acquisition'
import SubmitAsyncSwap from '../submit-async-swap'
import { cn } from '@/lib/utils'

const ASYNC_SWAP_BUFFER = 0.005

const AsyncMint = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const [inputAmount, setInputAmount] = useAtom(asyncSwapInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const selectedTokenBalance = useAtomValue(selectedTokenBalanceAtom)
  const slippage = useAtomValue(slippageAtom)
  const [ongoingTx, setOngoingTx] = useAtom(asyncSwapOngoingTxAtom)
  const setAsyncSwapRefetch = useSetAtom(asyncSwapRefetchAtom)
  const setAsyncSwapFetching = useSetAtom(asyncSwapFetchingAtom)
  const setCurrentTab = useSetAtom(currentAsyncSwapTabAtom)
  const selectedTokenPrice = useChainlinkPrice(chainId, selectedToken.address)
  const inputPrice = (selectedTokenPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(selectedTokenBalance?.balance || '0')
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)
  const orderSubmitted = !!asyncSwapResponse

  const insufficientBalance =
    parseUnits(inputAmount, selectedToken.decimals) >
    (selectedTokenBalance?.value || 0n)

  const amountOut = useMemo(() => {
    return (
      ((Number(inputAmount) || 0) / (dtfPrice ?? 1)) * (1 - ASYNC_SWAP_BUFFER)
    )
  }, [inputAmount, dtfPrice])

  const amountOutValue = useMemo(() => {
    return (Number(inputAmount) || 0) * (1 - ASYNC_SWAP_BUFFER)
  }, [inputAmount])

  const bufferValue = useMemo(() => {
    return (Number(inputAmount) || 0) * ASYNC_SWAP_BUFFER
  }, [inputAmount])

  const { data, isLoading, isFetching, refetch, failureReason } = useAsyncSwap({
    dtf: indexDTF?.id,
    amountOut: parseEther(amountOut.toString()).toString(),
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
          orderSubmitted && 'border-background bg-background'
        )}
        classNameSeparator={cn(
          'h-10 px-[8px] w-max mx-auto border-secondary border-4 -mt-[18px] -mb-[18px] z-20 text-foreground rounded-full bg-card hover:bg-card',
          orderSubmitted && 'bg-background'
        )}
      />
      {/* {!!data && <ZapDetails data={data.result} />} */}
      <div className="flex flex-col gap-2 bg-card rounded-b-3xl p-2 pt-0">
        {!orderSubmitted && (
          <SubmitAsyncSwap
            data={data}
            loadingQuote={awaitingQuote}
            dtfAddress={indexDTF.id}
            amountOut={parseEther(amountOut.toString()).toString()}
            operation="mint"
          />
        )}
        {orderSubmitted && <CollateralAcquisition dtfAmount={amountOut} />}
      </div>
    </div>
  )
}

export default AsyncMint
