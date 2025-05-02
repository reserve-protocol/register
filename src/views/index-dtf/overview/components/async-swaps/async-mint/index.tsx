import Swap from '@/components/ui/swap'
import useAsyncSwap from '@/hooks/useAsyncSwap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo } from 'react'
import { parseEther, parseUnits } from 'viem'
import useLoadingAfterRefetch from '../../hooks/useLoadingAfterRefetch'
import {
  currentZapMintTabAtom,
  openZapMintModalAtom,
  selectedTokenBalanceAtom,
  selectedTokenOrDefaultAtom,
  slippageAtom,
  zapFetchingAtom,
  zapMintInputAtom,
  zapOngoingTxAtom,
  zapRefetchAtom,
} from '../../zap-mint/atom'
import SubmitAsyncSwap from '../submit-async-swap'
import { asyncSwapResponseAtom } from '../atom'
import CollateralAcquisition from '../collateral-acquisition'

const ASYNC_SWAP_BUFFER = 0.005

const AsyncMint = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const dtfPrice = useAtomValue(indexDTFPriceAtom)
  const [inputAmount, setInputAmount] = useAtom(zapMintInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const selectedTokenBalance = useAtomValue(selectedTokenBalanceAtom)
  const slippage = useAtomValue(slippageAtom)
  const [ongoingTx, setOngoingTx] = useAtom(zapOngoingTxAtom)
  const setZapRefetch = useSetAtom(zapRefetchAtom)
  const setZapFetching = useSetAtom(zapFetchingAtom)
  const setCurrentTab = useSetAtom(currentZapMintTabAtom)
  const setOpen = useSetAtom(openZapMintModalAtom)
  const selectedTokenPrice = useChainlinkPrice(chainId, selectedToken.address)
  const inputPrice = (selectedTokenPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(selectedTokenBalance?.balance || '0')
  const asyncSwapResponse = useAtomValue(asyncSwapResponseAtom)

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
  const fetchingZapper = isLoading || isFetching

  const changeTab = () => {
    setCurrentTab((prev) => (prev === 'sell' ? 'buy' : 'sell'))
    setInputAmount('')
  }

  useEffect(() => {
    setZapRefetch({ fn: refetch })
  }, [refetch, setZapRefetch])

  useEffect(() => {
    setZapFetching(fetchingZapper)
  }, [fetchingZapper, setZapFetching])

  useEffect(() => {
    setOngoingTx(false)
    setInputAmount('')
  }, [])

  const onSuccess = useCallback(() => {
    setInputAmount('')
    setOpen(false)
  }, [])

  if (!indexDTF) return null

  return (
    <div className="flex flex-col gap-2 h-full">
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
        onSwap={changeTab}
        loading={isLoading || loadingAfterRefetch}
      />
      {/* {!!data && <ZapDetails data={data.result} />} */}
      {!asyncSwapResponse && (
        <SubmitAsyncSwap
          data={data}
          dtfAddress={indexDTF.id}
          amountOut={parseEther(amountOut.toString()).toString()}
          operation="mint"
        />
      )}
      {asyncSwapResponse && <CollateralAcquisition dtfAmount={amountOut} />}
    </div>
  )
}

export default AsyncMint
