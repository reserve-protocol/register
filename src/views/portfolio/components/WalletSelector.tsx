import { atom, useAtomValue, useSetAtom } from 'jotai'
import { Box, Flex, Text } from 'theme-ui'
import {
  currentWalletAtom,
  trackedWalletAtom,
  trackedWalletsAtom,
} from '../atoms'
import { walletAtom } from 'state/atoms'
import { shortenAddress } from 'utils'
import WalletIcon from 'components/icons/WalletIcon'
import TrackIcon from 'components/icons/TrackIcon'
import { Check, ChevronDown } from 'react-feather'
import { useState } from 'react'
import Popup from 'components/popup'

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
  const wallets = useAtomValue(walletListAtom)

  return (
    <Flex sx={{ gap: 2, flexDirection: 'column' }} p={3}>
      {wallets.map((wallet) => (
        <Box
          key={wallet.address}
          sx={{ cursor: !wallet.current ? 'pointer' : 'inherit' }}
          onClick={() => !wallet.current && onSelect(wallet.address)}
          variant="layout.verticalAlign"
        >
          {wallet.connected ? <WalletIcon /> : <TrackIcon />}
          <Box ml="3">
            <Text variant="bold">{wallet.shortedAddress}</Text>
            <Text variant="legend">$0.0</Text>
          </Box>
          <Box ml="5">
            {wallet.current && <Check fontSize={16} strokeWidth={1.5} />}
          </Box>
        </Box>
      ))}
    </Flex>
  )
}

const WalletSelector = () => {
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
        {isConnectedWallet ? <WalletIcon /> : <TrackIcon />}
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
