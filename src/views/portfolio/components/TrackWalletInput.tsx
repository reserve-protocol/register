import { Button, Input } from 'components'
import WalletOutlineIcon from 'components/icons/WalletOutlineIcon'
import { atom, useSetAtom } from 'jotai'
import { useState } from 'react'
import { Box, BoxProps } from 'theme-ui'
import { isAddress } from 'utils'
import { trackedWalletAtom, trackedWalletsAtom } from '../atoms'

const trackNewWalletAtom = atom(null, (get, set, address: string) => {
  const trackedWallets = get(trackedWalletsAtom)

  if (!trackedWallets.includes(address)) {
    set(trackedWalletsAtom, [...trackedWallets, address])
  }

  set(trackedWalletAtom, address)
})

const TrackWalletInput = ({ sx, ...props }: BoxProps) => {
  const [value, setValue] = useState('')
  const validAddress = isAddress(value)
  const trackWallet = useSetAtom(trackNewWalletAtom)

  const handleTrackWallet = () => {
    if (validAddress) {
      trackWallet(validAddress)
      setValue('')
    }
  }

  return (
    <Box
      sx={{ flexGrow: '1', position: 'relative', minWidth: 360, ...sx }}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <WalletOutlineIcon />
      </Box>
      <Input
        variant="smallInput"
        sx={{ width: '100%', pl: '32px', pr: '70px', fontSize: 1 }}
        placeholder="Enter address to track"
        value={value}
        onChange={setValue}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleTrackWallet()
          }
        }}
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
  )
}

export default TrackWalletInput
