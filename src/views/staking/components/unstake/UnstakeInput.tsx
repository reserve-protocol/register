import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rTokenTradingAvailableAtom, stRsrBalanceAtom } from 'state/atoms'
import { unStakeAmountAtom } from 'views/staking/atoms'

const UnstakeInput = (props: Partial<TransactionInputProps>) => {
  const max = useAtomValue(stRsrBalanceAtom)
  const isAvailable = useAtomValue(rTokenTradingAvailableAtom)

  return (
    <TransactionInput
      title={t`Unstake`}
      placeholder={t`stRSR amount`}
      amountAtom={unStakeAmountAtom}
      maxAmount={max.balance}
      disabled={!isAvailable}
      {...props}
    />
  )
}

export default UnstakeInput
