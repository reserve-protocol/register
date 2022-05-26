import { Flex, Text, Spinner, BoxProps } from 'theme-ui'

interface Props extends BoxProps {
  text: string
}

const TextPlaceholder = ({ text, sx, ...props }: Props) => (
  <Flex
    sx={{
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontSize: 1,
      ...sx,
    }}
    {...props}
  >
    <Spinner size={36} />
    <Text variant="legend" mt={3}>
      {text}
    </Text>
  </Flex>
)

export default TextPlaceholder
