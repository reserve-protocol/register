import { Trans } from '@lingui/macro'
import useRToken from 'hooks/useRToken'
import { AlertCircle } from 'react-feather'
import { Box, Text } from 'theme-ui'

// Requires rToken to exist for route to render
const Guard = ({ children }: { children: React.ReactNode }) => {
  const rToken = useRToken()

  return !rToken ? (
    <Box sx={{ textAlign: 'center', color: 'lightText' }} mt={8}>
      <AlertCircle />
      <br />
      <Text sx={{ fontSize: 3, fontWeight: 300 }}>
        <Trans>No RToken data</Trans>
      </Text>
    </Box>
  ) : (
    <>{children}</>
  )
}

export default Guard
