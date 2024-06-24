import { NumericalInput } from 'components'
import Help from 'components/help'
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
  hasThrottle?: boolean
}

interface MaxLabelProps {
  text: string
  compact: boolean
  clickable: boolean
  help?: string
  handleClick: () => void
}

export const MaxLabel = ({
  text,
  compact,
  clickable,
  help = '',
  handleClick,
}: MaxLabelProps) => (
  <Box variant="layout.verticalAlign">
    <Text
      onClick={handleClick}
      as={clickable ? 'a' : 'span'}
      variant={clickable ? 'a' : 'legend'}
      sx={{ display: 'block', fontSize: compact ? 1 : 2 }}
      ml={'auto'}
      mr={2}
    >
      {text}
    </Text>
    {!!help && <Help content={help} />}
  </Box>
)

const TransactionInput = ({
  title = '',
  placeholder = '',
  amountAtom,
  maxAmount,
  disabled = false,
  compact = true,
  autoFocus = false,
  hasThrottle = false,
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
      data-testid={`${title.toLowerCase()}-max-amount`}
    >
      Max: {formatCurrency(+maxAmount, 5)}
    </Text>
  )

  return (
    <Box {...props}>
      <Box variant="layout.verticalAlign" mb={2}>
        <Text as="label" variant="legend" ml={3}>
          {title}
        </Text>
        {compact && <Box ml="auto">{maxLabel}</Box>}
      </Box>
      <NumericalInput
        disabled={disabled}
        placeholder={placeholder}
        value={amount as string}
        onChange={setAmount}
        autoFocus={autoFocus}
      />
      {!compact && (
        <Flex mt={2} ml="auto">
          {maxLabel}
        </Flex>
      )}
    </Box>
  )
}

export default TransactionInput
