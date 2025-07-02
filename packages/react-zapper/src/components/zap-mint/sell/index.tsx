import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { formatEther, formatUnits, parseEther } from 'viem'
import useLoadingAfterRefetch from '../../../hooks/useLoadingAfterRefetch'
import useZapSwapQuery from '../../../hooks/useZapSwapQuery'
import {
  indexDTFAtom,
  indexDTFPriceAtom,
  chainIdAtom,
} from '../../../state/atoms'
import { formatCurrency } from '../../../utils'
import { Token } from '../../../types'
import Swap from '../../ui/swap'
import {
  zapperCurrentTabAtom,
  forceMintAtom,
  indexDTFBalanceAtom,
  openZapMintModalAtom,
  selectedTokenAtom,
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
import { trackTokenSelection, trackTabSwitch } from '../../../utils/tracking'

const Sell = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const chainId = useAtomValue(chainIdAtom)
  const [inputAmount, setInputAmount] = useAtom(zapMintInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const indexDTFBalance = useAtomValue(indexDTFBalanceAtom)
  const indxDTFParsedBalance = formatEther(indexDTFBalance)
  const tokens = useAtomValue(tokensAtom)
  const slippage = useAtomValue(slippageAtom)
  const forceMint = useAtomValue(forceMintAtom)
  const setOutputToken = useSetAtom(selectedTokenAtom)
  const [ongoingTx, setOngoingTx] = useAtom(zapOngoingTxAtom)
  const setZapRefetch = useSetAtom(zapRefetchAtom)
  const setZapFetching = useSetAtom(zapFetchingAtom)
  const setCurrentTab = useSetAtom(zapperCurrentTabAtom)
  const setOpen = useSetAtom(openZapMintModalAtom)
  const inputPrice = (indexDTFPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(indxDTFParsedBalance)

  const handleTokenSelect = (token: Token) => {
    setOutputToken(token)
    trackTokenSelection(
      token.symbol,
      'output',
      indexDTF?.token.symbol,
      indexDTF?.id,
      chainId
    )
  }

  const insufficientBalance = parseEther(inputAmount) > indexDTFBalance

  const { data, isLoading, isFetching, refetch, failureReason } =
    useZapSwapQuery({
      tokenIn: indexDTF?.id,
      tokenOut: selectedToken.address,
      amountIn: parseEther(inputAmount).toString(),
      slippage: Number(slippage),
      disabled: ongoingTx,
      forceMint,
      dtfTicker: indexDTF?.token.symbol || '',
      type: 'sell',
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
    const newTab = 'buy' // Since this is the Sell component, swapping goes to buy
    setCurrentTab(newTab)
    setOutputToken(tokens[0])
    setInputAmount('')
    trackTabSwitch(newTab, indexDTF?.token.symbol, indexDTF?.id, chainId)
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
          address: indexDTF.id,
          symbol: indexDTF.token.symbol,
          balance: `${formatCurrency(Number(indxDTFParsedBalance))}`,
          value: inputAmount,
          onChange: setInputAmount,
          onMax,
        }}
        to={{
          address: selectedToken.address,
          symbol: selectedToken.symbol,
          price: priceTo ? (
            <span>
              ${formatCurrency(priceTo)}
              {dustValue > 0.01
                ? ` + $${formatCurrency(dustValue)} in dust `
                : ' '}
              <ZapPriceImpact data={data?.result} />
            </span>
          ) : undefined,
          value: formatUnits(BigInt(valueTo || 0), selectedToken.decimals),
          tokens,
          onTokenSelect: handleTokenSelect,
        }}
        onSwap={changeTab}
        loading={isLoading || loadingAfterRefetch}
      />
      {!!data?.result && <ZapDetails data={data.result} />}
      <SubmitZap
        data={data?.result}
        chainId={indexDTF.chainId}
        buttonLabel={`Sell ${indexDTF.token.symbol}`}
        inputSymbol={indexDTF.token.symbol}
        outputSymbol={selectedToken.symbol}
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

export default Sell
