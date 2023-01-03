import { Trans } from '@lingui/macro'
import RTokenSelector from 'components/rtoken-selector'
import { useAtomValue } from 'jotai'
import { AlertCircle } from 'react-feather'
import { rTokenStatusAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'

const RTokenStatus = () => {
  const { paused, frozen } = useAtomValue(rTokenStatusAtom)

  if (!paused && !frozen) {
    return null
  }

  return (
    <Box ml={3} sx={{ display: ['none', 'block'] }}>
      <Box
        variant="layout.verticalAlign"
        sx={{ color: frozen ? 'danger' : 'warning' }}
      >
        <AlertCircle size={18} />
        <Text ml={2}>
          {frozen ? (
            <Trans>RToken is frozen</Trans>
          ) : (
            <Trans>RToken is paused</Trans>
          )}
        </Text>
      </Box>
    </Box>
  )
}

const TokenToggle = () => (
  <>
    <RTokenSelector />
    <RTokenStatus />
  </>
)

export default TokenToggle
