import { AlertCircle } from 'react-feather'
import { Box, BoxProps, Text } from 'theme-ui'

interface Props extends BoxProps {
  text: string
}

const Alert = ({ text, ...props }: Props) => (
  <Box
    p={3}
    variant="layout.verticalAlign"
    sx={{
      borderRadius: '8px',
      color: '#fff',
      backgroundColor: '#FF3232',
      opacity: 50,
    }}
    {...props}
  >
    <AlertCircle />
    <Text ml={3}>{text}</Text>
  </Box>
)

export default Alert
