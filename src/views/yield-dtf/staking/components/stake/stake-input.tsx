import { Button, NumericalInput } from 'components'
import TokenLogo from 'components/icons/TokenLogo'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { rsrBalanceAtom, rsrPriceAtom } from 'state/atoms'
import { formatCurrency } from 'utils'
import { stakeAmountAtom } from './atoms'
import InputPostfix from '../input-postfix'

const StakeInputField = () => {
  const [amount, setAmount] = useAtom(stakeAmountAtom)

  useEffect(() => {
    return () => {
      setAmount('')
    }
  }, [])

  return (
    <div className="relative z-0">
      <NumericalInput
        variant="transparent"
        placeholder="0 RSR"
        value={amount}
        onChange={setAmount}
      />
      {!!amount && <InputPostfix amount={amount} symbol={'RSR'} />}
    </div>
  )
}

const StakeUsdAmount = () => {
  const price = useAtomValue(rsrPriceAtom)
  const amount = useAtomValue(stakeAmountAtom)

  if (!amount) {
    return null
  }

  return (
    <span className="mr-3 overflow-hidden text-ellipsis text-legend">
      ${formatCurrency(price * Number(amount), 2)}
    </span>
  )
}

const StakeBalance = () => {
  const balance = useAtomValue(rsrBalanceAtom)
  const setAmount = useSetAtom(stakeAmountAtom)

  return (
    <div className="ml-auto flex items-center flex-shrink-0">
      <TokenLogo width={16} symbol={'rsr'} />
      <span className="ml-2 text-legend">Balance</span>
      <span className="mx-1 font-semibold">
        {formatCurrency(+balance.balance, 2, {
          notation: 'compact',
          compactDisplay: 'short',
        })}
      </span>
      <Button small variant="muted" onClick={() => setAmount(balance.balance)}>
        Max
      </Button>
    </div>
  )
}

const StakeInput = () => (
  <div className="overflow-hidden bg-muted rounded-3xl p-3">
    <span>You stake:</span>
    <StakeInputField />
    <div className="flex items-center">
      <StakeUsdAmount />
      <StakeBalance />
    </div>
  </div>
)

export default StakeInput
