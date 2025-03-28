import Swap from '@/components/ui/swap'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import {
  inputBalanceAtom,
  inputPriceAtom,
  stakingInputAtom,
  stTokenAtom,
} from '../atoms'

const LockView = () => {
  const stToken = useAtomValue(stTokenAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const inputPrice = useAtomValue(inputPriceAtom)
  const inputBalance = useAtomValue(inputBalanceAtom)

  const onMax = () => {
    onChange(inputBalance)
  }

  if (!stToken) {
    return null
  }

  return (
    <Swap
      from={{
        title: 'You lock:',
        address: stToken.underlying.address,
        symbol: stToken.underlying.symbol,
        value: input,
        onChange,
        price: `$${formatCurrency(inputPrice)}`,
        balance: `${formatCurrency(Number(inputBalance))}`,
        onMax,
      }}
      to={{
        address: stToken.id,
        symbol: stToken.token.symbol,
        price: `$${formatCurrency(inputPrice)}`,
        value: input,
      }}
    />
  )
}

export default LockView
