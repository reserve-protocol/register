import { Button } from '@/components/ui/button'
import { useConnectWithReset } from '@/hooks/use-connect-with-reset'
import { Trans } from '@lingui/react/macro'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const PortfolioConnectButton = () => {
  const handleConnect = useConnectWithReset()

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const ready = mounted
        const connected = ready && account && chain

        if (connected) return null

        return (
          <div
            className={
              ready ? undefined : 'opacity-0 pointer-events-none select-none'
            }
            aria-hidden={!ready}
          >
            <Button
              onClick={() => handleConnect(openConnectModal)}
              className="h-9 rounded-full px-4 py-1 font-medium"
            >
              <span className="block text-sm">
                <Trans>Connect wallet</Trans>
              </span>
            </Button>
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default PortfolioConnectButton
