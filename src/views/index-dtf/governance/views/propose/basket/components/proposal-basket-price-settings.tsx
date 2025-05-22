import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { indexDTFVersionAtom } from '@/state/dtf/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { AlignCenterVertical, Crown } from 'lucide-react'
import { ReactNode } from 'react'
import {
  isSingletonRebalanceAtom,
  priceVolatilityAtom,
  stepAtom,
  tradeRangeOptionAtom,
  TradeRangeOption as TradeRangeOptionType,
} from '../atoms'
import { isDeferAvailableAtom } from '../legacy-atoms'
import LegacyProposalAuctionPriceRanges from './legacy-proposal-auction-price-ranges'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type PriceSettingsOptionProps = {
  title: string
  description: string
  icon: ReactNode
  value: TradeRangeOptionType
  disabled?: boolean
  checked: boolean
  onClick: () => void
}

const PriceSettingsOption = ({
  title,
  description,
  icon,
  disabled,
  checked,
  onClick,
}: PriceSettingsOptionProps) => (
  <div
    role="button"
    className={cn(
      'flex items-center gap-2 border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-foreground/10',
      checked && 'bg-foreground/5',
      disabled && 'opacity-50 hover:bg-transparent'
    )}
    onClick={disabled ? undefined : onClick}
  >
    <div
      className={cn(
        'flex items-center flex-shrink-0 justify-center w-8 h-8 border-[1px] border-current rounded-full',
        checked && 'border-primary text-primary'
      )}
    >
      {icon}
    </div>
    <div className="mr-auto">
      <h4 className={cn('font-bold mb-1 text-base', checked && 'text-primary')}>
        {title}
      </h4>
      <p className="text-sm text-legend">{description}</p>
    </div>
    <Checkbox checked={checked} />
  </div>
)

const NextButton = () => {
  const isValid = !!useAtomValue(tradeRangeOptionAtom)
  const setStep = useSetAtom(stepAtom)

  return (
    <Button
      className="w-full my-2"
      size="lg"
      disabled={!isValid}
      onClick={() => setStep('confirmation')}
    >
      Confirm Changes
    </Button>
  )
}

export const TradeRangeTriggerLabel = () => {
  const option = useAtomValue(tradeRangeOptionAtom)

  if (!option) return null

  return (
    <div className="flex items-center gap-2 text-muted-foreground font-light">
      {option === 'defer' ? (
        <Crown size={16} />
      ) : (
        <AlignCenterVertical size={16} />
      )}
      <div>
        {option === 'defer'
          ? 'Defer to Auction Launcher'
          : 'Include Price Ranges'}
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
        <h4 className="font-semibold text-primary">Auction Price Volatility</h4>
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

const RebalancePriceSettings = () => {
  const option = useAtomValue(tradeRangeOptionAtom)
  const isSingletonRebalance = useAtomValue(isSingletonRebalanceAtom)

  if (option !== 'include') return null
  if (!isSingletonRebalance) return <LegacyProposalAuctionPriceRanges />

  return <RebalancePriceVolatility />
}

const ProposalPriceRanges = () => {
  const isDeferAvailable = useAtomValue(isDeferAvailableAtom)
  const [option, setOption] = useAtom(tradeRangeOptionAtom)

  return (
    <>
      <p className="text-sm sm:text-base mx-4 sm:mx-6 mb-6">
        Set expected pricing volatility for each token pair. The auction
        launcher can modify the pricing information within these volatility
        bounds.
      </p>
      <div className="flex flex-col gap-2 mx-2">
        <PriceSettingsOption
          title="Defer to Auction Launcher"
          description="Rely solely on the Auction Launcher to provide accurate pricing information when swapping assets. This option increases the amount of damage from mistakes or a rogue Auction Launcher."
          icon={<Crown size={16} strokeWidth={1.5} />}
          value="defer"
          disabled={!isDeferAvailable}
          onClick={() => setOption('defer')}
          checked={option === 'defer'}
        />
        <PriceSettingsOption
          title="Set Price Range(s)"
          description="Set guardrails for the auction launcher by specifying the expected price volatility (low, medium, or high)"
          icon={<AlignCenterVertical size={16} strokeWidth={1.5} />}
          value="include"
          onClick={() => setOption('include')}
          checked={option === 'include'}
        />
        <RebalancePriceSettings />
        <NextButton />
      </div>
    </>
  )
}

export default ProposalPriceRanges
