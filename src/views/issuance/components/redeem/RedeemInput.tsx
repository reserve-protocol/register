import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { atom, useAtomValue } from 'jotai'
import {
  maxRedemptionAtom,
  rTokenBalanceAtom,
  rTokenStatusAtom,
} from 'state/atoms'
import { redeemAmountAtom } from 'views/issuance/atoms'

const isTokenFrozenAtom = atom((get) => {
  const { frozen } = get(rTokenStatusAtom)

  return frozen
})

const RedeemInput = (props: Partial<TransactionInputProps>) => {
  const max = useAtomValue(rTokenBalanceAtom)
  const isTokenFrozen = useAtomValue(isTokenFrozenAtom)
  const redemptionAvailable = useAtomValue(maxRedemptionAtom)

  return (
    <TransactionInput
      title={t`Redeem`}
      placeholder={t`Redeem amount`}
      amountAtom={redeemAmountAtom}
      maxAmount={max.balance}
      help={t`Each RToken can have a redemption throttle to limit the amount of extractable value in the case of an attack. After a large redemption, the redemption limit recharges linearly to the defined maximum at a defined speed of recharge.`}
      globalMaxAmount={redemptionAvailable}
      disabled={isTokenFrozen}
      {...props}
    />
  )
}

export default RedeemInput
