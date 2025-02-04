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

  if (!indexDTF) return null

  return (
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
  )
}

export default Buy
