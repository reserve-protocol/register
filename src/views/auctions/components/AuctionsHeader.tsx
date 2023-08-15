import { Trans } from '@lingui/macro'
import { Button } from 'components'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { isModuleLegacyAtom } from 'state/atoms'
import { Box, ButtonProps, Text } from 'theme-ui'
import { TradeKind, auctionPlatformAtom, auctionSidebarAtom } from '../atoms'
import { useEffect } from 'react'

interface ToggleButtonProps extends ButtonProps {
  selected: boolean
}

const ToggleButton = ({ selected, children, ...props }: ToggleButtonProps) => {
  return (
    <Button
      small
      sx={{
        border: '2px solid',
        backgroundColor: 'transparent',
        color: selected ? 'primary' : 'lightText',
      }}
      {...props}
    >
      <Box variant="layout.verticalAlign">
        {selected && (
          <Box
            sx={{ height: '6px', width: '6px', backgroundColor: 'primary' }}
            mr={2}
          />
        )}
        {children}
      </Box>
    </Button>
  )
}

// TODO: When tokens upgrade to 3.0, default to dutch auctions
const AuctionsHeader = () => {
  const toggleSidebar = useSetAtom(auctionSidebarAtom)
  const [platform, setPlatform] = useAtom(auctionPlatformAtom)
  const { auctions: isLegacy } = useAtomValue(isModuleLegacyAtom)

  // Make sure platform = batch auctions for legacy tokens
  useEffect(() => {
    if (platform === TradeKind.DutchTrade && isLegacy) {
      setPlatform(TradeKind.BatchTrade)
    }
  }, [platform, isLegacy])

  return (
    <Box variant="layout.verticalAlign">
      {!isLegacy && (
        <>
          <ToggleButton
            selected={TradeKind.BatchTrade === platform}
            onClick={() => setPlatform(TradeKind.BatchTrade)}
            mx={3}
          >
            <Trans>Batch auctions</Trans>
          </ToggleButton>
          <ToggleButton
            selected={TradeKind.DutchTrade === platform}
            variant="bordered"
            onClick={() => setPlatform(TradeKind.DutchTrade)}
          >
            <Trans>Dutch auctions</Trans>
          </ToggleButton>
        </>
      )}

      <Button ml="auto" mr={3} variant="muted" small onClick={toggleSidebar}>
        <Text>
          <Trans>Check for auctions</Trans>
        </Text>
      </Button>
    </Box>
  )
}

export default AuctionsHeader
