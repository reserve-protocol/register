import { Input, NumericalInput } from 'components'
import { HelpCircle } from 'react-feather'
import { Box, Flex, Text, BoxProps } from 'theme-ui'

interface Props extends Omit<BoxProps, 'onChange'> {
  label: any
  help: any
  placeholder: any
  onChange(value: string): void
  error?: any
  numeric?: boolean
  value: string
}

const Field = ({
  label,
  onChange,
  help,
  value,
  placeholder,
  error,
  numeric,
  ...props
}: Props) => {
  const inputProps = { placeholder, onChange, value }

  return (
    <Box {...props}>
      <Flex mb={1}>
        <Text variant="subtitle" ml={2} sx={{ fontSize: 1 }}>
          {label}
        </Text>
        <Box mx="auto" />
        <HelpCircle />
      </Flex>
      {numeric ? <NumericalInput {...inputProps} /> : <Input {...inputProps} />}
    </Box>
  )
}

export default Field
