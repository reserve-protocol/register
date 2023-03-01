import { t } from '@lingui/macro'
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
      title={t`Unstake`}
      placeholder={t`stRSR amount`}
      amountAtom={unStakeAmountAtom}
      maxAmount={max.balance}
      {...props}
    />
  )
}

export default UnstakeInput
