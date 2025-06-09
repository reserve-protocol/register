import Swap from '@/components/ui/swap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import useZapSwapQuery from '@/hooks/useZapSwapQuery'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { formatEther, parseUnits } from 'viem'
import useLoadingAfterRefetch from '../../hooks/useLoadingAfterRefetch'
import {
  currentZapMintTabAtom,
  forceMintAtom,
  openZapMintModalAtom,
  selectedTokenAtom,
  selectedTokenBalanceAtom,
  selectedTokenOrDefaultAtom,
  slippageAtom,
  tokensAtom,
  zapFetchingAtom,
  zapMintInputAtom,
  zapOngoingTxAtom,
  zapRefetchAtom,
} from '../atom'
import SubmitZap from '../submit-zap'
import ZapDetails, { ZapPriceImpact } from '../zap-details'

const Buy = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const [inputAmount, setInputAmount] = useAtom(zapMintInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const selectedTokenBalance = useAtomValue(selectedTokenBalanceAtom)
  const tokens = useAtomValue(tokensAtom)
  const slippage = useAtomValue(slippageAtom)
  const forceMint = useAtomValue(forceMintAtom)
  const setInputToken = useSetAtom(selectedTokenAtom)
  const [ongoingTx, setOngoingTx] = useAtom(zapOngoingTxAtom)
  const setZapRefetch = useSetAtom(zapRefetchAtom)
  const setZapFetching = useSetAtom(zapFetchingAtom)
  const setCurrentTab = useSetAtom(currentZapMintTabAtom)
  const setOpen = useSetAtom(openZapMintModalAtom)
  const selectedTokenPrice = useChainlinkPrice(chainId, selectedToken.address)
  const inputPrice = (selectedTokenPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(selectedTokenBalance?.balance || '0')

  const insufficientBalance =
    parseUnits(inputAmount, selectedToken.decimals) >
    (selectedTokenBalance?.value || 0n)

  const { data, isLoading, isFetching, refetch, failureReason } =
    useZapSwapQuery({
      tokenIn: selectedToken.address,
      tokenOut: indexDTF?.id,
      amountIn: parseUnits(inputAmount, selectedToken.decimals).toString(),
      slippage: isFinite(Number(slippage)) ? Number(slippage) : 10000,
      disabled: ongoingTx,
      forceMint,
      dtfTicker: indexDTF?.token.symbol || '',
      type: 'buy',
    })

  const { loadingAfterRefetch } = useLoadingAfterRefetch(data)

  const priceFrom = data?.result?.amountInValue
  const priceTo = data?.result?.amountOutValue
  const valueTo = data?.result?.amountOut
  const showTxButton = Boolean(
    data?.status === 'success' &&
      data?.result &&
      !insufficientBalance &&
      !isLoading
  )
  const fetchingZapper = isLoading || isFetching
  const zapperErrorMessage = isFetching
    ? ''
    : data?.error || failureReason?.message || ''
  const dustValue = data?.result?.dustValue || 0

  const changeTab = () => {
    setCurrentTab((prev) => (prev === 'sell' ? 'buy' : 'sell'))
    setInputToken(tokens[0])
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
          tokens,
          onTokenSelect: setInputToken,
        }}
        to={{
          address: indexDTF.id,
          symbol: indexDTF.token.symbol,
          price: priceTo ? (
            <span>
              ${formatCurrency(priceTo)}
              {dustValue > 0.01
                ? ` + $${formatCurrency(dustValue)} in dust `
                : ' '}
              <ZapPriceImpact data={data?.result} />
            </span>
          ) : undefined,
          value: formatEther(BigInt(valueTo || 0)),
        }}
        onSwap={changeTab}
        loading={isLoading || loadingAfterRefetch}
      />
      {!!data?.result && <ZapDetails data={data.result} />}
      <SubmitZap
        data={data?.result}
        chainId={indexDTF.chainId}
        buttonLabel={`Buy ${indexDTF.token.symbol}`}
        inputSymbol={selectedToken.symbol}
        outputSymbol={indexDTF.token.symbol}
        inputAmount={formatCurrency(Number(inputAmount))}
        outputAmount={formatCurrency(Number(formatEther(BigInt(valueTo || 0))))}
        showTxButton={showTxButton}
        fetchingZapper={isLoading}
        insufficientBalance={insufficientBalance}
        zapperErrorMessage={zapperErrorMessage}
        onSuccess={onSuccess}
      />
    </div>
  )
}

export default Buy
