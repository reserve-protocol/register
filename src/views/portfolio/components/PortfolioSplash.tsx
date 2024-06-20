import { Button, Input } from 'components'
import SpectaclesIcon from 'components/icons/SpectaclesIcon'
import WalletOutlineIcon from 'components/icons/WalletOutlineIcon'
import { useState } from 'react'
import { Box, Divider, Flex, Image, Text } from 'theme-ui'
import { isAddress } from 'utils'
import VaultPlaceholder from '../assets/vault-placeholder.png'

const TrackWallet = () => {
  const [value, setValue] = useState('')
  const validAddress = isAddress(value)

  const handleTrackWallet = () => {}

  return (
    <Box variant="layout.verticalAlign" sx={{ flexWrap: 'wrap', gap: 3 }}>
      <WalletOutlineIcon fontSize={20} />
      <Text variant="bold" sx={{ whiteSpace: 'nowrap' }}>
        Track anyone Reserve holdings
      </Text>
      <Box sx={{ flexGrow: '1', position: 'relative', minWidth: 360 }}>
        <Input
          sx={{ width: '100%' }}
          variant="smallInput"
          placeholder="Enter wallet address"
          value={value}
          onChange={setValue}
        />
        <Button
          sx={{ position: 'absolute', right: '4px', top: '4px' }}
          small
          disabled={!validAddress}
          onClick={handleTrackWallet}
        >
          Track
        </Button>
      </Box>
    </Box>
  )
}

const PortfolioSplash = () => {
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
            <Button mt="3">Connect wallet</Button>
          </Box>
        </Box>
        <Divider my="5" />
        <TrackWallet />
      </Box>
    </Flex>
  )
}

export default PortfolioSplash
