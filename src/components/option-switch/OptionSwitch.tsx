import { Box, BoxProps, Flex } from 'theme-ui'

interface Props extends Omit<BoxProps, 'onChange'> {
  options: string[]
  error?: boolean[]
  value: number
  onChange(index: number): void
}

const OptionSwitch = ({
  sx = {},
  onChange,
  value,
  error = [],
  options,
  ...props
}: Props) => (
  <Flex
    sx={{ borderRadius: 30, backgroundColor: 'inputBorder', ...sx }}
    padding={1}
    {...props}
  >
    {options.map((option, index) => (
      <Flex
        variant="layout.verticalAlign"
        key={index}
        sx={{
          backgroundColor: value === index ? 'contentBackground' : 'none',
          borderRadius: 30,
          cursor: 'pointer',
          color: error[index] ? 'danger' : 'text',
        }}
        onClick={() => onChange(index)}
        px={4}
        py={2}
      >
        {option}
        {!!error[index] && value !== index && (
          <Box
            ml={2}
            sx={{
              backgroundColor: 'danger',
              height: 10,
              width: 10,
              borderRadius: '100%',
            }}
          />
        )}
      </Flex>
    ))}
  </Flex>
)

export default OptionSwitch
