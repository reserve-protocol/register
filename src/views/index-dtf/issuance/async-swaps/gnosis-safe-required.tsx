import { Button } from '@/components/ui/button'
import Help from '@/components/ui/help'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ArrowUpRightIcon, OctagonAlert } from 'lucide-react'
import { useDisconnect, useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

const GnosisSafeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="33"
    height="32"
    viewBox="0 0 33 32"
    fill="none"
  >
    <path
      d="M16.8828 0C8.06194 0 0.882812 7.1513 0.882812 16C0.882812 24.8209 8.03412 32 16.8828 32C25.7315 32 32.8828 24.8487 32.8828 16C32.8828 7.17913 25.7037 0 16.8828 0ZM28.5976 16.8626H21.168C20.6672 19.3113 18.3019 20.8974 15.8532 20.3965C13.4046 19.8956 11.8185 17.5304 12.3193 15.0817C12.8202 12.633 15.1854 11.047 17.6341 11.5478C19.4985 11.9096 20.9176 13.4122 21.2237 15.3043H28.5976C29.0428 15.3043 29.3767 15.6661 29.3767 16.0835C29.3767 16.5287 29.015 16.8626 28.5976 16.8626Z"
      fill="black"
    />
  </svg>
)
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
          className="p-4 flex items-center justify-between cursor-pointer"
          href={`https://gnosis-safe.io/`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center gap-1.5">
            <GnosisSafeIcon />
            <div className="font-semibold">Deploy new Gnosis Safe</div>
          </div>
          <div className="bg-muted-foreground/10 rounded-full p-2 hover:bg-muted-foreground/20 transition-colors">
            <ArrowUpRightIcon size={16} strokeWidth={1.5} />
          </div>
        </a>
      </div>
    </div>
  )
}

export default GnosisSafeRequired
