import { Trans } from '@lingui/macro'
import Help from 'components/help'
import useRToken from 'hooks/useRToken'
import { useAtom } from 'jotai'
import mixpanel from 'mixpanel-browser'
import { Zap as ZapIcon } from 'react-feather'
import { Box, Switch, Text } from 'theme-ui'
import { zapEnabledAtom } from '../state/ui-atoms'

const ZapToggle = () => {
  const [zapEnabled, setEnabled] = useAtom(zapEnabledAtom)
  const rToken = useRToken()

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(e.target.checked)
    mixpanel.track('Toggled Zaps', {
      RToken: rToken?.address.toLowerCase() ?? '',
    })
  }

  return (
    <Box
      variant={zapEnabled ? 'none' : 'layout.borderBox'}
      sx={{ display: 'flex', alignItems: 'center' }}
      mb={zapEnabled ? [1, 2] : [1, 4]}
      p={3}
      mt={[2, 0]}
    >
      <ZapIcon size={18} />
      <Text ml={2}>
        <Trans>Turn on Zaps to mint using 1 asset</Trans>
      </Text>
      <Box
        ml="auto"
        mr={3}
        sx={{ color: 'warning' }}
        variant="layout.verticalAlign"
      >
        Beta
        <Help
          ml={1}
          content="The Zap Mint feature is in beta and may result in unexpected behavior.
      Proceed with caution."
        />
      </Box>

      <label>
        <Switch
          sx={{ background: 'secondary' }}
          defaultChecked={zapEnabled}
          onChange={handleToggle}
        />
      </label>
    </Box>
  )
}

export default ZapToggle
