import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { issueAmountAtom, maxIssuableAtom } from '../../atoms'

const IssueInput = (props: Partial<TransactionInputProps>) => {
  const issuableAmount = useAtomValue(maxIssuableAtom)

  return (
    <TransactionInput
      placeholder={t`Mint amount`}
      amountAtom={issueAmountAtom}
      maxAmount={issuableAmount}
      {...props}
    />
  )
}

export default IssueInput
