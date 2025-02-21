import { BoxProps, Box, Text } from 'theme-ui'

interface Props extends BoxProps {
  error?: Error | null
  withName?: boolean
}

const TransactionError = ({ error, withName = true, ...props }: Props) => {
  if (!error) {
    return null
  }

  const messageSplit = error.message.split('\n')
  const message =
    messageSplit.length > 1
      ? messageSplit[0] + ' ' + messageSplit[1]
      : (messageSplit[0] ?? '')

  return (
    <Box {...props}>
      <Text
        variant="error"
        sx={{ whiteSpace: 'break-spaces', wordBreak: 'break-all' }}
      >
        {withName && `${error.name}:`}
        {withName && <br />}
        {message}
      </Text>
    </Box>
  )
}

export default TransactionError
