import { AccordionContent, AccordionItem } from '@/components/ui/accordion'
import MaxAuctionSizeEditor from '@/components/max-auction-size-editor'
import { NumericalInput } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { isAuctionLauncherAtom, isSingletonRebalanceAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useMemo } from 'react'
import { Sunrise } from 'lucide-react'
import {
  auctionLauncherWindowAtom,
  customAuctionLauncherWindowAtom,
  customPermissionlessLaunchingWindowAtom,
  permissionlessLaunchingWindowAtom,
  proposedIndexBasketAtom,
  stepAtom,
} from '../atoms'
import LegacyAdvancedControls from './legacy-advance-controls'
import ProposalStepTrigger from './proposal-step-trigger'
import { Button } from '@/components/ui/button'

const WINDOW_OPTIONS = ['0', '12', '24', '48']

const AuctionLauncherWindow = () => {
  const isSingletonRebalance = useAtomValue(isSingletonRebalanceAtom)
  const [auctionLauncherWindow, setAuctionLauncherWindow] = useAtom(
    auctionLauncherWindowAtom
  )
  const [customAuctionLauncherWindow, setCustomAuctionLauncherWindow] = useAtom(
    customAuctionLauncherWindowAtom
  )

  if (!isSingletonRebalance) return null

  return (
    <div className="flex flex-col justify-center gap-3 rounded-xl bg-foreground/5 p-4">
      <div>
        <h4 className="font-semibold text-primary text-base">
          Exclusive Auction Launcher Window
        </h4>
        <div className="">
          Specify how long only the Auction Launchers should be allow to start
          auctions.
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          className="bg-muted-foreground/10 p-1 rounded-xl justify-start flex-grow"
          value={customAuctionLauncherWindow ? 'custom' : auctionLauncherWindow}
          onValueChange={(value) => {
            if (value) {
              setAuctionLauncherWindow(value)
              setCustomAuctionLauncherWindow('')
            }
          }}
        >
          {WINDOW_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option.toString()}
              className="px-5 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary flex-grow"
            >
              {option} hours
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <NumericalInput
          className="hidden sm:block w-40"
          placeholder="Enter custom hours"
          value={customAuctionLauncherWindow}
          onChange={(value) => setCustomAuctionLauncherWindow(value)}
        />
      </div>
    </div>
  )
}

const PermissionlessWindow = () => {
  const [permissionlessLaunching, setPermissionlessLaunching] = useAtom(
    permissionlessLaunchingWindowAtom
  )
  const [
    customPermissionlessLaunchingWindow,
    setCustomPermissionlessLaunchingWindow,
  ] = useAtom(customPermissionlessLaunchingWindowAtom)

  return (
    <div className="flex flex-col justify-center gap-3 rounded-xl bg-foreground/5 p-4">
      <div>
        <h4 className="font-semibold text-primary text-base">
          Community Launch Window
        </h4>
        <div className="">
          Specify how long community members should be allow to start auctions
          after the Exclusive Launch Window.
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          className="bg-muted-foreground/10 p-1 rounded-xl justify-start flex-grow"
          value={
            customPermissionlessLaunchingWindow
              ? 'custom'
              : permissionlessLaunching
          }
          onValueChange={(value) => {
            if (value) {
              setPermissionlessLaunching(value)
              setCustomPermissionlessLaunchingWindow('')
            }
          }}
        >
          {WINDOW_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option.toString()}
              className="px-5 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary flex-grow"
            >
              {option} hours
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <NumericalInput
          className="hidden sm:block w-40"
          placeholder="Enter custom hours"
          value={customPermissionlessLaunchingWindow}
          onChange={(value) => setCustomPermissionlessLaunchingWindow(value)}
        />
      </div>
    </div>
  )
}

const ConfirmButton = () => {
  const setStep = useSetAtom(stepAtom)

  const handleConfirm = () => {
    setStep('basket')
  }

  return (
    <Button size="lg" className="m-2 rounded-xl" onClick={handleConfirm}>
      Confirm
    </Button>
  )
}

const MaxAuctionSizeSection = () => {
  const isAuctionLauncher = useAtomValue(isAuctionLauncherAtom)
  const proposedBasket = useAtomValue(proposedIndexBasketAtom)

  const tokens = useMemo(() => {
    if (!proposedBasket) return []
    return Object.values(proposedBasket).map((item) => item.token)
  }, [proposedBasket])

  if (!isAuctionLauncher || !tokens.length) return null

  return <MaxAuctionSizeEditor tokens={tokens} />
}

// TODO: Handle error case (0 ttl)
const ProposalBasketAuctionWindow = () => {
  const isSingletonRebalance = useAtomValue(isSingletonRebalanceAtom)

  if (!isSingletonRebalance) return <LegacyAdvancedControls />

  return (
    <AccordionItem
      value="advance"
      className="rounded-3xl bg-card m-1 border-none"
    >
      <ProposalStepTrigger
        id="advance"
        icon={<Sunrise size={16} strokeWidth={1.5} />}
        title="Auction window"
      />
      <AccordionContent className="flex flex-col animate-fade-in">
        <h2 className="text-xl sm:text-2xl font-bold text-primary mx-4 sm:mx-6 mb-2">
          Auction window
        </h2>
        <p className="text-sm sm:text-base mx-4 sm:mx-6 mb-2">
          Set the auction window for the rebalance.
        </p>
        <div className="flex flex-col px-2 pt-2 gap-2">
          <AuctionLauncherWindow />
          <PermissionlessWindow />
          <MaxAuctionSizeSection />
        </div>
        <ConfirmButton />
      </AccordionContent>
    </AccordionItem>
  )
}

export default ProposalBasketAuctionWindow
