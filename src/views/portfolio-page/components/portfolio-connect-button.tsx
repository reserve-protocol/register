import { Button } from '@/components/ui/button'
import { useConnectWithReset } from '@/hooks/use-connect-with-reset'
import { useWalletModal } from '@/hooks/use-wallet-modal'
import { Trans } from '@lingui/react/macro'
import { useAccount } from 'wagmi'

const PortfolioConnectButton = () => {
  const handleConnect = useConnectWithReset()
  const { openConnectModal } = useWalletModal()
  const { isConnected, isReconnecting } = useAccount()

  if (isConnected || isReconnecting) return null

  return (
    <Button
      onClick={() => handleConnect(openConnectModal)}
      className="h-9 rounded-full px-4 py-1 font-medium"
    >
      <span className="block text-sm">
        <Trans>Connect wallet</Trans>
      </span>
    </Button>
  )
}

export default PortfolioConnectButton
