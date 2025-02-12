import Swap, { SlippageSelector } from '@/components/ui/swap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import useZapSwapQuery from '@/hooks/useZapSwapQuery'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { formatEther, parseUnits } from 'viem'
import {
  currentZapMintTabAtom,
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

const Buy = () => {
  const chainId = useAtomValue(chainIdAtom)
  const indexDTF = useAtomValue(indexDTFAtom)
  const [inputAmount, setInputAmount] = useAtom(zapMintInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const selectedTokenBalance = useAtomValue(selectedTokenBalanceAtom)
  const tokens = useAtomValue(tokensAtom)
  const setInputToken = useSetAtom(selectedTokenAtom)
  const [slippage, setSlippage] = useAtom(slippageAtom)
  const [ongoingTx, setOngoingTx] = useAtom(zapOngoingTxAtom)
  const setZapRefetch = useSetAtom(zapRefetchAtom)
  const setZapFetching = useSetAtom(zapFetchingAtom)
  const setCurrentTab = useSetAtom(currentZapMintTabAtom)
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
  const zapperErrorMessage = data?.error || failureReason?.message || ''

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

  if (!indexDTF) return null

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex flex-col gap-1">
        <Swap
          from={{
            price: `$${formatCurrency(inputPrice)}`,
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
            price: priceTo ? `$${formatCurrency(priceTo)}` : undefined,
            value: formatEther(BigInt(valueTo || 0)),
          }}
          onSwap={changeTab}
        />
        <SlippageSelector
          value={slippage}
          onChange={setSlippage}
          options={['200', '1000', '10000']}
        />
      </div>
      <div className="mb-2">
        <SubmitZap
          data={data?.result}
          chainId={indexDTF.chainId}
          buttonLabel={`Buy ${indexDTF.token.symbol}`}
          inputSymbol={selectedToken.symbol}
          outputSymbol={indexDTF.token.symbol}
          showTxButton={showTxButton}
          fetchingZapper={fetchingZapper}
          insufficientBalance={insufficientBalance}
          zapperErrorMessage={zapperErrorMessage}
        />
      </div>
    </div>
  )
}

export default Buy
