import { NumericalInput } from 'components'
import TransactionInput, {
  TransactionInputProps,
} from 'components/transaction-input'
import { useAtom, useAtomValue } from 'jotai'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { issueAmountAtom, maxIssuableAtom } from '../../atoms'

const IssueInput = (props: Partial<TransactionInputProps>) => {
  const issuableAmount = useAtomValue(maxIssuableAtom)

  return (
    <TransactionInput
      placeholder="Mint amount"
      amountAtom={issueAmountAtom}
      maxAmount={issuableAmount}
      {...props}
    />
  )
}

export default IssueInput
