import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { stRsrBalanceAtom } from 'state/atoms'
import { unStakeAmountAtom } from 'views/staking/atoms'

const UnstakeInput = (props: Partial<TransactionInputProps>) => {
  const max = useAtomValue(stRsrBalanceAtom)

  return (
    <TransactionInput
      title="Unstake"
      placeholder="stRSR amount"
      amountAtom={unStakeAmountAtom}
      maxAmount={max}
      {...props}
    />
  )
}

export default UnstakeInput
