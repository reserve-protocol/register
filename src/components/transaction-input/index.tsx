import { NumericalInput } from 'components'
import { useAtom } from 'jotai'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

interface Props extends BoxProps {
  title: string
  placeholder: string
  compact?: boolean
  amountAtom: any
  maxAmount: number
}

const TransactionInput = ({
  title,
  placeholder,
  amountAtom,
  maxAmount,
  compact = false,
  ...props
}: Props) => {
  const [amount, setAmount] = useAtom(amountAtom)

  const maxLabel = (
    <Text
      onClick={() => setAmount(maxAmount.toString())}
      as="a"
      variant="a"
      sx={{ display: 'block', marginLeft: 'auto', fontSize: compact ? 1 : 2 }}
    >
      Max: {formatCurrency(maxAmount)}
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
        placeholder={placeholder}
        value={amount as string}
        onChange={setAmount}
      />
      {!compact && <Flex mt={2}>{maxLabel}</Flex>}
    </Box>
  )
}

export default TransactionInput
