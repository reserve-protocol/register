import Swap, { SlippageSelector } from '@/components/ui/swap'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  selectedTokenAtom,
  selectedTokenBalanceAtom,
  selectedTokenOrDefaultAtom,
  slippageAtom,
  tokensAtom,
  zapMintInputAtom,
} from '../atom'
import { useChainlinkPrice } from '@/hooks/useChainlinkPrice'
import { chainIdAtom } from '@/state/atoms'
import { formatEther } from 'viem'

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

  if (!indexDTF) return null

  return (
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
  )
}

export default Buy
