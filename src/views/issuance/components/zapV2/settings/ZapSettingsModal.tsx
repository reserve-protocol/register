import { Button, Modal } from 'components'
import Help from 'components/help'
import { X } from 'react-feather'
import { Box, Text } from 'theme-ui'
import { useZap } from '../context/ZapContext'
import ZapSettingsCollectDust from './ZapSettingsCollectDust'
import ZapSettingsSlippage from './ZapSettingsSlippage'

const ZapSettingsModal = () => {
  const { setOpenSettings } = useZap()

  return (
    <Modal
      p={0}
      width={360}
      sx={{ border: '3px solid', borderColor: 'borderFocused' }}
      onClose={() => setOpenSettings(false)}
      closeOnClickAway
      hideCloseButton
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          height: '100%',
          backgroundColor: 'backgroundNested',
        }}
      >
        <Box variant="layout.verticalAlign" p={4} mb={[3, 0]} pt={3} pb={0}>
          <Text variant="sectionTitle">Zap Settings</Text>
          <Button
            variant="circle"
            onClick={() => setOpenSettings(false)}
            sx={{ marginLeft: 'auto', backgroundColor: 'transparent' }}
          >
            <X />
          </Button>
        </Box>
        <Box
          p={['12px', '12px']}
          pt={0}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Box>
            <Box
              variant="layout.verticalAlign"
              pl={'12px'}
              pr={4}
              py={2}
              sx={{ justifyContent: 'space-between' }}
            >
              <Text variant="legend">Collect dust?</Text>
              <Help
                content={`Dust is the leftover amount of tokens that cannot be exchanged. If you choose to collect dust, it will be sent back to your wallet. Sending dust back to the wallet will increase transaction fee.`}
              />
            </Box>
            <ZapSettingsCollectDust />
          </Box>
          <Box>
            <Box
              variant="layout.verticalAlign"
              pl={'12px'}
              pr={4}
              py={2}
              sx={{ justifyContent: 'space-between' }}
            >
              <Text variant="legend">Max. mint slippage</Text>
              <Help
                content={`The maximum amount of slippage you are willing to accept when minting. Higher slippage settings will make the transaction more likely to succeed, but may result in fewer tokens minted.`}
              />
            </Box>
            <ZapSettingsSlippage />
            <Box
              variant="layout.verticalAlign"
              sx={{ justifyContent: 'start' }}
              mx="12px"
              mt={1}
            >
              <Text variant="legend" sx={{ fontSize: 12 }}>
                1 bps = 0.01%
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default ZapSettingsModal
