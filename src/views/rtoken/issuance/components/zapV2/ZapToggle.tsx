import { Trans } from '@lingui/macro'
import Help from 'components/help'
import { Zap as ZapIcon } from 'lucide-react'
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
      <Box
        ml="auto"
        mr={3}
        sx={{ color: 'warning' }}
        variant="layout.verticalAlign"
      >
        Beta
        <Help
          ml={1}
          content="Zap Mint is currently in beta. After approval, you might encounter non-executable routes, especially with Base assets. This will not affect your funds, but may require a retry. We're working to enhance route discovery for a smoother experience."
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
