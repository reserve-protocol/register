import Swap from '@/components/ui/swap'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import {
  inputPriceAtom,
  stTokenAtom,
  stakingInputAtom,
  unlockBalanceAtom,
} from '../atoms'

const UnlockView = () => {
  const stToken = useAtomValue(stTokenAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const inputPrice = useAtomValue(inputPriceAtom)
  const unlockBalance = useAtomValue(unlockBalanceAtom)

  const onMax = () => {
    onChange(unlockBalance)
  }

  if (!stToken) {
    return null
  }

  return (
    <Swap
      from={{
        title: 'You unlock:',
        address: stToken.id,
        symbol: stToken.token.symbol,
        value: input,
        onChange,
        price: `$${formatCurrency(inputPrice)}`,
        balance: `${formatCurrency(Number(unlockBalance))}`,
        onMax,
      }}
      to={{
        address: stToken.underlying.address,
        symbol: stToken.underlying.symbol,
        price: `$${formatCurrency(inputPrice)}`,
        value: input,
      }}
    />
  )
}

export default UnlockView
