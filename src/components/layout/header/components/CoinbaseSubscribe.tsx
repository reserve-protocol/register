import Button from 'components/button'
import { CoinbaseIcon } from 'components/icons/logos'
import { useAtomValue } from 'jotai'
import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'react-feather'
import { walletAtom } from 'state/atoms'
import { Box, IconButton } from 'theme-ui'

const RESERVE_ADDRESS = '0x5587ecB103EA317F08e1d334b0F2556e6223F45f'

const CoinbaseSubscribe = () => {
  const [isSubscribed, setISubscribed] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const account = useAtomValue(walletAtom)

  const handleSubscribe = () => {
    window.CBWSubscribe.toggleSubscription()
  }

  useEffect(() => {
    // Only init when there is an account connected to avoid triggering connection
    if (
      account &&
      window.CBWSubscribe &&
      !window.CBWSubscribe.subscriptionHandler
    ) {
      console.log('entered')
      window.CBWSubscribe.createSubscriptionUI({
        // Address user will be subscribing to.
        partnerAddress: RESERVE_ADDRESS,
        partnerName: 'Reserve explorer',
        // Title for subscribe modal. See pictures below.
        modalTitle: 'Stay connected with Reserve!',
        // Description title for the subscribe modal. See pictures below.
        modalBody: `Subscribe to Coinbase Wallet notifications and never miss out on new RTokens, DeFi yield updates, Governance alerts and more!`,
        onSubscriptionChange: setISubscribed,
        onLoading: setIsLoading,
      })
    }
  }, [window.CBWSubscribe, account])

  if (isLoading) {
    return null
  }

  return (
    <Box mr="2" sx={{ display: ['none', 'none', 'block'] }}>
      <IconButton
        p="1"
        sx={{
          cursor: 'pointer',
          width: '40px',
          height: '24px',
          border: '1px solid',
          borderColor: 'darkBorder',
          ':hover': { backgroundColor: 'border' },
        }}
        onClick={handleSubscribe}
      >
        <Box variant="layout.verticalAlign">
          <CoinbaseIcon />
          {isSubscribed ? (
            <Bell style={{ marginLeft: 4 }} size="14px" />
          ) : (
            <BellOff style={{ marginLeft: 4 }} size="14px" />
          )}
        </Box>
      </IconButton>
    </Box>
  )
}

export default CoinbaseSubscribe
