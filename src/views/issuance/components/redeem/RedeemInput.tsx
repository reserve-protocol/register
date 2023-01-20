import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { atom, useAtomValue } from 'jotai'
import { rTokenBalanceAtom, rTokenStatusAtom } from 'state/atoms'
import { redeemAmountAtom } from 'views/issuance/atoms'

const isTokenFrozenAtom = atom((get) => {
  const { frozen } = get(rTokenStatusAtom)

  return frozen
})

const RedeemInput = (props: Partial<TransactionInputProps>) => {
  const max = useAtomValue(rTokenBalanceAtom)
  const isTokenFrozen = useAtomValue(isTokenFrozenAtom)

  return (
    <TransactionInput
      title={t`Redeem`}
      placeholder={t`Redeem amount`}
      amountAtom={redeemAmountAtom}
      maxAmount={max}
      disabled={isTokenFrozen}
      {...props}
    />
  )
}

export default RedeemInput
