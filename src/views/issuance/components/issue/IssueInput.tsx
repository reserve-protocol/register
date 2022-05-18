import { NumericalInput } from 'components'
import { useAtom, useAtomValue } from 'jotai'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'
import { issueAmountAtom, maxIssuableAtom } from '../../atoms'

interface Props extends BoxProps {
  title?: string
  compact?: boolean
}

const IssueInput = ({ title = 'Mint', compact = false, ...props }: Props) => {
  const [amount, setAmount] = useAtom(issueAmountAtom)
  const issuableAmount = useAtomValue(maxIssuableAtom)

  const maxLabel = (
    <Text
      onClick={() => setAmount(issuableAmount.toString())}
      as="a"
      variant="a"
      sx={{ display: 'block', marginLeft: 'auto', fontSize: compact ? 1 : 2 }}
    >
      Max: {formatCurrency(issuableAmount)}
    </Text>
  )

  return (
    <Box {...props}>
      <Flex sx={{ alignItems: 'center' }} mb={2}>
        <Text as="label" variant="contentTitle" ml={2}>
          {title}
        </Text>
        {compact && maxLabel}
      </Flex>
      <NumericalInput
        placeholder="Mint amount"
        value={amount}
        onChange={setAmount}
      />
      {!compact && <Flex mt={2}>{maxLabel}</Flex>}
    </Box>
  )
}

export default IssueInput
