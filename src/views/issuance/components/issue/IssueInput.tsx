import { NumericalInput } from 'components'
import { useAtom } from 'jotai'
import { Box, BoxProps, Text } from 'theme-ui'
import { issueAmountAtom } from '../../atoms'

interface Props extends BoxProps {
  title: string
}

// TODO (idea): maybe its worth to move the maxIssuable logic to this component as well
const IssueInput = ({ title = 'Mint', ...props }: Props) => {
  const [amount, setAmount] = useAtom(issueAmountAtom)

  return (
    <Box {...props}>
      <Text as="label" variant="contentTitle" mb={2}>
        {title}
      </Text>
      <NumericalInput
        placeholder="Mint amount"
        value={amount}
        onChange={setAmount}
      />
    </Box>
  )
}

export default IssueInput
