import { Button } from 'components'
import Help from 'components/help'
import AsteriskIcon from 'components/icons/AsteriskIcon'
import { Box, Text } from 'theme-ui'

const ZapToggleBottom = ({
  setZapEnabled,
}: {
  setZapEnabled: (value: boolean) => void
}) => {
  return (
    <Box
      variant="layout.verticalAlign"
      sx={{
        gap: 3,
        justifyContent: 'space-between',
        flexDirection: ['column', 'row', 'row', 'row'],
        alignItems: ['flex-start', 'center', 'center', 'center'],
      }}
      mb="4"
      ml={[4, 7, 7, 7]}
      mr={[0, 7, 7, 4]}
    >
      <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
        <AsteriskIcon />
        <Text>Having issues minting? Zaps are in beta</Text>
        <Help
          content="Zap Mint is currently in beta. After approval, you might encounter non-executable routes, especially with Base assets. This will not affect your funds, but may require a retry. We're working to enhance route discovery for a smoother experience."
          mt={1}
        />
      </Box>
      <Button
        backgroundColor="muted"
        color="text"
        small
        onClick={() => setZapEnabled(false)}
        data-testid="manual-minting-button"
      >
        Switch to manual minting
      </Button>
    </Box>
  )
}

export default ZapToggleBottom
