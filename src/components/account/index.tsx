import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Staking from '@/views/index-dtf/overview/components/staking'
import PortfolioSidebar from '@/views/portfolio/sidebar'
import { Trans } from '@lingui/macro'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import ChainLogo from 'components/icons/ChainLogo'
import { Power, Wallet } from 'lucide-react'

/**
 * Account
 *
 * Handles wallet interaction
 */
const Account = () => (
  <ConnectButton.Custom>
    {({ account, chain, openConnectModal, mounted }) => {
      const ready = mounted
      const connected = ready && account && chain

      return (
        <div
          className={cn(
            !ready && 'opacity-0 pointer-events-none select-none'
          )}
          aria-hidden={!ready}
        >
          {(() => {
            if (!connected) {
              return (
                <Button
                  data-testid="header-connect-btn"
                  variant="accent"
                  onClick={openConnectModal}
                  className="px-3.5 py-1 rounded-full font-normal"
                >
                  <span className="flex md:hidden items-center py-1">
                    <Power size={16} />
                  </span>
                  <span className="hidden md:block text-base">
                    <Trans>Connect</Trans>
                  </span>
                </Button>
              )
            }

            return (
              <>
                <PortfolioSidebar>
                  <div data-testid="header-wallet" className="flex items-center justify-center cursor-pointer text-base">
                    <div className="flex items-center relative">
                      <div className="flex items-center absolute lg:relative -bottom-1 -right-1 lg:bottom-0 lg:right-0">
                        <ChainLogo
                          chain={chain.id}
                          className="w-3 h-3 lg:w-4 lg:h-4"
                        />
                      </div>

                      <span className="hidden lg:inline ml-2">
                        {account.displayName}
                      </span>

                      <div className="lg:ml-3 p-2 border border-border rounded-xl">
                        <Wallet size={16} />
                      </div>
                    </div>
                  </div>
                </PortfolioSidebar>
                <Staking />
              </>
            )
          })()}
        </div>
      )
    }}
  </ConnectButton.Custom>
)

export default Account
