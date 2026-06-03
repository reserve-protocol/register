import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ArrowUpRight, OctagonAlert, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'

const LEARN_MORE_URL = 'https://docs.safe.global/home/what-is-safe'

const GnosisRequired = () => {
  const { openConnectModal } = useConnectModal()
  const { isConnected } = useAccount()
  const title = isConnected
    ? 'This account cannot batch orders'
    : 'Mint with automated collateral trades'
  const body =
    'Automated minting creates multiple CoW Swap orders in one transaction before minting.'
  const verifiedWallets = (
    <div>
      <p className="text-md text-primary font-medium mb-1">
        Known supported wallets
      </p>
      <p>Metamask · Safe · Ambire · Coinbase Smart Wallet</p>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="font-medium text-amber-900 dark:text-amber-300">
          Note:
        </span>{' '}
        Some wallets, like MetaMask, need smart accounts enabled.
        Hardware-wallet accounts are not supported.
      </p>
    </div>
  )
  const swapGuidance = (
    <div className="flex items-end justify-between gap-4">
      <div className="flex gap-3 text-primary">
        <div>
          <p className="text-sm font-medium text-primary mb-4">
            Recommended path
          </p>
          <p className="text-md font-medium text-foreground">
            Most users should use Swap
          </p>
          <p className="text-md text-muted-foreground">
            Simpler and works with standard wallets.
          </p>
        </div>
      </div>
      <Button
        asChild
        size="sm"
        variant="outline"
        className="h-8 shrink-0 rounded-full border border-primary/30 px-3 bg-card text-primary"
      >
        <Link to=".." relative="path">
          Use Swap
        </Link>
      </Button>
    </div>
  )
  const automatedRequirement = (
    <div>
      <p className="text-md font-medium text-amber-900 dark:text-amber-300">
        {isConnected
          ? 'Connect a wallet with smart account support'
          : 'Connect a wallet with smart account support'}
      </p>
    </div>
  )

  return (
    <div className="w-full">
      <div className="flex min-h-[calc(100vh-136px)] w-full items-center lg:min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-[468px] mx-auto flex flex-col gap-2">
          <div className="bg-muted rounded-4xl p-1">
            <div className="bg-background rounded-3xl p-5">{swapGuidance}</div>
          </div>
          <div className="bg-secondary rounded-4xl p-1 w-full">
            <div className="flex flex-col">
              <div className="flex flex-col">
                {isConnected && (
                  <>
                    {/* Header: icons + badge */}
                    <div className="flex items-center justify-between p-5">
                      <div
                        className={cn(
                          'h-8 px-3 rounded-full flex items-center gap-1 text-sm font-light',
                          'border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-300'
                        )}
                      >
                        <OctagonAlert size={16} strokeWidth={1.5} />
                        <span>Smart account required</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Title + description */}
                <div
                  className={cn(
                    'flex flex-col gap-1',
                    isConnected ? 'mt-12' : 'mt-4'
                  )}
                >
                  {!isConnected && (
                    <p className="text-sm font-medium text-primary mb-10 px-5">
                      Advanced path
                    </p>
                  )}
                  <h2
                    className={cn(
                      'text-xl font-semibold px-5',
                      isConnected
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-primary dark:text-foreground'
                    )}
                  >
                    {title}
                  </h2>
                  <p className="text-muted-foreground font-light px-5">
                    {body}
                  </p>
                  <div className="text-base bg-background rounded-3xl overflow-hidden mt-3">
                    {isConnected ? (
                      <div>
                        <div className="bg-secondary ">
                          <div className="p-5 bg-amber-500/25 border-b border-secondary dark:bg-amber-300/15">
                            {automatedRequirement}
                          </div>
                        </div>

                        <div className="p-5">{verifiedWallets}</div>
                        <div className="flex flex-col gap-1 p-2 pt-0 sm:flex-row">
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="w-full h-[49px] rounded-xl text-primary hover:text-primary"
                          >
                            <a
                              href={LEARN_MORE_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              How to continue
                              <ArrowUpRight size={16} className="ml-1" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="bg-secondary ">
                            <div className="p-5 bg-amber-500/25 dark:bg-amber-300/15">
                              {automatedRequirement}
                            </div>
                          </div>
                          <div className="p-5">{verifiedWallets}</div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row p-2 pt-0">
                          <Button
                            size="lg"
                            className="h-[49px] rounded-xl sm:flex-[2]"
                            onClick={openConnectModal}
                          >
                            Connect Wallet
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-[49px] rounded-xl px-1  text-primary hover:text-primary sm:flex-1"
                          >
                            <a
                              href={LEARN_MORE_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Learn More
                              <ArrowUpRight size={16} className="ml-1" />
                            </a>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GnosisRequired
