import { Trans } from '@lingui/macro'
import RTokenSelector from 'components/rtoken-selector'
import useRToken from 'hooks/useRToken'
import { useAtomValue } from 'jotai'
import { AlertCircle } from 'react-feather'
import { rTokenStatusAtom } from 'state/atoms'
import { Box, Text } from 'theme-ui'

const RTokenStatus = () => {
  const rToken = useRToken()
  const { paused, frozen } = useAtomValue(rTokenStatusAtom)

  if ((!paused && !frozen) || !rToken) {
    return null
  }

  return (
    <Box sx={{ display: ['none', 'block'] }}>
      <Box
        variant="layout.verticalAlign"
        ml={3}
        sx={{ color: frozen ? 'danger' : 'warning' }}
      >
        <AlertCircle size={16} />
        <Text ml={2} sx={{ fontSize: 1, textTransform: 'uppercase' }}>
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
