import { Trans } from '@lingui/macro'
import { useAtom } from 'jotai'
import { Box, BoxProps, Checkbox, Text } from 'theme-ui'

import useRToken from 'hooks/useRToken'
import { pluginsDisplayModeAtom } from './atoms'

const DisplayMode = (props: BoxProps) => {
  const rToken = useRToken()
  const [displayMode, setDisplayMode] = useAtom(pluginsDisplayModeAtom)

  return (
    <Box variant="layout.verticalAlign" mx={4} {...props}>
      <Text variant="label">
        <Trans>Display only {rToken?.symbol} related collaterals</Trans>
      </Text>
      <Box ml="auto">
        <label>
          <Checkbox
            defaultChecked={displayMode}
            onChange={() => setDisplayMode(!displayMode)}
          />
        </label>
      </Box>
    </Box>
  )
}

export default DisplayMode
