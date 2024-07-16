import { Button } from 'components'
import TrackIcon from 'components/icons/TrackIcon'
import WalletIcon from 'components/icons/WalletIcon'
import Popup from 'components/popup'
import { MouseoverTooltip } from 'components/tooltip'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { Check, ChevronDown, X } from 'react-feather'
import { walletAtom } from 'state/atoms'
import { Box, Flex, Text, useColorMode } from 'theme-ui'
import { formatCurrency, shortenAddress, stringToColor } from 'utils'
import {
  allWalletsAccountsAtom,
  allWalletsAtom,
  currentWalletAtom,
  trackedWalletAtom,
  trackedWalletsAtom,
} from '../atoms'
import CopyValue from 'components/button/CopyValue'
import { colors } from 'theme'

const WalletList = ({ onSelect }: { onSelect(addr: string): void }) => {
  const [colorMode] = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const wallets = useAtomValue(allWalletsAtom)
  const accountsData = useAtomValue(allWalletsAccountsAtom)
  const [trackedWallets, setTrackedWallets] = useAtom(trackedWalletsAtom)
  const setTrackedWallet = useSetAtom(trackedWalletAtom)

  const stopTracking = useCallback(
    (address: string, isSelected: boolean) => {
      setTrackedWallets((prev) => prev.filter((addr) => addr !== address))
      if (isSelected) {
        setTrackedWallet(trackedWallets[0] || '')
      }
    },
    [setTrackedWallets, setTrackedWallet, trackedWallets]
  )

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
            minWidth: 280,
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
                isDarkMode ? 0.5 : 0.2
              ),
            }}
          >
            {wallet.connected ? <WalletIcon /> : <TrackIcon />}
          </Box>
          <Box>
            <Box variant="layout.verticalAlign" sx={{ gap: 1 }}>
              <Text variant="bold">{wallet.shortedAddress}</Text>
              <CopyValue
                color={colors.secondaryText}
                value={wallet.address}
                size={14}
              />
            </Box>
            <Text variant="legend">
              $
              {formatCurrency(
                accountsData?.[wallet.address.toLowerCase()]?.holdings || 0
              )}
            </Text>
          </Box>
          <Box variant="layout.verticalAlign" ml="auto" sx={{ gap: 1 }}>
            {wallet.current && wallet.connected && (
              <Check fontSize={14} strokeWidth={1.2} />
            )}
            {!wallet.connected && (
              <MouseoverTooltip text="Stop tracking" placement="right">
                <Button
                  variant="circle"
                  onClick={(e) => {
                    e.stopPropagation()
                    stopTracking(wallet.address, wallet.current)
                  }}
                  sx={{
                    ml: 1,
                    width: '24px',
                    height: '24px',
                  }}
                >
                  <X />
                </Button>
              </MouseoverTooltip>
            )}
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
  const trackedWallets = useAtomValue(trackedWalletsAtom)

  if (!current) {
    return null
  }

  const isConnectedWallet = current === connected

  const handleSelectWallet = (wallet: string) => {
    setTrackedWallet(wallet)
  }

  useEffect(() => {
    if (!trackedWallets.length && !isConnectedWallet) {
      setTrackedWallet('')
    }
  }, [trackedWallets, isConnectedWallet, setTrackedWallet])

  return (
    <Popup
      show={isVisible}
      onDismiss={() => setVisible(false)}
      content={<WalletList onSelect={handleSelectWallet} />}
      containerProps={{
        sx: {
          border: '2px solid',
          borderColor: 'darkBorder',
          background: 'background',
        },
      }}
      zIndex={1}
      placement="bottom-end"
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
              isDarkMode ? 0.5 : 0.2
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
