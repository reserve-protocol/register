import BridgeNavIcon from '@/components/icons/BridgeNavIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { UNIVERSAL_ASSETS, WORMHOLE_ASSETS } from '@/utils/constants'
import { ArrowUpRight, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const WormholeDialog = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md px-6 bg-card border-none sm:rounded-3xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-start">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center">
                <div className="rounded-full bg-card border border-primary text-primary p-1.5 z-10">
                  <BridgeNavIcon className="w-5 h-5" />
                </div>
                <div className="rounded-full bg-white -ml-5">
                  <img
                    src="https://storage.reserve.org/wormwhole.svg"
                    alt="Wormhole Bridge"
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="text-xl font-bold text-primary">
                Bridged using Wormhole
              </DialogTitle>
              <DialogDescription className="text-base font-normal text-black">
                Using a bridged asset introduces additional considerations, such
                as:
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-4 border-t border-gray-200 space-y-2 mt-2 text-sm">
          <div>
            <p className="font-semibold">
              Smart contract risks{' '}
              <span className="font-normal text-muted-foreground">
                – Bridges rely on smart contracts that could have
                vulnerabilities.
              </span>
            </p>
          </div>
          <div>
            <p className="font-semibold">
              Custodial risks{' '}
              <span className="font-normal text-muted-foreground">
                – Some bridges hold assets in a pool while issuing wrapped
                versions.
              </span>
            </p>
          </div>
          <div>
            <p className="font-semibold">
              Liquidity concerns{' '}
              <span className="font-normal text-muted-foreground">
                – Redemption mechanisms depend on the bridge's infrastructure.
              </span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center sm:flex-row gap-4 sm:gap-0 mt-2 -mx-4 -mb-4">
          <Button
            variant="outline"
            className="flex-1 text-base py-6 rounded-xl border-2"
            asChild
          >
            <Link
              to="https://wormhole.com/docs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>Read Wormhole Docs</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          </Button>
          <Button
            className="text-base py-6 rounded-xl border-2 border-primary"
            onClick={() => setOpen(false)}
          >
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const UniversalDialog = ({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (open: boolean) => void
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md px-6 bg-card border-none sm:rounded-3xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-start">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center">
                <div className="rounded-full bg-card border border-primary text-primary p-1.5 z-10">
                  <BridgeNavIcon className="w-5 h-5" />
                </div>
                <div className="rounded-full bg-white -ml-5">
                  <img
                    src="https://storage.reserve.org/universal.svg"
                    alt="Universal Protocol"
                    className="w-8 h-8"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl"
                onClick={() => setOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <DialogTitle className="text-xl font-bold text-primary">
                Universal Protocol Asset
              </DialogTitle>
              <DialogDescription className="text-base font-normal text-black">
                Universal Protocol assets are native tokens with these key
                considerations:
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="pt-4 border-t border-gray-200 space-y-2 mt-2 text-sm">
          <div>
            <p className="font-semibold">
              Decentralized minting{' '}
              <span className="font-normal text-muted-foreground">
                – Universal assets are minted directly on each chain rather than
                bridged
              </span>
            </p>
          </div>
          <div>
            <p className="font-semibold">
              Independent security{' '}
              <span className="font-normal text-muted-foreground">
                – Each chain's assets operate independently without cross-chain
                dependencies
              </span>
            </p>
          </div>
          <div>
            <p className="font-semibold">
              Native liquidity{' '}
              <span className="font-normal text-muted-foreground">
                – Assets have their own liquidity pools on each blockchain
              </span>
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center sm:flex-row gap-4 sm:gap-0 mt-2 -mx-4 -mb-4">
          <Button
            variant="outline"
            className="flex-1 text-base py-6 rounded-xl border-2"
            asChild
          >
            <Link
              to="https://docs.universal.xyz/universal-protocol"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>Read Universal Docs</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          </Button>
          <Button
            className="text-base py-6 rounded-xl border-2 border-primary"
            onClick={() => setOpen(false)}
          >
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const BridgeLabel = ({ address }: { address: string }) => {
  const [open, setOpen] = useState(false)
  const isWormhole = WORMHOLE_ASSETS.has(address)
  const isUniversal = UNIVERSAL_ASSETS.has(address)

  if (!isWormhole && !isUniversal) return null

  return (
    <>
      <div
        className="rounded-full bg-black/5 p-1 flex items-center gap-1.5 justify-center hover:bg-primary/10 hover:text-primary"
        role="button"
        onClick={() => setOpen(true)}
      >
        {isWormhole ? (
          <img
            src="https://storage.reserve.org/wormwhole.svg"
            className="h-4 w-4"
          />
        ) : (
          <img
            src="https://storage.reserve.org/universal.svg"
            className="h-4 w-4"
          />
        )}
        <BridgeNavIcon className="h-4 w-4" />
      </div>
      {isWormhole && <WormholeDialog open={open} setOpen={setOpen} />}
      {isUniversal && <UniversalDialog open={open} setOpen={setOpen} />}
    </>
  )
}

export default BridgeLabel
