import TrackIcon from 'components/icons/TrackIcon'
import WalletIcon from 'components/icons/WalletIcon'
import Popup from 'components/popup'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useState } from 'react'
import { Check, ChevronDown } from 'react-feather'
import { walletAtom } from 'state/atoms'
import { Box, Flex, Text, useColorMode } from 'theme-ui'
import { shortenAddress, stringToColor } from 'utils'
import {
  currentWalletAtom,
  trackedWalletAtom,
  trackedWalletsAtom,
} from '../atoms'
import { colors } from 'theme'

// TODO: Extract total value from data atom
const walletListAtom = atom((get) => {
  const tracked = get(trackedWalletsAtom)
  const connected = get(walletAtom)
  const selected = get(currentWalletAtom)
  let isConnectedIncluded = false
  const walletList: {
    connected: boolean
    current: boolean
    address: string
    shortedAddress: string
  }[] = tracked.map((addr) => {
    const isConnected = addr === connected

    if (isConnected) {
      isConnectedIncluded = true
    }

    return {
      address: addr,
      shortedAddress: shortenAddress(addr),
      current: addr === selected,
      connected: isConnected,
    }
  })

  if (connected && !isConnectedIncluded) {
    walletList.unshift({
      address: connected,
      shortedAddress: shortenAddress(connected),
      current: connected === selected,
      connected: true,
    })
  }

  return walletList.sort((a, b) => (a.current ? 1 : 0))
})

const WalletList = ({ onSelect }: { onSelect(addr: string): void }) => {
  const [colorMode] = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const wallets = useAtomValue(walletListAtom)

  return (
    <Flex sx={{ gap: 2, flexDirection: 'column' }} p={2}>
      {wallets.map((wallet) => (
        <Box
          key={wallet.address}
          variant="layout.verticalAlign"
          sx={{
            cursor: !wallet.current ? 'pointer' : 'inherit',
            border: wallet.current ? '1px solid' : 'none',
            borderColor: 'border',
            borderRadius: '8px',
            minWidth: 260,
            gap: 3,
          }}
          onClick={() => !wallet.current && onSelect(wallet.address)}
          px={3}
          py={2}
        >
          <Box
            sx={{
              height: '24px',
              width: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              backgroundColor: stringToColor(
                wallet.address.toLowerCase(),
                isDarkMode ? 0.8 : 0.2
              ),
            }}
          >
            {wallet.connected ? <WalletIcon /> : <TrackIcon />}
          </Box>
          <Box>
            <Text variant="bold">{wallet.shortedAddress}</Text>
            <Text variant="legend">$0.0</Text>
          </Box>
          <Box ml="auto">
            {wallet.current && <Check fontSize={16} strokeWidth={1.5} />}
          </Box>
        </Box>
      ))}
    </Flex>
  )
}

const WalletSelector = () => {
  const [colorMode] = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const [isVisible, setVisible] = useState(false)
  const current = useAtomValue(currentWalletAtom)
  const connected = useAtomValue(walletAtom)
  const setTrackedWallet = useSetAtom(trackedWalletAtom)

  if (!current) {
    return null
  }

  const isConnectedWallet = current === connected

  const handleSelectWallet = (wallet: string) => {
    setTrackedWallet(wallet)
  }

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<WalletList onSelect={handleSelectWallet} />}
      containerProps={{
        sx: { border: '2px solid', borderColor: 'darkBorder' },
      }}
    >
      <Box
        variant="layout.verticalAlign"
        role="button"
        onClick={() => setVisible(!isVisible)}
        sx={{ cursor: 'pointer' }}
      >
        <Box
          sx={{
            height: '24px',
            width: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            backgroundColor: stringToColor(
              current.toLowerCase(),
              isDarkMode ? 0.8 : 0.2
            ),
          }}
        >
          {isConnectedWallet ? <WalletIcon /> : <TrackIcon />}
        </Box>
        <Text ml="2" variant="bold">
          {isConnectedWallet ? 'Your portfolio' : shortenAddress(current)}
        </Text>
        <Text mx="1" variant="legend">
          ({isConnectedWallet ? 'Connected' : 'Tracked'})
        </Text>
        <ChevronDown strokeWidth={1.5} fontSize={16} />
      </Box>
    </Popup>
  )
}

export default WalletSelector
