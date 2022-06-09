import { Box, BoxProps, Flex } from 'theme-ui'

interface Props extends Omit<BoxProps, 'onChange'> {
  options: string[]
  value: number
  onChange(index: number): void
}

const OptionSwitch = ({
  sx = {},
  onChange,
  value,
  options,
  ...props
}: Props) => (
  <Flex
    sx={{ borderRadius: 30, backgroundColor: 'inputBorder', ...sx }}
    padding={1}
    {...props}
  >
    {options.map((option, index) => (
      <Box
        sx={{
          backgroundColor: value === index ? 'contentBackground' : 'none',
          borderRadius: 30,
          cursor: 'pointer',
        }}
        onClick={() => onChange(index)}
        px={4}
        py={2}
      >
        {option}
      </Box>
    ))}
  </Flex>
)

export default OptionSwitch
