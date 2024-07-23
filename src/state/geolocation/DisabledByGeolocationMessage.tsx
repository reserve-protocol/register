import AlertIcon from 'components/icons/AlertIcon'
import { useAtomValue } from 'jotai'
import { isRTokenMintEnabled } from 'state/geolocation/atoms'
import { Box, BoxProps, Text } from 'theme-ui'

const DisabledByGeolocationMessage = ({ sx, ...props }: BoxProps) => {
  const isEnabled = useAtomValue(isRTokenMintEnabled)

  if (isEnabled.loading || isEnabled.value) {
    return null
  }

  return (
    <Box
      {...props}
      variant="layout.verticalAlign"
      sx={{ ...sx, justifyContent: 'center', gap: 2 }}
    >
      <AlertIcon />
      <Text variant="warning">This feature is not available</Text>
    </Box>
  )
}

export default DisabledByGeolocationMessage
