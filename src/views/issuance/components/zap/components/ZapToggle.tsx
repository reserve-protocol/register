import { Trans } from '@lingui/macro'
import { useAtom } from 'jotai'
import { Zap as ZapIcon } from 'react-feather'
import { Box, Switch, Text } from 'theme-ui'
import { zapEnabledAtom } from '../state/ui-atoms'

const ZapToggle = () => {
  const [zapEnabled, setEnabled] = useAtom(zapEnabledAtom)

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnabled(e.target.checked)
  }

  return (
    <Box
      variant="layout.verticalAlign"
      mb={zapEnabled ? 0 : 4}
      pb={3}
      mx={3}
      sx={{
        borderBottom: zapEnabled ? 'none' : '1px solid',
        borderColor: 'border',
      }}
    >
      <ZapIcon size={14} />
      <Text ml={2}>
        <Trans>Turn on Zaps to mint from 1 asset</Trans>
      </Text>
      <Box ml="auto">
        <label>
          <Switch defaultChecked={zapEnabled} onChange={handleToggle} />
        </label>
      </Box>
    </Box>
  )
}

export default ZapToggle
