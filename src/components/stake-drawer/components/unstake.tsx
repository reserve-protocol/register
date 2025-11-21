import Swap from '@/components/ui/swap'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { rsrPriceAtom } from '@/state/atoms'
import {
  stTokenBalanceStringAtom,
  stakingInputAtom,
  stTokenAtom,
  unstakeOutputAtom,
  exchangeRateAtom,
} from '../atoms'

const Unstake = () => {
  const stToken = useAtomValue(stTokenAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const stTokenBalance = useAtomValue(stTokenBalanceStringAtom)
  const unstakeOutput = useAtomValue(unstakeOutputAtom)
  const exchangeRate = useAtomValue(exchangeRateAtom)

  const onMax = () => {
    onChange(stTokenBalance)
  }

  if (!stToken) {
    return null
  }

  // Calculate USD value of output RSR
  const outputUsdValue = rsrPrice ? Number(unstakeOutput) * rsrPrice : 0

  return (
    <Swap
      from={{
        title: 'You unstake:',
        address: stToken.stToken.address,
        symbol: stToken.stToken.symbol,
        value: input,
        onChange,
        price: `$${formatCurrency(outputUsdValue)}`,
        balance: `${formatCurrency(Number(stTokenBalance))}`,
        onMax,
      }}
      to={{
        address: '0x320623b8e4ff03373931769a31fc52a4e78b5d70', // RSR address (mainnet)
        symbol: 'RSR',
        price: `$${formatCurrency(outputUsdValue)}`,
        value: unstakeOutput,
      }}
    />
  )
}

export default Unstake