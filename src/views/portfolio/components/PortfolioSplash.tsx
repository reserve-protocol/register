import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Button } from 'components'
import SpectaclesIcon from 'components/icons/SpectaclesIcon'
import WalletOutlineIcon from 'components/icons/WalletOutlineIcon'
import { Box, Divider, Flex, Image, Text } from 'theme-ui'
import VaultPlaceholder from '../assets/vault-placeholder.png'
import TrackWalletInput from './TrackWalletInput'

const TrackWallet = () => {
  return (
    <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap', gap: 3 }}>
      <WalletOutlineIcon fontSize={20} />
      <Text variant="bold" sx={{ whiteSpace: 'nowrap' }}>
        Track anyone Reserve holdings
      </Text>
      <TrackWalletInput />
    </Box>
  )
}

const PortfolioSplash = () => {
  const { openConnectModal } = useConnectModal()

  return (
    <Flex
      p={4}
      sx={{
        border: '2px dashed',
        borderColor: 'primary',
        borderRadius: '20px',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 220px)',
      }}
    >
      <Box>
        <Box variant="layout.verticalAlign">
          <Image src={VaultPlaceholder} sx={{ display: ['none', 'block'] }} />
          <Box ml={[0, 5]} sx={{ maxWidth: 440 }}>
            <Box mb="2" sx={{ fontSize: 5, color: 'primary' }}>
              <SpectaclesIcon />
            </Box>
            <Text
              variant="title"
              sx={{ color: 'primary', fontSize: 5, lineHeight: '40px' }}
            >
              Insight into your RToken related holdings
            </Text>
            <Text mt={2} as="p">
              View native and bridged token amounts/values + your staked
              positions.
            </Text>
            <Button mt="3" variant="accentAction" onClick={openConnectModal}>
              Connect wallet
            </Button>
          </Box>
        </Box>
        <Divider my="5" />
        <TrackWallet />
      </Box>
    </Flex>
  )
}

export default PortfolioSplash
