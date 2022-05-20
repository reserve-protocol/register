import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rsrBalanceAtom } from 'state/atoms'
import { stakeAmountAtom } from 'views/staking/atoms'

const StakeInput = (props: Partial<TransactionInputProps>) => {
  const max = useAtomValue(rsrBalanceAtom)

  return (
    <TransactionInput
      title="Stake"
      placeholder="RSR amount"
      amountAtom={stakeAmountAtom}
      maxAmount={max}
      {...props}
    />
  )
}

export default StakeInput
