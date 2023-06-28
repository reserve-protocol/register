import { Trans } from '@lingui/macro'
import { useAtom, useAtomValue } from 'jotai'
import { Zap as ZapIcon } from 'react-feather'
import { Box, Switch, Text } from 'theme-ui'
import mixpanel from 'mixpanel-browser'
import { zapEnabledAtom } from '../state/ui-atoms'
import { rTokenAtom } from 'state/atoms'

const ZapToggle = () => {
  const [zapEnabled, setEnabled] = useAtom(zapEnabledAtom)
  const rToken = useAtomValue(rTokenAtom)

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
      <Box ml="auto">
        <label>
          <Switch
            sx={{ background: 'secondary' }}
            defaultChecked={zapEnabled}
            onChange={handleToggle}
          />
        </label>
      </Box>
    </Box>
  )
}

export default ZapToggle
