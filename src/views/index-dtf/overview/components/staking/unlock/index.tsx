import Swap from '@/components/ui/swap'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { inputPriceAtom, stakingInputAtom, unlockBalanceAtom } from '../atoms'

const UnlockView = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const inputPrice = useAtomValue(inputPriceAtom)
  const unlockBalance = useAtomValue(unlockBalanceAtom)

  const onMax = () => {
    onChange(unlockBalance)
  }

  if (!indexDTF || !indexDTF.stToken) {
    return null
  }

  return (
    <Swap
      from={{
        title: 'You unlock:',
        address: indexDTF.stToken.id,
        symbol: indexDTF.stToken.token.symbol,
        value: input,
        onChange,
        price: `$${formatCurrency(inputPrice)}`,
        balance: `${formatCurrency(Number(unlockBalance))}`,
        onMax,
      }}
      to={{
        address: indexDTF.stToken.underlying.address,
        symbol: indexDTF.stToken.underlying.symbol,
        price: `$${formatCurrency(inputPrice)}`,
        value: input,
      }}
    />
  )
}

export default UnlockView
