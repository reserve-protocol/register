import { Button } from '@/components/ui/button'
import Help from '@/components/ui/help'
import { chainIdAtom } from '@/state/atoms'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useAtomValue } from 'jotai'
import { ArrowUpRight, OctagonAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

const GnosisRequired = () => {
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
  const [shouldOpenModal, setShouldOpenModal] = useState(false)
  const chainId = useAtomValue(chainIdAtom)

  useEffect(() => {
    if (shouldOpenModal && !isConnected && openConnectModal) {
      openConnectModal()
      setShouldOpenModal(false)
    }
  }, [shouldOpenModal, isConnected, openConnectModal])

  const handleSwitchWallet = async () => {
    try {
      setShouldOpenModal(true)
      await disconnect()
    } catch (error) {
      console.error('Error switching wallets:', error)
      setShouldOpenModal(false)
    }
  }

  return (
    <div className="bg-secondary rounded-3xl p-1 w-full max-w-[468px] mx-auto">
      <div className="flex flex-col min-h-[470px] rounded-[20px]">
        <div className="flex-1 px-6 pt-6 pb-5 flex flex-col justify-between">
          {/* Header: icons + badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center pr-4">
              <img
                src="https://storage.reserve.org/cowswap.svg"
                alt="CoW Protocol"
                className="w-8 h-8 z-[2] border border-secondary rounded-full"
              />
              <img
                src="https://storage.reserve.org/universal.svg"
                alt="Universal Protocol"
                className="w-8 h-8 -ml-4 z-[1]"
              />
            </div>
            <div className="h-8 px-3 bg-background rounded-full flex items-center gap-1 text-sm font-light">
              <OctagonAlert size={16} strokeWidth={1.5} />
              <span>Gnosis Safe Required</span>
              <Help
                size={16}
                content="This feature uses atomic batch transactions which require a Gnosis Safe wallet."
                className="text-muted-foreground/80"
              />
            </div>
          </div>

          {/* Title + description */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-semibold text-primary max-w-[306px]">
              Get better prices by accessing off-chain liquidity
            </h2>
            <p className="text-base font-light">
              Automated Slow Mints can provide better quotes for minting or
              redeeming a DTF, especially when dealing with significant amounts
              of capital or DTFs with bridged or low DEX liquidity collateral
              assets.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-1 p-1 pt-0">
          <Button
            size="lg"
            className="w-full h-[49px] rounded-[20px]"
            onClick={handleSwitchWallet}
          >
            <span>
              {isConnected ? 'Switch Wallets' : 'Connect Wallet'}
            </span>
            <span className="pl-1 opacity-85 font-light">
              - Gnosis Safe Required
            </span>
          </Button>
          <a
            href="https://app.safe.global/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full h-[49px] rounded-[20px] border-primary text-primary hover:text-primary"
            >
              Create a new Gnosis Safe
              <ArrowUpRight size={16} className="ml-1" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default GnosisRequired
