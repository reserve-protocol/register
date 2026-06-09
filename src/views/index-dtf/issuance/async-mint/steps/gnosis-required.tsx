import { Button } from '@/components/ui/button'
import useAtomicBatch from '@/hooks/use-atomic-batch'
import { cn } from '@/lib/utils'
import { useAccountModal, useConnectModal } from '@rainbow-me/rainbowkit'
import { useSetAtom } from 'jotai'
import {
  ArrowLeft,
  ArrowUpRight,
  Info,
  MoveRight,
  OctagonAlert,
  Combine,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { wizardStepAtom } from '../atoms'

const LEARN_MORE_URL = 'https://docs.safe.global/home/what-is-safe'

const ProcessStep = ({ label }: { label: string }) => (
  <div className="flex shrink-0 items-center">
    <span className="whitespace-nowrap text-sm font-medium text-foreground">
      {label}
    </span>
  </div>
)

const ProcessArrow = () => (
  <div className="flex shrink-0 items-center justify-center">
    <MoveRight size={16} className="text-muted-foreground" />
  </div>
)

const GnosisRequired = () => {
  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()
  const { isConnected } = useAccount()
  const { atomicSupported, isLoading } = useAtomicBatch()
  const setStep = useSetAtom(wizardStepAtom)
  const [showRequirements, setShowRequirements] = useState(false)
  const [requirementsCardHeight, setRequirementsCardHeight] = useState<number>()
  const cardStackRef = useRef<HTMLDivElement>(null)
  const title = showRequirements
    ? 'Smart Account Required'
    : 'Automated Mint / Redeem'
  const body = showRequirements
    ? 'Automated minting and redemption require a wallet with smart account support. Hardware Wallets are not supported.'
    : 'Mint large USDC amounts through batched CoW Swap orders, or redeem DTFs into the underlying assets. Recommended for market makers or transactions over 50,000 USDC.'
  const verifiedWallets = (
    <div>
      <p className="text-md text-primary dark:text-foreground font-medium mb-4">
        Known supported wallets
      </p>
      <div className="flex items-center gap-2">
        <a
          href="https://metamask.io/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open MetaMask website"
          className="rounded-[8px]"
        >
          <img
            src="/svgs/Metamask.svg"
            alt=""
            className="size-8 rounded-[8px] border border-input shadow-md"
          />
        </a>
        <a
          href="https://www.ambire.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Ambire website"
          className="rounded-[8px]"
        >
          <img
            src="/svgs/Ambire.svg"
            alt=""
            className="size-8 rounded-[8px] border border-input shadow-md"
          />
        </a>
        <a
          href="https://safe.global/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open Safe website"
          className="rounded-[8px]"
        >
          <img
            src="/svgs/Safe.svg"
            alt=""
            className="size-8 rounded-[8px] border border-input shadow-md"
          />
        </a>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Note:</span> Some wallets,
        like MetaMask, need smart accounts enabled.
      </p>
    </div>
  )
  const swapGuidance = (
    <div className="flex flex-col p-2 bg-card/50">
      <div className="flex items-center rounded-full p-2 bg-card justify-between border border-amber-700/20 dark:border-amber-300/25">
        <div className="flex w-fit items-center h-8 gap-2 text-amber-700 dark:text-amber-300">
          <div className="flex items-center rounded-full justify-center h-8 w-8 bg-amber-700/15 border border-amber-700/20 dark:bg-amber-300/10 dark:border-amber-300/25">
            <Info size={20} strokeWidth={1.5} />
          </div>
          <p className="text-md font-medium">Most users should use Swap</p>
        </div>
        <Button
          asChild
          size="sm"
          className="h-8 w-fit shrink-0 rounded-full px-3 !transition-none"
        >
          <Link to=".." relative="path">
            Use Swap
          </Link>
        </Button>
      </div>
      <div className="flex flex-col px-4 pb-3 pt-4 gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">Before using automated minting</p>
          <p className="text-sm text-muted-foreground">
            Automated minting is an advanced feature. For most people, simple
            swaps are recommended.
          </p>
        </div>
      </div>
    </div>
  )

  const processIllustration = (
    <div className="px-5 pb-3 mt-1">
      <div className="flex gap-2">
        <ProcessStep label="You fund" />
        <ProcessArrow />
        <ProcessStep label="CoW routes" />
        <ProcessArrow />
        <ProcessStep label="Assets arrive" />
        <ProcessArrow />
        <ProcessStep label="You mint" />
      </div>
    </div>
  )

  const handleShowRequirements = () => {
    if (isConnected && atomicSupported) {
      setStep('configure')
      return
    }

    setRequirementsCardHeight(
      cardStackRef.current?.getBoundingClientRect().height
    )
    setShowRequirements(true)
  }

  return (
    <div className="w-full">
      <div className="flex min-h-[calc(100vh-136px)] w-full items-center lg:min-h-[calc(100vh-100px)]">
        <div
          ref={cardStackRef}
          className="w-full max-w-[468px] mx-auto flex flex-col rounded-4xl border-2 border-card overflow-hidden"
        >
          {!showRequirements && swapGuidance}
          <div
            className={cn(
              'p-1 overflow-hidden w-full flex flex-col transition-[min-height] duration-700 ease-out',
              showRequirements ? 'bg-background/70' : 'bg-card'
            )}
            style={
              showRequirements && requirementsCardHeight
                ? { minHeight: requirementsCardHeight }
                : undefined
            }
          >
            <div className="flex flex-1 flex-col">
              {/* Title + description */}
              <div
                className={cn(
                  'mt-5 flex flex-col gap-1',
                  showRequirements && 'flex-1'
                )}
              >
                {showRequirements ? (
                  <div className="mb-auto flex items-center justify-between gap-3 px-5 pb-10">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-8 rounded-full !transition-none"
                      aria-label="Back to automated minting introduction"
                      onClick={() => setShowRequirements(false)}
                    >
                      <ArrowLeft size={16} />
                    </Button>
                    {isConnected && (
                      <div
                        className={cn(
                          'h-8 px-3 rounded-full flex items-center gap-1 text-sm font-light',
                          'border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-300'
                        )}
                      >
                        <OctagonAlert size={16} strokeWidth={1.5} />
                        <span>Incompatible wallet</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 px-5 mb-[64px]">
                      <Combine size={16} strokeWidth={1.5} />
                      <p className="text-md">Advanced</p>
                    </div>
                    <h2 className="text-xl font-semibold px-5 mb-1 text-foreground">
                      {title}
                    </h2>
                    <p className="text-muted-foreground font-light px-5 mb-1 max-w-[435px]">
                      {body}
                    </p>
                    {processIllustration}
                  </>
                )}
                {showRequirements && (
                  <>
                    <h2 className="text-xl font-semibold px-5 mb-1 mt-8 text-amber-700 dark:text-amber-300">
                      {title}
                    </h2>
                    <p className="text-muted-foreground font-light px-5 mb-2 max-w-[435px]">
                      {body}
                    </p>
                  </>
                )}
                {showRequirements ? (
                  <div className="text-base bg-card rounded-3xl overflow-hidden mt-1">
                    {isConnected ? (
                      <div>
                        <div className="p-5">{verifiedWallets}</div>
                        <div className="flex flex-col gap-2 sm:flex-row p-2 pt-0">
                          <Button
                            size="lg"
                            className="h-[49px] rounded-xl sm:flex-[2] !transition-none"
                            onClick={openAccountModal}
                          >
                            Switch wallet
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-[49px] rounded-xl px-1 text-primary hover:text-primary sm:flex-1 !transition-none"
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
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="p-5">{verifiedWallets}</div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row p-2 pt-0">
                          <Button
                            size="lg"
                            className="h-[49px] rounded-xl sm:flex-[2] !transition-none"
                            onClick={openConnectModal}
                          >
                            Connect Wallet
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="h-[49px] rounded-xl px-1 text-primary hover:text-primary sm:flex-1 !transition-none"
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
                ) : (
                  <div className="p-1">
                    <Button
                      size="lg"
                      className="h-[49px] w-full rounded-2xl bg-foreground dark:bg-foreground/10 dark:text-foreground !transition-none"
                      onClick={handleShowRequirements}
                      disabled={isConnected && isLoading}
                    >
                      {isConnected && isLoading
                        ? 'Checking wallet...'
                        : 'Continue'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GnosisRequired
