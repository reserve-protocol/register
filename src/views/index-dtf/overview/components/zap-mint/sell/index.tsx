import Swap, { SlippageSelector } from '@/components/ui/swap'
import { indexDTFAtom, indexDTFPriceAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { formatEther } from 'viem'
import {
  indexDTFBalanceAtom,
  selectedTokenAtom,
  selectedTokenOrDefaultAtom,
  slippageAtom,
  tokensAtom,
  zapMintInputAtom,
} from '../atom'
import SubmitZap from '../submit-zap'

const Buy = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const indexDTFPrice = useAtomValue(indexDTFPriceAtom)
  const [inputAmount, setInputAmount] = useAtom(zapMintInputAtom)
  const selectedToken = useAtomValue(selectedTokenOrDefaultAtom)
  const indexDTFBalance = useAtomValue(indexDTFBalanceAtom)
  const indxDTFParsedBalance = formatEther(indexDTFBalance)
  const tokens = useAtomValue(tokensAtom)
  const setInputToken = useSetAtom(selectedTokenAtom)
  const [slippage, setSlippage] = useAtom(slippageAtom)
  const inputPrice = (indexDTFPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(indxDTFParsedBalance)

  const priceTo = 0 // TODO: get price from zap
  const valueTo = '0' // TODO: get value from zap
  const showTxButton = false
  const fetchingZapper = false
  const insufficientBalance = false
  const zapperErrorMessage = ''

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
        <SlippageSelector value={slippage} onChange={setSlippage} />
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

export default Buy
