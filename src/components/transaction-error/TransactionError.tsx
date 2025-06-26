import { BoxProps, Box, Text } from 'theme-ui'

interface Props extends BoxProps {
  error?: Error | null
  withName?: boolean
}

const TransactionError = ({ error, withName = true, ...props }: Props) => {
  if (!error) {
    return null
  }
  let parsed = false

  const messageSplit = error.message.split('\n')
  let message =
    messageSplit.length > 1
      ? messageSplit[0] + ' ' + messageSplit[1]
      : (messageSplit[0] ?? '')

  if (message.includes('0x168cdd18')) {
    parsed = true
    message =
      'Proposal cannot be executed while another auction is currently running'
  }

  return (
    <Box {...props}>
      <Text
        variant="error"
        sx={{
          whiteSpace: 'break-spaces',
          fontSize: 1,
          wordBreak: parsed ? 'break-word' : 'break-all',
        }}
      >
        {withName && `${error.name}:`}
        {withName && <br />}
        {message}
      </Text>
    </Box>
  )
}

export default TransactionError
