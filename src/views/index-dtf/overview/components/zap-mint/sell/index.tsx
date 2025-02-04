import Swap, { SlippageSelector } from '@/components/ui/swap'
import useZapSwapQuery from '@/hooks/useZapSwapQuery'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { formatEther, parseEther } from 'viem'
import {
  indexDTFBalanceAtom,
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

const Sell = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const [inputAmount, setInputAmount] = useAtom(zapMintInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const indexDTFBalance = useAtomValue(indexDTFBalanceAtom)
  const indxDTFParsedBalance = formatEther(indexDTFBalance)
  const tokens = useAtomValue(tokensAtom)
  const setInputToken = useSetAtom(selectedTokenAtom)
  const [slippage, setSlippage] = useAtom(slippageAtom)
  const [ongoingTx, setOngoingTx] = useAtom(zapOngoingTxAtom)
  const setZapRefetch = useSetAtom(zapRefetchAtom)
  const setZapFetching = useSetAtom(zapFetchingAtom)
  const inputPrice = (indexDTFPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(indxDTFParsedBalance)

  const insufficientBalance = parseEther(inputAmount) > indexDTFBalance

  const { data, isLoading, isFetching, refetch } = useZapSwapQuery({
    tokenIn: indexDTF?.id,
    tokenOut: selectedToken.address,
    amountIn: parseEther(inputAmount).toString(),
    slippage: Number(slippage),
    disabled: insufficientBalance || ongoingTx,
  })

  const priceTo = data?.result?.amountOutValue
  const valueTo = data?.result?.amountOut
  const showTxButton = Boolean(
    data?.status === 'success' &&
      data?.result &&
      !insufficientBalance &&
      !isFetching
  )
  const fetchingZapper = isLoading || isFetching
  const zapperErrorMessage = data?.error || ''

  useEffect(() => {
    setZapRefetch({ fn: refetch })
  }, [refetch, setZapRefetch])

  useEffect(() => {
    setZapFetching(fetchingZapper)
  }, [fetchingZapper, setZapFetching])

  useEffect(() => {
    setOngoingTx(false)
  }, [])

  if (!indexDTF) return null

  return (
    <div className="flex flex-col justify-between gap-2 h-full">
      <div className="flex flex-col gap-1">
        <Swap
          from={{
            price: `$${formatCurrency(inputPrice)}`,
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
            price: priceTo ? `$${formatCurrency(priceTo)}` : undefined,
            value: formatEther(BigInt(valueTo || 0)),
            tokens,
            onTokenSelect: setInputToken,
          }}
        />
        <SlippageSelector
          value={slippage}
          onChange={setSlippage}
          options={['200', '1000', '10000']}
        />
      </div>
      <div className="mb-2">
        <SubmitZap
          data={{
            tokenIn: indexDTF.id,
            amountIn: '',
            amountInValue: null,
            tokenOut: selectedToken.address,
            amountOut: '',
            amountOutValue: null,
            approvalAddress: selectedToken.address,
            approvalNeeded: false,
            insufficientFunds: false,
            dust: [],
            dustValue: null,
            gas: null,
            priceImpact: 0,
            tx: null,
          }}
          buttonLabel={`Sell ${indexDTF.token.symbol}`}
          inputSymbol={indexDTF.token.symbol}
          outputSymbol={selectedToken.symbol}
          showTxButton={showTxButton}
          fetchingZapper={fetchingZapper}
          insufficientBalance={insufficientBalance}
          zapperErrorMessage={zapperErrorMessage}
        />
      </div>
    </div>
  )
}

export default Sell
