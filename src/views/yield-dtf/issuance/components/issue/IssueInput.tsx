import { useLingui } from '@lingui/react/macro'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtomValue } from 'jotai'
import { rTokenStateAtom } from 'state/atoms'
import { formatEther } from 'viem'
import { issueAmountAtom, maxIssuableAtom } from '../../atoms'

const IssueInput = (props: Partial<TransactionInputProps>) => {
  const { t } = useLingui()
  const issuableAmount = useAtomValue(maxIssuableAtom)
  const { issuancePaused, frozen } = useAtomValue(rTokenStateAtom)

  return (
    <TransactionInput
      placeholder={t`Mint amount`}
      amountAtom={issueAmountAtom}
      maxAmount={formatEther(((issuableAmount ?? 0n) * 9999n) / 10000n)}
      disabled={issuancePaused || frozen}
      {...props}
    />
  )
}

export default IssueInput
