import { isSingletonRebalanceAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue } from 'jotai'
import LegacyAdvancedControls from './legacy-advance-controls'
import { AccordionContent, AccordionItem } from '@/components/ui/accordion'
import ProposalStepTrigger from './proposal-step-trigger'
import { Sunrise } from 'lucide-react'
import ProposalRebalanceLaunchSettings, {
  PermissionOptionId,
} from './proposal-rebalance-launch-settings'
import { ToggleGroupItem } from '@/components/ui/toggle-group'
import { ToggleGroup } from '@/components/ui/toggle-group'
import {
  auctionLauncherWindowAtom,
  customAuctionLauncherWindowAtom,
  customPermissionlessLaunchingWindowAtom,
  permissionlessLaunchingWindowAtom,
  permissionlessLaunchingAtom,
  priceVolatilityAtom,
} from '../atoms'
import { NumericalInput } from '@/components/ui/input'

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

const VOLATILITY_OPTIONS = ['Low', 'Medium', 'High']

const RebalancePriceVolatility = () => {
  const [priceVolatility, setPriceVolatility] = useAtom(priceVolatilityAtom)

  return (
    <div className="flex flex-col justify-center gap-3 rounded-xl bg-foreground/5 p-4">
      <div>
        <h4 className="font-semibold text-primary text-base">
          Auction Price Volatility
        </h4>
        <div className="">
          Specify the expected price volatility for the auction. This will be
          used to set the price range for the auction.
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ToggleGroup
          type="single"
          className="bg-muted-foreground/10 p-1 rounded-xl justify-start flex-grow"
          value={priceVolatility}
          onValueChange={(value) => {
            if (value) {
              setPriceVolatility(value)
            }
          }}
        >
          {VOLATILITY_OPTIONS.map((option) => (
            <ToggleGroupItem
              key={option}
              value={option}
              className="px-5 h-8 whitespace-nowrap rounded-lg data-[state=on]:bg-card text-secondary-foreground/80 data-[state=on]:text-primary flex-grow"
            >
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  )
}

// TODO: Handle error case (0 ttl)
const ProposalBasketAdvanceSettings = () => {
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
        title="Advance settings"
      />
      <AccordionContent className="flex flex-col animate-fade-in">
        <h2 className="text-xl  sm:text-2xl font-bold text-primary mx-4 sm:mx-6 mb-2">
          Advance settings
        </h2>
        <p className="text-sm sm:text-base mx-4 sm:mx-6 mb-2">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.
        </p>
        <div className="flex flex-col p-4 gap-2">
          <RebalancePriceVolatility />
          <AuctionLauncherWindow />
          <PermissionlessWindow />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default ProposalBasketAdvanceSettings
