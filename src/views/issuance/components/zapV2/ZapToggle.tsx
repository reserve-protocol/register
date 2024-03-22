import { Trans } from '@lingui/macro'
import { Zap as ZapIcon } from 'react-feather'
import { Box, Switch, Text } from 'theme-ui'

const ZapToggle = ({
  zapEnabled,
  setZapEnabled,
}: {
  zapEnabled: boolean
  setZapEnabled: (value: boolean) => void
}) => {
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setZapEnabled(e.target.checked)
  }

  return (
    <Box
      variant={zapEnabled ? 'none' : 'layout.borderBox'}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      mb={zapEnabled ? [1, 2] : [1, 4]}
      p={3}
      mt={[2, 0]}
    >
      <Box variant="layout.verticalAlign">
        <ZapIcon size={18} />
        <Text ml={2}>
          <Trans>Turn on Zaps to mint using 1 asset</Trans>
        </Text>
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
