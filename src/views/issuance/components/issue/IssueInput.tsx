import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { formatEther } from 'ethers/lib/utils'
import { useAtomValue } from 'jotai'
import { isRTokenDisabledAtom, maxIssuanceAtom } from 'state/atoms'
import { issueAmountAtom, maxIssuableAtom } from '../../atoms'

const IssueInput = (props: Partial<TransactionInputProps>) => {
  const issuableAmount = useAtomValue(maxIssuableAtom)
  const isTokenDisabled = useAtomValue(isRTokenDisabledAtom)
  const issuanceAvailable = useAtomValue(maxIssuanceAtom)

  return (
    <TransactionInput
      placeholder={t`Mint amount`}
      amountAtom={issueAmountAtom}
      maxAmount={formatEther(issuableAmount)}
      help={t`Each RToken can have an issuance throttle to limit the amount of extractable value in the case of an attack. After a large isuance, the issuance limit recharges linearly to the defined maximum at a defined speed of recharge`}
      globalMaxAmount={issuanceAvailable}
      disabled={isTokenDisabled}
      {...props}
    />
  )
}

export default IssueInput
