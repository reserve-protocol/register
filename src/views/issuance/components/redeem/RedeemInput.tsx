import TransactionInput from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rTokenBalanceAtom } from 'state/atoms'
import { redeemAmountAtom } from 'views/issuance/atoms'

const RedeemInput = () => {
  const max = useAtomValue(rTokenBalanceAtom)

  return (
    <TransactionInput
      title="Redeem"
      placeholder="Redeem amount"
      amountAtom={redeemAmountAtom}
      maxAmount={max}
    />
  )
}

export default RedeemInput
