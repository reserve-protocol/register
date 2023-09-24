import { Trans } from '@lingui/macro'
import { Box } from 'theme-ui'
import { isWrappingAtom } from './atoms'
import { useAtom } from 'jotai'

const WrapTypeToggle = () => {
  const [wrapping, setWrapping] = useAtom(isWrappingAtom)

  return (
    <Box
      variant="layout.verticalAlign"
      mx={4}
      sx={{
        cursor: 'pointer',
        borderRadius: 12,
        overflow: 'hidden',
        padding: 1,
        border: '1px solid',
        borderColor: 'inputBorder',
        flex: 'none',
      }}
      mb={4}
    >
      <Box
        p={1}
        sx={{
          flexGrow: 1,
          textAlign: 'center',
          borderRadius: 8,
          backgroundColor: wrapping ? 'inputBorder' : 'none',
          color: 'text',
        }}
        onClick={() => setWrapping(true)}
      >
        <Trans>Wrap collaterals</Trans>
      </Box>
      <Box
        p={1}
        sx={{
          flexGrow: 1,
          textAlign: 'center',
          borderRadius: 8,
          backgroundColor: !wrapping ? 'inputBorder' : 'none',
          color: 'text',
        }}
        onClick={() => setWrapping(false)}
      >
        <Trans>Unwrap collaterals</Trans>
      </Box>
    </Box>
  )
}

export default WrapTypeToggle
