import { NumericalInput } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { issueAmountAtom, maxIssuableAtom } from '../../atoms'

interface Props extends BoxProps {
  title?: string
}

const IssueInput = ({ title = 'Mint', ...props }: Props) => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const issuableAmount = useAtomValue(maxIssuableAtom)

  return (
    <Box {...props}>
      <Flex sx={{ alignItems: 'center' }} mb={2}>
        <Text as="label" variant="contentTitle" ml={2}>
          {title}
        </Text>
        <Text
          onClick={() => setAmount(issuableAmount.toString())}
          as="a"
          variant="a"
          sx={{ marginLeft: 'auto', fontSize: 1 }}
        >
          Max: {formatCurrency(issuableAmount)}
        </Text>
      </Flex>
      <NumericalInput
        placeholder="Mint amount"
        value={amount}
        onChange={setAmount}
      />
    </Box>
  )
}

export default IssueInput
