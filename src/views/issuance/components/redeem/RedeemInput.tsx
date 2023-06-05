import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rTokenBalanceAtom, rTokenStatusAtom } from 'state/atoms'
import { redeemAmountAtom } from 'views/issuance/atoms'

const RedeemInput = (props: Partial<TransactionInputProps>) => {
  const max = useAtomValue(rTokenBalanceAtom)
  const { frozen } = useAtomValue(rTokenStatusAtom)

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
