import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { AlignCenterVertical, Crown } from 'lucide-react'
import {
  isDeferAvailableAtom,
  stepAtom,
  tradeRangeOptionAtom,
  TradeRangeOption as TradeRangeOptionType,
} from '../atoms'
import ProposalTradesSetup from './proposal-trades-setup'
import { ReactNode } from 'react'

type TradeRangeOptionProps = {
  title: string
  description: string
  icon: ReactNode
  value: TradeRangeOptionType
  disabled?: boolean
  checked: boolean
  onClick: () => void
}

const TradeRangeOption = ({
  title,
  description,
  icon,
  disabled,
  checked,
  onClick,
}: TradeRangeOptionProps) => (
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

const TradesSetup = () => {
  const option = useAtomValue(tradeRangeOptionAtom)

  if (option !== 'include') return null

  return <ProposalTradesSetup />
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

const ProposalTradingRanges = () => {
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
        <TradeRangeOption
          title="Defer to Auction Launcher"
          description="Rely solely on the Auction Launcher to provide accurate pricing information when swapping assets. This option increases the amount of damage from mistakes or a rogue Auction Launcher."
          icon={<Crown size={16} strokeWidth={1.5} />}
          value="defer"
          disabled={!isDeferAvailable}
          onClick={() => setOption('defer')}
          checked={option === 'defer'}
        />
        <TradeRangeOption
          title="Set Price Range(s)"
          description="Set guardrails for the auction launcher by specifying the expected price volatility (low, medium, or high) for each auction. "
          icon={<AlignCenterVertical size={16} strokeWidth={1.5} />}
          value="include"
          onClick={() => setOption('include')}
          checked={option === 'include'}
        />
        <TradesSetup />
        <NextButton />
      </div>
    </>
  )
}

export default ProposalTradingRanges
