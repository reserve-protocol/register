import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rTokenBalanceAtom, rTokenStateAtom } from 'state/atoms'
import { redeemAmountAtom } from '@/views/rtoken/issuance/atoms'

const RedeemInput = (props: Partial<TransactionInputProps>) => {
  const max = useAtomValue(rTokenBalanceAtom)
  const { frozen } = useAtomValue(rTokenStateAtom)

  return (
    <TransactionInput
      title={t`Redeem`}
      placeholder={t`Redeem amount`}
      amountAtom={redeemAmountAtom}
      maxAmount={max.balance}
      disabled={frozen}
      {...props}
    />
  )
}

export default RedeemInput
