import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { atom, useAtomValue } from 'jotai'
import { rTokenBalanceAtom, rTokenStatusAtom } from 'state/atoms'
import { RTOKEN_STATUS } from 'utils/constants'
import { redeemAmountAtom } from 'views/issuance/atoms'

const isTokenFrozenAtom = atom((get) => {
  const status = get(rTokenStatusAtom)

  return status === RTOKEN_STATUS.FROZEN
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
