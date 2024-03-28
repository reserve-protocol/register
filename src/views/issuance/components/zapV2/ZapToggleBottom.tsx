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
      ml={[4, 7, 7, 7]}
      mr={[0, 7, 7, 4]}
    >
      <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
        <AsteriskIcon />
        <Text>Having issues minting? Zaps are in beta</Text>
        <Help
          content="The Zap Mint feature is in beta and may result in unexpected behavior.
      Proceed with caution."
          mt={1}
        />
      </Box>
      <Button
        backgroundColor="muted"
        color="text"
        small
        onClick={() => setZapEnabled(false)}
      >
        Switch to manual minting
      </Button>
    </Box>
  )
}

export default ZapToggleBottom
