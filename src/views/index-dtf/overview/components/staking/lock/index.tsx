import Swap from '@/components/ui/swap'
import { indexDTFAtom } from '@/state/dtf/atoms'
import { formatCurrency } from '@/utils'
import { useAtom, useAtomValue } from 'jotai'
import { inputBalanceAtom, inputPriceAtom, stakingInputAtom } from '../atoms'

const LockView = () => {
  const indexDTF = useAtomValue(indexDTFAtom)
  const [input, onChange] = useAtom(stakingInputAtom)
  const inputPrice = useAtomValue(inputPriceAtom)
  const inputBalance = useAtomValue(inputBalanceAtom)

  const onMax = () => {
    onChange(inputBalance)
  }

  if (!indexDTF || !indexDTF.stToken) {
    return null
  }

  return (
    <Swap
      from={{
        title: 'You lock:',
        address: indexDTF.stToken.underlying.address,
        symbol: indexDTF.stToken.underlying.symbol,
        value: input,
        onChange,
        price: `$${formatCurrency(inputPrice)}`,
        balance: `${formatCurrency(Number(inputBalance))}`,
        onMax,
      }}
      to={{
        address: indexDTF.stToken.id,
        symbol: indexDTF.stToken.token.symbol,
        price: `$${formatCurrency(inputPrice)}`,
        value: input,
      }}
    />
  )
}

export default LockView
