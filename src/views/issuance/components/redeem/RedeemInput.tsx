import TransactionInput from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { balancesAtom, rTokenAtom } from 'state/atoms'
import { redeemAmountAtom } from 'views/issuance/atoms'

const RedeemInput = () => {
  const RToken = useAtomValue(rTokenAtom)
  const max = useAtomValue(balancesAtom)[RToken?.token.address ?? ''] ?? 0

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
