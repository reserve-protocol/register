import { Button } from '@/components/ui/button'
import Help from '@/components/ui/help'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ExternalLink, OctagonAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

const GnosisSafeRequired = () => {
  const { openConnectModal } = useConnectModal()
  const { disconnect } = useDisconnect()
  const { isConnected } = useAccount()
  const [shouldOpenModal, setShouldOpenModal] = useState(false)

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
    <div className="bg-card rounded-3xl border-2 border-secondary lg:border-none sm:w-[420px] m-auto min-h-[400px] flex flex-col">
      <div className="flex-1 p-6 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            <img
              src="https://storage.reserve.org/cowswap.svg"
              alt="CoW Protocol"
              className="w-8 h-8 z-10"
            />
            <img
              src="https://storage.reserve.org/universal.svg"
              alt="Universal Protocol"
              className="w-8 h-8 -ml-4"
            />
          </div>
          <div className="p-1 px-3 border border-muted-foreground/20 rounded-full flex items-center gap-1 text-sm font-light">
            <OctagonAlert size={16} strokeWidth={1.5} />
            <div className="text-sm">Gnosis Safe Required</div>
            <Help
              size={16}
              content="Gnosis Safe Required"
              className="text-muted-foreground/80"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-2xl text-[28px] font-semibold text-primary">
            Get better prices by accessing off-chain liquidity
          </div>
          <div className="text-sm text-muted-foreground">
            Automated Slow Mints can provide better quotes for minting or
            redeeming a DTF, particularly when dealing with significant amounts
            of capital or DTFs that involve bridged or low DEX liquidity
            collateral assets.
          </div>
        </div>
      </div>
      <div className="p-2 pt-0">
        <Button
          size="lg"
          className="w-full rounded-xl"
          onClick={handleSwitchWallet}
        >
          {isConnected ? 'Switch Wallets' : 'Connect Wallet'}
          <span className="pl-1 opacity-50 font-light">
            {' '}
            - Gnosis Safe Required
          </span>
        </Button>
        <a
          className="p-4 flex items-center gap-1 text-base font-light text-muted-foreground/80 justify-center"
          href={`https://gnosis-safe.io/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="underline">Create a new Gnosis Safe</span>
          <ExternalLink size={16} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  )
}

export default GnosisSafeRequired
