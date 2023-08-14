import { BoxProps, Box, Text } from 'theme-ui'

interface Props extends BoxProps {
  error?: Error | null
}

const TransactionError = ({ error, ...props }: Props) => {
  if (!error) {
    return null
  }

  return (
    <Box {...props}>
      <Text
        variant="error"
        sx={{ whiteSpace: 'break-spaces', wordBreak: 'break-all' }}
      >
        {error.name}:
        <br />
        {error.message.split('\n')[0]}
      </Text>
    </Box>
  )
}

export default TransactionError
