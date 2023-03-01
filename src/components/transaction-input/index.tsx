import { NumericalInput } from 'components'
import { useAtom } from 'jotai'
import { Box, BoxProps, Flex, Text } from 'theme-ui'
import { formatCurrency } from 'utils'

export interface TransactionInputProps extends BoxProps {
  title?: string
  placeholder?: string
  compact?: boolean
  amountAtom: any
  maxAmount: string
  disabled?: boolean
  autoFocus?: boolean
}

const TransactionInput = ({
  title = '',
  placeholder = '',
  amountAtom,
  maxAmount,
  disabled = false,
  compact = false,
  autoFocus = false,
  ...props
}: TransactionInputProps) => {
  const [amount, setAmount] = useAtom(amountAtom)

  const maxLabel = (
    <Text
      onClick={() => setAmount(maxAmount)}
      as="a"
      variant="a"
      sx={{ display: 'block', fontSize: compact ? 1 : 2 }}
      ml={'auto'}
      mr={2}
    >
      Max: {formatCurrency(+maxAmount, 5)}
    </Text>
  )

  return (
    <Box {...props}>
      <Flex sx={{ alignItems: 'center' }} mb={2}>
        <Text as="label" variant="legend" ml={3}>
          {title}
        </Text>
        {compact && maxLabel}
      </Flex>
      <NumericalInput
        disabled={disabled}
        placeholder={placeholder}
        value={amount as string}
        onChange={setAmount}
        autoFocus={autoFocus}
      />
      {!compact && <Flex mt={2}>{maxLabel}</Flex>}
    </Box>
  )
}

export default TransactionInput
