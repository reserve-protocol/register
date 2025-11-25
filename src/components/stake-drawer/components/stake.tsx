import Swap from '@/components/ui/swap'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { rsrPriceAtom } from '@/state/atoms'
import {
  rsrBalanceStringAtom,
  stakingInputAtom,
  stTokenAtom,
  stakeOutputAtom,
  inputPriceAtom,
} from '../atoms'
import { adjustMaxAmount } from '../utils/adjust-max-amount'

const Stake = () => {
  const stToken = useAtomValue(stTokenAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const rsrPrice = useAtomValue(rsrPriceAtom)
  const rsrBalance = useAtomValue(rsrBalanceStringAtom)
  const stakeOutput = useAtomValue(stakeOutputAtom)
  const inputUsdValue = useAtomValue(inputPriceAtom)

  const onMax = () => {
    onChange(adjustMaxAmount(rsrBalance))
  }

  if (!stToken) {
    return null
  }

  return (
    <Swap
      from={{
        title: 'You stake:',
        address: '0x320623b8e4ff03373931769a31fc52a4e78b5d70', // RSR address (mainnet)
        symbol: 'RSR',
        value: input,
        onChange,
        price: `$${formatCurrency(inputUsdValue)}`,
        balance: `${formatCurrency(Number(rsrBalance))}`,
        onMax,
      }}
      to={{
        address: stToken.stToken.address,
        symbol: stToken.stToken.symbol,
        price: `$${formatCurrency(inputUsdValue)}`,
        value: stakeOutput,
      }}
    />
  )
}

export default Stake