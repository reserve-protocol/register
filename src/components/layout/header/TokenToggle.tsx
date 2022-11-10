import { Trans } from '@lingui/macro'
import RTokenSelector from 'components/rtoken-selector'
import { useAtomValue } from 'jotai/utils'
import { AlertCircle } from 'react-feather'
import { rTokenStatusAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'
import { RTOKEN_STATUS } from 'utils/constants'

const RTokenStatus = () => {
  const status = useAtomValue(rTokenStatusAtom)

  if (status === RTOKEN_STATUS.SOUND) {
    return null
  }

  return (
    <Box ml={3} sx={{ display: ['none', 'block'] }}>
      <Box
        variant="layout.verticalAlign"
        sx={{ color: status === RTOKEN_STATUS.FROZEN ? 'danger' : 'warning' }}
      >
        <AlertCircle size={18} />
        <Text ml={2}>
          {status === RTOKEN_STATUS.FROZEN ? (
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
