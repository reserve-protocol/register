import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { AssetTrade } from '../atoms'

const AuctionEjectSwitch = ({
  trade,
  value,
  setValue,
  disabled,
}: {
  trade: AssetTrade
  value: boolean
  setValue: (value: boolean) => void
  disabled?: boolean
}) => {
  const ejectFullyAvailable = Boolean(
    trade.currentSellShare &&
      trade.deltaSellShare &&
      trade.currentSellShare + trade.deltaSellShare === 0
  )

  if (!ejectFullyAvailable) return null

  return (
    <div className="flex items-center">
      <label>Eject Dust</label>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <Info size={16} className="ml-1 inline text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            The Reserve Index Protocol aims to make precise trades on quantities
            of tokens as a function of historical prices. If prices move in a
            favorable direction over the course of an auction, this can result
            in dust being left behind. Turn on this toggle to force a full
            ejection of the sell token regardless of price movement.
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Switch
        className="ml-2 data-[state=checked]:bg-black"
        variant="small"
        checked={value}
        onCheckedChange={setValue}
        disabled={disabled}
      />
    </div>
  )
}

export default AuctionEjectSwitch
