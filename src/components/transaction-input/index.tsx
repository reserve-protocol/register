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
  globalMaxAmount?: number
  help?: string
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

const MaxLabel = ({
  text,
  compact,
  clickable,
  help = '',
  handleClick,
}: MaxLabelProps) => {
  return (
    <Text
      onClick={handleClick}
      as={clickable ? 'a' : 'span'}
      variant={clickable ? 'a' : 'legend'}
      sx={{ display: 'block', fontSize: compact ? 1 : 2 }}
      ml={'auto'}
      mr={2}
    >
      {text} {!!help && <Help content={help} />}
    </Text>
  )
}

const TransactionInput = ({
  title = '',
  placeholder = '',
  amountAtom,
  maxAmount,
  globalMaxAmount = 0,
  help = '',
  disabled = false,
  compact = true,
  autoFocus = false,
  hasThrottle = false,
  ...props
}: TransactionInputProps) => {
  const [amount, setAmount] = useAtom(amountAtom)

  const maxLabel = (
    <MaxLabel
      text={`Max: ${formatCurrency(+maxAmount, 5)}`}
      handleClick={() => setAmount(maxAmount)}
      clickable={true}
      compact
    />
  )

  const throttleLabel = (
    <MaxLabel
      text={`Global Max: ${formatCurrency(+globalMaxAmount, 2)}`}
      handleClick={() => {}}
      help={help}
      clickable={false}
      compact
    />
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
      {!compact ? (
        <Flex mt={2}>{maxLabel}</Flex>
      ) : (
        !!globalMaxAmount && <Flex mt={2}>{throttleLabel}</Flex>
      )}
    </Box>
  )
}

export default TransactionInput
