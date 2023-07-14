import { t } from '@lingui/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import { issueAmountAtom, maxIssuableAtom } from '../../atoms'
import { formatEther } from 'viem'

const IssueInput = (props: Partial<TransactionInputProps>) => {
  const issuableAmount = useAtomValue(maxIssuableAtom)
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)

  return (
    <TransactionInput
      placeholder={t`Mint amount`}
      amountAtom={issueAmountAtom}
      maxAmount={formatEther(issuableAmount)}
      disabled={issuancePaused || frozen}
      {...props}
    />
  )
}

export default IssueInput
