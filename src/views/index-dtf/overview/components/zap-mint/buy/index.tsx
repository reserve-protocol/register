import Swap, { SlippageSelector } from '@/components/ui/swap'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import { chainIdAtom } from '@/state/atoms'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { formatEther } from 'viem'
import {
  selectedTokenAtom,
  selectedTokenBalanceAtom,
  selectedTokenOrDefaultAtom,
  slippageAtom,
  tokensAtom,
  zapMintInputAtom,
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
  const selectedTokenPrice = useChainlinkPrice(chainId, selectedToken.address)
  const inputPrice = (selectedTokenPrice || 0) * Number(inputAmount)
  const onMax = () => setInputAmount(selectedTokenBalance?.balance || '0')

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
        />
        <SlippageSelector value={slippage} onChange={setSlippage} />
      </div>
      <div className="mb-2">
        <SubmitZap
          data={{
            tokenIn: selectedToken.address,
            amountIn: '',
            amountInValue: null,
            tokenOut: indexDTF.id,
            amountOut: '',
            amountOutValue: null,
            approvalAddress: indexDTF.id,
            approvalNeeded: false,
            insufficientFunds: false,
            dust: [],
            dustValue: null,
            gas: null,
            priceImpact: 0,
            tx: null,
          }}
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
