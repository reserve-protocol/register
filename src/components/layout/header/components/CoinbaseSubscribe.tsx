import { CoinbaseIcon } from 'components/icons/logos'
import { useAtomValue } from 'jotai'
import { useEffect, useMemo, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { walletAtom } from 'state/atoms'
import { Box, BoxProps, IconButton } from 'theme-ui'
import { useAccount } from 'wagmi'

const RESERVE_ADDRESS = '0x5587ecB103EA317F08e1d334b0F2556e6223F45f'

const CoinbaseSubscribe = (props: BoxProps) => {
  const [isSubscribed, setISubscribed] = useState<boolean>(false)
  const wallet = useAtomValue(walletAtom)
  const account = useAccount()

  const handleSubscribe = () => {
    if (window.CBWSubscribe?.toggleSubscription) {
      window.CBWSubscribe.toggleSubscription()
    }
  }

  const isCoinbaseWallet = useMemo(
    () => account?.connector?.name === 'Coinbase Wallet',
    [account?.connector?.name]
  )

  useEffect(() => {
    // Only init when there is an account connected to avoid triggering connection
    if (
      wallet &&
      window.CBWSubscribe &&
      !window.CBWSubscribe.subscriptionHandler
    ) {
      window.CBWSubscribe.createSubscriptionUI({
        // Address user will be subscribing to.
        partnerAddress: RESERVE_ADDRESS,
        partnerName: 'Reserve explorer',
        // Title for subscribe modal. See pictures below.
        modalTitle: 'Stay connected with Reserve!',
        // Description title for the subscribe modal. See pictures below.
        modalBody: `Subscribe to Coinbase Wallet notifications and never miss out on new RTokens, DeFi yield updates, Governance alerts and more!`,
        onSubscriptionChange: setISubscribed,
      })
    }
  }, [window.CBWSubscribe, wallet])

  if (!wallet || !isCoinbaseWallet) return null

  return (
    <Box {...props}>
      <IconButton
        p="1"
        mr="2"
        sx={{
          cursor: 'pointer',
          width: '56px',
          height: '34px',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: '12px',
          ':hover': { backgroundColor: 'border' },
        }}
        onClick={handleSubscribe}
      >
        <Box variant="layout.verticalAlign">
          <CoinbaseIcon />
          {isSubscribed ? (
            <Bell style={{ marginLeft: 6 }} size="14px" />
          ) : (
            <BellOff style={{ marginLeft: 6 }} size="14px" />
          )}
        </Box>
      </IconButton>
    </Box>
  )
}

export default CoinbaseSubscribe
